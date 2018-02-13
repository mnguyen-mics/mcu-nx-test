import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { Layout, message, Button } from 'antd';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import DisplayCampaignsActionbar, {
  FilterProps,
} from './DisplayCampaignsActionbar';
import DisplayCampaignsTable from './DisplayCampaignsTable';
import { injectDrawer } from '../../../../components/Drawer';
import CampaignService, {
  GetCampaignsOptions,
} from '../../../../services/CampaignService';
import DisplayCampaignService from '../../../../services/DisplayCampaignService';
import EditCampaignsForm, {
  EditCampaignsFormProps,
  EditCampaignsFormData,
} from '../Edit/Campaign/MutiEdit/EditCampaignsForm';
import {
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { DISPLAY_SEARCH_SETTINGS } from './constants';
import * as NotificationActions from '../../../../state/Notifications/actions';
import { getTableDataSource } from '../../../../state/Campaigns/Display/selectors';
import { DisplayCampaignResource } from '../../../../models/campaign/display/DisplayCampaignResource';
import { InjectDrawerProps } from '../../../../components/Drawer/injectDrawer';
import messages from '../messages';
import DisplayCampaignFormService from '../Edit/DisplayCampaignFormService';
import { CampaignStatus } from '../../../../models/campaign/constants/index';
import { UpdateMessage } from '../Dashboard/Campaign/DisplayCampaignAdGroupTable';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import * as DisplayCampaignsActions from '../../../../state/Campaigns/Display/actions';
import { Label } from '../../../Labels/Labels';
import { TranslationProps } from '../../../Helpers/withTranslations';
import { executeTasksInSequence, Task } from '../../../../utils/FormHelper';

export interface MapDispatchToProps {
  labels: Label[];
  translations: TranslationProps;
  hasDisplayCampaigns: boolean;
  isFetchingDisplayCampaigns: boolean;
  isFetchingCampaignsStat: boolean;
  dataSource: DisplayCampaignResource[];
  totalDisplayCampaigns: number;
  removeNotification: () => void;
}

export interface MapStateToProps {
  loadDisplayCampaignsDataSource: (
    organisationId: string,
    filer: FilterProps,
    bool?: boolean,
  ) => void;
  resetDisplayCampaignsTable: () => void;
}

const { Content } = Layout;
interface DisplayCampaignsPageProps {
  totalDisplayCampaigns: number;
  dataSource: DisplayCampaignResource[];
}

interface DisplayCampaignsPageState {
  selectedRowKeys: string[];
  allRowsAreSelected: boolean;
  visible: boolean;
  isUploadingStatuses: boolean;
}

type JoinedProps = DisplayCampaignsPageProps &
  InjectedIntlProps &
  InjectDrawerProps &
  MapDispatchToProps &
  MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class DisplayCampaignsPage extends React.Component<
  JoinedProps,
  DisplayCampaignsPageState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      allRowsAreSelected: false,
      visible: false,
      isUploadingStatuses: false,
    };
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  getAllCampaignsIds = () => {
    const {
      totalDisplayCampaigns,
      match: { params: { organisationId } },
      notifyError,
    } = this.props;
    const options: GetCampaignsOptions = {
      max_results: totalDisplayCampaigns,
      archived: false,
    };
    return CampaignService.getCampaigns(organisationId, 'DISPLAY', options)
      .then(apiResp =>
        apiResp.data.map(campaignResource => campaignResource.id),
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
      dataSource,
      loadDisplayCampaignsDataSource,
      match: { params: { organisationId } },
    } = this.props;
    const filter = parseSearch(search, DISPLAY_SEARCH_SETTINGS);
    if (dataSource.length === 1 && filter.currentPage !== 1) {
      const newFilter = {
        ...filter,
        currentPage: filter.currentPage - 1,
      };
      loadDisplayCampaignsDataSource(organisationId, filter);
      history.replace({
        pathname: pathname,
        search: updateSearch(search, newFilter),
        state: state,
      });
    } else {
      loadDisplayCampaignsDataSource(organisationId, filter);
    }
    this.setState({
      visible: false,
      selectedRowKeys: [],
    });
    message.success(intl.formatMessage(messages.campaignsArchived));
  };

  makeAuditAction = (campaignIds: string[]) => {
    const tasks: Task[] = [];
    campaignIds.forEach(campaignId => {
      tasks.push(() => {
        return DisplayCampaignService.updateCampaign(campaignId, {
          status: 'PAUSED',
          archived: true,
          type: 'DISPLAY',
        });
      });
    });
    executeTasksInSequence(tasks)
      .then(() => {
        this.redirectAndNotify();
      })
      .catch(err => {
        this.props.notifyError(err);
      });
  };

  handleOk = () => {
    const { selectedRowKeys, allRowsAreSelected } = this.state;
    if (allRowsAreSelected) {
      return this.getAllCampaignsIds().then((allCampaignsIds: string[]) => {
        this.makeAuditAction(allCampaignsIds);
      });
    } else {
      return this.makeAuditAction(selectedRowKeys);
    }
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  makeEditAction = (
    campaignsIds: string[],
    formData: EditCampaignsFormData,
  ) => {
    const { notifyError, intl } = this.props;
    return DisplayCampaignFormService.saveCampaigns(campaignsIds, formData)
      .then(() => {
        this.props.closeNextDrawer();
        this.setState({
          selectedRowKeys: [],
        });
        message.success(intl.formatMessage(messages.campaignsSaved));
      })
      .catch(err => {
        this.props.closeNextDrawer();
        this.setState({
          selectedRowKeys: [],
        });
        notifyError(err);
      });
  };

  editCampaigns = (formData: EditCampaignsFormData) => {
    const { selectedRowKeys, allRowsAreSelected } = this.state;

    if (allRowsAreSelected) {
      return this.getAllCampaignsIds().then((allCampaignsIds: string[]) => {
        this.makeEditAction(allCampaignsIds, formData);
      });
    } else {
      return this.makeEditAction(selectedRowKeys, formData);
    }
  };

  openEditCampaignsDrawer = () => {
    const { allRowsAreSelected } = this.state;
    const additionalProps: {
      close: () => void;
      onSave: (formData: EditCampaignsFormData) => Promise<any>;
      selectedRowKeys?: string[];
    } = {
      close: this.props.closeNextDrawer,
      onSave: this.editCampaigns,
    };
    if (allRowsAreSelected) {
      additionalProps.selectedRowKeys = undefined;
    } else {
      additionalProps.selectedRowKeys = this.state.selectedRowKeys;
    }

    const options = {
      additionalProps: additionalProps,
    };
    this.props.openNextDrawer<EditCampaignsFormProps>(
      EditCampaignsForm,
      options,
    );
  };

  updateCampaignStatus = (
    campaignId: string,
    body: { status: CampaignStatus },
    successMessage: UpdateMessage,
    errorMessage: UpdateMessage,
    undoBody: { status: CampaignStatus },
  ) => {
    this.setState({
      isUploadingStatuses: true,
    });
    const { notifySuccess, notifyError, removeNotification } = this.props;

    const campaignBody = {
      ...body,
      type: 'DISPLAY',
    };

    const campaignUndoBody = {
      ...undoBody,
      type: 'DISPLAY',
    };

    return DisplayCampaignService.updateCampaign(campaignId, campaignBody)
      .then(response => {
        if (successMessage) {
          const undo = () => {
            DisplayCampaignService.updateCampaign(
              campaignId,
              campaignUndoBody,
            ).then(() => {
              removeNotification();
            });
          };

          notifySuccess({
            uid: campaignId,
            message: successMessage.title,
            description: successMessage.body,
            btn: (
              <Button type="primary" size="small" onClick={undo}>
                <span>Undo</span>
              </Button>
            ),
          });
        }
        this.setState({
          isUploadingStatuses: false,
          selectedRowKeys: [],
        });
        return null;
      })
      .catch(error => {
        notifyError(error);
        this.setState({
          isUploadingStatuses: false,
          selectedRowKeys: [],
        });
      });
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

  render() {
    const {
      selectedRowKeys,
      isUploadingStatuses,
      allRowsAreSelected,
    } = this.state;

    const {
      labels,
      translations,
      dataSource,
      hasDisplayCampaigns,
      isFetchingDisplayCampaigns,
      isFetchingCampaignsStat,
      totalDisplayCampaigns,
      removeNotification,
      loadDisplayCampaignsDataSource,
      resetDisplayCampaignsTable,
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

    const multiEditProps = {
      archiveCampaigns: this.showModal,
      updateCampaignStatus: this.updateCampaignStatus,
      visible: this.state.visible,
      handleOk: this.handleOk,
      handleCancel: this.handleCancel,
      openEditCampaignsDrawer: this.openEditCampaignsDrawer,
      totalDisplayCampaigns: this.props.totalDisplayCampaigns,
    };

    const reduxProps = {
      labels,
      translations,
      dataSource,
      hasDisplayCampaigns,
      isFetchingDisplayCampaigns,
      isFetchingCampaignsStat,
      totalDisplayCampaigns,
      removeNotification,
      loadDisplayCampaignsDataSource,
      resetDisplayCampaignsTable,
    };

    return (
      <div className="ant-layout">
        <DisplayCampaignsActionbar
          rowSelection={rowSelection}
          multiEditProps={multiEditProps}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            {!isUploadingStatuses ? (
              <DisplayCampaignsTable
                rowSelection={rowSelection}
                {...reduxProps}
              />
            ) : null}
          </Content>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  labels: state.labels.labelsApi.data,
  translations: state.translations,
  hasDisplayCampaigns: state.displayCampaignsTable.displayCampaignsApi.hasItems,
  isFetchingDisplayCampaigns:
    state.displayCampaignsTable.displayCampaignsApi.isFetching,
  isFetchingCampaignsStat:
    state.displayCampaignsTable.performanceReportApi.isFetching,
  dataSource: getTableDataSource(state),
  totalDisplayCampaigns: state.displayCampaignsTable.displayCampaignsApi.total,
  removeNotification: NotificationActions.removeNotification,
});

const mapDispatchToProps = {
  loadDisplayCampaignsDataSource:
    DisplayCampaignsActions.loadDisplayCampaignsDataSource,
  resetDisplayCampaignsTable:
    DisplayCampaignsActions.resetDisplayCampaignsTable,
};

export default compose<DisplayCampaignsPageProps, JoinedProps>(
  withRouter,
  injectIntl,
  injectDrawer,
  connect(mapStateToProps, mapDispatchToProps),
  injectNotifications,
)(DisplayCampaignsPage);
