import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { Layout, message } from 'antd';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import DisplayCampaignsActionbar from './DisplayCampaignsActionbar';
import DisplayCampaignsTable from './DisplayCampaignsTable';
import { injectDrawer } from '../../../../components/Drawer';
import CampaignService, {
  GetCampaignsOptions,
} from '../../../../services/CampaignService';
import DisplayCampaignService from '../../../../services/DisplayCampaignService';
import EditCampaignsForm, {
  EditCampaignsFormProps,
} from '../Edit/Campaign/MutiEdit/EditCampaignsForm';
import {
  parseSearch,
  PAGINATION_SEARCH_SETTINGS,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { getTableDataSource } from '../../../../state/Campaigns/Display/selectors';
import { DisplayCampaignResource } from '../../../../models/campaign/display/DisplayCampaignResource';
import { InjectDrawerProps } from '../../../../components/Drawer/injectDrawer';

const { Content } = Layout;

interface DisplayCampaignsPageProps {
  totalDisplayCampaigns: number;
  dataSource: DisplayCampaignResource[];
}

interface DisplayCampaignsPageState {
  selectedRowKeys: string[];
  selected: boolean;
  visible: boolean;
}

type JoinedProps = DisplayCampaignsPageProps &
  InjectedIntlProps &
  InjectDrawerProps &
  RouteComponentProps<{ organisationId: string }>;

class DisplayCampaignsPage extends React.Component<
  JoinedProps,
  DisplayCampaignsPageState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selected: true,
      visible: false,
    };
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    const { selectedRowKeys } = this.state;

    const {
      location: { search, pathname, state },
      history,
      intl: { formatMessage },
    } = this.props;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    return Promise.all(
      selectedRowKeys.map(campaignId => {
        DisplayCampaignService.updateCampaign(campaignId, {
          archived: true,
          type: 'DISPLAY',
        });
      }),
    ).then(() => {
      // case we archive a campaigns on page 1. refresh page ?
      const newFilter = {
        ...filter,
        currentPage: 1,
      };
      history.push({
        pathname: pathname,
        search: updateSearch(search, newFilter),
        state: state,
      });

      this.setState({
        visible: false,
        selectedRowKeys: [],
      });
      message.success(
        formatMessage({
          id: 'archive.campaigns.success.msg',
          defaultMessage: 'Campaigns successfully archived',
        }),
      );
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  saveCampaigns = () => {
    const { intl: { formatMessage } } = this.props;

    this.setState({
      visible: false,
      selectedRowKeys: [],
    });
    this.props.closeNextDrawer();
    message.success(
      formatMessage({
        id: 'edit.campaigns.success.msg',
        defaultMessage: 'Campaigns successfully saved',
      }),
    );
  };

  openEditCampaignsDrawer = () => {
    const additionalProps = {
      close: this.props.closeNextDrawer,
      onSubmit: this.saveCampaigns,
      selectedRowKeys: this.state.selectedRowKeys,
    };
    const options = {
      additionalProps: additionalProps,
    };
    this.props.openNextDrawer<EditCampaignsFormProps>(
      EditCampaignsForm,
      options,
    );
  };

  archiveCampaigns = () => {
    this.showModal();
  };

  onSelectChange = (selectedRowKeys: string[]) => {
    this.setState({ selectedRowKeys });
  };

  selectAllItemIds = (selected: boolean) => {
    const {
      totalDisplayCampaigns,
      match: { params: { organisationId } },
    } = this.props;
    const options: GetCampaignsOptions = {
      max_results: totalDisplayCampaigns,
      archived: false,
    };
    const allCampaignsIds: string[] = [];
    if (selected) {
      // todo: no call before action, use flag
      CampaignService.getCampaigns(organisationId, 'DISPLAY', options).then(
        apiResp => {
          apiResp.data.map((campaignResource, index) => {
            allCampaignsIds.push(campaignResource.id);
          });
          this.setState({
            selectedRowKeys: allCampaignsIds,
            selected: false,
          });
        },
      );
    } else {
      this.setState({
        selectedRowKeys: allCampaignsIds,
        selected: true,
      });
    }
  };

  unselectAllItemIds = () => {
    this.selectAllItemIds(false);
  };

  onSelectAll = () => {
    const { selectedRowKeys } = this.state;
    const { dataSource } = this.props;
    if (selectedRowKeys.length > 0) {
      this.selectAllItemIds(false);
    } else {
      const allPageItemsIds: string[] = [];
      dataSource.map(dataCampaign => {
        allPageItemsIds.push(dataCampaign.id);
      });
      this.setState({
        selectedRowKeys: allPageItemsIds,
      });
    }
  };

  render() {
    const { selectedRowKeys } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
      selectAllItemIds: this.selectAllItemIds,
      unselectAllItemIds: this.unselectAllItemIds,
      onSelectAll: this.onSelectAll,
    };

    const multiEditProps = {
      archiveCampaigns: this.archiveCampaigns,
      visible: this.state.visible,
      handleOk: this.handleOk,
      handleCancel: this.handleCancel,
      openEditCampaignsDrawer: this.openEditCampaignsDrawer,
    };

    return (
      <div className="ant-layout">
        <DisplayCampaignsActionbar
          selectedRowKeys={rowSelection.selectedRowKeys}
          multiEditProps={multiEditProps}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <DisplayCampaignsTable rowSelection={rowSelection} />
          </Content>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  totalDisplayCampaigns: state.displayCampaignsTable.displayCampaignsApi.total,
  dataSource: getTableDataSource(state),
});

export default compose<DisplayCampaignsPageProps, JoinedProps>(
  withRouter,
  injectIntl,
  injectDrawer,
  connect(mapStateToProps, undefined),
)(DisplayCampaignsPage);
