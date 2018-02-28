import * as React from 'react';
import { compose } from 'recompose';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import SiteService from '../../../../../services/SiteService';

import settingsMessages from '../../../messages';
import messages from './messages';

import SitesTable from './SitesTable';
import { injectDatamart, InjectedDatamartProps } from '../../../../Datamart';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { Filter } from '../../Common/domain';
import { SiteResource } from '../../../../../models/settings/settings';

export interface SitesListPageProps {
  datamartId: string;
}

interface SiteListState {
  sites: SiteResource[],
  totalSites: number,
  isFetchingSites: boolean;
  noSiteYet: boolean;
  filter: Filter;
}

type Props = RouteComponentProps<{ organisationId: string }>
  & InjectedDatamartProps
  & InjectedNotificationProps
  & SitesListPageProps

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
     datamartId,
    } = this.props;

    this.fetchSites(organisationId, datamartId, this.state.filter);
  }


  handleArchiveSite = () => {
    // to do
  }

  handleEditSite = (site: SiteResource) => {
    const {
      match: {
        params: {
          organisationId
        }
      },
      history,
    } = this.props;

    history.push(`/v2/o/${organisationId}/settings/sites/${site.id}/edit`);
  }

  handleFilterChange = (newFilter: Filter) => {
    const {
      match: {
        params: {
          organisationId
        }
      },
      datamartId,
    } = this.props;

    this.setState({ filter: newFilter });
    this.fetchSites(organisationId, datamartId, newFilter);
  }

  fetchSites = (organisationId: string, datamartId: string, filter: Filter) => {
    const buildGetSitesOptions = () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };

      if (filter.name) {
        return {
          ...options,
          name: filter.name,
        }
      }
      return options;
    };

    SiteService.getSites(organisationId, datamartId, buildGetSitesOptions()).then(response => {
      this.setState({
        isFetchingSites: false,
        noSiteYet: response && response.count === 0 && !filter.name,
        sites: response.data,
        totalSites: response.count,
      });
    }).catch(error => {
      this.setState({ isFetchingSites: false });
      this.props.notifyError(error);
    });
  }

  buildNewActionElement = (organisationId: string, datamartId: string) => {
    return (
      <Link key={messages.newSite.id} to={`/v2/o/${organisationId}/settings/sites/create`}>
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
      datamartId,
    } = this.props;

    const {
      isFetchingSites,
      totalSites,
      sites,
      noSiteYet,
      filter,
    } = this.state;

    const newButton = this.buildNewActionElement(organisationId, datamartId);
    const buttons = [newButton];

    return (
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
    );
  }
}


export default compose(
  withRouter,
  injectDatamart,
  injectNotifications,
)(SitesListPage);
