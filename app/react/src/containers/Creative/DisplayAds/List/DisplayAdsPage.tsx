import * as React from 'react';
import { Layout, message, Modal } from 'antd';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps, StaticContext } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import DisplayAdsActionBar from './DisplayAdsActionBar';
import DisplayAdsTable from './DisplayAdsTable';
import { injectDrawer } from '../../../../components/Drawer';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import {
  DisplayAdResource,
  CreativeAuditAction,
} from '../../../../models/creative/CreativeResource';
import { CreativesOptions, ICreativeService } from '../../../../services/CreativeService';
import {
  parseSearch,
  updateSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { CREATIVE_DISPLAY_SEARCH_SETTINGS } from './constants';
import { executeTasksInSequence, Task } from '../../../../utils/PromiseHelper';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { Index } from '../../../../utils';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import messages from './message';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Content } = Layout;

interface State {
  selectedRowKeys: string[];
  allRowsAreSelected: boolean;
  isArchiveModalVisible: boolean;
  isArchiving: boolean;
  isUpdatingAuditStatus: boolean;
  isLoadingDisplayAds: boolean;
  dataSource: DisplayAdResource[];
  totalDisplayAds: number;
  hasDisplayAds: boolean;
}

type JoinedProps = InjectedIntlProps &
  InjectedDrawerProps &
  InjectedNotificationProps &
  RouteComponentProps<CampaignRouteParams, StaticContext, { reloadDataSource?: boolean }>;

