import * as React from 'react';
import { compose } from 'recompose';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Row, Button, Layout } from 'antd';
import { FormattedMessage } from 'react-intl';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import ChannelService from '../../../../../services/ChannelService';

import settingsMessages from '../../../messages';
import messages from './messages';

import SitesTable from './SitesTable';
import { injectDatamart, InjectedDatamartProps } from '../../../../Datamart';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { Filter } from '../../Common/domain';
import { ChannelResource } from '../../../../../models/settings/settings';

const { Content } = Layout;

interface SiteListState {
  sites: ChannelResource[],
  totalSites: number,
  isFetchingSites: boolean;
  noSiteYet: boolean;
  filter: Filter;
}

type Props = RouteComponentProps<{ organisationId: string }>
  & InjectedDatamartProps
  & InjectedNotificationProps

class SitesListPage extends React.Component<Props, SiteListState> {

  constructor(props: Props) {
    super(props);
    this.state = {
      sites: [],
      totalSites: 0,
      isFetchingSites: true,
      noSiteYet: false,
      filter: {
        currentPage: 1,
        pageSize: 10,
        name: '',
      },
    };
  }

  componentDidMount() {
    const {
     match: {
       params: {
         organisationId
       }
     }, 
     datamart,
    } = this.props;

    this.fetchSites(organisationId, datamart.id, this.state.filter);
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
     match: {
       params: {
         organisationId
       }
     }, 
     datamart,
    } = this.props;

    const {
      match: {
        params: {
          organisationId: nextOrganiastionId
        }
      }, 
      datamart: nextDatamart,
     } = this.props;

    if (nextOrganiastionId !== organisationId || nextDatamart.id !== datamart.id)
      this.fetchSites(organisationId, datamart.id, this.state.filter);
  }


  handleArchiveSite = () => {
    // to do
  }

  handleEditSite = (site: ChannelResource) => {
    const {
      match: {
        params: {
          organisationId
        }
      },
      history,
    } = this.props;

    history.push(`/v2/o/${organisationId}/settings/datamart/sites/${site.id}/edit`);
  }

  handleFilterChange = (newFilter: Filter) => {
    const {
      match: {
        params: {
          organisationId
        }
      },
      datamart,
    } = this.props;

    this.setState({ filter: newFilter });
    this.fetchSites(organisationId, datamart.id, newFilter);
  }

  fetchSites = (organisationId: string, datamartId: string, filter: Filter) => {
    const buildGetSitesOptions = () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
        channel_type: 'SITE'
      };

      if (filter.name) {
        return {
          ...options,
          name: filter.name,
        }
      }
      return options;
    };

    ChannelService.getChannels(organisationId, datamartId, buildGetSitesOptions()).then(response => {
      this.setState({
        isFetchingSites: false,
        noSiteYet: response && response.count === 0 && !filter.name,
        sites: response.data,
        totalSites: response.total ? response.total : response.count,
      });
    }).catch(error => {
      this.setState({ isFetchingSites: false });
      this.props.notifyError(error);
    });
  }

  buildNewActionElement = (organisationId: string, datamartId: string) => {
    return (
      <Link key={messages.newSite.id} to={`/v2/o/${organisationId}/settings/datamart/sites/create`}>
        <Button key={messages.newSite.id} type="primary" htmlType="submit">
          <FormattedMessage {...messages.newSite} />
        </Button>
      </Link>
    );
  }

  render() {
    const {
      match: {
        params: {
          organisationId
        }
      },
      datamart,
    } = this.props;

    const {
      isFetchingSites,
      totalSites,
      sites,
      noSiteYet,
      filter,
    } = this.state;

    const newButton = this.buildNewActionElement(organisationId, datamart.id);
    const buttons = [newButton];

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <div>
              <div className="mcs-card-header mcs-card-title">
                <span className="mcs-card-title"><FormattedMessage {...settingsMessages.sites} /></span>
                <span className="mcs-card-button">{buttons}</span>
              </div>
              <hr className="mcs-separator" />
              <SitesTable
                dataSource={sites}
                totalSites={totalSites}
                isFetchingSites={isFetchingSites}
                noSiteYet={noSiteYet}
                filter={filter}
                onFilterChange={this.handleFilterChange}
                onArchiveSite={this.handleArchiveSite}
                onEditSite={this.handleEditSite}
              />
            </div>
          </Row>
        </Content>
      </div>
    );
  }
}


export default compose<Props, {}>(
  withRouter,
  injectDatamart,
  injectNotifications,
)(SitesListPage);
