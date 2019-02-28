import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Row, Layout, Icon } from 'antd';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import ChannelService from '../../../../../services/ChannelService';
import { Index } from '../../../../../utils';
import messages from './messages';
import settingsMessages from '../../../messages';
import {
  updateSearch,
  DATAMART_SEARCH_SETTINGS,
  KEYWORD_SEARCH_SETTINGS,
  parseSearch,
  compareSearches,
} from '../../../../../utils/LocationSearchHelper';
import MobileApplicationsTable from './MobileApplicationsTable';
import { injectDrawer } from '../../../../../components/Drawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { ChannelResource } from '../../../../../models/settings/settings';
import { Filter } from '../../Common/domain';
import { injectDatamart, InjectedDatamartProps } from '../../../../Datamart';
import { MultiSelectProps } from '../../../../../components/MultiSelect';
import { getWorkspace } from '../../../../../state/Session/selectors';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';

const { Content } = Layout;
export interface MobileApplicationsListPageProps {
  datamartId?: string;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

interface MobileApplicationsListPageState {
  mobileApplications: ChannelResource[];
  totalMobileApplications: number;
  isFetchingMobileApplications: boolean;
  noMobileApplicationYet: boolean;
  filter: Filter;
}

type Props = MobileApplicationsListPageProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps &
  InjectedDrawerProps &
  MapStateToProps &
  InjectedDatamartProps;

class MobileApplicationsListPage extends React.Component<
  Props,
  MobileApplicationsListPageState
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mobileApplications: [],
      totalMobileApplications: 0,
      isFetchingMobileApplications: true,
      noMobileApplicationYet: false,
      filter: {
        currentPage: 1,
        pageSize: 10,
        keywords: '',
      },
    };
  }

  buildNewActionElement = (organisationId: string, datamartId: string) => {
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
      location: { search },
      datamart,
      datamartId,
    } = this.props;
    const filter = parseSearch(search, this.getSearchSetting(organisationId));
    const calculatedDatamartId = datamartId ? datamartId : (filter.datamartId ? filter.datamartId : datamart.id);
    this.setState({
      isFetchingMobileApplications: true,
    });
    this.fetchMobileApplications(
      organisationId,
      calculatedDatamartId,
      this.state.filter,
    ).then(() => {
      this.setState({
        isFetchingMobileApplications: false,
      });
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      datamartId,
    } = this.props;

    const {
      match: {
        params: { organisationId: nextOrganisationId },
      },
      location: { search: nextSearch },
      datamartId: nextDatamartId,
    } = nextProps;

    if (
      nextOrganisationId !== organisationId ||
      !compareSearches(search, nextSearch) ||
      nextDatamartId !== datamartId
    ) {
      const nextFilter = parseSearch(
        nextSearch,
        this.getSearchSetting(nextOrganisationId),
      );
      const calculatedDatamartId = nextDatamartId ? nextDatamartId : nextFilter.datamartId;
      this.setState({
        isFetchingMobileApplications: true,
      });
      this.fetchMobileApplications(
        organisationId,
        calculatedDatamartId,
        this.state.filter,
      ).then(() => {
        this.setState({
          isFetchingMobileApplications: false,
        });
      });
    }
  }

  handleArchiveMobileApplication() {
    return Promise.resolve();
  }

  handleEditMobileApplication = (mobileApplication: ChannelResource) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/datamart/${mobileApplication.datamart_id}/mobile_application/${
        mobileApplication.id
      }/edit`,
    );
  };

  handleFilterChange = (newFilter: Filter) => {
    const {
      match: {
        params: { organisationId },
      },
      datamart,
      datamartId,
      location: {search}
    } = this.props;

    this.setState({ filter: newFilter });
    const filters = parseSearch(
      search,
      this.getSearchSetting(organisationId),
    );
    const calculatedDatamartId = datamartId ? datamartId : (filters.datamartId ? filters.datamartId : datamart.id);
    this.fetchMobileApplications(organisationId, calculatedDatamartId, newFilter);
  };

  /**
   * Data
   */

  fetchMobileApplications = (
    organisationId: string,
    datamartId: string,
    filter: Filter,
  ) => {
    const buildGetMobileApplicationsOptions = () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
        channel_type: 'MOBILE_APPLICATION',
      };

      if (filter.keywords) {
        return {
          ...options,
          keywords: filter.keywords,
        };
      }
      return options;
    };

    return ChannelService.getChannels(
      organisationId,
      datamartId,
      buildGetMobileApplicationsOptions(),
    )
      .then(response => {
        this.setState({
          isFetchingMobileApplications: false,
          noMobileApplicationYet:
            response && response.count === 0 && !filter.keywords,
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

  getSearchSetting(organisationId: string) {
    return [...KEYWORD_SEARCH_SETTINGS, ...DATAMART_SEARCH_SETTINGS];
  }

  updateLocationSearch = (params: Index<any>) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        this.getSearchSetting(organisationId),
      ),
    };

    history.push(nextLocation);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      datamart,
      datamartId,
      workspace,
      location: { search },
    } = this.props;

    const {
      isFetchingMobileApplications,
      totalMobileApplications,
      mobileApplications,
      noMobileApplicationYet,
      filter,
    } = this.state;

    const newButton = this.buildNewActionElement(organisationId, datamart.id);
    const buttons = [newButton];

    const datamartItems = workspace(organisationId).datamarts.map(d => ({
      key: d.id,
      value: d.name || d.token,
    }));

    const filtersOptions: Array<MultiSelectProps<any>> = [];

    if (workspace(organisationId).datamarts.length > 1) {
      const filterData = parseSearch(
        search,
        this.getSearchSetting(organisationId),
      );
      const datamartFilter = {
        displayElement: (
          <div>
            <FormattedMessage id="Datamart" defaultMessage="Datamart" />{' '}
            <Icon type="down" />
          </div>
        ),
        selectedItems: filterData.datamartId
          ? [datamartItems.find(di => di.key === filterData.datamartId)]
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

const mapStateToProps = (state: any) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, MobileApplicationsListPageProps>(
  injectIntl,
  withRouter,
  injectDrawer,
  injectDatamart,
  injectNotifications,
  connect(mapStateToProps),
)(MobileApplicationsListPage);
