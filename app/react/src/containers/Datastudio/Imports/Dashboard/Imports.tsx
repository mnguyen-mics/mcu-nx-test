import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Layout, Progress, Tooltip } from 'antd';
import { compose } from 'recompose';
import moment from 'moment';
import ImportHeader from './ImportHeader';
import Card from '../../../../components/Card/Card';
import { Filters } from '../../../../components/ItemList';
import { ImportExecution, Import, ImportExecutionSuccess } from '../../../../models/imports/imports';
import ImportActionbar from './ImportActionbar';
import TableView from '../../../../components/TableView/TableView';
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
  InjectedThemeColorsProps;

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
    options: object,
  ) => {
    const fetchImport = this._importService
      .getImport(datamartId, importId)
      .then(res => res.data)
      .then(res =>
        this.setState({ importObject: { item: res, isLoading: false } }),
      )
      .catch(err => log(err));
    const fetchImportExecutions = this._importService
      .getImportExecutions(datamartId, importId)
      .then(res =>
        this.setState({
          importExecutions: {
            items: res.data,
            isLoading: false,
            total: res.total ? res.total : res.count,
          },
        }),
      )
      .catch(err => log(err));

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

  getExecutionInfo = (execution: ImportExecution) => {
    const { colors } = this.props;
    const tasks = execution.num_tasks ? parseInt(execution.num_tasks, 10) : 0;
    const completedTasks = execution.completed_tasks
      ? parseInt(execution.completed_tasks, 10)
      : 0;
    const setColor = (status: string) => {
      switch (status) {
        case 'RUNNING':
        case 'PENDING':
          return colors['mcs-primary'];
        case 'SUCCESS':
          return colors['mcs-success'];
        case 'SUCCEEDED':
          return colors['mcs-success'];
        case 'FAILED':
          return colors['mcs-error'];
        default:
          return colors['mcs-primary'];
      }
    };
    return {
      percent: tasks ? Math.round(completedTasks / tasks) : 0,
      color: setColor(execution.status),
    };
  };

  renderStatuColumn = (record: ImportExecution) => {
    switch(record.status) {
      case 'SUCCEEDED':
      case 'SUCESS':
        return (
          <div>
            {record.status} {(record as ImportExecutionSuccess).result && (record as ImportExecutionSuccess).result.total_failure > 0 ? <span>- with errors <Tooltip placement="top" title={record.error && record.error.message}><McsIcon type="question" /></Tooltip></span> : undefined}
          </div>
        )
      default:
      return (
        (
          <div>
            {record.status}}
          </div>
        )
      )

    }
  }

  buildColumnDefinition = () => {
    const {
      intl: { formatMessage },
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
        render: (text: string, record: ImportExecution) => this.renderStatuColumn(record),
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
            <Progress percent={this.getExecutionInfo(record).percent * 100} />
          </div>
        ),
      },
      {
        intlMessage: messages.startDate,
        key: 'start_date',
        isHideable: false,
        render: (text: string) =>
          text
            ? moment(text).format('DD/MM/YYYY h:mm:ss')
            : formatMessage(messages.notStarted),
      },
      {
        intlMessage: messages.endDate,
        key: 'end_date',
        isHideable: false,
        render: (text: string) =>
          text
            ? moment(text).format('DD/MM/YYYY h:mm:ss')
            : formatMessage(messages.notEnded),
      },
      {
        intlMessage: messages.creationDate,
        key: 'submission_date',
        isHideable: false,
        render: (text: string) => moment(text).format('DD/MM/YYYY h:mm:ss'),
      },
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
)(Imports);
