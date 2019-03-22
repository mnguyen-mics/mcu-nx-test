import * as React from 'react';
import { compose } from 'recompose';
import {
  defineMessages,
  FormattedMessage,
  InjectedIntlProps,
  injectIntl,
} from 'react-intl';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { Menu, Icon } from 'antd';
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
import { ClickParam } from 'antd/lib/menu';
import injectDrawer, { InjectedDrawerProps } from '../../../../components/Drawer/injectDrawer';
import ResourceTimelinePage, { ResourceTimelinePageProps } from '../../../ResourceHistory/ResourceTimeline/ResourceTimelinePage';
import formatEmailBlastProperty from '../../../../messages/campaign/email/emailBlastMessages';
import resourceHistoryMessages from '../../../ResourceHistory/ResourceTimeline/messages';
import EmailCampaignService from '../../../../services/EmailCampaignService';

const blastStatusMessageMap: {
  [key in EmailBlastStatus]: FormattedMessage.MessageDescriptor
} = defineMessages({
  SCENARIO_ACTIVATED: {
    id: 'blast.status.scenario_activated',
    defaultMessage: 'Scenario activation',
  },
  PENDING: {
    id: 'blast.status.pending',
    defaultMessage: 'Pending',
  },
  SCHEDULED: {
    id: 'blast.status.scheduled',
    defaultMessage: 'Scheduled',
  },
  FINISHED: {
    id: 'blast.status.finished',
    defaultMessage: 'Sent',
  },
  ERROR: {
    id: 'blast.status.error',
    defaultMessage: 'Error',
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
  editBlast = (blast: BlastData) => {
    const {
      match: { params: { organisationId, campaignId } },
      history,
    } = this.props;

    history.push(
      `/v2/o/${organisationId}/campaigns/email/${campaignId}/blasts/${
        blast.id
      }/edit`,
    );
  };

  renderStatus = (blast: BlastData) => {
    const isUpdatable = availableStatusTransition[blast.status];
    if (isUpdatable) {
      return (
        <Dropdown overlay={this.getStatusMenu(blast)} trigger={['click']}>
          <a className="ant-dropdown-link">
            <FormattedMessage {...blastStatusMessageMap[blast.status]} />
            <Icon type="down" />
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

    const handleOnClick = (param: ClickParam) =>
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
    
    this.props.openNextDrawer<ResourceTimelinePageProps>(
      ResourceTimelinePage,
      {
        additionalProps: {
          resourceType: 'EMAIL_BLAST',
          resourceId: record.id,
          handleClose: () => this.props.closeNextDrawer(),
          formatProperty: formatEmailBlastProperty,
          resourceLinkHelper: {
            EMAIL_CAMPAIGN: {
              direction: 'PARENT',
              getType: () => {
                return (
                  <FormattedMessage
                    {...resourceHistoryMessages.emailCampaignResourceType}/>
                );
              },
              getName: (id: string) => {
                return EmailCampaignService.getEmailCampaign(id).then(response => {
                  return response.data.name;
                });
              },
              goToResource: (id: string) => {
                history.push(
                  `/v2/o/${organisationId}/campaigns/email/${id}`,
                );
              },
            },
          },
        },
        size: 'small',
      }
    )
  }

  render() {
    const {
      match: { params: { organisationId, campaignId } },
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
        translationKey: 'STATUS',
        key: 'status',
        isHideable: false,
        render: (text, record) => this.renderStatus(record),
      },
      {
        translationKey: 'NAME',
        key: 'blast_name',
        isHideable: false,
        render: (text, record) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/campaigns/email/${campaignId}/blasts/${
              record.id
            }/edit`}
          >
            {record.blast_name}
          </Link>
        ),
      },
      {
        translationKey: 'EMAIL_SENT',
        key: 'email_sent',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text, record) => renderMetricData(record.email_sent, '0,0'),
      },
      {
        translationKey: 'EMAIL_HARD_BOUNCED',
        key: 'email_hard_bounced',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text, record) =>
          renderMetricData(record.email_hard_bounced, '0,0'),
      },
      {
        translationKey: 'EMAIL_SOFT_BOUNCED',
        key: 'email_soft_bounced',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text, record) =>
          renderMetricData(record.email_soft_bounced, '0,0'),
      },
      {
        translationKey: 'CLICKS',
        key: 'clicks',
        isVisibleByDefault: true,
        isHideable: true,
        render: (text, record) => renderMetricData(record.clicks, '0,0'),
      },
      {
        translationKey: 'IMPRESSIONS',
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
            translationKey: 'EDIT',
            callback: this.editBlast,
          },
          {
            translationKey: 'HISTORY',
            callback: this.openHistoryDrawer,
          },
          {
            translationKey: 'ARCHIVE',
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

export default compose<Props, BlastTableProps>(withRouter, injectIntl, injectDrawer)(
  BlastTable,
);
