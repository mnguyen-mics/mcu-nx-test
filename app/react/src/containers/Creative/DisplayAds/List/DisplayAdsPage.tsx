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
import { InjectDrawerProps } from '../../../../components/Drawer/injectDrawer';
import {
  getDisplayCreatives,
  getDisplayCreativesTotal,
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
  PAGINATION_SEARCH_SETTINGS,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

const messages = defineMessages({
  archiveSuccess: {
    id: 'archive.creatives.success.msg',
    defaultMessage: 'Creatives successfully archived',
  },
});

const { Content } = Layout;

interface DisplayAdsPageProps {}

interface MapStateToProps {
  totalCreativeDisplay: number;
  dataSource: DisplayAdResource[];
}

interface DisplayAdsPageState {
  selectedRowKeys: string[];
  allRowsAreSelected: boolean;
  isArchiveModalVisible: boolean;
}

type JoinedProps = DisplayAdsPage &
  InjectedIntlProps &
  InjectDrawerProps &
  MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<CampaignRouteParams>;

class DisplayAdsPage extends React.Component<JoinedProps, DisplayAdsPageState> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      allRowsAreSelected: false,
      isArchiveModalVisible: false,
    };
  }

  getAllCreativesIds = () => {
    const {
      totalCreativeDisplay,
      match: { params: { organisationId } },
      notifyError,
    } = this.props;
    const options: GetCreativesOptions = {
      creative_type: 'DISPLAY_AD',
      archived: false,
      max_results: totalCreativeDisplay, // not mandatory
    };
    const allCreativesIds: string[] = [];
    return CreativeService.getDisplayAds(organisationId, options)
      .then(apiResp => {
        apiResp.data.forEach((creativeResource, index) => {
          allCreativesIds.push(creativeResource.id);
        });
        return allCreativesIds;
      })
      .catch(err => {
        notifyError(err);
      });
  };

  makeAuditAction = (creativesIds: string[], action: CreativeAuditAction) => {
    Promise.all(
      creativesIds.map(creativeId => {
        CreativeService.getDisplayAd(creativeId)
          .then(apiResp => apiResp.data)
          .then(creative => {
            if (action === 'START_AUDIT') {
              if (creative.audit_status === 'NOT_AUDITED') {
                CreativeService.makeAuditAction(creative.id, action);
              }
            } else {
              if (
                creative.audit_status === 'AUDIT_FAILED' ||
                creative.audit_status === 'AUDIT_PASSED'
              ) {
                CreativeService.makeAuditAction(creative.id, action);
              }
            }
          });
      }),
    )
      .then(() => {
        this.redirect();
        this.setState({
          selectedRowKeys: [],
          allRowsAreSelected: false,
        });
      })
      .catch((err: any) => {
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
    const { location: { search, pathname, state }, history } = this.props;
    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
    if (filter.currentPage !== 1) {
      const newFilter = {
        ...filter,
        currentPage: 1,
      };
      history.push({
        pathname: pathname,
        search: updateSearch(search, newFilter),
        state: state,
      });
    } else {
      window.location.reload();
    }
  };

  makeArchiveAction = (creativesIds: string[]) => {
    return Promise.all(
      creativesIds.map(creativeId => {
        CreativeService.getDisplayAd(creativeId)
          .then(apiResp => apiResp.data)
          .then(creativeData => {
            if (
              creativeData.audit_status !== 'AUDIT_PENDING' &&
              creativeData.audit_status !== 'AUDIT_FAILED'
            ) {
              CreativeService.updateDisplayCreative(creativeId, {
                ...creativeData,
                archived: true,
              });
            }
          });
      }),
    ).then(() => {
      this.redirect();
      this.setState({
        isArchiveModalVisible: false,
        selectedRowKeys: [],
      });
      message.success(this.props.intl.formatMessage(messages.archiveSuccess));
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
    const { selectedRowKeys, allRowsAreSelected } = this.state;
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
    };

    return (
      <div className="ant-layout">
        <DisplayAdsActionBar
          selectedRowKeys={rowSelection.selectedRowKeys}
          multiEditProps={multiEditProps}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <DisplayAdsList rowSelection={rowSelection} />
          </Content>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: MapStateToProps) => ({
  totalCreativeDisplay: getDisplayCreativesTotal(state),
  dataSource: getDisplayCreatives(state),
});

export default compose<JoinedProps, DisplayAdsPageProps>(
  withRouter,
  injectIntl,
  injectDrawer,
  injectNotifications,
  connect(mapStateToProps, undefined),
)(DisplayAdsPage);
