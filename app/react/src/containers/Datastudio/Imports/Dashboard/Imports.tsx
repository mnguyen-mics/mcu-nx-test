import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Layout, Progress, Tooltip } from 'antd';
import { compose } from 'recompose';
import moment from 'moment';
import ImportHeader from './ImportHeader';
import Card from '../../../../components/Card/Card';
import { Filters } from '../../../../components/ItemList';
import {
  ImportExecution,
  Import
} from '../../../../models/imports/imports';
import ImportActionbar from './ImportActionbar';
import TableView, { ActionsColumnDefinition } from '../../../../components/TableView/TableView';
import log from '../../../../utils/Logger';
import {
  PAGINATION_SEARCH_SETTINGS,
  buildDefaultSearch,
  compareSearches,
  isSearchValid,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import messages from './messages';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IImportService } from '../../../../services/ImportService';
import injectThemeColors, {
  InjectedThemeColorsProps,
} from '../../../Helpers/injectThemeColors';
import { McsIcon } from '../../../../components';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';
import LocalStorage from '../../../../services/LocalStorage';
import { getExecutionInfo } from '../../../../utils/JobHelpers';

const { Content } = Layout;

interface ImportItem {
  item: Import | undefined;
  isLoading: boolean;
}

interface ImportExecutionItems {
  items: ImportExecution[];
  isLoading: boolean;
  total: number;
}

interface State {
  importObject: ImportItem;
  importExecutions: ImportExecutionItems;
}

interface ImportRouteParams {
  organisationId: string;
  datamartId: string;
  importId: string;
}

type JoinedProps = RouteComponentProps<ImportRouteParams> &
  InjectedIntlProps &
  InjectedThemeColorsProps &
  InjectedNotificationProps;

class Imports extends React.Component<JoinedProps, State> {
  fetchLoop = window.setInterval(() => {
    const {
      match: {
        params: { datamartId, importId },
      },
      location: { search },
    } = this.props;

    const { importExecutions } = this.state;

    if (
      importExecutions.items[0] &&
      (importExecutions.items[0].status === 'PENDING' ||
        importExecutions.items[0].status === 'RUNNING')
    ) {
      const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
      this.fetchImportAndExecutions(datamartId, importId, filter);
    }
  }, 5000);

