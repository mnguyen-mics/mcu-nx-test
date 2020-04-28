import * as React from 'react';
import { compose } from 'recompose';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Row, Button, Layout, Icon, Modal } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import settingsMessages from '../../../messages';
import messages from './messages';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import SitesTable from './SitesTable';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { Filter } from '../../Common/domain';
import { ChannelResourceShape } from '../../../../../models/settings/settings';
import {
  updateSearch,
  DATAMART_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
  parseSearch,
  compareSearches,
  PAGINATION_SEARCH_SETTINGS,
} from '../../../../../utils/LocationSearchHelper';
import { Index } from '../../../../../utils';
import { MultiSelectProps } from '../../../../../components/MultiSelect';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { connect } from 'react-redux';
import { lazyInject } from '../../../../../config/inversify.config';
import { IChannelService } from '../../../../../services/ChannelService';
import { TYPES } from '../../../../../constants/types';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';

const { Content } = Layout;

export interface SitesListPageProps {
  datamartId?: string;
}

interface SiteListState {
  sites: ChannelResourceShape[];
  totalSites: number;
  isFetchingSites: boolean;
  noSiteYet: boolean;
  filter: Filter;
}
interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = SitesListPageProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  MapStateToProps &
  InjectedNotificationProps;

class SitesListPage extends React.Component<Props, SiteListState> {
  @lazyInject(TYPES.IChannelService)
  private _channelService: IChannelService;

  constructor(props: Props) {
    super(props);

    const {
      location: { search },
    } = this.props;

    const filter = this.computeFilter(search);

    this.state = {
      sites: [],
      totalSites: 0,
      isFetchingSites: true,
      noSiteYet: false,
      filter: filter,
    };
  }

