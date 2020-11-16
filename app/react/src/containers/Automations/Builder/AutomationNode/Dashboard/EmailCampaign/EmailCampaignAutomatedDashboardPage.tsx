import * as React from 'react';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Layout } from 'antd';
import CampaignDashboardHeader from '../../../../../Campaigns/Common/CampaignDashboardHeader';
import { Card, Actionbar, McsIcon } from '@mediarithmics-private/mcs-components-library';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import { EmailCampaignResource } from '../../../../../../models/campaign/email';
import { Index } from '../../../../../../utils';
import Overview from '../../../../../Campaigns/Email/Dashboard/Overview';
import { EmailStackedAreaChart } from '../../../../../Campaigns/Email/Dashboard/Charts';
import { McsDateRangeValue } from '../../../../../../components/McsDateRangePicker';
import ReportService from '../../../../../../services/ReportService';
import log from '../../../../../../utils/Logger';
import { normalizeReportView } from '../../../../../../utils/MetricHelper';
import { lazyInject } from '../../../../../../config/inversify.config';
import { IEmailCampaignService } from '../../../../../../services/EmailCampaignService';
import { TYPES } from '../../../../../../constants/types';
import McsMoment from '../../../../../../utils/McsMoment';

export interface EmailCampaignAutomatedDashboardPageProps {
  campaignId: string;
  close: () => void;
}

const { Content } = Layout;

const messageMap = defineMessages({
  overview: {
    id: 'email.automatedCampaigns.dashboard.tabs.overview',
    defaultMessage: 'Overview',
  },
  devileryAnalysis: {
    id: 'email.automatedCampaigns.dashboard.tabs.deliveryAnalysis',
    defaultMessage: 'Delivery Analysis',
  },
  statusUpdateSuccess: {
    id: 'email.automatedCampaigns.dashboard.status-update-successfull',
    defaultMessage: 'Campaign status successfully updated',
  },
  statusUpdateFailure: {
    id: 'email.automatedCampaigns.dashboard.status-update-failure',
    defaultMessage:
      'There was an error updating your campaign... Please try again...',
  },
  notifSuccess: {
    id: 'email.automatedCampaigns.dashboard.notification-success',
    defaultMessage: 'Success',
  },
  notifError: {
    id: 'email.automatedCampaigns.dashboard.notification-error',
    defaultMessage: 'Error',
  },
});

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }> &
  EmailCampaignAutomatedDashboardPageProps;

interface State {
  campaign?: EmailCampaignResource;
  isLoadingCampaign: boolean;
  campaignStatReport: Array<Index<any>>;
  isLoadingCampaignStatReport: boolean;
  dateRange: McsDateRangeValue;
}

class EmailCampaignAutomatedDashboardPage extends React.Component<
  Props,
  State
> {
  @lazyInject(TYPES.IEmailCampaignService)
  private _emailCampaignService: IEmailCampaignService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingCampaign: true,
      isLoadingCampaignStatReport: true,
      campaignStatReport: [],
      dateRange: { from: new McsMoment('now-7d'), to: new McsMoment('now') },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      campaignId,
    } = this.props;
    this.loadCampaign(campaignId);
    this.refreshStats(organisationId, campaignId);
  }

  componentDidUpdate(previousProps: Props, previousState: State) {
    const {
      match: {
        params: { organisationId },
      },
      campaignId,
    } = this.props;

    const { campaignId: previousCampaignId } = previousProps;
    const { dateRange } = this.state;
    const { dateRange: previousDateRange } = previousState;

    if (
      dateRange.from.value !== previousDateRange.from.value ||
      dateRange.to.value !== previousDateRange.to.value ||
      campaignId !== previousCampaignId
    ) {
      this.loadCampaign(campaignId);
      this.refreshStats(organisationId, campaignId);
    }
  }

  loadCampaign = (campaignId: string) => {
    if (!this.state.campaign || this.state.campaign.id !== campaignId) {
      this.setState({ isLoadingCampaign: true });
      this._emailCampaignService
        .getEmailCampaign(campaignId)
        .then(res => {
          this.setState({
            isLoadingCampaign: false,
            campaign: res.data,
          });
        })
        .catch(err => {
          log.error(err);
          this.setState({
            isLoadingCampaign: false,
          });
          this.props.notifyError(err);
        });
    }
  };

  refreshStats = (organisationId: string, campaignId: string) => {
    this.setState({
      isLoadingCampaignStatReport: true,
    });
    ReportService.getSingleEmailDeliveryReport(
      organisationId,
      campaignId,
      this.state.dateRange.from,
      this.state.dateRange.to,
      ['day'],
    )
      .then(res => {
        this.setState({
          isLoadingCampaignStatReport: false,
          campaignStatReport: normalizeReportView(res.data.report_view),
        });
      })
      .catch(err => {
        log.error(err);
        this.setState({
          isLoadingCampaignStatReport: false,
        });
        this.props.notifyError(err);
      });
  };

  render() {
    const { intl } = this.props;

    const {
      campaign,
      isLoadingCampaignStatReport,
      campaignStatReport,
      isLoadingCampaign,
    } = this.state;

    const handleDateRangeChange = (newRange: McsDateRangeValue) =>
      this.setState({ dateRange: newRange });

    return (
      <div className="ant-layout">
        <Actionbar
          paths={[
            {
              name: campaign ? campaign.name : '',
            },
          ]}
          edition={true}>
          <McsIcon
            type="close"
            className="close-icon"
            style={{ cursor: 'pointer' }}
            onClick={this.props.close}
          />
        </Actionbar>
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <CampaignDashboardHeader campaign={campaign} />
            <Card title={intl.formatMessage(messageMap.overview)}>
              <Overview campaign={campaign} isLoading={isLoadingCampaign} />
            </Card>
            <Card title={intl.formatMessage(messageMap.devileryAnalysis)}>
              <EmailStackedAreaChart
                dateRangeValue={{ ...this.state.dateRange }}
                onDateRangeChange={handleDateRangeChange}
                isLoading={isLoadingCampaignStatReport}
                emailReport={campaignStatReport}
              />
            </Card>
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<Props, EmailCampaignAutomatedDashboardPageProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(EmailCampaignAutomatedDashboardPage);