  @lazyInject(TYPES.IImportService)
  private _importService: IImportService;


  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      importObject: {
        item: undefined,
        isLoading: true,
      },
      importExecutions: {
        items: [],
        isLoading: true,
        total: 0,
      },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId, importId },
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

      this.fetchImportAndExecutions(datamartId, importId, filter);
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      history,
      location: { search },
      match: {
        params: { organisationId },
      },
    } = this.props;

    const {
      location: { pathname: nextPathname, search: nextSearch },
      match: {
        params: {
          organisationId: nextOrganisationId,
          datamartId: nextDatamartId,
          importId: nextImportId,
        },
      },
    } = nextProps;

    if (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId
    ) {
      if (!isSearchValid(nextSearch, PAGINATION_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, PAGINATION_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, PAGINATION_SEARCH_SETTINGS);
        this.fetchImportAndExecutions(nextDatamartId, nextImportId, filter);
      }
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.fetchLoop);
  }

  fetchImportAndExecutions = (
    datamartId: string,
    importId: string,
    options: Filters,
  ) => {
    const fetchImport = this._importService
      .getImport(datamartId, importId)
      .then(res => res.data)
      .then(res =>
        this.setState({ importObject: { item: res, isLoading: false } }),
      )
      .catch(err => log.error(err));

    const params = {
      ...getPaginatedApiParam(options.currentPage, options.pageSize),
    };

    const fetchImportExecutions = this._importService
      .getImportExecutions(datamartId, importId, params)
      .then(res =>
        this.setState({
          importExecutions: {
            items: res.data,
            isLoading: false,
            total: res.total ? res.total : res.count,
          },
        }),
      )
      .catch(err => log.error(err));

    return Promise.all([fetchImport, fetchImportExecutions]);
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


  renderStatuColumn = (record: ImportExecution) => {
    switch (record.status) {
      case 'SUCCEEDED':
      case 'SUCCESS':
        return (
          <div>
            {record.status}{' '}
            { record.result && record.result.total_failure > 0 ? (
              <span>
                - with errors{' '}
                <Tooltip
                  placement="top"
                  title={record.error && record.error.message}
                >
                  <McsIcon type="question" />
                </Tooltip>
              </span>
            ) : (
              undefined
            )}
          </div>
        );
      default:
        return <div>{record.status}</div>;
    }
  };


  onClickCancel = (execution: ImportExecution) => {
    const datamartId = this.props.match.params.datamartId;
    const importId = this.props.match.params.importId;
    const executions = this.state.importExecutions.items;
    return this._importService.cancelImportExecution(datamartId, importId, execution.id)
      .then(res => res.data)
      .then(res => {
        this.setState({
          importObject: this.state.importObject,
          importExecutions: { 
            items: executions.map(e => e.id === res.id ? res : e),
            isLoading: false,
            total: this.state.importExecutions.total
          }
        });
      })
      .catch(err => {
        log.error(err);
      })
  }

  download = (uri: string) => {
    try {
      (window as any).open(
        `${
          (window as any).MCS_CONSTANTS.API_URL
        }/v1/data_file/data?uri=${encodeURIComponent(uri)}&access_token=${encodeURIComponent(
          LocalStorage.getItem('access_token')!,
        )}`
      );
    } catch(err) {
      log.error(err);
    }
    
  }

  onDownloadErrors = (execution: ImportExecution) => {
    if (execution.result && execution.result.error_file_uri) {
      this.download(execution.result.error_file_uri)
    } else {

      return;
    }
  }

  onDownloadInputs = (execution: ImportExecution) => {
    if (execution.result) {
      this.download(execution.result.input_file_uri)
    } else {
      return;
    }
  }

  buildColumnDefinition = () => {
    const {
      intl: { formatMessage },
      colors
    } = this.props;

    const dataColumns = [
      {
        intlMessage: messages.id,
        key: 'id',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        intlMessage: messages.status,
        key: 'status',
        isHideable: false,
        render: (text: string, record: ImportExecution) =>
          this.renderStatuColumn(record),
      },
      {
        intlMessage: messages.progress,
        key: 'progress',
        isHideable: false,
        render: (text: string, record: ImportExecution) => (
          // we should update ant design in order to have strokeColor prop
          // currently we can't pass color
          // https://github.com/ant-design/ant-design/blob/master/components/progress/progress.tsx
          <div>
            <Progress showInfo={false} percent={getExecutionInfo(record, colors).percent * 100} />
          </div>
        ),
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
        intlMessage: messages.endDate,
        key: 'end_date',
        isHideable: false,
        render: (text: string, record: ImportExecution) =>
          record.start_date && record.duration
            ? moment(record.start_date + record.duration).format(
                'DD/MM/YYYY HH:mm:ss',
              )
            : formatMessage(messages.notEnded),
      },
      {
        intlMessage: messages.creationDate,
        key: 'creation_date',
        isHideable: false,
        render: (text: string) =>
          text
            ? moment(text).format('DD/MM/YYYY HH:mm:ss')
            : formatMessage(messages.notCreated),
      }
    ];

    return {
      dataColumnsDefinition: dataColumns,
    };
  };

  render() {
    const {
      location: { search },
    } = this.props;

    const { importExecutions, importObject } = this.state;

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
      total: this.state.importExecutions.total,
    };

    const onNewExecution = () => {
      return this.fetchImportAndExecutions(
        this.props.match.params.datamartId,
        this.props.match.params.importId,
        filter,
      );
    };

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<ImportExecution>> = [
      {
        key: 'action',
        actions: (execution: ImportExecution) => [
          { intlMessage: messages.uploadCancel, callback: this.onClickCancel, disabled: execution.status !== "PENDING" },
          { intlMessage: messages.downloadErrorFile, callback: this.onDownloadErrors, disabled: !(execution.result && execution.result.total_failure > 0 && execution.result.error_file_uri) },
          { intlMessage: messages.downloadInputFile, callback: this.onDownloadInputs, disabled: !(execution.result && execution.result.input_file_uri) },
        ],
      },
    ];

    return (
      <div className="ant-layout">
        <ImportActionbar
          importObject={importObject.item}
          isImportExecutionRunning={
            importExecutions.items.length &&
            (importExecutions.items[0].status === 'PENDING' ||
              importExecutions.items[0].status === 'RUNNING')
              ? true
              : false
          }
          onNewExecution={onNewExecution}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <ImportHeader object={importObject.item} />
            <Card title={'Import Execution'}>
              <hr />
              <TableView
                dataSource={importExecutions.items}
                columns={this.buildColumnDefinition().dataColumnsDefinition}
                actionsColumnsDefinition={actionsColumnsDefinition}
                pagination={pagination}
                loading={importExecutions.isLoading}
              />
            </Card>
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<JoinedProps, {}>(
  injectIntl,
  withRouter,
  injectThemeColors,
  injectNotifications,
)(Imports);
