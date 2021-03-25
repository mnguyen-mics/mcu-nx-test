import * as React from 'react';
import { Layout, Row, Breadcrumb } from 'antd';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  compareSearches,
} from '../../../../../utils/LocationSearchHelper';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  InjectedIntlProps,
} from 'react-intl';
import { IDatamartService } from '../../../../../services/DatamartService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { Index } from '../../../../../utils';
import { Link } from 'react-router-dom';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import {
  EmptyTableView,
  McsIcon,
} from '@mediarithmics-private/mcs-components-library';
import { TableViewWrapper } from '../../../../../components/TableView';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const { Content } = Layout;

interface State {
  dataSource: DatamartResource[];
  loading: boolean;
  total: number;
  filters: Index<any>;
  datamart?: DatamartResource;
}

export const messages = defineMessages({
  datamarts: {
    id: 'settings.datamart.sources.datamarts',
    defaultMessage: 'Datamarts',
  },
  title: {
    id: 'settings.datamart.sources.title',
    defaultMessage: 'Sources',
  },
  id: {
    id: 'settings.datamart.sources.table.column.id',
    defaultMessage: 'Id',
  },
  name: {
    id: 'settings.datamart.sources.table.column.name',
    defaultMessage: 'Datamart Name',
  },
  noData: {
    id: 'settings.datamart.sources.empty.table',
    defaultMessage: 'No Datamart Sources',
  },
});

type Props = RouteComponentProps<{
  organisationId: string;
  datamartId: string;
}> &
  InjectedIntlProps &
  InjectedNotificationProps;

class SourcesListPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      total: 0,
      dataSource: [],
      filters: {
        currentPage: 0,
        pageSize: 10,
      },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId },
      },
      location: { search },
    } = this.props;
    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
    this.fetchList(datamartId, filter);
    this.fetchDatamart(datamartId);
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { datamartId },
      },
      location: { search },
    } = this.props;

    const {
      match: {
        params: { datamartId: previousDatamartId },
      },
      location: { search: previousSearch },
    } = previousProps;

    if (
      datamartId !== previousDatamartId ||
      compareSearches(search, previousSearch)
    ) {
      const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
      this.fetchList(datamartId, filter);
      if (datamartId !== previousDatamartId) {
        this.fetchDatamart(datamartId);
      }
    }
  }

  handleFilterChange = (newFilter: Index<any>) => {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;

    this.setState({ filters: newFilter });

    this.fetchList(datamartId, newFilter);
  };

  fetchList = (datamartId: string, filters: Index<any>) => {
    const { notifyError } = this.props;
    this.setState({ loading: true });
    return this._datamartService
      .getSources(datamartId)
      .then((res) =>
        this.setState({
          loading: false,
          dataSource: res.data,
          total: res.total || res.count,
        }),
      )
      .catch((err) => {
        notifyError(err);
        this.setState({ loading: false });
      });
  };

  fetchDatamart = (datamartId: string) => {
    return this._datamartService
      .getDatamart(datamartId)
      .then((res) => this.setState({ datamart: res.data }));
  };

  public render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;
    const { dataSource, loading, filters, total, datamart } = this.state;

    const dataColumns: Array<DataColumnDefinition<DatamartResource>> = [
      {
        title: formatMessage(messages.id),
        key: 'id',
        isHideable: false,
      },
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
      },
    ];

    const pagination = {
      current: filters.currentPage,
      pageSize: filters.pageSize,
      total: total,
      onChange: (page: number, size: number) =>
        this.handleFilterChange({
          currentPage: page,
          pageSize: size,
        }),
      onShowSizeChange: (current: number, size: number) =>
        this.handleFilterChange({
          pageSize: size,
          currentPage: 1,
        }),
    };

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <Breadcrumb
              className={'mcs-breadcrumb'}
              separator={<McsIcon type="chevron-right" />}
            >
              <Breadcrumb.Item>
                <Link
                  to={`/v2/o/${organisationId}/settings/datamart/datamarts`}
                >
                  <FormattedMessage {...messages.datamarts} />
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {datamart ? (
                  datamart.name ? (
                    datamart.name
                  ) : (
                    '...'
                  )
                ) : (
                  <i className="mcs-table-cell-loading" />
                )}
              </Breadcrumb.Item>
            </Breadcrumb>
          </Row>
          <Row className="mcs-table-container">
            <div className="mcs-card-header mcs-card-title">
              <span className="mcs-card-title">
                <FormattedMessage {...messages.title} />
              </span>
            </div>
            <hr className="mcs-separator" />
            {total === 0 && loading === false ? (
              <EmptyTableView
                iconType="settings"
                message={formatMessage(messages.noData)}
                className="mcs-table-view-empty mcs-empty-card"
              />
            ) : (
              <TableViewWrapper
                dataSource={dataSource}
                loading={loading}
                columns={dataColumns}
                pagination={pagination}
              />
            )}
          </Row>
        </Content>
      </div>
    );
  }
}

export default compose<{}, Props>(
  withRouter,
  injectIntl,
  injectNotifications,
)(SourcesListPage);
