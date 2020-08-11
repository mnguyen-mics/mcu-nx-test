import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Button, Layout, message } from 'antd';
import { compose } from 'recompose';
import moment from 'moment';
import ExportHeader from './ExportHeader';
import { Card } from '@mediarithmics-private/mcs-components-library';
import { Filters } from '../../../components/ItemList';
import { Export, ExportExecution } from '../../../models/exports/exports';
import ExportActionbar from './ExportActionbar';
import TableView from '../../../components/TableView/TableView';
import log from '../../../utils/Logger';
import LocalStorage from '../../../services/LocalStorage';
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
}

interface ExportRouteParams {
  organisationId: string;
  exportId: string;
}

type JoinedProps = RouteComponentProps<ExportRouteParams> & InjectedIntlProps;

class Exports extends React.Component<JoinedProps, ExportsState> {
  fetchLoop = window.setInterval(() => {
    const {
      match: {
        params: { exportId },
      },
      location: { search },
    } = this.props;

    if (
      this.state.exportExecutions.items[0] &&
      (this.state.exportExecutions.items[0].status === 'PENDING' ||
        this.state.exportExecutions.items[0].status === 'RUNNING')
    ) {
      const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
      this.fetchExportExecution(exportId, filter);
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
      const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

      this.fetchExportExecution(exportId, filter);
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

    if (
      !compareSearches(search, previousSearch) ||
      organisationId !== previousOrganisationId
    ) {
      if (!isSearchValid(search, PAGINATION_SEARCH_SETTINGS)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, PAGINATION_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== organisationId },
        });
      } else {
        const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
        this.fetchExportExecution(exportId, filter);
      }
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.fetchLoop);
  }

  fetchExportExecution = (exportId: string, options: object) => {
    const fetchExport = this._exportService
      .getExport(exportId)
      .then(res => res.data)
      .then(res =>
        this.setState({ exportObject: { item: res, isLoading: false } }),
      )
      .catch(err => log.error(err));
    const fetchExportExecution = this._exportService
      .getExportExecutions(exportId, options)
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

  downloadFile = (execution: ExportExecution) => (e: any) => {
    const {
      intl: { formatMessage },
    } = this.props;

    if (execution.status === 'RUNNING' || execution.status === 'PENDING') {
      message.error(formatMessage(messages.exportRunning));
    } else if (execution.status === 'FAILED') {
      message.error(formatMessage(messages.exportFailed));
    } else if (execution.status === 'SUCCEEDED') {
      (window as any).location = `${
        (window as any).MCS_CONSTANTS.API_URL
      }/v1/exports/${this.props.match.params.exportId}/executions/${
        execution.id
      }/files/technical_name=${
        execution.result.output_files[0]
      }?access_token=${encodeURIComponent(
        LocalStorage.getItem('access_token')!,
      )}`;
    }
  };

  buildColumnDefinition = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    const dataColumns = [
      {
        intlMessage: messages.status,
        key: 'status',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        intlMessage: messages.creationDate,
        key: 'creation_date',
        isHideable: false,
        render: (text: string) => moment(text).format('DD/MM/YYYY HH:mm:ss'),
      },
      {
        intlMessage: messages.startDate,
        key: 'start_date',
        isHideable: false,
        render: (text: string) =>
          text
            ? moment(text).format('DD/MM/YYYY HH:mm:ss')
            : formatMessage(messages.notStarted),
      },
      {
        key: 'action',
        render: (text: string, record: ExportExecution, index: number) => {
          return (
            record.status === 'SUCCEEDED' && (
              <Button type="primary" onClick={this.downloadFile(record)}>
                {' '}
                {formatMessage(messages.download)}
              </Button>
            )
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
      onChange: (page: number) =>
        this.updateLocationSearch({
          currentPage: page,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.updateLocationSearch({
          pageSize: size,
        }),
      total: exportExecutions.total,
    };

    const onNewExecution = () => {
      return this.fetchExportExecution(
        this.props.match.params.exportId,
        filter,
      );
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
      <div className="ant-layout">
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
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <ExportHeader object={exportObject.item && exportObject.item} />
            {exportObject.item && (
              <Labels
                labellableId={exportObject.item.id}
                labellableType="EXPORT"
                organisationId={organisationId}
              />
            )}
            <Card title={formatMessage(messages.exportExecutionsTitle)}>
              <hr />
              <TableView
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

export default compose<JoinedProps, {}>(injectIntl, withRouter)(Exports);
