import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';

import withDrawer, {
  DrawableContentProps,
} from '../../../../../components/Drawer/index';
import * as NotificationActions from '../../../../../state/Notifications/actions';
import * as FeatureSelectors from '../../../../../state/Features/selectors';
import {
  AdGroupFormData,
  EditAdGroupRouteMatchParam,
  INITIAL_AD_GROUP_FORM_DATA,
} from './domain';
import { DisplayCampaignResource } from '../../../../../models/campaign/display/DisplayCampaignResource';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import AdGroupFormService from './AdGroupFormService';
import messages from '../messages';
import AdGroupForm from './AdGroupForm';
import Loading from '../../../../../components/Loading';

interface State {
  campaign?: DisplayCampaignResource;
  adGroupFormData: AdGroupFormData;
  loading: boolean;
}

interface MapStateProps {
  notifyError: (err: any) => void;
}

type Props = InjectedIntlProps &
  MapStateProps &
  DrawableContentProps &
  RouteComponentProps<EditAdGroupRouteMatchParam>;

class EditAdGroupPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true, // default true to avoid render x2 on mounting
      adGroupFormData: INITIAL_AD_GROUP_FORM_DATA,
    };
  }

  componentDidMount() {
    const { match: { params: { campaignId, adGroupId } } } = this.props;

    Promise.all([
      DisplayCampaignService.getCampaignDisplay(campaignId),
      adGroupId
        ? AdGroupFormService.loadAdGroup(campaignId, adGroupId)
        : Promise.resolve(null),
    ])
      .then(([campaignApiRes, adGroupFormData]) => {
        this.setState(prevState => {
          const newState: Partial<State> = {
            ...prevState,
            campaign: campaignApiRes.data,
            loading: false,
          };
          if (adGroupFormData) newState.adGroupFormData = adGroupFormData;
          return newState;
        });
      })
      .catch(err => {
        this.setState({ loading: false });
        this.props.notifyError(err);
      });
  }

  redirect = () => {
    const {
      match: { params: { organisationId, campaignId } },
      history,
    } = this.props;

    const displayCampaignDashboardUrl = `/v2/o/${organisationId}/campaigns/display/${campaignId}`;

    history.push(displayCampaignDashboardUrl);
  };

  save = (adGroupFormData: AdGroupFormData) => {
    const { match: { params: { campaignId } }, notifyError } = this.props;

    const { adGroupFormData: initialAdGroupFormData } = this.state;

    const hideSaveInProgress = message.loading(
      <FormattedMessage
        id="ad-group-editing-save-in-progress"
        defaultMessage="Saving in progress"
      />,
      0,
    );

    return AdGroupFormService.saveAdGroup(
      campaignId,
      adGroupFormData,
      initialAdGroupFormData,
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

  onClose = () => {
    const {
      history,
      location,
      match: { params: { adGroupId, campaignId, organisationId } },
    } = this.props;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(
          `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${adGroupId}`,
        );
  };

  render() {
    const {
      match: { params: { organisationId, campaignId, adGroupId } },
      intl: { formatMessage },
      openNextDrawer,
      closeNextDrawer,
    } = this.props;

    const { loading, campaign, adGroupFormData } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const campaignName = campaign ? campaign.name : campaignId;
    const adGroupName = adGroupId
      ? formatMessage(messages.breadcrumbTitle3, {
          blastName:
            adGroupFormData.adGroup && adGroupFormData.adGroup.name
              ? adGroupFormData.adGroup.name
              : adGroupId,
        })
      : formatMessage(messages.breadcrumbTitle2);

    const breadcrumbPaths = [
      {
        name: messages.breadcrumbTitle1,
        path: `/v2/o/${organisationId}/campaigns/email/${campaignId}`,
      },
      {
        name: campaignName,
        path: `/v2/o/${organisationId}/campaigns/email/${campaignId}`,
      },
      {
        name: adGroupName,
      },
    ];

    return (
      <AdGroupForm
        initialValues={adGroupFormData}
        onSubmit={this.save}
        close={this.redirect}
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
)(EditAdGroupPage);
