import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Button, Layout, message, Spin } from 'antd';
import { compose } from 'recompose';
import moment from 'moment';
import ExportHeader from './ExportHeader';
import { Card } from '@mediarithmics-private/mcs-components-library';
import { Filters } from '../../../components/ItemList';
import { Export, ExportExecution } from '../../../models/exports/exports';
import ExportActionbar from './ExportActionbar';
import log from '../../../utils/Logger';
import {
  PAGINATION_SEARCH_SETTINGS,
  buildDefaultSearch,
  compareSearches,
  isSearchValid,
  parseSearch,
  updateSearch,
} from '../../../utils/LocationSearchHelper';
import messages from './messages';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IExportService } from '../../../services/Library/ExportService';
import { Labels } from '../../Labels';
import { getPaginatedApiParam, getApiToken } from '../../../utils/ApiHelper';
import { TableViewWithSelectionNotifyerMessages } from '../../../components/TableView';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import FileSaver from 'file-saver';

const { Content } = Layout;

interface ExportItem {
  item: Export | undefined;
  isLoading: boolean;
}

interface ExportExecutionItems {
  items: ExportExecution[];
  isLoading: boolean;
  total: number;
}

interface ExportsState {
  exportObject: ExportItem;
  exportExecutions: ExportExecutionItems;
  dataExportState: Record<string, number>;
}

interface ExportRouteParams {
  organisationId: string;
  exportId: string;
}

type JoinedProps = RouteComponentProps<ExportRouteParams> &
  InjectedIntlProps &
  InjectedNotificationProps;

class Exports extends React.Component<JoinedProps, ExportsState> {
  fetchLoop = window.setInterval(() => {
    const {
      match: {
        params: { exportId },
      },
    } = this.props;

    if (
      this.state.exportExecutions.items[0] &&
      (this.state.exportExecutions.items[0].status === 'PENDING' ||
        this.state.exportExecutions.items[0].status === 'RUNNING')
    ) {
      this.fetchExportExecution(exportId);
    }
  }, 5000);