class DisplayAdsPage extends React.Component<JoinedProps, State> {
  @lazyInject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      allRowsAreSelected: false,
      isArchiveModalVisible: false,
      isArchiving: false,
      isUpdatingAuditStatus: false,
      isLoadingDisplayAds: false,
      dataSource: [],
      totalDisplayAds: 0,
      hasDisplayAds: true,
    };
  }

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
      match: {
        params: { organisationId },
      },
    } = this.props;

    if (!isSearchValid(search, CREATIVE_DISPLAY_SEARCH_SETTINGS)) {
      history.replace(
        {
          pathname: pathname,
          search: buildDefaultSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS),
        },
        { reloadDataSource: true },
      );
    } else {
      const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);
      this.fetchDisplayAds(organisationId, filter, true);
    }
  }

  componentDidUpdate(previousProps: JoinedProps) {
    const {
      location: { pathname, search, state },
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const {
      location: { search: previousSearch },
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearches(search, previousSearch) || organisationId !== previousOrganisationId) {
      if (!isSearchValid(search, CREATIVE_DISPLAY_SEARCH_SETTINGS)) {
        history.replace(
          {
            pathname: pathname,
            search: buildDefaultSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS),
          },
          { reloadDataSource: organisationId !== previousOrganisationId },
        );
      } else {
        const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);
        this.fetchDisplayAds(organisationId, filter, checkEmptyDataSource);
      }
    }
  }

  fetchDisplayAds = (organisationId: string, filter: Index<any>, init: boolean = false) => {
    this.setState({
      isLoadingDisplayAds: true,
    });
    let options: CreativesOptions = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      archived: filter.archived,
      subtype: ['BANNER', 'VIDEO'],
    };

    if (filter.keywords) {
      options = {
        ...options,
        keywords: filter.keywords,
      };
    }
    this._creativeService.getDisplayAds(organisationId, options).then(result => {
      const data = result.data;
      const displayAdsById = normalizeArrayOfObject(data, 'id');
      this.setState({
        dataSource: Object.keys(displayAdsById).map(id => {
          return {
            ...displayAdsById[id],
          };
        }),
        isLoadingDisplayAds: false,
        hasDisplayAds: init ? result.count !== 0 : true,
        totalDisplayAds: result.total || 0,
      });
    });
  };

  getAllCreativesIds = () => {
    const {
      match: {
        params: { organisationId },
      },
      notifyError,
    } = this.props;

    const { totalDisplayAds } = this.state;
    const options: CreativesOptions = {
      type: 'DISPLAY_AD',
      archived: false,
      max_results: totalDisplayAds,
    };
    return this._creativeService
      .getDisplayAds(organisationId, options)
      .then(apiResp => apiResp.data.map(creativeResource => creativeResource.id))
      .catch(err => {
        notifyError(err);
      });
  };

  makeAuditAction = (creativesIds: string[], action: CreativeAuditAction) => {
    this.setState({
      isUpdatingAuditStatus: true,
    });
    const tasks: Task[] = [];
    const { notifyError } = this.props;
    creativesIds.forEach(creativeId => {
      tasks.push(() => {
        return this._creativeService
          .getDisplayAd(creativeId)
          .then(apiResp => apiResp.data)
          .then(creative => {
            if (creative.available_user_audit_actions.includes(action)) {
              this._creativeService
                .makeAuditAction(creative.id, action)
                .catch(err => notifyError(err));
            }
          });
      });
    });
    executeTasksInSequence(tasks)
      .then(() => {
        this.setState({
          selectedRowKeys: [],
          allRowsAreSelected: false,
          isUpdatingAuditStatus: false,
        });
        this.redirect();
      })
      .catch((err: any) => {
        this.setState({
          isUpdatingAuditStatus: false,
        });
        this.props.notifyError(err);
      });
  };

  handleAuditAction = (action: CreativeAuditAction) => {
    const { allRowsAreSelected, selectedRowKeys } = this.state;
    if (allRowsAreSelected) {
      this.getAllCreativesIds().then((allCreativesIds: string[]) => {
        this.makeAuditAction(allCreativesIds, action);
      });
    } else {
      this.makeAuditAction(selectedRowKeys, action);
    }
  };

  onSelectChange = (selectedRowKeys: string[]) => {
    this.setState({ selectedRowKeys });
  };

  selectAllItemIds = () => {
    this.setState({
      allRowsAreSelected: true,
    });
  };

  unselectAllItemIds = () => {
    this.setState({
      selectedRowKeys: [],
      allRowsAreSelected: false,
    });
  };

  unsetAllItemsSelectedFlag = () => {
    this.setState({
      allRowsAreSelected: false,
    });
  };

  archiveCreatives = () => {
    this.showModal();
  };

  showModal = () => {
    this.setState({
      isArchiveModalVisible: true,
    });
  };

  handleCancel = () => {
    this.setState({
      isArchiveModalVisible: false,
    });
  };

  redirect = () => {
    const {
      location: { search, pathname, state },
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { dataSource } = this.state;

    const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);
    if (dataSource.length === 1 && filter.currentPage !== 1) {
      const newFilter = {
        ...filter,
        currentPage: filter.currentPage - 1,
      };
      this.fetchDisplayAds(organisationId, filter, true);
      history.push(
        {
          pathname: pathname,
          search: updateSearch(search, newFilter),
        },
        state,
      );
    }
    this.fetchDisplayAds(organisationId, filter, true);
  };

  makeArchiveAction = (creativesIds: string[]) => {
    this.setState({
      isArchiving: true,
    });
    const tasks: Task[] = [];
    creativesIds.forEach(creativeId => {
      tasks.push(() => {
        return this._creativeService
          .getDisplayAd(creativeId)
          .then(apiResp => apiResp.data)
          .then(creativeData => {
            if (
              creativeData.audit_status !== 'AUDIT_PENDING' &&
              creativeData.audit_status !== 'AUDIT_FAILED' &&
              creativeData.audit_status !== 'AUDIT_PASSED'
            ) {
              return this._creativeService.updateDisplayCreative(creativeId, {
                ...creativeData,
                archived: true,
              });
            }
            return Promise.resolve() as any;
          });
      });
    });
    executeTasksInSequence(tasks).then(() => {
      this.setState(
        {
          isArchiveModalVisible: false,
          selectedRowKeys: [],
        },
        () => {
          message.success(this.props.intl.formatMessage(messages.archiveSuccess));
          this.redirect();
          this.setState({
            isArchiving: false,
          });
        },
      );
    });
  };

  archiveDisplayAd = (creative: DisplayAdResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location: { search, pathname, state },
      intl,
      history,
    } = this.props;

    const { dataSource } = this.state;

    const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);

    const fetchDataSource = () => {
      this.fetchDisplayAds(organisationId, filter);
    };

    const updateDisplayCreative = () => {
      return this._creativeService.updateDisplayCreative(creative.id, {
        ...creative,
        archived: true,
      });
    };

    if (creative.audit_status === 'NOT_AUDITED') {
      Modal.confirm({
        title: intl.formatMessage(messages.creativeModalConfirmArchivedTitle),
        content: intl.formatMessage(messages.creativeModalConfirmArchivedContent),
        icon: <ExclamationCircleOutlined />,
        okText: intl.formatMessage(messages.creativeModalConfirmArchivedOk),
        cancelText: intl.formatMessage(messages.cancelText),
        onOk() {
          updateDisplayCreative().then(() => {
            if (dataSource.length === 1 && filter.currentPage !== 1) {
              const newFilter = {
                ...filter,
                currentPage: filter.currentPage - 1,
              };
              fetchDataSource();
              history.replace(
                {
                  pathname: pathname,
                  search: updateSearch(search, newFilter),
                },
                state,
              );
            }
            fetchDataSource();
          });
        },
        onCancel() {
          //
        },
      });
    } else {
      Modal.warning({
        title: intl.formatMessage(messages.creativeModalNoArchiveTitle),
        content: intl.formatMessage(messages.creativeModalNoArchiveMessage),
        icon: <ExclamationCircleOutlined />,
      });
    }
  };

  handleOk = () => {
    const { selectedRowKeys, allRowsAreSelected } = this.state;

    if (allRowsAreSelected) {
      return this.getAllCreativesIds().then((allCreativesIds: string[]) => {
        this.makeArchiveAction(allCreativesIds);
      });
    } else {
      return this.makeArchiveAction(selectedRowKeys);
    }
  };

  render() {
    const {
      selectedRowKeys,
      allRowsAreSelected,
      isUpdatingAuditStatus,
      dataSource,
      hasDisplayAds,
      totalDisplayAds,
      isLoadingDisplayAds,
    } = this.state;

    const rowSelection = {
      selectedRowKeys,
      allRowsAreSelected: allRowsAreSelected,
      onChange: this.onSelectChange,
      selectAllItemIds: this.selectAllItemIds,
      unselectAllItemIds: this.unselectAllItemIds,
      onSelectAll: this.unsetAllItemsSelectedFlag,
      onSelect: this.unsetAllItemsSelectedFlag,
    };

    const multiEditProps = {
      archiveCreatives: this.archiveCreatives,
      isArchiveModalVisible: this.state.isArchiveModalVisible,
      handleOk: this.handleOk,
      handleCancel: this.handleCancel,
      handleAuditAction: this.handleAuditAction,
      isArchiving: this.state.isArchiving,
    };

    return (
      <div className='ant-layout'>
        <DisplayAdsActionBar
          selectedRowKeys={rowSelection.selectedRowKeys}
          multiEditProps={multiEditProps}
        />
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
            <DisplayAdsTable
              rowSelection={rowSelection}
              isUpdatingAuditStatus={isUpdatingAuditStatus}
              dataSource={dataSource}
              archiveDisplayAd={this.archiveDisplayAd}
              hasDisplayAds={hasDisplayAds}
              isLoadingDisplayAds={isLoadingDisplayAds}
              totalDisplayAds={totalDisplayAds}
            />
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<JoinedProps, {}>(
  withRouter,
  injectIntl,
  injectDrawer,
  injectNotifications,
)(DisplayAdsPage);
