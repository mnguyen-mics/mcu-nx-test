import * as React from 'react';
import { compose } from 'recompose';
import { message } from 'antd';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import EmailBlastForm from './EmailBlastForm';
import {
  EditEmailBlastRouteMatchParam,
  EmailBlastFormData,
  INITIAL_EMAIL_BLAST_FORM_DATA,
} from '../domain';
import messages from '../messages';
import { EmailCampaignResource } from '../../../../../models/campaign/email';
import { Loading } from '../../../../../components';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { TYPES } from '../../../../../constants/types';
import { IEmailCampaignService } from '../../../../../services/EmailCampaignService';
import { lazyInject } from '../../../../../config/inversify.config';
import { IEmailCampaignFormService } from '../EmailCampaignFormService';

interface State {
  campaign?: EmailCampaignResource;
  blastFormData: EmailBlastFormData;
  loading: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditEmailBlastRouteMatchParam>;

class EditBlastPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IEmailCampaignService)
  private _emailCampaignService: IEmailCampaignService;

  @lazyInject(TYPES.IEmailCampaignFormService)
  private _emailCampaignFormService: IEmailCampaignFormService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true, // default true to avoid render x2 on mounting
      blastFormData: INITIAL_EMAIL_BLAST_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { campaignId, blastId },
      },
    } = this.props;

    Promise.all([
      this._emailCampaignService.getEmailCampaign(campaignId),
      blastId
        ? this._emailCampaignFormService.loadBlast(campaignId, blastId)
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
      match: {
        params: { organisationId, campaignId },
      },
      history,
    } = this.props;

    const emailCampaignListUrl = `/v2/o/${organisationId}/campaigns/email/${campaignId}`;

    history.push(emailCampaignListUrl);
  };

  save = (blastFormData: EmailBlastFormData) => {
    const {
      match: {
        params: { campaignId },
      },
      intl: { formatMessage },
      notifyError,
    } = this.props;

    const { blastFormData: initialBlastFormData } = this.state;

    const hideSaveInProgress = message.loading(formatMessage(messages.savingInProgress), 0);

    this.setState({
      loading: true,
    });

    return this._emailCampaignFormService
      .saveBlast(campaignId, blastFormData, initialBlastFormData)
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
      match: {
        params: { organisationId, campaignId, blastId },
      },
      intl: { formatMessage },
    } = this.props;

    const { loading, campaign, blastFormData } = this.state;

    if (loading) {
      return <Loading isFullScreen={true} />;
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
      <Link key='1' to={`/v2/o/${organisationId}/campaigns/email/${campaignId}`}>
        {campaignName}
      </Link>,
      blastName,
    ];

    return (
      <EmailBlastForm
        initialValues={blastFormData}
        onSubmit={this.save}
        close={this.redirect}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
      />
    );
  }
}

export default compose(injectIntl, withRouter, injectNotifications)(EditBlastPage);
