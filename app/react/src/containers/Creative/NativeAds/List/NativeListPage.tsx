import * as React from 'react';
import { Layout, message } from 'antd';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import NativeActionBar from './NativeActionBar';
import NativeList from './NativeList';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import CreativeService, {
  CreativesOptions,
} from '../../../../services/CreativeService';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { injectDrawer } from '../../../../components/Drawer/index';
import {
  getNativeCreatives,
  isFetchingNativeCreatives,
  hasNativeCreatives,
  getNativeCreativesTotal,
} from '../../../../state/Creatives/Native/selectors';
import {
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { NATIVE_SEARCH_SETTINGS } from './constants';
import * as NativeCreativesActions from '../../../../state/Creatives/Native/actions';
import { Filters } from '../../../../components/ItemList';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { executeTasksInSequence, Task } from '../../../../utils/FormHelper';

const messages = defineMessages({
  archiveSuccess: {
    id: 'archive.native.success.msg',
    defaultMessage: 'Native creative successfully archived',
  },
});

const { Content } = Layout;

export interface MapDispatchToProps {
  fetchNativeCreatives: (
    organisationId: string,
    filter: Filters,
    bool?: boolean,
  ) => void;
  resetNativeCreatives: () => void;
}

export interface MapStateToProps {
  hasNatives: boolean;
  isFetchingNatives: boolean;
  dataSource: object[]; // type better
  totalNativeCreatives: number;
}

interface NativeListPageState {
  selectedRowKeys: string[];
  isArchiveModalVisible: boolean;
  allRowsAreSelected: boolean;
  isArchiving: boolean;
}

type JoinedProps = InjectedIntlProps &
  MapStateToProps &
  MapDispatchToProps &
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
    };
  }
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
      totalNativeCreatives,
      match: {
        params: { organisationId },
      },
      notifyError,
    } = this.props;
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

  redirectAndNotify = () => {
    const {
      location: { search, pathname, state },
      history,
      intl,
      match: {
        params: { organisationId },
      },
      dataSource,
    } = this.props;
    const filter = parseSearch(search, NATIVE_SEARCH_SETTINGS);
    if (dataSource.length === 1 && filter.currentPage !== 1) {
      const newFilter = {
        ...filter,
        currentPage: 1,
      };
      this.props.fetchNativeCreatives(organisationId, filter, true);
      history.push({
        pathname: pathname,
        search: updateSearch(search, newFilter),
        state: state,
      });
    } else {
      this.props.fetchNativeCreatives(organisationId, filter, true);
    }

    this.setState({
      isArchiveModalVisible: false,
      selectedRowKeys: [],
    });
    message.success(intl.formatMessage(messages.archiveSuccess));
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
    const { selectedRowKeys, allRowsAreSelected } = this.state;
    const {
      hasNatives,
      isFetchingNatives,
      dataSource,
      totalNativeCreatives,
      fetchNativeCreatives,
      resetNativeCreatives,
    } = this.props;
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

    const reduxProps = {
      hasNatives,
      isFetchingNatives,
      dataSource,
      totalNativeCreatives,
      fetchNativeCreatives,
      resetNativeCreatives,
    };

    return (
      <div className="ant-layout">
        <NativeActionBar
          rowSelection={rowSelection}
          multiEditProps={multiEditProps}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <NativeList rowSelection={rowSelection} {...reduxProps} />
          </Content>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: MapStateToProps) => ({
  hasNatives: hasNativeCreatives(state),
  isFetchingNativeCreatives: isFetchingNativeCreatives(state),
  dataSource: getNativeCreatives(state),
  totalNativeCreatives: getNativeCreativesTotal(state),
});

const mapDispatchToProps = {
  fetchNativeCreatives: NativeCreativesActions.fetchNativeCreatives.request,
  resetNativeCreatives: NativeCreativesActions.resetNativeCreatives,
};
export default compose<JoinedProps, {}>(
  withRouter,
  injectIntl,
  injectDrawer,
  injectNotifications,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(NativeListPage);
