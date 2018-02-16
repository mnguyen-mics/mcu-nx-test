import * as React from 'react';
import { compose } from 'recompose';
import { message } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import EmailBlastForm from './EmailBlastForm';
import {
  EditEmailBlastRouteMatchParam,
  EmailBlastFormData,
  INITIAL_EMAIL_BLAST_FORM_DATA,
} from '../domain';
import messages from '../messages';
import EmailCampaignFormService from '../EmailCampaignFormService';
import { EmailCampaignResource } from '../../../../../models/campaign/email';
import EmailCampaignService from '../../../../../services/EmailCampaignService';
import { Loading } from '../../../../../components';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';

interface State {
  campaign?: EmailCampaignResource;
  blastFormData: EmailBlastFormData;
  loading: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditEmailBlastRouteMatchParam>;

class EditBlastPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true, // default true to avoid render x2 on mounting
      blastFormData: INITIAL_EMAIL_BLAST_FORM_DATA,
    };
  }

  componentDidMount() {
    const { match: { params: { campaignId, blastId } } } = this.props;

    Promise.all([
      EmailCampaignService.getEmailCampaign(campaignId),
      blastId
        ? EmailCampaignFormService.loadBlast(campaignId, blastId)
        : Promise.resolve(INITIAL_EMAIL_BLAST_FORM_DATA),
    ])
      .then(([campaignApiRes, blastFormData]) => {
        this.setState(prevState => {
          const newState = {
            ...prevState,
            campaign: campaignApiRes.data,
            loading: false,
          };
          if (blastFormData) newState.blastFormData = blastFormData;
          return newState;
        });
      })
      .catch(err => {
        this.setState({ loading: false });
        this.props.notifyError(err);
      });
  }

  // TODO create a generic component ErrorBoundary
  // componentDidCatch(error: Error | null, info: object) {
  //   this.props.notifyError(error);
  // }

  redirect = () => {
    const {
      match: { params: { organisationId, campaignId } },
      history,
    } = this.props;

    const emailCampaignListUrl = `/v2/o/${organisationId}/campaigns/email/${campaignId}`;

    history.push(emailCampaignListUrl);
  };

  save = (blastFormData: EmailBlastFormData) => {
    const {
      match: { params: { campaignId } },
      intl: { formatMessage },
      notifyError,
    } = this.props;

    const { blastFormData: initialBlastFormData } = this.state;

    const hideSaveInProgress = message.loading(
      formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      loading: true,
    });

    return EmailCampaignFormService.saveBlast(
      campaignId,
      blastFormData,
      initialBlastFormData,
    )
      .then(() => {
        hideSaveInProgress();
        this.redirect();
      })
      .catch(err => {
        hideSaveInProgress();
        notifyError(err);
        this.setState({
          loading: false,
        });
      });
  };

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  render() {
    const {
      match: { params: { organisationId, campaignId, blastId } },
      intl: { formatMessage },
    } = this.props;

    const { loading, campaign, blastFormData } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const campaignName = campaign ? campaign.name : campaignId;
    const blastName = blastId
      ? formatMessage(messages.emailBlastEditorBreadcrumbTitleEditBlast, {
          blastName:
            blastFormData.blast && blastFormData.blast.blast_name
              ? blastFormData.blast.blast_name
              : blastId,
        })
      : formatMessage(messages.emailBlastEditorBreadcrumbTitleNewBlast);

    const breadcrumbPaths = [
      {
        name: campaignName,
        path: `/v2/o/${organisationId}/campaigns/email/${campaignId}`,
      },
      {
        name: blastName,
      },
    ];

    return (
      <EmailBlastForm
        initialValues={blastFormData}
        save={this.save}
        close={this.redirect}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
      />
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  injectNotifications,
)(EditBlastPage);
