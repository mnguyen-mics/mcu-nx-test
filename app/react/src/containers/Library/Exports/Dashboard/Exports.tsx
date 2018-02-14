import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Layout, message } from 'antd';
import { compose } from 'recompose';
import moment from 'moment';
import ExportHeader from './ExportHeader';
import Card from '../../../../components/Card/Card';
import { Filters } from '../../../../components/ItemList'
import { Export, ExportExecution } from '../../../../models/exports/exports'
import ExportsService from '../../../../services/Library/ExportsService'
import ExportActionbar from './ExportActionbar';
import TableView from '../../../../components/TableView/TableView';
import log from '../../../../utils/Logger';
import { getCookie } from '../../../../utils/CookieHelper'
import {
  PAGINATION_SEARCH_SETTINGS,
  buildDefaultSearch,
  compareSearches,
  isSearchValid,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import messages from './messages';

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

interface ExportsProps {
}

interface ExportsState {
  exportObject: ExportItem;
  exportExecutions: ExportExecutionItems;
  
}

interface ExportRouteParams {
  organisationId: string;
  exportId: string;
}

type JoinedProps =
  ExportsProps &
  RouteComponentProps<ExportRouteParams> &
  InjectedIntlProps;

class Exports extends React.Component<JoinedProps, ExportsState> {

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
      
    }
  }

  componentDidMount() {
    const {
      match: {
        params: {
          exportId
        }
      },
      location: {
        search,
        pathname,
      },
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

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      history,
      location: {
        search,
      },
      match: {
        params: {
          organisationId,
        },
      },
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
      },
      match: {
        params: {
          organisationId: nextOrganisationId,
          exportId: nextExportId
        },
      },
    } = nextProps;

    if (!compareSearches(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, PAGINATION_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, PAGINATION_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, PAGINATION_SEARCH_SETTINGS);
        this.fetchExportExecution(nextExportId, filter);
      }
    }
  }

  fetchExportExecution = (exportId: string, options: object) => {

    const fetchExport = ExportsService.getExport(exportId)
      .then(res => res.data)
      .then(res => this.setState({ exportObject: { item: res, isLoading: false } }))
      .catch(err => log(err))
    const fetchExportExecution = ExportsService.getExportExecutions(exportId, options)
    .then(res => this.setState({ exportExecutions: { items: res.data, isLoading: false, total: res.total ? res.total : res.count } }))
    .catch(err => log(err))

    return Promise.all([fetchExport, fetchExportExecution]);
  }

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
  }
  
  downloadFile = (execution: ExportExecution) => {
    const {
      intl: {
        formatMessage,
      },
    } = this.props;

    if (execution.status === 'RUNNING' || execution.status === 'PENDING') {
      message.error(formatMessage(messages.exportRunning))
    } else {
      (window as any).location =
      `${(window as any).MCS_CONSTANTS.API_URL}/v1/exports/
${this.props.match.params.exportId}/executions/
${execution.id}/files/
technical_name=${execution.result.output_files[0]}
?access_token=${getCookie('access_token')}` 
    }
  }

  buildColumnDefinition = () => {

    const {
      intl: {
        formatMessage
      },
    } = this.props;

    const dataColumns = [
      {
        intlMessage: messages.name,
        key: 'status',
        isHideable: false,
        render: (text: string) => (
          text
        ),
      },
      {
        intlMessage: messages.creationDate,
        key: 'creation_date',
        isHideable: false,
        render: (text: string) => moment(text).format('DD/MM/YYYY h:mm:ss')
      },
      {
        intlMessage: messages.startDate,
        key: 'start_date',
        isHideable: false,
        render: (text: string) => text ? moment(text).format('DD/MM/YYYY h:mm:ss') : formatMessage(messages.notStarted)
      }
     
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            intlMessage: messages.download,
            callback: this.downloadFile,
          },
        ],
      },
    ];

    return  {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns,
    };
  }


  render() {

    const {

      location: {
        search,
      },
    } = this.props;


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
      total: this.state.exportExecutions.total,
    };

    const onNewExecution = () => {
      return this.fetchExportExecution(this.props.match.params.exportId, filter)
    }

    return (
      <div className="ant-layout">
        <ExportActionbar
          exportObject={this.state.exportObject.item}
          isExportExecutionRunning={
            this.state.exportExecutions.items.length && (
            this.state.exportExecutions.items[0].status === 'PENDING' ||
            this.state.exportExecutions.items[0].status === 'RUNNING'
          ) ? true : false}
          onNewExecution={onNewExecution}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <ExportHeader
              object={this.state.exportObject.item && this.state.exportObject.item}
            />
            <Card title={'Export Execution'}>
              <TableView
                dataSource={this.state.exportExecutions.items}
                columns={this.buildColumnDefinition().dataColumnsDefinition}
                actionsColumnsDefinition={this.buildColumnDefinition().actionsColumnsDefinition}
                pagination={pagination}
                loading={this.state.exportExecutions.isLoading}
              />
            </Card>
          </Content>
        </div>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
)(Exports);
