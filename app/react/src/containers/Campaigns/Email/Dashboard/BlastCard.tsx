import * as React from 'react';
import { Button } from 'antd';
import { compose } from 'recompose';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Card } from '../../../../components/Card';
import messages from './messages';
import { EmailCampaignDashboardRouteMatchParam } from './constants';
import BlastTable, { BlastData } from './BlastTable';
import { ReportViewResource } from '../../../../models/ReportView';
import {
  EmailBlastResource,
  EmailBlastStatus,
} from '../../../../models/campaign/email';
import EmailCampaignService from '../../../../services/EmailCampaignService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import log from '../../../../utils/Logger';

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
    const { match: { params: { campaignId } } } = this.props;
    this.setState({ isLoading: true });
    EmailCampaignService.getBlasts(campaignId)
      .then(res => {
        this.setState({
          isLoading: false,
          blasts: res.data,
        });
      })
      .catch(err => {
        log.error(err);
        this.props.notifyError(err);
        this.setState({ isLoading: false });
      });
  };

  handleUpdateStatus = (id: string, nextStatus: EmailBlastStatus) => {
    const { match: { params: { campaignId } } } = this.props;
    this.setState({ isLoading: true });
    EmailCampaignService.updateBlast(campaignId, id, { status: nextStatus })
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
      match: { params: { organisationId, campaignId } },
    } = this.props;

    const { isLoading, blasts } = this.state;

    const newBlastButton = (
      <Link
        to={`/v2/o/${organisationId}/campaigns/email/${campaignId}/blasts/create`}
      >
        <Button type="primary">
          <FormattedMessage id="NEW_EMAIL_BLAST" />
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
