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
import { DisplayAdResource } from '../../../../models/creative/CreativeResource';
import CreativeService, {
  GetCreativesOptions,
} from '../../../../services/CreativeService';
import {
  parseSearch,
  PAGINATION_SEARCH_SETTINGS,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';

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

  handleOk = () => {
    const { selectedRowKeys, allRowsAreSelected } = this.state;

    const {
      location: { search, pathname, state },
      history,
      intl,
      totalCreativeDisplay,
      match: { params: { organisationId } },
    } = this.props;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    if (allRowsAreSelected) {
      const options: GetCreativesOptions = {
        creative_type: 'DISPLAY_AD',
        archived: false,
        max_results: totalCreativeDisplay, // not mandatory
      };
      const displayAdsIds: string[] = [];
      return CreativeService.getDisplayAds(organisationId, options).then(
        apiResp => {
          apiResp.data.forEach((adResource, index) => {
            displayAdsIds.push(adResource.id);
          });
          return Promise.all(
            displayAdsIds.map(creativeId => {
              CreativeService.getDisplayAd(creativeId)
                .then(apiResponse => apiResponse.data)
                .then(creativeData => {
                  CreativeService.updateDisplayCreative(creativeId, {
                    ...creativeData,
                    archived: true,
                  });
                });
            }),
          ).then(() => {
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

            this.setState({
              isArchiveModalVisible: false,
              selectedRowKeys: [],
            });
            message.success(intl.formatMessage(messages.archiveSuccess));
          });
        },
      );
    } else {
      return Promise.all(
        selectedRowKeys.map(creativeId => {
          CreativeService.getDisplayAd(creativeId)
            .then(apiResp => apiResp.data)
            .then(creativeData => {
              CreativeService.updateDisplayCreative(creativeId, {
                ...creativeData,
                archived: true,
              });
            });
        }),
      ).then(() => {
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

        this.setState({
          isArchiveModalVisible: false,
          selectedRowKeys: [],
        });
        message.success(intl.formatMessage(messages.archiveSuccess));
      });
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
  connect(mapStateToProps, undefined),
)(DisplayAdsPage);
