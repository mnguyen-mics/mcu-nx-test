import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import * as FeatureSelectors from '../../../../state/Features/selectors';
import {
  DisplayCampaignFormData,
  EditDisplayCampaignRouteMatchParam,
  INITIAL_DISPLAY_CAMPAIGN_FORM_DATA,
} from './domain';
import DisplayCampaignFormService from './DisplayCampaignFormService';
import messages from './messages';
import DisplayCampaignForm from './DisplayCampaignForm';
import Loading from '../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

interface State {
  displayCampaignFormData: DisplayCampaignFormData;
  loading: boolean;
}

type Props = InjectedIntlProps &
InjectedNotificationProps &
  RouteComponentProps<EditDisplayCampaignRouteMatchParam>;

class EditCampaignPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true, // default true to avoid render x2 on mounting
      displayCampaignFormData: INITIAL_DISPLAY_CAMPAIGN_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: { params: { campaignId: campaignIdFromURLParam } },
      location,
    } = this.props;

    const campaignIdFromLocState = location.state && location.state.campaignId;

    const campaignId = campaignIdFromURLParam || campaignIdFromLocState;

    if (campaignId) {
      DisplayCampaignFormService.loadCampaign(
        campaignId,
        !!campaignIdFromLocState,
      )
        .then(formData => {
          this.setState({
            loading: false,
            displayCampaignFormData: formData,
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

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  save = (displayCampaignFormData: DisplayCampaignFormData) => {
    const {
      match: { params: { organisationId } },
      notifyError,
      history,
      intl,
    } = this.props;

    const {
      displayCampaignFormData: initialDisplayCampaignFormData,
    } = this.state;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      loading: true,
    });

    return DisplayCampaignFormService.saveCampaign(
      organisationId,
      displayCampaignFormData,
      initialDisplayCampaignFormData,
    )
      .then(campaignId => {
        hideSaveInProgress();
        const displayCampaignDashboardUrl = `/v2/o/${organisationId}/campaigns/display/${campaignId}`;
        history.push(displayCampaignDashboardUrl);
      })
      .catch(err => {
        hideSaveInProgress();
        notifyError(err);
        this.setState({
          loading: false,
        });
      });
  };

  onClose = () => {
    const {
      history,
      location,
      match: { params: { campaignId, organisationId } },
    } = this.props;

    const defaultRedirectUrl = campaignId
      ? `/v2/o/${organisationId}/campaigns/display/${campaignId}`
      : `/v2/o/${organisationId}/campaigns/display`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  render() {
    const {
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const { loading, displayCampaignFormData } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const campaignName =
      displayCampaignFormData.campaign && displayCampaignFormData.campaign.name
        ? formatMessage(messages.breadcrumbTitle3, {
            name: displayCampaignFormData.campaign.name,
          })
        : formatMessage(messages.createCampaingTitle);

    const breadcrumbPaths = [
      {
        name: messages.breadcrumbTitle1,
        path: `/v2/o/${organisationId}/campaigns/display`,
      },
      {
        name: campaignName,
      },
    ];

    return (
      <DisplayCampaignForm
        initialValues={displayCampaignFormData}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
      />
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  connect(state => ({ hasFeature: FeatureSelectors.hasFeature(state) })),
  injectNotifications,
)(EditCampaignPage);
