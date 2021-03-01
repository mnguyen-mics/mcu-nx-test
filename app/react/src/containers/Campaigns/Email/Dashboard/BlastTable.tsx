import * as React from 'react';
import { compose } from 'recompose';
import {
  defineMessages,
  FormattedMessage,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Dropdown } from '../../../../components/PopupContainers';
import { TableView } from '../../../../components/TableView';
import { formatMetric } from '../../../../utils/MetricHelper';
import {
  TableViewProps,
  DataColumnDefinition,
  ActionsColumnDefinition,
} from '../../../../components/TableView/TableView';
import { EmailBlastStatus } from '../../../../models/campaign/email';
import { EmailCampaignDashboardRouteMatchParam } from './constants';
import injectDrawer, {
  InjectedDrawerProps,
} from '../../../../components/Drawer/injectDrawer';
import ResourceTimelinePage, {
  ResourceTimelinePageProps,
} from '../../../ResourceHistory/ResourceTimeline/ResourceTimelinePage';
import { formatEmailBlastProperty } from '../../Email/messages';
import resourceHistoryMessages from '../../../ResourceHistory/ResourceTimeline/messages';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../services/AudienceSegmentService';
import { ICreativeService } from '../../../../services/CreativeService';
import { IResourceHistoryService } from '../../../../services/ResourceHistoryService';
import { IEmailCampaignService } from '../../../../services/EmailCampaignService';

const blastStatusMessageMap: {
  [key in EmailBlastStatus]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  SCENARIO_ACTIVATED: {
    id: 'email.campaigns.dashboard.blastList.scenarioActivation',
    defaultMessage: 'Scenario activation',
  },
  PENDING: {
    id: 'email.campaigns.dashboard.blastList.status.pending',
    defaultMessage: 'Pending',
  },
  SCHEDULED: {
    id: 'email.campaigns.dashboard.blastList.status.scheduled',
    defaultMessage: 'Scheduled',
  },
  FINISHED: {
    id: 'email.campaigns.dashboard.blastList.status.finished',
    defaultMessage: 'Sent',
  },
  ERROR: {
    id: 'email.campaigns.dashboard.blastList.status.error',
    defaultMessage: 'Error',
  },
});

export const messagesMap = defineMessages({
  status: {
    id: 'email.campaigns.dashboard.blastList.status',
    defaultMessage: 'Status',
  },
  name: {
    id: 'email.campaigns.dashboard.blastList.name',
    defaultMessage: 'Name',
  },
  emailSent: {
    id: 'email.campaigns.dashboard.blastList.emailSent',
    defaultMessage: 'Email Sent',
  },
  emailHardBounced: {
    id: 'email.campaigns.dashboard.blastList.emailHardBounced',
    defaultMessage: 'Email Hard Bounced',
  },
  emailSoftBounced: {
    id: 'email.campaigns.dashboard.blastList.emailSoftBounced',
    defaultMessage: 'Email Soft Bounced',
  },
  clicks: {
    id: 'email.campaigns.dashboard.blastList.clicks',
    defaultMessage: 'Clicks',
  },
  impressions: {
    id: 'email.campaigns.dashboard.blastList.impressions',
    defaultMessage: 'Impressions',
  },
  noEmailStats: {
    id: 'email.campaigns.dashboard.blastList.noEmailStats',
    defaultMessage: 'No Data during the selected period.',
  },
  editBlast: {
    id: 'email.campaigns.dashboard.blastList.edit',
    defaultMessage: 'Edit',
  },
  blastHistory: {
    id: 'email.campaigns.dashboard.blastList.history',
    defaultMessage: 'History',
  },
  archiveBlast: {
    id: 'email.campaigns.dashboard.blastList.archive',
    defaultMessage: 'Archive',
  },
});

const availableStatusTransition: { [status in EmailBlastStatus]: string[] } = {
  PENDING: ['SCENARIO_ACTIVATED', 'SCHEDULED'],
  SCENARIO_ACTIVATED: ['PENDING'],
  SCHEDULED: ['PENDING'],
  FINISHED: [],
  ERROR: [],
};

export interface BlastData {
  id: string;
  blast_name: string;
  status: EmailBlastStatus;
  email_sent?: number;
  email_hard_bounced?: number;
  email_soft_bounced?: number;
  clicks?: number;
  impressions?: number;
}

