import * as React from 'react';
import { Layout, message } from 'antd';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { connect } from 'react-redux';

import DisplayAdsActionBar from './DisplayAdsActionBar';
import DisplayAdsList from './DisplayAdsList';
import { injectDrawer } from '../../../../components/Drawer';
import { CampaignRouteParams } from '../../../../models/campaign/CampaignResource';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import {
  getDisplayCreatives,
  getDisplayCreativesTotal,
  hasDisplayCreatives,
  isFetchingDisplayCreatives,
} from '../../../../state/Creatives/Display/selectors';
import {
  DisplayAdResource,
  CreativeAuditAction,
} from '../../../../models/creative/CreativeResource';
import CreativeService, {
  GetCreativesOptions,
} from '../../../../services/CreativeService';
import {
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import * as CreativeDisplayActions from '../../../../state/Creatives/Display/actions';
import { CREATIVE_DISPLAY_SEARCH_SETTINGS } from './constants';
import { executeTasksInSequence, Task } from '../../../../utils/FormHelper';

const messages = defineMessages({
  archiveSuccess: {
    id: 'archive.creatives.success.msg',
    defaultMessage: 'Creatives successfully archived',
  },
});

const { Content } = Layout;

export interface MapDispatchToProps {
  fetchCreativeDisplay: (
    organisationId: string,
    filter: object,
    bool: boolean,
  ) => void;
  resetCreativeDisplay: () => void;
}

export interface MapStateToProps {
  isFetchingCreativeDisplay?: boolean;
  dataSource: DisplayAdResource[];
  totalCreativeDisplay?: number;
  hasCreativeDisplay: boolean;
}

interface DisplayAdsPageState {
  selectedRowKeys: string[];
  allRowsAreSelected: boolean;
  isArchiveModalVisible: boolean;
  isArchiving: boolean;
  isUpdatingAuditStatus: boolean;
}

type JoinedProps = DisplayAdsPage &
  InjectedIntlProps &
  InjectedDrawerProps &
  MapStateToProps &
  MapDispatchToProps &
  InjectedNotificationProps &
  RouteComponentProps<CampaignRouteParams>;

class DisplayAdsPage extends React.Component<JoinedProps, DisplayAdsPageState> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      allRowsAreSelected: false,
      isArchiveModalVisible: false,
      isArchiving: false,
      isUpdatingAuditStatus: false,
    };
  }

  getAllCreativesIds = () => {
    const {
      totalCreativeDisplay,
      match: {
        params: { organisationId },
      },
      notifyError,
    } = this.props;
    const options: GetCreativesOptions = {
      type: 'DISPLAY_AD',
      archived: false,
      max_results: totalCreativeDisplay, // mandatory
    };
    return CreativeService.getDisplayAds(organisationId, options)
      .then(apiResp =>
        apiResp.data.map(creativeResource => creativeResource.id),
      )
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
        return CreativeService.getDisplayAd(creativeId)
          .then(apiResp => apiResp.data)
          .then(creative => {
            if (creative.available_user_audit_actions.includes(action)) {
              CreativeService.makeAuditAction(creative.id, action)
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
      fetchCreativeDisplay,
      match: {
        params: { organisationId },
      },
      dataSource,
    } = this.props;
    const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);
    if (dataSource.length === 1 && filter.currentPage !== 1) {
      const newFilter = {
        ...filter,
        currentPage: filter.currentPage - 1,
      };
      fetchCreativeDisplay(organisationId, filter, true);
      history.push({
        pathname: pathname,
        search: updateSearch(search, newFilter),
        state: state,
      });
    }
    fetchCreativeDisplay(organisationId, filter, true);
  };

  makeArchiveAction = (creativesIds: string[]) => {
    this.setState({
      isArchiving: true,
    });
    const tasks: Task[] = [];
    creativesIds.forEach(creativeId => {
      tasks.push(() => {
        return CreativeService.getDisplayAd(creativeId)
          .then(apiResp => apiResp.data)
          .then(creativeData => {
            if (
              creativeData.audit_status !== 'AUDIT_PENDING' &&
              creativeData.audit_status !== 'AUDIT_FAILED' &&
              creativeData.audit_status !== 'AUDIT_PASSED'
            ) {
              return CreativeService.updateDisplayCreative(creativeId, {
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
          message.success(
            this.props.intl.formatMessage(messages.archiveSuccess),
          );
          this.redirect();
          this.setState({
            isArchiving: false,
          });
        },
      );
    });
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
    } = this.state;
    const {
      hasCreativeDisplay,
      isFetchingCreativeDisplay,
      dataSource,
      totalCreativeDisplay,
      fetchCreativeDisplay,
      resetCreativeDisplay,
    } = this.props;

    const rowSelection = {
      selectedRowKeys,
      allRowsAreSelected: allRowsAreSelected,
      onChange: this.onSelectChange,
      selectAllItemIds: this.selectAllItemIds,
      unselectAllItemIds: this.unselectAllItemIds,
      onSelectAll: this.unsetAllItemsSelectedFlag,
      onSelect: this.unsetAllItemsSelectedFlag,
    };

    const reduxProps = {
      hasCreativeDisplay,
      isFetchingCreativeDisplay,
      dataSource,
      totalCreativeDisplay,
      fetchCreativeDisplay,
      resetCreativeDisplay,
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
      <div className="ant-layout">
        <DisplayAdsActionBar
          selectedRowKeys={rowSelection.selectedRowKeys}
          multiEditProps={multiEditProps}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <DisplayAdsList
              rowSelection={rowSelection}
              isUpdatingAuditStatus={isUpdatingAuditStatus}
              {...reduxProps}
            />
          </Content>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state: MapStateToProps) => ({
  hasCreativeDisplay: hasDisplayCreatives(state),
  isFetchingCreativeDisplay: isFetchingDisplayCreatives(state),
  dataSource: getDisplayCreatives(state),
  totalCreativeDisplay: getDisplayCreativesTotal(state),
});

const mapDispatchToProps = {
  fetchCreativeDisplay: CreativeDisplayActions.fetchCreativeDisplay.request,
  resetCreativeDisplay: CreativeDisplayActions.resetCreativeDisplay,
};

export default compose<JoinedProps, {}>(
  withRouter,
  injectIntl,
  injectDrawer,
  injectNotifications,
  connect(mapStateToProps, mapDispatchToProps),
)(DisplayAdsPage);
