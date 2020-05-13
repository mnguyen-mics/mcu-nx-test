import * as React from 'react';
import { Button } from 'antd';
import { compose } from 'recompose';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Card } from '@mediarithmics-private/mcs-components-library';
import messages from './messages';
import {
  EMAIL_DASHBOARD_SEARCH_SETTINGS,
  EmailCampaignDashboardRouteMatchParam,
  EmailDashboardSearchSettings,
} from './constants';
import BlastTable, { BlastData } from './BlastTable';
import { ReportViewResource } from '../../../../models/ReportView';
import {
  EmailBlastResource,
  EmailBlastStatus,
} from '../../../../models/campaign/email';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import log from '../../../../utils/Logger';
import ReportService from '../../../../services/ReportService';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IEmailCampaignService } from '../../../../services/EmailCampaignService';

export interface BlastCardProps {
  reportView?: ReportViewResource;
  isLoading?: boolean;
}

type Props = BlastCardProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EmailCampaignDashboardRouteMatchParam>;

interface State {
  isLoading: boolean;
  blasts: EmailBlastResource[];
}

class BlastCard extends React.Component<Props, State> {

  @lazyInject(TYPES.IEmailCampaignService)
  private _emailCampaignService: IEmailCampaignService;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      blasts: [],
    };
  }

  componentDidMount() {
    this.refreshData();
  }
  
  refreshData = () => {
    const {
      location: { search },
      match: {
        params: { campaignId, organisationId },
      },
    } = this.props;
    this.setState({ isLoading: true });
    const filter = parseSearch<EmailDashboardSearchSettings>(
      search,
      EMAIL_DASHBOARD_SEARCH_SETTINGS,
    );
    Promise.all([
      ReportService.getEmailDeliveryReport(
        organisationId,
        filter.from,
        filter.to,
        ['campaign_id', 'sub_campaign_id'],
      ).then(report => {
        return normalizeArrayOfObject(
          normalizeReportView(report.data.report_view),
          'sub_campaign_id',
        );
      }),
      this._emailCampaignService.getBlasts(campaignId).then(res => res.data),
    ])
      .then(([deliveryReport, blastsData]) => {
        this.setState({
          isLoading: false,
          blasts: blastsData.map(b => ({
            ...b,
            ...deliveryReport[b.id],
          })),
        });
      })
      .catch(err => {
        log.error(err);
        this.props.notifyError(err);
        this.setState({ isLoading: false });
      });
  };

  handleUpdateStatus = (id: string, nextStatus: EmailBlastStatus) => {
    const {
      match: {
        params: { campaignId },
      },
    } = this.props;
    this.setState({ isLoading: true });
    this._emailCampaignService.updateBlast(campaignId, id, { status: nextStatus })
      .then(res => {
        this.props.notifySuccess({
          intlMessage: messages.blastStatusUpdateSuccessMessage,
          intlDescription: messages.blastStatusUpdateSuccessDescription,
        });
        this.refreshData();
        this.setState({ isLoading: false });
      })
      .catch(err => {
        log.error(err);
        this.props.notifyError(err, {
          intlMessxage: messages.blastStatusUpdateFailure,
        });
        this.setState({ isLoading: false });
      });
  };

  handleArchiveBlast = (blast: BlastData) => {
    // TODO
    // Modal.confirm({
    //   title: formatMessage(messages.blastArchiveTitle),
    //   content: formatMessage(messages.blastArchivetext),
    //   iconType: 'exclamation-circle',
    //   okText: formatMessage(messages.blastArchiveOk),
    //   cancelText: formatMessage(messages.blastArchiveCancel),
    //   onOk() {
    //     return this.refreshData()
    //   },
    //   onCancel() {},
  };

  render() {
    const {
      intl,
      match: {
        params: { organisationId, campaignId },
      },
    } = this.props;

    const { isLoading, blasts } = this.state;

    const newBlastButton = (
      <Link
        to={`/v2/o/${organisationId}/campaigns/email/${campaignId}/blasts/create`}
      >
        <Button type="primary">
          <FormattedMessage
            id="email.campaign.dashboard.blastCard.newEmailBlast"
            defaultMessage="New Email Blast"
          />
        </Button>
      </Link>
    );

    // todo add blast stats when api working

    return (
      <Card
        title={intl.formatMessage(messages.emailBlast)}
        buttons={newBlastButton}
      >
        <BlastTable
          isLoading={isLoading}
          data={blasts}
          isStatLoading={false}
          updateBlastStatus={this.handleUpdateStatus}
          archiveBlast={this.handleArchiveBlast}
        />
      </Card>
    );
  }
}

export default compose<Props, BlastCardProps>(
  injectIntl,
  withRouter,
  injectNotifications,
)(BlastCard);