export interface BlastTableProps {
  isLoading: boolean;
  isStatLoading: boolean;
  data: BlastData[];
  updateBlastStatus: (id: string, nextStatus: EmailBlastStatus) => void;
  archiveBlast: (blast: BlastData) => void;
}

type Props = BlastTableProps &
  InjectedIntlProps &
  RouteComponentProps<EmailCampaignDashboardRouteMatchParam> &
  InjectedDrawerProps;

const BlastTableView = TableView as React.ComponentClass<
  TableViewProps<BlastData>
>;

class BlastTable extends React.Component<Props> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.IResourceHistoryService)
  private _resourceHistoryService: IResourceHistoryService;

  @lazyInject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  @lazyInject(TYPES.IEmailCampaignService)
  private _emailCampaignService: IEmailCampaignService;

  editBlast = (blast: BlastData) => {
    const {
      match: {
        params: { organisationId, campaignId },
      },
      history,
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/campaigns/email/${campaignId}/blasts/${blast.id}/edit`,
    );
  };

  renderStatus = (blast: BlastData) => {
    const isUpdatable = availableStatusTransition[blast.status];
    if (isUpdatable) {
      return (
        <Dropdown overlay={this.getStatusMenu(blast)} trigger={['click']}>
          <a className="ant-dropdown-link">
            <FormattedMessage {...blastStatusMessageMap[blast.status]} />
            <DownOutlined />
          </a>
        </Dropdown>
      );
    }
    return <FormattedMessage {...blastStatusMessageMap[blast.status]} />;
  };

  getStatusMenu = (blast: BlastData) => {
    const { updateBlastStatus } = this.props;

    const menuItems = availableStatusTransition[blast.status].map(
      (status: EmailBlastStatus) => (
        <Menu.Item key={status}>
          <FormattedMessage {...blastStatusMessageMap[status]} />
        </Menu.Item>
      ),
    );

    const handleOnClick = (param: any) =>
      updateBlastStatus(blast.id, param.key as EmailBlastStatus);

    return <Menu onClick={handleOnClick}>{menuItems}</Menu>;
  };

  openHistoryDrawer = (record: BlastData) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    this.props.openNextDrawer<ResourceTimelinePageProps>(ResourceTimelinePage, {
      additionalProps: {
        resourceType: 'EMAIL_BLAST',
        resourceId: record.id,
        handleClose: () => this.props.closeNextDrawer(),
        formatProperty: formatEmailBlastProperty,
        resourceLinkHelper: {
          EMAIL_CAMPAIGN: {
            // this one is only kept for backward compatibility, all the new events are related to "CAMPAIGN"
            direction: 'PARENT',
            getType: () => {
              return (
                <FormattedMessage
                  {...resourceHistoryMessages.emailCampaignResourceType}
                />
              );
            },
            getName: (id: string) => {
              return this._emailCampaignService
                .getEmailCampaign(id)
                .then(response => {
                  return response.data.name;
                });
            },
            goToResource: (id: string) => {
              history.push(`/v2/o/${organisationId}/campaigns/email/${id}`);
            },
          },
          CAMPAIGN: {
            direction: 'PARENT',
            getType: () => {
              return (
                <FormattedMessage
                  {...resourceHistoryMessages.emailCampaignResourceType}
                />
              );
            },
            getName: (id: string) => {
              return this._emailCampaignService
                .getEmailCampaign(id)
                .then(response => {
                  return response.data.name;
                });
            },
            goToResource: (id: string) => {
              history.push(`/v2/o/${organisationId}/campaigns/email/${id}`);
            },
          },
          EMAIL_TEMPLATE_SELECTION: {
            direction: 'CHILD',
            getType: () => {
              return (
                <FormattedMessage
                  {...resourceHistoryMessages.emailTemplateResourceType}
                />
              );
            },
            getName: (id: string) => {
              return this._resourceHistoryService
                .getLinkedResourceIdInSelection(
                  organisationId,
                  'EMAIL_TEMPLATE_SELECTION',
                  id,
                  'CREATIVE',
                )
                .then(emailTemplateId => {
                  return this._creativeService
                    .getEmailTemplate(emailTemplateId)
                    .then(response => {
                      return response.data.name;
                    });
                });
            },
            goToResource: (id: string) => {
              this._resourceHistoryService
                .getLinkedResourceIdInSelection(
                  organisationId,
                  'EMAIL_TEMPLATE_SELECTION',
                  id,
                  'CREATIVE',
                )
                .then(emailTemplateId => {
                  history.push(
                    `/v2/o/${organisationId}/creatives/email/${emailTemplateId}/edit`,
                  );
                });
            },
          },
          AUDIENCE_SEGMENT_EMAIL_SELECTION: {
            direction: 'CHILD',
            getType: () => {
              return (
                <FormattedMessage
                  {...resourceHistoryMessages.segmentResourceType}
                />
              );
            },
            getName: (id: string) => {
              return this._resourceHistoryService
                .getLinkedResourceIdInSelection(
                  organisationId,
                  'AUDIENCE_SEGMENT_EMAIL_SELECTION',
                  id,
                  'AUDIENCE_SEGMENT',
                )
                .then(audienceSegmentId => {
                  return this._audienceSegmentService
                    .getSegment(audienceSegmentId)
                    .then(response => {
                      return response.data.name;
                    });
                });
            },
            goToResource: (id: string) => {
              this._resourceHistoryService
                .getLinkedResourceIdInSelection(
                  organisationId,
                  'AUDIENCE_SEGMENT_EMAIL_SELECTION',
                  id,
                  'AUDIENCE_SEGMENT',
                )
                .then(audienceSegmentId => {
                  history.push(
                    `/v2/o/${organisationId}/audience/segments/${audienceSegmentId}`,
                  );
                });
            },
          },
        },
      },
      size: 'small',
    });
  };

  render() {
    const {
      match: {
        params: { organisationId, campaignId },
      },
      data,
      isStatLoading,
      isLoading,
    } = this.props;

    const renderMetricData = (
      value: any,
      numeralFormat: string,
      currency = '',
    ) => {
      if (isStatLoading) {
        return <i className="mcs-table-cell-loading" />;
      }
      const unlocalizedMoneyPrefix = currency === 'EUR' ? '€ ' : '';
      return formatMetric(value, numeralFormat, unlocalizedMoneyPrefix);
    };

    const dataColumns: Array<DataColumnDefinition<BlastData>> = [
      {
        intlMessage: messagesMap.status,
        key: 'status',
        isHideable: false,
        render: (text, record) => this.renderStatus(record),
      },
      {
        intlMessage: messagesMap.name,
        key: 'blast_name',
        isHideable: false,
        render: (text, record) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/campaigns/email/${campaignId}/blasts/${record.id}/edit`}
          >
            {record.blast_name}
          </Link>
        ),
      },
      {
        intlMessage: messagesMap.emailSent,
        key: 'email_sent',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text, record) => renderMetricData(record.email_sent, '0,0'),
      },
      {
        intlMessage: messagesMap.emailHardBounced,
        key: 'email_hard_bounced',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text, record) =>
          renderMetricData(record.email_hard_bounced, '0,0'),
      },
      {
        intlMessage: messagesMap.emailSoftBounced,
        key: 'email_soft_bounced',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text, record) =>
          renderMetricData(record.email_soft_bounced, '0,0'),
      },
      {
        intlMessage: messagesMap.clicks,
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text, record) => renderMetricData(record.clicks, '0,0'),
      },
      {
        intlMessage: messagesMap.impressions,
        key: 'impressions',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text, record) => renderMetricData(record.impressions, '0,0'),
      },
    ];

    const actionColumns: Array<ActionsColumnDefinition<BlastData>> = [
      {
        key: 'action',
        actions: () => [
          {
            intlMessage: messagesMap.editBlast,
            callback: this.editBlast,
          },
          {
            intlMessage: messagesMap.blastHistory,
            callback: this.openHistoryDrawer,
          },
          {
            intlMessage: messagesMap.archiveBlast,
            callback: this.props.archiveBlast,
          },
        ],
      },
    ];

    return (
      <BlastTableView
        columns={dataColumns}
        actionsColumnsDefinition={actionColumns}
        dataSource={data}
        loading={isLoading}
      />
    );
  }
}

export default compose<Props, BlastTableProps>(
  withRouter,
  injectIntl,
  injectDrawer,
)(BlastTable);
