import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { Layout, message, Button } from 'antd';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import DisplayCampaignsActionbar, {
  FilterParams,
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
import { getTableDataSource } from '../../../../state/Campaigns/Display/selectors';
import { DisplayCampaignResource } from '../../../../models/campaign/display/DisplayCampaignResource';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import messages from '../messages';
import {
  IDisplayCampaignFormService,
} from '../Edit/DisplayCampaignFormService';
import { CampaignStatus } from '../../../../models/campaign/constants/index';
import { UpdateMessage } from '../Dashboard/ProgrammaticCampaign/DisplayCampaignAdGroupTable';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import * as DisplayCampaignsActions from '../../../../state/Campaigns/Display/actions';
import { Label } from '../../../Labels/Labels';
import { TranslationProps } from '../../../Helpers/withTranslations';
import { executeTasksInSequence, Task } from '../../../../utils/FormHelper';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';

export interface MapDispatchToProps {
  labels: Label[];
  translations: TranslationProps;
  hasDisplayCampaigns: boolean;
  isFetchingDisplayCampaigns: boolean;
  isFetchingCampaignsStat: boolean;
  dataSource: DisplayCampaignResource[];
  totalDisplayCampaigns: number;
}

export interface MapStateToProps {
  loadDisplayCampaignsDataSource: (
    organisationId: string,
    filer: FilterParams,
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
  isUpdatingStatuses: boolean;
  isArchiving: boolean;
}

type JoinedProps = DisplayCampaignsPageProps &
  InjectedIntlProps &
  InjectedDrawerProps &
  MapDispatchToProps &
  MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class DisplayCampaignsPage extends React.Component<
  JoinedProps,
  DisplayCampaignsPageState
> {
  
  @lazyInject(TYPES.IDisplayCampaignFormService)
  private _displayCampaignFormService: IDisplayCampaignFormService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      allRowsAreSelected: false,
      visible: false,
      isUpdatingStatuses: false,
      isArchiving: false,
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
      match: {
        params: { organisationId },
      },
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
      match: {
        params: { organisationId },
      },
    } = this.props;
    const filter = parseSearch<FilterParams>(search, DISPLAY_SEARCH_SETTINGS);
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
    this.setState({
      isArchiving: true,
    });
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
        this.setState({
          isArchiving: false,
        });
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({
          isArchiving: false,
        });
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
    return this._displayCampaignFormService
      .saveCampaigns(campaignsIds, formData)
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
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
    undoBody?: { status: CampaignStatus },
  ) => {
    this.setState({
      isUpdatingStatuses: true,
    });
    const { notifySuccess, notifyError, removeNotification } = this.props;

    const campaignBody = {
      ...body,
    };

    const campaignUndoBody = {
      ...undoBody,
    };

    return DisplayCampaignService.updateCampaign(campaignId, campaignBody)
      .then(response => {
        if (successMessage) {
          const undo = () => {
            DisplayCampaignService.updateCampaign(
              campaignId,
              campaignUndoBody,
            ).then(() => {
              removeNotification(campaignId);
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
          isUpdatingStatuses: false,
          selectedRowKeys: [],
        });
        return null;
      })
      .catch(error => {
        notifyError(error);
        this.setState({
          isUpdatingStatuses: false,
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

  handleStatusAction = (status: CampaignStatus) => {
    const {
      totalDisplayCampaigns,
      match: {
        params: { organisationId },
      },
      loadDisplayCampaignsDataSource,
      location: { search },
    } = this.props;
    const { allRowsAreSelected, selectedRowKeys } = this.state;
    this.setState({
      isUpdatingStatuses: true,
    });
    let campaignIdsToUpdate: string[] = [];
    if (allRowsAreSelected) {
      const options: GetCampaignsOptions = {
        max_results: totalDisplayCampaigns,
        archived: false,
      };
      const allCampaignsIds: string[] = [];
      CampaignService.getCampaigns(organisationId, 'DISPLAY', options).then(
        apiResp => {
          apiResp.data.forEach((campaignResource, index) => {
            allCampaignsIds.push(campaignResource.id);
          });
          campaignIdsToUpdate = allCampaignsIds;
        },
      );
    } else if (selectedRowKeys) {
      campaignIdsToUpdate = selectedRowKeys;
    }

    const tasks: Task[] = [];
    campaignIdsToUpdate.forEach(campaignId => {
      tasks.push(() => {
        return this.updateCampaignStatus(campaignId, {
          status,
        });
      });
    });
    executeTasksInSequence(tasks)
      .then(() => {
        this.setState(
          {
            isUpdatingStatuses: false,
          },
          () => {
            const filter = parseSearch<FilterParams>(
              search,
              DISPLAY_SEARCH_SETTINGS,
            );
            loadDisplayCampaignsDataSource(organisationId, filter);
          },
        );
      })
      .catch((err: any) => {
        this.setState({
          isUpdatingStatuses: false,
        });
        this.props.notifyError(err);
      });
  };

  render() {
    const {
      selectedRowKeys,
      isUpdatingStatuses,
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
      visible: this.state.visible,
      handleOk: this.handleOk,
      handleCancel: this.handleCancel,
      openEditCampaignsDrawer: this.openEditCampaignsDrawer,
      isArchiving: this.state.isArchiving,
      handleStatusAction: this.handleStatusAction,
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
            <DisplayCampaignsTable
              rowSelection={rowSelection}
              isUpdatingStatuses={isUpdatingStatuses}
              {...reduxProps}
            />
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
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
  injectNotifications,
)(DisplayCampaignsPage);
