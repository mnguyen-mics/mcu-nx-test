import * as React from 'react';
import { compose } from 'recompose';
import { message } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import EmailCampaignForm from './EmailCampaignForm';
import {
  EditEmailCampaignRouteMatchParam,
  EmailCampaignFormData,
  INITIAL_EMAIL_CAMPAIGN_FORM_DATA,
} from '../domain';
import messages from '../messages';
import { Loading } from '../../../../../components';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IEmailCampaignFormService } from '../EmailCampaignFormService';

interface State {
  campaignFormData: EmailCampaignFormData;
  loading: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditEmailCampaignRouteMatchParam>;

class EditCampaignPage extends React.Component<Props, State> {

  @lazyInject(TYPES.IEmailCampaignFormService)
  private _emailCampaignFormService: IEmailCampaignFormService;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      campaignFormData: INITIAL_EMAIL_CAMPAIGN_FORM_DATA,
    };
  }

  componentDidMount() {
    const { match: { params: { campaignId } } } = this.props;

    if (campaignId) {
      this._emailCampaignFormService.loadCampaign(campaignId)
        .then(formData => {
          this.setState({
            loading: false,
            campaignFormData: formData,
          });
        })
        .catch(err => {
          this.setState({ loading: false });
          this.props.notifyError(err);
        });
    } else {
      this.setState({ loading: false });
    }
  }

  // TODO create a generic component ErrorBoundary
  // componentDidCatch(error: Error | null, info: object) {
  //   this.props.notifyError(error);
  // }

  onClose = () => {
    const {
      history,
      location,
      match: { params: { campaignId, organisationId } },
    } = this.props;

    const defaultRedirectUrl = campaignId
      ? `/v2/o/${organisationId}/campaigns/email/${campaignId}`
      : `/v2/o/${organisationId}/campaigns/email`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  save = (campaignFormData: EmailCampaignFormData) => {
    const {
      match: { params: { organisationId } },
      intl: { formatMessage },
      notifyError,
      history,
    } = this.props;

    const { campaignFormData: initialCampaignFormData } = this.state;

    const hideSaveInProgress = message.loading(
      formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      loading: true,
    });

    return this._emailCampaignFormService.saveCampaign(
      organisationId,
      campaignFormData,
      initialCampaignFormData,
    )
      .then(campaignId => {
        hideSaveInProgress();
        const emailCampaignDashboardUrl = `/v2/o/${organisationId}/campaigns/email/${campaignId}`;
        history.push(emailCampaignDashboardUrl);
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
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const { campaignFormData, loading } = this.state;

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    const campaignName =
      campaignFormData.campaign && campaignFormData.campaign.name
        ? formatMessage(messages.emailEditorBreadcrumbEditCampaignTitle, {
            campaignName: campaignFormData.campaign.name,
          })
        : formatMessage(messages.emailEditorBreadcrumbNewCampaignTitle);

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.emailEditorBreadcrumbTitle1),
        path: `/v2/o/${organisationId}/campaigns/email`,
      },
      {
        name: campaignName,
      },
    ];

    return (
      <EmailCampaignForm
        initialValues={campaignFormData}
        save={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
      />
    );
  }
}

export default compose(injectIntl, withRouter, injectNotifications)(
  EditCampaignPage,
);
