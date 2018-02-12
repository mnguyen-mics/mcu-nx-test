import * as React from 'react';
import { Button, message, Modal, Spin, Dropdown, Menu } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import {
  FormattedMessage,
  InjectedIntlProps,
  injectIntl,
  defineMessages,
} from 'react-intl';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import { withTranslations } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon';
import ExportService from '../../../../services/ExportService';
import CampaignService, {
  GetCampaignsOptions,
} from '../../../../services/CampaignService';
import ReportService from '../../../../services/ReportService';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { DISPLAY_SEARCH_SETTINGS } from './constants';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import { RouteComponentProps } from 'react-router';
import McsMoment from '../../../../utils/McsMoment';
import messages from './messages';
import Slider from '../../../../components/Transition/Slide';
import {
  DrawableContent,
  injectDrawer,
} from '../../../../components/Drawer/index';
import { CampaignStatus } from '../../../../models/campaign/constants/index';
import { UpdateMessage } from '../Dashboard/Campaign/DisplayCampaignAdGroupTable';
import { Task, executeTasksInSequence } from '../../../../utils/FormHelper';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { TranslationProps } from '../../../Helpers/withTranslations';

const messagesMap = defineMessages({
  setStatus: {
    id: 'set.ads.status',
    defaultMessage: 'Set status to',
  },
  activeAll: {
    id: 'active.all.ads',
    defaultMessage: 'Active',
  },
  pauseAll: {
    id: 'pause.all.ads',
    defaultMessage: 'Paused',
  },
  exportInProgress: {
    id: 'display.campaigns.export.in.progress',
    defaultMessage: 'Export in progress',
  },
  breadCrumbPath: {
    id: 'display.campaigns.breadCrumb',
    defaultMessage: 'Display',
  },
});

interface DisplayCampaignsActionbarProps {
  rowSelection: {
    selectedRowKeys: string[];
    allRowsAreSelected: boolean;
    totalDisplayCampaigns?: number;
    unselectAllItemIds: () => void;
    onChange: (selectedRowKeys: string[]) => void;
    selectAllItemIds: () => void;
  };
  multiEditProps: {
    archiveCampaigns: () => void;
    visible: boolean;
    handleOk: () => any;
    handleCancel: () => void;
    openEditCampaignsDrawer: () => void;
    updateCampaignStatus: (
      campaignId: string,
      body: { status: CampaignStatus },
      successMessage?: UpdateMessage,
      errorMessage?: UpdateMessage,
      undoBody?: { status: CampaignStatus },
    ) => void;
  };
}

export interface FilterProps {
  currentPage: number;
  from: McsMoment;
  to: McsMoment;
  keywords: string[];
  pageSize: number;
  statuses: CampaignStatus[];
}

type JoinedProps = DisplayCampaignsActionbarProps &
  InjectedIntlProps &
  TranslationProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

interface DisplayCampaignsActionbarState {
  exportIsRunning: boolean;
  isArchiving: boolean;
  allCampaignsActivated: boolean;
  allCampaignsPaused: boolean;
  isUpdatingStatuses: boolean;
}

const fetchExportData = (organisationId: string, filter: FilterProps) => {
  const campaignType = 'DISPLAY';
  const buildOptionsForGetCampaigns = () => {
    const options: GetCampaignsOptions = {
      archived: filter.statuses.includes('ARCHIVED'),
      first_result: 0,
      max_results: 2000,
    };

    const apiStatuses = filter.statuses.filter(status => status !== 'ARCHIVED');

    if (filter.keywords) {
      options.keywords = filter.keywords;
    }
    if (apiStatuses.length > 0) {
      options.status = apiStatuses;
    }

    return options;
  };

  const startDate = filter.from;
  const endDate = filter.to;
  const dimension = [''];

  const apiResults = Promise.all([
    CampaignService.getCampaigns(
      organisationId,
      campaignType,
      buildOptionsForGetCampaigns(),
    ),
    ReportService.getDisplayCampaignPerformanceReport(
      organisationId,
      startDate,
      endDate,
      dimension,
    ),
  ]);

  return apiResults.then(results => {
    const displayCampaigns = normalizeArrayOfObject(results[0].data, 'id');
    const performanceReport = normalizeArrayOfObject(
      normalizeReportView(results[1].data.report_view),
      'campaign_id',
    );

    return Object.keys(displayCampaigns).map(campaignId => {
      return {
        ...displayCampaigns[campaignId],
        ...performanceReport[campaignId],
      };
    });
  });
};

