import * as React from 'react';
import { Layout, message, Modal } from 'antd';
import { compose } from 'recompose';
import NativeActionBar from './NativeActionBar';
import NativeList from './NativeList';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import CreativeService, {
  CreativesOptions,
} from '../../../../services/CreativeService';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { injectDrawer } from '../../../../components/Drawer/index';
import {
  parseSearch,
  updateSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import { NATIVE_SEARCH_SETTINGS } from './constants';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { executeTasksInSequence, Task } from '../../../../utils/FormHelper';
import { DisplayAdResource } from '../../../../models/creative/CreativeResource';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { Index } from '../../../../utils';
import messagesMap from '../../DisplayAds/List/message';

const { Content } = Layout;

interface NativeListPageState {
  selectedRowKeys: string[];
  isArchiveModalVisible: boolean;
  allRowsAreSelected: boolean;
  isArchiving: boolean;
  hasNatives: boolean;
  isLoadingNatives: boolean;
  dataSource: DisplayAdResource[];
  totalNativeCreatives: number;
}

type JoinedProps = InjectedIntlProps &
  InjectedDrawerProps &
  InjectedNotificationProps &
  RouteComponentProps<CampaignRouteParams>;

class NativeListPage extends React.Component<JoinedProps, NativeListPageState> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      isArchiveModalVisible: false,
      allRowsAreSelected: false,
      isArchiving: false,
      hasNatives: true,
      isLoadingNatives: false,
      dataSource: [],
      totalNativeCreatives: 0,
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

    if (!isSearchValid(search, NATIVE_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, NATIVE_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, NATIVE_SEARCH_SETTINGS);
      this.fetchNativeAds(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      location: { search },
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    const {
      location: { pathname: nextPathname, search: nextSearch, state },
      match: {
        params: { organisationId: nextOrganisationId },
      },
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (
      !compareSearches(search, nextSearch) ||
      organisationId !== nextOrganisationId
    ) {
      if (!isSearchValid(nextSearch, NATIVE_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, NATIVE_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, NATIVE_SEARCH_SETTINGS);
        this.fetchNativeAds(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  fetchNativeAds = (
    organisationId: string,
    filter: Index<any>,
    init: boolean = false,
  ) => {
    this.setState({
      isLoadingNatives: true,
    });
    let options: CreativesOptions = {
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      archived: filter.archived,
      subtype: ['NATIVE'],
    };

    if (filter.keywords) {
      options = {
        ...options,
        keywords: filter.keywords,
      };
    }
    CreativeService.getDisplayAds(organisationId, options).then(result => {
      const data = result.data;
      const displayAdsById = normalizeArrayOfObject(data, 'id');
      this.setState({
        dataSource: Object.keys(displayAdsById).map(id => {
          return {
            ...displayAdsById[id],
          };
        }),
        isLoadingNatives: false,
        hasNatives: init ? result.count !== 0 : true,
        totalNativeCreatives: result.total || 0,
      });
    });
  };

  onSelectChange = (selectedRowKeys: string[]) => {
    this.setState({ selectedRowKeys });
  };
  selectAllItemIds = (selected: boolean = true) => {
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

  archiveNativeCreatives = () => {
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

  getAllNativeCreativeIds = () => {
    const {
      match: {
        params: { organisationId },
      },
      notifyError,
    } = this.props;

    const { totalNativeCreatives } = this.state;
    const options: CreativesOptions = {
      type: 'DISPLAY_AD',
      subtype: ['NATIVE'],
      archived: false,
      max_results: totalNativeCreatives, // mandatory
    };
    return CreativeService.getDisplayAds(organisationId, options)
      .then(apiResp =>
        apiResp.data.map(nativeCreativesResource => nativeCreativesResource.id),
      )
      .catch(err => {
        notifyError(err);
      });
  };

  archiveNativeAd = (native: DisplayAdResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location: { search, pathname, state },
      history,
      intl,
    } = this.props;

    const filter = parseSearch(search, NATIVE_SEARCH_SETTINGS);

    const { dataSource } = this.state;

    const fetchDataSource = () => {
      this.fetchNativeAds(organisationId, filter);
    };

    Modal.confirm({
      title: intl.formatMessage(messagesMap.creativeModalConfirmArchivedTitle),
      content: intl.formatMessage(messagesMap.creativeModalNoArchiveMessage),
      iconType: 'exclamation-circle',
      okText: intl.formatMessage(messagesMap.creativeModalConfirmArchivedOk),
      cancelText: intl.formatMessage(messagesMap.cancelText),
      onOk() {
        CreativeService.updateDisplayCreative(native.id, {
          ...native,
          archived: true,
        }).then(() => {
          if (dataSource.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            fetchDataSource();
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state,
            });
          }
          fetchDataSource();
        });
      },
      onCancel() {
        //
      },
    });
  };

  redirectAndNotify = () => {
    const {
      location: { search, pathname, state },
      history,
      intl,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { dataSource } = this.state;
    const filter = parseSearch(search, NATIVE_SEARCH_SETTINGS);
    if (dataSource.length === 1 && filter.currentPage !== 1) {
      const newFilter = {
        ...filter,
        currentPage: 1,
      };
      this.fetchNativeAds(organisationId, filter, true);
      history.push({
        pathname: pathname,
        search: updateSearch(search, newFilter),
        state: state,
      });
    } else {
      this.fetchNativeAds(organisationId, filter, true);
    }

    this.setState({
      isArchiveModalVisible: false,
      selectedRowKeys: [],
    });
    message.success(intl.formatMessage(messagesMap.archiveNativeSuccess));
  };

  makeArchiveAction = (nativeIds: string[]) => {
    this.setState({
      isArchiving: true,
    });
    const tasks: Task[] = [];
    nativeIds.forEach(nativeId => {
      tasks.push(() => {
        return CreativeService.getDisplayAd(nativeId)
          .then(apiResp => apiResp.data)
          .then(nativeData => {
            return CreativeService.updateDisplayCreative(nativeId, {
              ...nativeData,
              archived: true,
            });
          });
      });
    });
    executeTasksInSequence(tasks).then(() => {
      this.redirectAndNotify();
      this.setState({
        isArchiving: false,
      });
    });
  };

  handleOk = () => {
    const { selectedRowKeys, allRowsAreSelected } = this.state;

    if (allRowsAreSelected) {
      return this.getAllNativeCreativeIds().then(
        (allTemplatesIds: string[]) => {
          this.makeArchiveAction(allTemplatesIds);
        },
      );
    } else {
      return this.makeArchiveAction(selectedRowKeys);
    }
  };

  unsetAllItemsSelectedFlag = () => {
    this.setState({
      allRowsAreSelected: false,
    });
  };

  render() {
    const {
      selectedRowKeys,
      allRowsAreSelected,
      dataSource,
      hasNatives,
      isLoadingNatives,
      totalNativeCreatives,
    } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      allRowsAreSelected: allRowsAreSelected,
      selectAllItemIds: this.selectAllItemIds,
      unselectAllItemIds: this.unselectAllItemIds,
      onSelectAll: this.unsetAllItemsSelectedFlag,
      onSelect: this.unsetAllItemsSelectedFlag,
    };

    const multiEditProps = {
      archiveNatives: this.archiveNativeCreatives,
      isArchiveModalVisible: this.state.isArchiveModalVisible,
      handleOk: this.handleOk,
      handleCancel: this.handleCancel,
      isArchiving: this.state.isArchiving,
    };
    return (
      <div className="ant-layout">
        <NativeActionBar
          rowSelection={rowSelection}
          multiEditProps={multiEditProps}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <NativeList
              rowSelection={rowSelection}
              dataSource={dataSource}
              archiveNativeAd={this.archiveNativeAd}
              hasNativeAds={hasNatives}
              isLoadingNativeAds={isLoadingNatives}
              totalNativeAds={totalNativeCreatives}
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
)(NativeListPage);
