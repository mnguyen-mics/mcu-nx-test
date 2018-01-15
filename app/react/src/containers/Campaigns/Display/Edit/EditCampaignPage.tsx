import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import withDrawer, {
  DrawableContentProps,
} from '../../../../components/Drawer/index';
import * as NotificationActions from '../../../../state/Notifications/actions';
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

interface State {
  displayCampaignFormData: DisplayCampaignFormData;
  loading: boolean;
}

interface MapStateProps {
  notifyError: (err: any) => void;
}

type Props = InjectedIntlProps &
  MapStateProps &
  DrawableContentProps &
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
    const { match: { params: { campaignId: campaignIdFromURLParam } }, location } = this.props;

    const campaignIdFromLocState = location.state && location.state.campaignId

    const campaignId = campaignIdFromURLParam || campaignIdFromLocState;
    
    if (campaignId) {
      DisplayCampaignFormService.loadCampaign(campaignId, !!campaignIdFromLocState)
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

  save = (displayCampaignFormData: DisplayCampaignFormData) => {
    const {
      match: { params: { organisationId } },
      notifyError,
      history,
    } = this.props;

    const {
      displayCampaignFormData: initialDisplayCampaignFormData,
    } = this.state;

    const hideSaveInProgress = message.loading('Saving in progress', 0);

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
      openNextDrawer,
      closeNextDrawer,
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
        openNextDrawer={openNextDrawer}
        closeNextDrawer={closeNextDrawer}
      />
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  withDrawer,
  connect(state => ({ hasFeature: FeatureSelectors.hasFeature(state) }), {
    notifyError: NotificationActions.notifyError,
  }),
)(EditCampaignPage);