class DisplayCampaignsActionbar extends React.Component<
  JoinedProps,
  DisplayCampaignsActionbarState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      exportIsRunning: false,
      isArchiving: false,
      allCampaignsActivated: false,
      allCampaignsPaused: false,
      isUpdatingStatuses: false,
    };
  }

  handleRunExport = () => {
    const { match: { params: { organisationId } }, translations } = this.props;

    const filter = parseSearch(
      this.props.location.search,
      DISPLAY_SEARCH_SETTINGS,
    );

    this.setState({ exportIsRunning: true });

    const hideExportLoadingMsg = message.loading(
      translations.EXPORT_IN_PROGRESS,
      0,
    );

    fetchExportData(organisationId, filter)
      .then(data => {
        ExportService.exportDisplayCampaigns(
          organisationId,
          data,
          filter,
          translations,
        );
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      });
  };

  handleArchive = () => {
    this.setState({
      isArchiving: true,
    });
    this.props.multiEditProps
      .handleOk()
      .then(() => {
        this.setState({
          isArchiving: false,
        });
      })
      .catch((err: any) => {
        this.props.notifyError(err);
      });
  };

  handleStatusAction = (status: CampaignStatus) => {
    const {
      multiEditProps: { updateCampaignStatus },
      rowSelection: {
        selectedRowKeys,
        allRowsAreSelected,
        totalDisplayCampaigns,
      },
      match: { params: { organisationId } },
    } = this.props;
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
    } else {
      campaignIdsToUpdate = selectedRowKeys;
    }

    const tasks: Task[] = [];
    campaignIdsToUpdate.forEach(campaignId => {
      tasks.push(() => {
        updateCampaignStatus(campaignId, {
          status,
        });
        return Promise.resolve();
      });
    });
    Promise.all([executeTasksInSequence(tasks)])
      .then(() => {
        this.setState({
          isUpdatingStatuses: false,
        });
      })
      .catch((err: any) => {
        this.props.notifyError(err);
      });
  };

  buildMenu = () => {
    const onClick = (event: any) => {
      switch (event.key) {
        case 'pause':
          return this.handleStatusAction('PAUSED');
        case 'activate':
          return this.handleStatusAction('ACTIVE');
        default:
          break;
      }
    };

    return (
      <Menu onClick={onClick}>
        <Menu.Item key="pause">
          <FormattedMessage {...messagesMap.pauseAll} />
        </Menu.Item>
        <Menu.Item key="activate">
          <FormattedMessage {...messagesMap.activeAll} />
        </Menu.Item>
      </Menu>
    );
  };

  render() {
    const { exportIsRunning, isArchiving } = this.state;
    const {
      match: { params: { organisationId } },
      intl,
      rowSelection: { selectedRowKeys },
      multiEditProps: {
        archiveCampaigns,
        visible,
        handleCancel,
        openEditCampaignsDrawer,
      },
    } = this.props;

    const hasSelected = !!(selectedRowKeys && selectedRowKeys.length > 0);

    const breadcrumbPaths = [
      {
        name: intl.formatMessage(messagesMap.breadCrumbPath),
        url: `/v2/o/${organisationId}/campaigns/display`,
      },
    ];

    const buildActionElement = () => {
      return (
        <Dropdown overlay={this.buildMenu()} trigger={['click']}>
          <Button className="button-glow">
            <McsIcon type="chevron" />
            <FormattedMessage {...messagesMap.setStatus} />
          </Button>
        </Dropdown>
      );
    };

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/campaigns/display/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" /> <FormattedMessage id="NEW_CAMPAIGN" />
          </Button>
        </Link>

        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <McsIcon type="download" />}
          <FormattedMessage id="EXPORT" />
        </Button>

        <Slider
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button
              onClick={archiveCampaigns}
              className="button-slider button-glow"
            >
              <McsIcon type="delete" />
              <FormattedMessage id="ARCHIVE" />
            </Button>
          }
        />

        {hasSelected ? (
          <Modal
            title={
              <FormattedMessage {...messages.archiveCampaignsModalTitle} />
            }
            visible={visible}
            onOk={this.handleArchive}
            onCancel={handleCancel}
          >
            <div>
              {isArchiving ? (
                <Spin />
              ) : (
                <FormattedMessage {...messages.archiveCampaignsModalMessage} />
              )}
            </div>
          </Modal>
        ) : null}

        <Slider
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button
              onClick={openEditCampaignsDrawer}
              className="button-slider button-glow"
            >
              <McsIcon type="pen" />
              <FormattedMessage id="EDIT" />
            </Button>
          }
        />

        <Slider
          toShow={hasSelected}
          horizontal={true}
          content={buildActionElement()}
        />
      </Actionbar>
    );
  }
}

const mapStateToProps = (state: { drawableContents: DrawableContent[] }) => ({
  drawableContents: state.drawableContents,
});

export default compose<JoinedProps, DisplayCampaignsActionbarProps>(
  withRouter,
  withTranslations,
  injectDrawer,
  injectNotifications,
  connect(mapStateToProps, undefined),
  injectIntl,
)(DisplayCampaignsActionbar);
