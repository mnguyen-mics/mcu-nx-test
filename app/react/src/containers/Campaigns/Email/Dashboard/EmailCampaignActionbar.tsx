import * as React from 'react';
import { EditOutlined, EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Menu, Modal, message } from 'antd';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import messages from '../messages';
import modalMessages from '../../../../common/messages/modalMessages';
import exportMessages from '../../../../common/messages/exportMessages';
import ExportService from '../../../../services/ExportService';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import {
  EmailCampaignDashboardRouteMatchParam,
  EMAIL_DASHBOARD_SEARCH_SETTINGS,
} from './constants';
import { EmailCampaignResource } from '../../../../models/campaign/email';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { Actionbar, McsIcon, PopupContainer } from '@mediarithmics-private/mcs-components-library';
import ReportService from '../../../../services/ReportService';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import log from '../../../../utils/Logger';
import injectDrawer, { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import { formatCampaignProperty } from '../../Email/messages';
import ResourceTimelinePage, {
  ResourceTimelinePageProps,
} from '../../../ResourceHistory/ResourceTimeline/ResourceTimelinePage';
import resourceHistoryMessages from '../../../ResourceHistory/ResourceTimeline/messages';
import { lazyInject } from '../../../../config/inversify.config';
import { IEmailRouterService } from '../../../../services/Library/EmailRoutersService';
import { TYPES } from '../../../../constants/types';
import { IResourceHistoryService } from '../../../../services/ResourceHistoryService';
import { IEmailCampaignService } from '../../../../services/EmailCampaignService';

const { Dropdown } = PopupContainer;

export interface EmailCampaignActionbarProps {
  campaign?: EmailCampaignResource;
  activateCampaign: () => void;
  pauseCampaign: () => void;
  archiveCampaign: () => void;
}

interface State {
  exportIsRunning: boolean;
}

type Props = EmailCampaignActionbarProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EmailCampaignDashboardRouteMatchParam> &
  InjectedDrawerProps;

class EmailCampaignActionbar extends React.Component<Props, State> {
  @lazyInject(TYPES.IEmailRouterService)
  private _emailRoutersService: IEmailRouterService;

  @lazyInject(TYPES.IResourceHistoryService)
  private _resourceHistoryService: IResourceHistoryService;

  @lazyInject(TYPES.IEmailCampaignService)
  private _emailCampaignService: IEmailCampaignService;

  constructor(props: Props) {
    super(props);
    this.state = { exportIsRunning: false };
  }

  handleRunExport = (e: React.MouseEvent) => {
    const {
      match: {
        params: { organisationId, campaignId },
      },
      intl: { formatMessage },
      location: { search },
      campaign,
    } = this.props;

    this.setState({ exportIsRunning: true });

    const filter = parseSearch(search, EMAIL_DASHBOARD_SEARCH_SETTINGS);

    const hideExportLoadingMsg = message.loading(formatMessage(exportMessages.exportInProgress), 0);

    Promise.all([
      this._emailCampaignService.getBlasts(campaignId).then(res => res.data),
      ReportService.getSingleEmailDeliveryReport(
        organisationId,
        campaignId,
        filter.from,
        filter.to,
        ['day'],
      ).then(res => normalizeReportView(res.data.report_view)),
    ])
      .then(([blasts, campaignStats]) => {
        ExportService.exportEmailCampaignDashboard(
          organisationId,
          campaign,
          campaignStats,
          blasts,
          filter,
          formatMessage,
        );
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      })
      .catch(err => {
        log.error(err);
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      });
  };

  buildActionElement = () => {
    const { campaign, activateCampaign, pauseCampaign } = this.props;

    const activeCampaignElement = (
      <Button className='mcs-primary' type='primary' onClick={activateCampaign}>
        <McsIcon type='play' />
        <FormattedMessage
          id='email.campaign.dashboard.actionbar.activateCampaign'
          defaultMessage='Activate Campaign'
        />
      </Button>
    );
    const pauseCampaignElement = (
      <Button className='mcs-primary' type='primary' onClick={pauseCampaign}>
        <McsIcon type='pause' />
        <FormattedMessage
          id='email.campaign.dashboard.actionbar.pauseCampaign'
          defaultMessage='Pause Campaign'
        />
      </Button>
    );

    return campaign && campaign.status
      ? campaign.status === 'PAUSED' || campaign.status === 'PENDING'
        ? activeCampaignElement
        : pauseCampaignElement
      : null;
  };

  buildMenu = () => {
    const {
      campaign,
      archiveCampaign,
      intl: { formatMessage },
    } = this.props;

    const handleArchiveCampaign = (displayCampaignId: string) => {
      Modal.confirm({
        title: formatMessage(modalMessages.archiveCampaignConfirm),
        content: formatMessage(modalMessages.archiveCampaignMessage),
        icon: <ExclamationCircleOutlined />,
        okText: formatMessage(modalMessages.confirm),
        cancelText: formatMessage(modalMessages.cancel),
        onOk() {
          return archiveCampaign();
        },
      });
    };

    const onClick = (param: any) => {
      const {
        match: {
          params: { organisationId, campaignId },
        },
        history,
      } = this.props;

      switch (param.key) {
        case 'HISTORY':
          return this.props.openNextDrawer<ResourceTimelinePageProps>(ResourceTimelinePage, {
            size: 'small',
            additionalProps: {
              resourceType: 'CAMPAIGN',
              resourceId: campaignId,
              handleClose: () => this.props.closeNextDrawer(),
              formatProperty: formatCampaignProperty,
              resourceLinkHelper: {
                EMAIL_BLAST: {
                  direction: 'CHILD',
                  getType: () => {
                    return <FormattedMessage {...resourceHistoryMessages.emailBlastResourceType} />;
                  },
                  getName: (id: string) => {
                    return this._emailCampaignService.getBlast(campaignId, id).then(response => {
                      return response.data.blast_name || id;
                    });
                  },
                  goToResource: (id: string) => {
                    history.push(
                      `/v2/o/${organisationId}/campaigns/email/${campaignId}/blasts/${id}/edit`,
                    );
                  },
                },
                EMAIL_ROUTER_SELECTION: {
                  direction: 'CHILD',
                  getType: () => {
                    return (
                      <FormattedMessage {...resourceHistoryMessages.emailRouterResourceType} />
                    );
                  },
                  getName: (id: string) => {
                    return this._resourceHistoryService
                      .getLinkedResourceIdInSelection(
                        organisationId,
                        'EMAIL_ROUTER_SELECTION',
                        id,
                        'EMAIL_ROUTER',
                      )
                      .then(emailRouterId => {
                        return this._emailRoutersService
                          .getEmailRouter(emailRouterId)
                          .then(response => {
                            return response.data.name;
                          });
                      });
                  },
                  goToResource: (id: string) => {
                    return this._resourceHistoryService
                      .getLinkedResourceIdInSelection(
                        organisationId,
                        'EMAIL_ROUTER_SELECTION',
                        id,
                        'EMAIL_ROUTER',
                      )
                      .then(emailRouterId => {
                        history.push(
                          `/v2/o/${organisationId}/settings/campaigns/email_routers/${emailRouterId}/edit`,
                        );
                      });
                  },
                },
              },
            },
          });
        case 'ARCHIVED':
          return campaign && handleArchiveCampaign(campaign.id);
        default:
          return () => {
            // not handled
          };
      }
    };

    return (
      <Menu onClick={onClick} className='mcs-menu-antd-customized'>
        <Menu.Item key='HISTORY'>
          <FormattedMessage {...messages.history} />
        </Menu.Item>
        <Menu.Item key='ARCHIVED'>
          <FormattedMessage
            id='email.campaign.dashboard.actionbar.archive'
            defaultMessage='Archive'
          />
        </Menu.Item>
      </Menu>
    );
  };

  exportIsRunningModal = (e: React.MouseEvent) => {
    const {
      intl: { formatMessage },
    } = this.props;
    Modal.warning({
      title: formatMessage(modalMessages.exportIsRunningTitle),
      content: formatMessage(modalMessages.exportIsRunningMessage),
      icon: <ExclamationCircleOutlined />,
      okText: formatMessage(modalMessages.confirm),
      onOk() {
        // closing modal
      },
    });
  };

  render() {
    const {
      match: {
        params: { organisationId, campaignId },
      },
      intl: { formatMessage },
      campaign,
    } = this.props;

    const actionElement = this.buildActionElement();
    const menu = this.buildMenu();

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/campaigns/email`}>
        {formatMessage(messages.email)}
      </Link>,
      campaign ? campaign.name : '',
    ];

    return (
      <Actionbar pathItems={breadcrumbPaths}>
        {actionElement}
        <Button
          onClick={this.state.exportIsRunning ? this.exportIsRunningModal : this.handleRunExport}
        >
          <McsIcon type='download' />
          <FormattedMessage
            id='email.campaign.dashboard.actionbar.export'
            defaultMessage='Export'
          />
        </Button>
        <Link to={`/v2/o/${organisationId}/campaigns/email/${campaignId}/edit`}>
          <Button>
            <EditOutlined />
            <FormattedMessage id='email.campaign.dashboard.actionbar.edit' defaultMessage='Edit' />
          </Button>
        </Link>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            <EllipsisOutlined />
          </Button>
        </Dropdown>
      </Actionbar>
    );
  }
}

export default compose<Props, EmailCampaignActionbarProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  injectDrawer,
)(EmailCampaignActionbar);