  computeFilter = (search: string): Filter => {
    const parsedFilter = parseSearch(search, this.getSearchSetting());

    const filter: Filter = {
      currentPage: parsedFilter.currentPage ? parsedFilter.currentPage : 1,
      pageSize: parsedFilter.pageSize ? parsedFilter.pageSize : 10,
      keywords: parsedFilter.keywords ? parsedFilter.keywords : '',
      datamartId: parsedFilter.datamartId,
    };

    return filter;
  };

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      datamartId,
    } = this.props;

    const { filter } = this.state;

    this.setState({ isFetchingSites: true }, () => {
      const fetchPromise = datamartId
        ? this.fetchSites(datamartId, filter)
        : this.fetchOrganisationSites(organisationId);

      fetchPromise.then(() => {
        this.setState({ isFetchingSites: false });
      });
    });
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      datamartId,
    } = this.props;

    const {
      match: {
        params: { organisationId: previousOrganisationId },
      },
      location: { search: previousSearch },
      datamartId: previousDatamartId,
    } = previousProps;

    const filter: Filter = this.computeFilter(search);

    const localFetchSites = (localDatamartId: string) => {
      this.setState({ isFetchingSites: true, filter: filter }, () => {
        this.fetchSites(localDatamartId, filter).then(() => {
          this.setState({ isFetchingSites: false });
        });
      });
    };

    const localFetchOrganisationSites = () => {
      this.setState({ isFetchingSites: true, filter: filter }, () => {
        this.fetchOrganisationSites(organisationId).then(() => {
          this.setState({ isFetchingSites: false });
        });
      });
    };

    if (datamartId !== previousDatamartId && datamartId) {
      localFetchSites(datamartId);
    } else if (organisationId !== previousOrganisationId) {
      localFetchOrganisationSites();
    } else if (!compareSearches(previousSearch, search)) {
      if (filter.datamartId) {
        localFetchSites(filter.datamartId);
      } else {
        localFetchOrganisationSites();
      }
    }
  }

  handleDeleteSite = (site: ChannelResourceShape) => {
    const {
      location: { pathname, state, search },
      history,
      intl: { formatMessage },
    } = this.props;

    const { sites, filter } = this.state;

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.deleteSiteModalTitle),
      okText: formatMessage(messages.deleteSiteModalOk),
      cancelText: formatMessage(messages.deleteSiteModalCancel),
      onOk: () => {
        this._channelService.deleteSite(site.datamart_id, site.id).then(() => {
          if (sites.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state,
            });
            return Promise.resolve();
          }
          return this.fetchSites(
            site.datamart_id,
            this.state.filter,
          ).then(() => {
            this.setState({
              isFetchingSites: false,
            });
          });
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  handleEditSite = (site: ChannelResourceShape) => {
    const {
      match: {
        params: { organisationId },
      },
      location,
      history,
    } = this.props;

    history.push({
      pathname: `/v2/o/${organisationId}/settings/datamart/${site.datamart_id}/sites/${site.id}/edit`,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  handleFilterChange = (newFilter: Filter) => {
    const { datamartId } = this.props;
    const { filter } = this.state;
    const computedFilter: Filter = {
      ...newFilter,
      datamartId: datamartId ? datamartId : filter.datamartId,
    };
    this.setState({ isFetchingSites: true, filter: computedFilter }, () => {
      if (datamartId) {
        this.fetchSites(datamartId, computedFilter);
      } else if (filter.datamartId) {
        this.updateLocationSearch(computedFilter);
      } else {
        this.setState({ isFetchingSites: false, sites: [] });
      }
    });
  };

  fetchOrganisationSites = (organisationId: string) => {
    const { workspace } = this.props;
    const { filter } = this.state;

    const datamart =
      workspace(organisationId).datamarts.length > 0 &&
      workspace(organisationId).datamarts[0];

    if (!datamart) return Promise.resolve();

    const modifiedFilter: Filter = {
      ...filter,
      datamartId: datamart.id,
    };

    this.setState({ filter: modifiedFilter });
    return this.fetchSites(datamart.id, filter);
  };

  fetchSites = (datamartId: string, filter: Filter) => {
    const buildGetSitesOptions = () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
        channel_type: 'SITE',
        datamart_id: datamartId,
      };
      if (filter.keywords) {
        return {
          ...options,
          keywords: filter.keywords,
        };
      }

      return options;
    };

    return this._channelService
      .getChannels(buildGetSitesOptions())
      .then(response => {
        this.setState({
          isFetchingSites: false,
          sites: response.data,
          totalSites: response.total ? response.total : response.count,
        });
      })
      .catch(error => {
        this.setState({ isFetchingSites: false });
        this.props.notifyError(error);
      });
  };

  buildNewActionElement = (organisationId: string) => {
    const { workspace } = this.props;
    const datamarts = workspace(organisationId).datamarts;

    const url =
      datamarts.length > 1
        ? `/v2/o/${organisationId}/settings/datamart/sites/create`
        : `/v2/o/${organisationId}/settings/datamart/sites/create?selectedDatamartId=${datamarts[0].id}`;
    return (
      <Link key={messages.newSite.id} to={url}>
        <Button key={messages.newSite.id} type="primary">
          <FormattedMessage {...messages.newSite} />
        </Button>
      </Link>
    );
  };

  getSearchSetting() {
    return [
      ...KEYWORD_SEARCH_SETTINGS,
      ...DATAMART_SEARCH_SETTINGS,
      ...PAGINATION_SEARCH_SETTINGS,
    ];
  }

  updateLocationSearch = (params: Index<any>) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, this.getSearchSetting()),
    };

    history.push(nextLocation);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      workspace,
      datamartId,
    } = this.props;

    const {
      isFetchingSites,
      totalSites,
      sites,
      noSiteYet,
      filter,
    } = this.state;

    const newButton = this.buildNewActionElement(organisationId);
    const buttons = [newButton];

    const datamartItems = workspace(organisationId).datamarts.map(d => ({
      key: d.id,
      value: d.name || d.token,
    }));

    const filtersOptions: Array<MultiSelectProps<any>> = [];

    if (datamartItems.length > 1) {
      const datamartFilter = {
        displayElement: (
          <div>
            <FormattedMessage
              id="settings.datamart.site.list.datamartFilter"
              defaultMessage="Datamart"
            />{' '}
            <Icon type="down" />
          </div>
        ),
        selectedItems: filter.datamartId
          ? [datamartItems.find(di => di.key === filter.datamartId)]
          : [datamartItems[0]],
        items: datamartItems,
        singleSelectOnly: true,
        getKey: (item: any) => (item && item.key ? item.key : ''),
        display: (item: any) => item.value,
        handleItemClick: (datamartItem: { key: string; value: string }) => {
          this.updateLocationSearch({
            datamartId:
              datamartItem && datamartItem.key ? datamartItem.key : undefined,
            currentPage: 1,
          });
        },
      };
      if (!datamartId) {
        filtersOptions.push(datamartFilter);
      }
    }

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <div>
              <div className="mcs-card-header mcs-card-title">
                <span className="mcs-card-title">
                  <FormattedMessage {...settingsMessages.sites} />
                </span>
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
                onDeleteSite={this.handleDeleteSite}
                onEditSite={this.handleEditSite}
                filtersOptions={filtersOptions}
              />
            </div>
          </Row>
        </Content>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, SitesListPageProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(mapStateToProps),
)(SitesListPage);
