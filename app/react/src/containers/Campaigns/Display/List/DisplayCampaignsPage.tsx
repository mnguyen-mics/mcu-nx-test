import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Layout, message, Button, Modal } from 'antd';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import DisplayCampaignsActionbar, { FilterParams } from './DisplayCampaignsActionbar';
import DisplayCampaignsTable from './DisplayCampaignsTable';
import { injectDrawer } from '../../../../components/Drawer';
import {
  IDisplayCampaignService,
  CampaignsOptions,
} from '../../../../services/DisplayCampaignService';
import EditCampaignsForm, {
  EditCampaignsFormProps,
  EditCampaignsFormData,
} from '../Edit/Campaign/MutiEdit/EditCampaignsForm';
import {
  parseSearch,
  updateSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../utils/LocationSearchHelper';
import { DISPLAY_SEARCH_SETTINGS } from './constants';
import {
  DisplayCampaignResourceWithStats,
  DisplayCampaignResource,
} from '../../../../models/campaign/display/DisplayCampaignResource';
import { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { messages } from '../messages';
import { IDisplayCampaignFormService } from '../Edit/DisplayCampaignFormService';
import { CampaignStatus } from '../../../../models/campaign/constants/index';
import { UpdateMessage } from '../Dashboard/ProgrammaticCampaign/DisplayCampaignAdGroupTable';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { Label } from '../../../Labels/Labels';
import { executeTasksInSequence, Task } from '../../../../utils/PromiseHelper';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { Index } from '../../../../utils';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import ReportService from '../../../../services/ReportService';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export interface MapDispatchToProps {
  labels: Label[];
}

const { Content } = Layout;

interface State {
  selectedRowKeys: string[];
  allRowsAreSelected: boolean;
  visible: boolean;
  isUpdatingStatuses: boolean;
  isArchiving: boolean;
  isLoadingCampaigns: boolean;
  isLoadingStats: boolean;
  dataSource: DisplayCampaignResourceWithStats[];
  totalCampaigns: number;
  hasCampaigns: boolean;
}

type Props = InjectedIntlProps &
  InjectedDrawerProps &
  MapDispatchToProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

class DisplayCampaignsPage extends React.Component<Props, State> {
  _isMounted = false;
  @lazyInject(TYPES.IDisplayCampaignFormService)
  private _displayCampaignFormService: IDisplayCampaignFormService;

  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      allRowsAreSelected: false,
      visible: false,
      isUpdatingStatuses: false,
      isArchiving: false,
      isLoadingCampaigns: false,
      isLoadingStats: false,
      dataSource: [],
      totalCampaigns: 0,
      hasCampaigns: true,
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

    this._isMounted = true;
    if (!isSearchValid(search, DISPLAY_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DISPLAY_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch<FilterParams>(search, DISPLAY_SEARCH_SETTINGS);
      this.loadDisplayCampaignsDataSource(organisationId, filter, true);
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      location: { pathname, search },
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

    if (!compareSearches(search, previousSearch) || organisationId !== previousOrganisationId) {
      if (!isSearchValid(search, DISPLAY_SEARCH_SETTINGS)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, DISPLAY_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== previousOrganisationId },
        });
      } else {
        const filter = parseSearch<FilterParams>(search, DISPLAY_SEARCH_SETTINGS);
        this.loadDisplayCampaignsDataSource(organisationId, filter);
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  loadDisplayCampaignsDataSource = (
    organisationId: string,
    filter: Index<any>,
    init: boolean = false,
  ) => {
    this.setState({
      isLoadingCampaigns: true,
      isLoadingStats: true,
    });
    const campaignType = 'DISPLAY';

    const options: CampaignsOptions = {
      archived: filter.statuses.includes('ARCHIVED'),
      ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
    };

    if (filter.label_id.length) {
      options.label_id = filter.label_id;
    }

    const apiStatuses = filter.statuses.filter((status: string) => status !== 'ARCHIVED');

    if (filter.keywords) {
      options.keywords = filter.keywords;
    }
    if (apiStatuses.length > 0) {
      options.status = apiStatuses;
    }

    this._displayCampaignService
      .getDisplayCampaigns(organisationId, campaignType, options)
      .then(result => {
        const data = result.data;
        const campaignsById = normalizeArrayOfObject(data, 'id');
        this.setState({
          dataSource: Object.keys(campaignsById).map(campaignId => {
            return {
              ...campaignsById[campaignId],
            };
          }),
          isLoadingCampaigns: false,
          totalCampaigns: result.total || 0,
          hasCampaigns: init ? result.count !== 0 : true,
        });

        ReportService.getDisplayCampaignPerformanceReport(organisationId, filter.from, filter.to, [
          'campaign_id',
        ])
          .then(statsResult => {
            const statsByCampaignlId = normalizeArrayOfObject(
              normalizeReportView(statsResult.data.report_view),
              'campaign_id',
            );
            this.setState({
              isLoadingStats: false,
              dataSource: Object.keys(campaignsById).map(campaignId => {
                return {
                  ...statsByCampaignlId[campaignId],
                  ...campaignsById[campaignId],
                };
              }),
            });
          })
          .catch(error => {
            this.setState({
              isLoadingStats: false,
            });
            this.props.notifyError(error, {
              intlMessage: messages.fetchReportError,
            });
          });
      });
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  getAllCampaignsIds = () => {
    const {
      match: {
        params: { organisationId },
      },
      notifyError,
    } = this.props;
    const { totalCampaigns } = this.state;
    const options: CampaignsOptions = {
      max_results: totalCampaigns,
      automated: false,
      archived: false,
    };
    return this._displayCampaignService
      .getDisplayCampaigns(organisationId, 'DISPLAY', options)
      .then(apiResp => apiResp.data.map(campaignResource => campaignResource.id))

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
    } = this.props;
    const { dataSource } = this.state;
    const filter = parseSearch<FilterParams>(search, DISPLAY_SEARCH_SETTINGS);
    if (dataSource.length === 1 && filter.currentPage !== 1) {
      const newFilter = {
        ...filter,
        currentPage: filter.currentPage - 1,
      };
      this.loadDisplayCampaignsDataSource(organisationId, filter);
      history.replace({
        pathname: pathname,
        search: updateSearch(search, newFilter),
        state: state,
      });
    } else {
      this.loadDisplayCampaignsDataSource(organisationId, filter);
    }
    this.setState({
      visible: false,
      selectedRowKeys: [],
    });
    message.success(intl.formatMessage(messages.campaignsArchived));
  };

  archiveCampaigns = (campaignIds: string[]) => {
    this.setState({
      isArchiving: true,
    });
    const tasks: Task[] = [];
    campaignIds.forEach(campaignId => {
      tasks.push(() => {
        return this._displayCampaignService.updateCampaign(campaignId, {
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

  archiveCampaign = (campaign: DisplayCampaignResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location: { pathname, state, search },
      history,
      intl,
    } = this.props;

    const { dataSource } = this.state;

    const filter = parseSearch<FilterParams>(search, DISPLAY_SEARCH_SETTINGS);

    const fetchDataSource = () => {
      this.loadDisplayCampaignsDataSource(organisationId, filter);
    };

    const deleteCampaign = () => {
      return this._displayCampaignService.deleteCampaign(campaign.id);
    };

    Modal.confirm({
      title: intl.formatMessage(messages.confirmArchiveModalTitle),
      content: intl.formatMessage(messages.confirmArchiveModalContent),
      icon: <ExclamationCircleOutlined />,
      okText: intl.formatMessage(messages.confirmArchiveModalOk),
      cancelText: intl.formatMessage(messages.confirmArchiveModalCancel),
      onOk() {
        return deleteCampaign().then(() => {
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
          } else {
            fetchDataSource();
          }
        });
      },
      onCancel() {
        //
      },
    });
  };

  handleOk = () => {
    const { selectedRowKeys, allRowsAreSelected } = this.state;
    if (allRowsAreSelected) {
      return this.getAllCampaignsIds().then((allCampaignsIds: string[]) => {
        this.archiveCampaigns(allCampaignsIds);
      });
    } else {
      return this.archiveCampaigns(selectedRowKeys);
    }
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  makeEditAction = (campaignsIds: string[], formData: EditCampaignsFormData) => {
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
    this.props.openNextDrawer<EditCampaignsFormProps>(EditCampaignsForm, options);
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

    return this._displayCampaignService
      .updateCampaign(campaignId, campaignBody)
      .then(response => {
        if (successMessage) {
          const undo = () => {
            this._displayCampaignService.updateCampaign(campaignId, campaignUndoBody).then(() => {
              removeNotification(campaignId);
            });
          };

          notifySuccess({
            uid: campaignId,
            message: successMessage.title,
            description: successMessage.body,
            btn: (
              <Button type='primary' size='small' onClick={undo}>
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
      match: {
        params: { organisationId },
      },
      location: { search },
    } = this.props;
    const { allRowsAreSelected, selectedRowKeys, totalCampaigns } = this.state;
    this.setState({
      isUpdatingStatuses: true,
    });
    let campaignIdsToUpdate: string[] = [];
    if (allRowsAreSelected) {
      const options: CampaignsOptions = {
        max_results: totalCampaigns,
        archived: false,
      };
      const allCampaignsIds: string[] = [];
      this._displayCampaignService
        .getDisplayCampaigns(organisationId, 'DISPLAY', options)
        .then(apiResp => {
          apiResp.data.forEach((campaignResource, index) => {
            allCampaignsIds.push(campaignResource.id);
          });
          campaignIdsToUpdate = allCampaignsIds;
        });
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
            const filter = parseSearch<FilterParams>(search, DISPLAY_SEARCH_SETTINGS);
            this.loadDisplayCampaignsDataSource(organisationId, filter);
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
    const { labels } = this.props;

    const {
      selectedRowKeys,
      isUpdatingStatuses,
      allRowsAreSelected,
      dataSource,
      hasCampaigns,
      isLoadingCampaigns,
      isLoadingStats,
      totalCampaigns,
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
      archiveCampaigns: this.showModal,
      visible: this.state.visible,
      handleOk: this.handleOk,
      handleCancel: this.handleCancel,
      openEditCampaignsDrawer: this.openEditCampaignsDrawer,
      isArchiving: this.state.isArchiving,
      handleStatusAction: this.handleStatusAction,
    };

    return (
      <div className='ant-layout'>
        <DisplayCampaignsActionbar rowSelection={rowSelection} multiEditProps={multiEditProps} />
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
            <DisplayCampaignsTable
              dataSource={dataSource}
              archiveCampaign={this.archiveCampaign}
              rowSelection={rowSelection}
              hasCampaigns={hasCampaigns}
              isFetchingCampaigns={isLoadingCampaigns}
              isFetchingStats={isLoadingStats}
              totalCampaigns={totalCampaigns}
              isUpdatingStatuses={isUpdatingStatuses}
              labels={labels}
            />
          </Content>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  labels: state.labels.labelsApi.data,
});

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectDrawer,
  connect(mapStateToProps, undefined),
  injectNotifications,
)(DisplayCampaignsPage);
