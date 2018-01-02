import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
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
import EmailCampaignFormService from '../EmailCampaignFormService';
import * as NotificationActions from '../../../../../state/Notifications/actions';
import { Loading } from '../../../../../components';
import withDrawer, {
  DrawableContentProps,
} from '../../../../../components/Drawer';

interface State {
  campaignFormData: EmailCampaignFormData;
  loading: boolean;
}

interface MapStateProps {
  notifyError: (err: any) => void;
}

type Props = InjectedIntlProps &
  MapStateProps &
  DrawableContentProps &
  RouteComponentProps<EditEmailCampaignRouteMatchParam>;

class EditCampaignPage extends React.Component<Props, State> {
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
      EmailCampaignFormService.loadCampaign(campaignId)
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

  redirect = () => {
    const {
      match: { params: { organisationId, campaignId } },
      history,
    } = this.props;

    if (campaignId) {
      history.push(`/v2/o/${organisationId}/campaigns/email/${campaignId}`);
    } else {
      history.push(`/v2/o/${organisationId}/campaigns/email`);
    }
  };

  save = (campaignFormData: EmailCampaignFormData) => {
    const {
      match: { params: { organisationId } },
      intl: { formatMessage },
      notifyError,
    } = this.props;

    const { campaignFormData: initialCampaignFormData } = this.state;

    const hideSaveInProgress = message.loading(
      formatMessage(messages.savingInProgress),
      0,
    );

    return EmailCampaignFormService.saveCampaign(
      organisationId,
      campaignFormData,
      initialCampaignFormData,
    )
      .then(() => {
        hideSaveInProgress();
        this.redirect();
      })
      .catch(err => {
        hideSaveInProgress();
        notifyError(err);
      });
  };

  render() {
    const {
      match: { params: { organisationId } },
      intl: { formatMessage },
      openNextDrawer,
      closeNextDrawer,
    } = this.props;

    const { campaignFormData, loading } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
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
        close={this.redirect}
        breadCrumbPaths={breadcrumbPaths}
        openNextDrawer={openNextDrawer}
        closeNextDrawer={closeNextDrawer}
      />
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  connect(undefined, { notifyError: NotificationActions.notifyError }),
  withDrawer,
)(EditCampaignPage);
