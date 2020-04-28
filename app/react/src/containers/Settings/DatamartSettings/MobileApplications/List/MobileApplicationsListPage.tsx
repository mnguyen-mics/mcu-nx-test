import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Row, Layout, Icon } from 'antd';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { Index } from '../../../../../utils';
import messages from './messages';
import settingsMessages from '../../../messages';
import {
  updateSearch,
  DATAMART_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
  parseSearch,
  compareSearches,
  PAGINATION_SEARCH_SETTINGS,
} from '../../../../../utils/LocationSearchHelper';
import MobileApplicationsTable from './MobileApplicationsTable';
import { injectDrawer } from '../../../../../components/Drawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { ChannelResourceShape } from '../../../../../models/settings/settings';
import { Filter } from '../../Common/domain';
import { MultiSelectProps } from '../../../../../components/MultiSelect';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import { lazyInject } from '../../../../../config/inversify.config';
import { IChannelService } from '../../../../../services/ChannelService';
import { TYPES } from '../../../../../constants/types';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';

const { Content } = Layout;
export interface MobileApplicationsListPageProps {
  datamartId?: string;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

interface MobileApplicationsListPageState {
  mobileApplications: ChannelResourceShape[];
  totalMobileApplications: number;
  isFetchingMobileApplications: boolean;
  noMobileApplicationYet: boolean;
  filter: Filter;
}

type Props = MobileApplicationsListPageProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps &
  InjectedDrawerProps &
  MapStateToProps;

class MobileApplicationsListPage extends React.Component<
  Props,
  MobileApplicationsListPageState
> {
  @lazyInject(TYPES.IChannelService)
  private _channelService: IChannelService;

  constructor(props: Props) {
    super(props);

    const {
      location: { search },
    } = this.props;

    const filter = this.computeFilter(search);

    this.state = {
      mobileApplications: [],
      totalMobileApplications: 0,
      isFetchingMobileApplications: true,
      noMobileApplicationYet: false,
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

  buildNewActionElement = () => {
    return (
      <Button
        key={messages.newMobileApplication.id}
        type="primary"
        onClick={this.onClick}
      >
        <FormattedMessage {...messages.newMobileApplication} />
      </Button>
    );
  };

  onClick = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    history.push(
      `/v2/o/${organisationId}/settings/datamart/mobile_application/create`,
    );
  };

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      datamartId,
    } = this.props;

    const { filter } = this.state;

    this.setState({ isFetchingMobileApplications: true }, () => {
      const fetchPromise = datamartId
        ? this.fetchMobileApplications(datamartId, filter)
        : this.fetchOrganisationMobileApplications(organisationId);

      fetchPromise.then(() => {
        this.setState({ isFetchingMobileApplications: false });
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

    const localFetchMobileApplications = (localDatamartId: string) => {
      this.setState(
        { isFetchingMobileApplications: true, filter: filter },
        () => {
          this.fetchMobileApplications(
            localDatamartId,
            filter,
          ).then(() => {
            this.setState({ isFetchingMobileApplications: false });
          });
        },
      );
    };

    const localFetchOrganisationMobileApplications = () => {
      this.setState(
        { isFetchingMobileApplications: true, filter: filter },
        () => {
          this.fetchOrganisationMobileApplications(organisationId).then(() => {
            this.setState({ isFetchingMobileApplications: false });
          });
        },
      );
    };

    if (datamartId !== previousDatamartId && datamartId) {
      localFetchMobileApplications(datamartId);
    } else if (organisationId !== previousOrganisationId) {
      localFetchOrganisationMobileApplications();
    } else if (!compareSearches(previousSearch, search)) {
      if (filter.datamartId) {
        localFetchMobileApplications(filter.datamartId);
      } else {
        localFetchOrganisationMobileApplications();
      }
    }
  }

  handleArchiveMobileApplication() {
    return Promise.resolve();
  }

  handleEditMobileApplication = (mobileApplication: ChannelResourceShape) => {
    const {
      match: {
        params: { organisationId },
      },
      location,
      history,
    } = this.props;

    history.push({
      pathname: `/v2/o/${organisationId}/settings/datamart/${mobileApplication.datamart_id}/mobile_application/${mobileApplication.id}/edit`,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  handleFilterChange = (newFilter: Filter) => {
    const {
      datamartId,
    } = this.props;
    const { filter } = this.state;
    const computedFilter: Filter = {
      ...newFilter,
      datamartId: datamartId ? datamartId : filter.datamartId,
    };
    this.setState(
      { isFetchingMobileApplications: true, filter: computedFilter },
      () => {
        if (datamartId) {
          this.fetchMobileApplications(
            datamartId,
            computedFilter,
          );
        } else if (filter.datamartId) {
          this.updateLocationSearch(computedFilter);
        } else {
          this.setState({
            isFetchingMobileApplications: false,
            mobileApplications: [],
          });
        }
      },
    );
  };

  /**
   * Data
   */

  fetchOrganisationMobileApplications = (organisationId: string) => {
    const { notifyError } = this.props;
    const { filter } = this.state;
    return this._channelService
      .getChannels({
        channel_type: 'MOBILE_APPLICATION',
        organisation_Id: organisationId
      })
      .then(res => {
        if (res.data.length === 0) {
          this.setState({
            noMobileApplicationYet: true,
          });
        } else {
          const datamartId =
            filter.datamartId &&
            res.data.filter(channel => {
              return channel.datamart_id === filter.datamartId;
            }).length !== 0
              ? filter.datamartId
              : res.data[0].datamart_id;

          const modifiedFilter: Filter = {
            ...filter,
            datamartId: datamartId,
          };

          this.setState(
            {
              filter: modifiedFilter,
            },
            () => {
              this.fetchMobileApplications(datamartId, filter);
            },
          );
        }
      })
      .catch(err => {
        this.setState({ isFetchingMobileApplications: false });
        notifyError(err);
      });
  };

  fetchMobileApplications = (
    datamartId: string,
    filter: Filter,
  ) => {
    const buildGetMobileApplicationsOptions = () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
        channel_type: 'MOBILE_APPLICATION',
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
      .getChannels(
        buildGetMobileApplicationsOptions(),
      )
      .then(response => {
        this.setState({
          isFetchingMobileApplications: false,
          mobileApplications: response.data,
          totalMobileApplications: response.total
            ? response.total
            : response.count,
        });
      })
      .catch(error => {
        this.setState({ isFetchingMobileApplications: false });
        this.props.notifyError(error);
      });
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
      datamartId,
      workspace,
    } = this.props;

    const {
      isFetchingMobileApplications,
      totalMobileApplications,
      mobileApplications,
      noMobileApplicationYet,
      filter,
    } = this.state;

    const newButton = this.buildNewActionElement();
    const buttons = [newButton];

    const datamartItems = workspace(organisationId).datamarts.map(d => ({
      key: d.id,
      value: d.name || d.token,
    }));

    const filtersOptions: Array<MultiSelectProps<any>> = [];

    if (workspace(organisationId).datamarts.length > 1) {
      const datamartFilter = {
        displayElement: (
          <div>
            <FormattedMessage
              id="settings.mobileApplication.datamartFilter"
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
                  <FormattedMessage {...settingsMessages.mobileApplications} />
                </span>
                <span className="mcs-card-button">{buttons}</span>
              </div>
              <hr className="mcs-separator" />
              <MobileApplicationsTable
                dataSource={mobileApplications}
                totalMobileApplications={totalMobileApplications}
                isFetchingMobileApplications={isFetchingMobileApplications}
                noMobileApplicationYet={noMobileApplicationYet}
                filter={filter}
                onFilterChange={this.handleFilterChange}
                onArchiveMobileApplication={this.handleArchiveMobileApplication}
                onEditMobileApplication={this.handleEditMobileApplication}
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

export default compose<Props, MobileApplicationsListPageProps>(
  injectIntl,
  withRouter,
  injectDrawer,
  injectNotifications,
  connect(mapStateToProps),
)(MobileApplicationsListPage);