  @lazyInject(TYPES.IExportService)
  private _exportService: IExportService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      exportObject: {
        item: undefined,
        isLoading: true,
      },
      exportExecutions: {
        items: [],
        isLoading: true,
        total: 0,
      },
      dataExportState: {},
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { exportId },
      },
      location: { search, pathname },
      history,
    } = this.props;

    if (!isSearchValid(search, PAGINATION_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, PAGINATION_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      this.fetchExportExecution(exportId);
    }
  }

  componentDidUpdate(previousProps: JoinedProps) {
    const {
      history,
      location: { pathname, search },
      match: {
        params: { organisationId, exportId },
      },
    } = this.props;

    const {
      location: { search: previousSearch },
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    if (!compareSearches(search, previousSearch) || organisationId !== previousOrganisationId) {
      if (!isSearchValid(search, PAGINATION_SEARCH_SETTINGS)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, PAGINATION_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== organisationId },
        });
      } else {
        this.fetchExportExecution(exportId);
      }
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.fetchLoop);
  }

  fetchExportExecution = (exportId: string) => {
    const {
      location: { search },
    } = this.props;
    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
    const fetchExport = this._exportService
      .getExport(exportId)
      .then(res => res.data)
      .then(res => this.setState({ exportObject: { item: res, isLoading: false } }))
      .catch(err => log.error(err));
    const fetchExportExecution = this._exportService
      .getExportExecutions(exportId, getPaginatedApiParam(filter.currentPage, filter.pageSize))
      .then(res =>
        this.setState({
          exportExecutions: {
            items: res.data,
            isLoading: false,
            total: res.total ? res.total : res.count,
          },
        }),
      )
      .catch(err => log.error(err));

    return Promise.all([fetchExport, fetchExportExecution]);
  };

  updateLocationSearch = (params: Filters) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, PAGINATION_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  private startDownload = (recordId: string) => {
    const { dataExportState } = this.state;

    this.props.notifyInfo({
      message:
        'Your download request is processing. Do not refresh your page to avoid canceling it.',
    });
    if (!dataExportState.hasOwnProperty(recordId)) {
      this.setState(prevState => {
        const newState = prevState;
        newState.dataExportState[recordId] = 0;
        return newState;
      });
    }
  };

  private finaliseDownload = (recordId: string) => {
    const { dataExportState } = this.state;

    if (dataExportState.hasOwnProperty(recordId)) {
      this.setState(prevState => {
        const newState = prevState;
        delete newState.dataExportState[recordId];
        return newState;
      });
    }
  };

  downloadFile = (execution: ExportExecution) => (e: any) => {
    const {
      intl: { formatMessage },
    } = this.props;
    const { exportObject } = this.state;

    if (execution.status === 'RUNNING' || execution.status === 'PENDING') {
      message.error(formatMessage(messages.exportRunning));
    } else if (execution.status === 'FAILED') {
      message.error(formatMessage(messages.exportFailed));
    } else if (execution.status === 'SUCCEEDED') {
      this.startDownload(execution.id);
      const url = `${(window as any).MCS_CONSTANTS.API_URL}/v1/exports/${
        this.props.match.params.exportId
      }/executions/${execution.id}/files/technical_name=${
        execution.result
          ? execution.result.output_files
            ? execution.result.output_files[0] || 'export'
            : 'export'
          : 'export'
      }`;

      const transferFailed = () => {
        this.props.notifyInfo({ message: 'Your download has failed.' });
        this.finaliseDownload(execution.id);
      };
      const transferCanceled = () => {
        this.props.notifyInfo({ message: 'Your download as been canceled.' });
        this.finaliseDownload(execution.id);
      };
      const oReq = new XMLHttpRequest();
      oReq.responseType = 'blob';
      oReq.onload = () => {
        if (oReq.status >= 200 && oReq.status < 400) {
          FileSaver.saveAs(oReq.response, `export-${exportObject.item?.name}-${execution.id}.json`);
        } else {
          const responsePromise: Promise<any> = oReq.response.text();
          responsePromise.then(responseAsText => {
            const response = JSON.parse(responseAsText);
            const notification = { message: `${response.error} (error id: ${response.error_id})` };
            if (oReq.status < 500) {
              this.props.notifyWarning(notification);
            } else {
              this.props.notifyError(notification);
            }
          });
        }
        this.finaliseDownload(execution.id);
      };
      oReq.open('get', url, true);
      oReq.addEventListener('error', transferFailed, false);
      oReq.addEventListener('abort', transferCanceled, false);

      oReq.setRequestHeader('Authorization', getApiToken());
      oReq.send();
    }
  };

  buildColumnDefinition = () => {
    const {
      intl: { formatMessage },
    } = this.props;
    const { dataExportState } = this.state;

    const dataColumns: Array<DataColumnDefinition<ExportExecution>> = [
      {
        title: formatMessage(messages.status),
        key: 'status',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        title: formatMessage(messages.creationDate),
        key: 'creation_date',
        isHideable: false,
        render: (text: string) => moment(text).format('DD/MM/YYYY HH:mm:ss'),
      },
      {
        title: formatMessage(messages.startDate),
        key: 'start_date',
        isHideable: false,
        render: (text: string) =>
          text ? moment(text).format('DD/MM/YYYY HH:mm:ss') : formatMessage(messages.notStarted),
      },
      {
        key: 'action',
        render: (text: string, record: ExportExecution, index: number) => {
          return (
            (record.status === 'SUCCEEDED' && !dataExportState.hasOwnProperty(record.id) && (
              <Button type='primary' onClick={this.downloadFile(record)}>
                <span className='mcs-export-button-download-message'>
                  {' '}
                  {formatMessage(messages.download)}
                </span>
              </Button>
            )) ||
            (dataExportState.hasOwnProperty(record.id) && <Spin size='small' />)
          );
        },
      },
    ];

    return {
      dataColumnsDefinition: dataColumns,
    };
  };

  render() {
    const {
      location: { search },
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
      history,
    } = this.props;

    const { exportExecutions, exportObject } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      onChange: (page: number, size: number) =>
        this.updateLocationSearch({
          currentPage: page,
          pageSize: size,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          currentPage: 1,
          pageSize: size,
        }),
      total: exportExecutions.total,
    };

    const onNewExecution = () => {
      return this.fetchExportExecution(this.props.match.params.exportId);
    };

    const handleArchive = () => {
      if (exportObject.item) {
        const exportId = exportObject.item.id;
        return this._exportService.deleteExport(exportId).then(() => {
          history.push(`/v2/o/${organisationId}/datastudio/exports`);
        });
      }
      return;
    };

    return (
      <div className='ant-layout'>
        <ExportActionbar
          exportObject={exportObject.item}
          archiveObject={handleArchive}
          isExportExecutionRunning={
            exportExecutions.items.length &&
            (exportExecutions.items[0].status === 'PENDING' ||
              exportExecutions.items[0].status === 'RUNNING')
              ? true
              : false
          }
          onNewExecution={onNewExecution}
        />
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
            <ExportHeader object={exportObject && exportObject.item} />
            {exportObject.item && (
              <Labels
                labellableId={exportObject.item.id}
                labellableType='EXPORT'
                organisationId={organisationId}
              />
            )}
            <Card
              title={formatMessage(messages.exportExecutionsTitle)}
              className='mcs-table-container'
            >
              <hr />
              <TableViewWithSelectionNotifyerMessages
                dataSource={exportExecutions.items}
                columns={this.buildColumnDefinition().dataColumnsDefinition}
                pagination={pagination}
                loading={exportExecutions.isLoading}
              />
            </Card>
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<JoinedProps, {}>(injectIntl, withRouter, injectNotifications)(Exports);
