import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Row, Layout } from 'antd';
import { FormattedMessage, injectIntl } from 'react-intl';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { Index } from '../../../../../utils';
import messages from './messages';
import {
  updateSearch,
  KEYWORD_SEARCH_SETTINGS,
  parseSearch,
  compareSearches,
  PAGINATION_SEARCH_SETTINGS,
} from '../../../../../utils/LocationSearchHelper';
import DatamartReplicationTable from './DatamartReplicationTable';
import { injectDrawer } from '../../../../../components/Drawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { DatamartReplicationResource } from '../../../../../models/settings/settings';
import { Filter } from '../../Common/domain';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDatamartReplicationService } from '../../../../../services/DatamartReplicationService';
import { DatamartReplicationRouteMatchParam } from '../Edit/domain';

const { Content } = Layout;

export const DATAMART_REPLICATION_SEARCH_SETTINGS = [
  ...KEYWORD_SEARCH_SETTINGS,
  ...PAGINATION_SEARCH_SETTINGS,
];

interface State {
  datasource: DatamartReplicationResource[];
  total: number;
  isLoading: boolean;
  noItem: boolean;
}

type Props = RouteComponentProps<DatamartReplicationRouteMatchParam> &
  InjectedNotificationProps &
  InjectedDrawerProps;

class DatamartReplicationListPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartReplicationService)
  private _datamartReplicationService: IDatamartReplicationService;

  constructor(props: Props) {
    super(props);
    this.state = {
      datasource: [],
      total: 0,
      isLoading: true,
      noItem: false,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId },
      },
      location: { search },
    } = this.props;
    const filter = parseSearch(search, DATAMART_REPLICATION_SEARCH_SETTINGS);

    this.fetchDatamartReplications(datamartId, filter);
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { datamartId, organisationId },
      },
      location: { search },
    } = this.props;

    const {
      match: {
        params: {
          organisationId: prevOrganisationId,
          datamartId: prevDatamartId,
        },
      },
      location: { search: prevSearch },
    } = prevProps;

    if (
      prevOrganisationId !== organisationId ||
      !compareSearches(search, prevSearch) ||
      prevDatamartId !== datamartId
    ) {
      const filter = parseSearch(search, DATAMART_REPLICATION_SEARCH_SETTINGS);
      const calculatedDatamartId = datamartId ? datamartId : filter.datamartId;
      this.setState({
        isLoading: true,
      });
      this.fetchDatamartReplications(calculatedDatamartId, filter).then(() => {
        this.setState({
          isLoading: false,
        });
      });
    }
  }

  buildNewActionElement = () => {
    const onClick = () => {
      const {
        history,
        match: {
          params: { organisationId },
        },
      } = this.props;
      history.push(
        `/v2/o/${organisationId}/settings/datamart/datamart_replication/create`,
      );
    };
    return (
      <Button
        key={messages.newDatamartReplication.id}
        type="primary"
        onClick={onClick}
      >
        <FormattedMessage {...messages.newDatamartReplication} />
      </Button>
    );
  };

  handleFilterChange = (newFilter: Filter) => {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    this.fetchDatamartReplications(datamartId, newFilter);
  };

  fetchDatamartReplications = (datamartId: string, filter: Index<any>) => {
    const buildOptions = () => {
      let options = {};
      if (filter.currentPage && filter.pageSize) {
        options = {
          ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
        };
      }
      if (filter.keywords) {
        return {
          ...options,
          keywords: filter.keywords,
        };
      }
      return options;
    };

    this.setState({
      isLoading: true,
    });

    return this._datamartReplicationService
      .getDatamartReplications(datamartId, buildOptions())
      .then(response => {
        this.setState({
          isLoading: false,
          noItem: response && response.total === 0 && !filter.keywords,
          datasource: response.data,
          total: response.total ? response.total : response.count,
        });
      })
      .catch(error => {
        this.setState({ isLoading: false });
        this.props.notifyError(error);
      });
  };

  updateLocationSearch = (params: Index<any>) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        DATAMART_REPLICATION_SEARCH_SETTINGS,
      ),
    };

    history.push(nextLocation);
  };

  render() {
    const { isLoading, total, datasource, noItem } = this.state;

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <div>
              <div className="mcs-card-header mcs-card-title">
                <span className="mcs-card-title">
                  <FormattedMessage {...messages.datamartReplications} />
                </span>
                <span className="mcs-card-button">
                  {this.buildNewActionElement()}
                </span>
              </div>
              <hr className="mcs-separator" />
              <DatamartReplicationTable
                dataSource={datasource}
                total={total}
                isLoading={isLoading}
                noItem={noItem}
                onFilterChange={this.handleFilterChange}
              />
            </div>
          </Row>
        </Content>
      </div>
    );
  }
}

export default compose<Props, {}>(
  injectIntl,
  withRouter,
  injectDrawer,
  injectNotifications,
)(DatamartReplicationListPage);
