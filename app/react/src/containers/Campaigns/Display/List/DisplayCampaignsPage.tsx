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
import { DISPLAY_SEARCH_SETTINGS } from './constants';
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
    const allCampaignsIds: string[] = [];
    return CampaignService.getCampaigns(organisationId, 'DISPLAY', options)
      .then(apiResp => {
        apiResp.data.forEach((campaignResource, index) => {
          allCampaignsIds.push(campaignResource.id);
        });
        return allCampaignsIds;
      })
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

  handleOk = () => {
    const { selectedRowKeys, allRowsAreSelected } = this.state;

    const { notifyError } = this.props;

    if (allRowsAreSelected) {
      return this.getAllCampaignsIds().then((allCampaignsIds: string[]) => {
        return Promise.all(
          allCampaignsIds.map(campaignId => {
            return DisplayCampaignService.updateCampaign(campaignId, {
              status: 'PAUSED',
              archived: true,
              type: 'DISPLAY',
            });
          }),
        )
          .then(() => {
            this.redirectAndNotify();
          })
          .catch(err => {
            notifyError(err);
          });
      });
    } else {
      return Promise.all(
        selectedRowKeys.map(campaignId => {
          return DisplayCampaignService.updateCampaign(campaignId, {
            status: 'PAUSED',
            archived: true,
            type: 'DISPLAY',
          });
        }),
      )
        .then(() => {
          this.redirectAndNotify();
        })
        .catch(err => {
          notifyError(err);
        });
    }
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  editCampaigns = (formData: EditCampaignsFormData) => {
    const { selectedRowKeys, allRowsAreSelected } = this.state;
    const { notifyError, intl } = this.props;

    if (allRowsAreSelected) {
      return this.getAllCampaignsIds().then((allCampaignsIds: string[]) => {
        DisplayCampaignFormService.saveCampaigns(allCampaignsIds, formData)
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
      });
    } else {
      return DisplayCampaignFormService.saveCampaigns(selectedRowKeys, formData)
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

  archiveCampaigns = () => {
    this.showModal();
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
      totalDisplayCampaigns: this.props.totalDisplayCampaigns,
      onChange: this.onSelectChange,
      selectAllItemIds: this.selectAllItemIds,
      unselectAllItemIds: this.unselectAllItemIds,
      onSelectAll: this.unsetAllItemsSelectedFlag,
      onSelect: this.unsetAllItemsSelectedFlag,
    };

    const multiEditProps = {
      archiveCampaigns: this.archiveCampaigns,
      updateCampaignStatus: this.updateCampaignStatus,
      visible: this.state.visible,
      handleOk: this.handleOk,
      handleCancel: this.handleCancel,
      openEditCampaignsDrawer: this.openEditCampaignsDrawer,
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
