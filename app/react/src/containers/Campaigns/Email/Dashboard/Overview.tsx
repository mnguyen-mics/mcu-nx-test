import * as React from 'react';
import { compose } from 'recompose';
import { ReportViewResource } from '../../../../models/ReportView';
import { EmailPieCharts } from './Charts';
import {
  normalizeReportView,
  formatNormalizeReportView,
} from '../../../../utils/MetricHelper';
import { EmailDeliveryReport } from './Charts/EmailPieCharts';
import ReportService from '../../../../services/ReportService';
import { EmailCampaignResource } from '../../../../models/campaign/email';
import McsMoment from '../../../../utils/McsMoment';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import log from '../../../../utils/Logger';

interface State {
  isLoading: boolean;
  emailReportView?: ReportViewResource;
}

export interface OverviewProps {
  campaign?: EmailCampaignResource;
  isLoading: boolean;
}

type Props = OverviewProps & InjectedNotificationProps;

class Overview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  componentDidMount() {
    const { campaign } = this.props;

    if (campaign) {
      this.fetchData(campaign);
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      campaign
    } = this.props;
    if (
      campaign &&
      (!previousProps.campaign || campaign.id !== previousProps.campaign.id)
    ) {
      this.fetchData(campaign);
    }
  }

  fetchData = (campaign: EmailCampaignResource) => {
    this.setState({ isLoading: true });
    ReportService.getSingleEmailDeliveryReport(
      campaign.organisation_id,
      campaign.id,
      new McsMoment(campaign.creation_ts),
      new McsMoment('now'),
      ['day'],
    )
      .then(res => {
        this.setState({
          isLoading: false,
          emailReportView: res.data,
        });
      })
      .catch(err => {
        log.error(err);
        this.props.notifyError(err);
        this.setState({ isLoading: false });
      });
  };

  render() {
    const { isLoading, emailReportView } = this.state;

    let deliveryReport: EmailDeliveryReport | undefined;
    if (emailReportView) {
      const normlizedRV = normalizeReportView(emailReportView.report_view);
      const {
        email_sent,
        uniq_email_hard_bounced,
        uniq_email_soft_bounced,
        uniq_impressions,
        uniq_email_unsubscribed,
        uniq_clicks,
      } = formatNormalizeReportView(normlizedRV);

      deliveryReport = {
        emailDelivered:
          email_sent - uniq_email_hard_bounced - uniq_email_soft_bounced,
        emailOpened: uniq_impressions,
        emailUnsubscribed: uniq_email_unsubscribed,
        emailClicks: uniq_clicks,
        emailSent: email_sent,
      };
    }

    return (
      <EmailPieCharts isLoading={isLoading} deliveryReport={deliveryReport} />
    );
  }
}

export default compose<Props, OverviewProps>(injectNotifications)(Overview);
