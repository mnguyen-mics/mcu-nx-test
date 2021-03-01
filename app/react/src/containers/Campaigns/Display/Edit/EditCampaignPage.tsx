import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps, StaticContext } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import * as FeatureSelectors from '../../../../redux/Features/selectors';
import {
  DisplayCampaignFormData,
  EditDisplayCampaignRouteMatchParam,
  INITIAL_DISPLAY_CAMPAIGN_FORM_DATA,
} from './domain';
import { IDisplayCampaignFormService } from './DisplayCampaignFormService';
import messages from './messages';
import DisplayCampaignForm from './DisplayCampaignForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart';
import DisplayCampaignSelector from './DisplayCampaignSelector';
import { DisplayCampaignSubType } from '../../../../models/campaign/constants';
import DisplayAdServingCampaignForm from './DisplayAdServingCampaignForm';
import { TYPES } from '../../../../constants/types';
import { lazyInject } from '../../../../config/inversify.config';
import { MicsReduxState } from '../../../../utils/ReduxHelper';
import { Loading } from '@mediarithmics-private/mcs-components-library';

interface State {
  displayCampaignFormData: DisplayCampaignFormData;
  loading: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  InjectedDatamartProps &
  RouteComponentProps<EditDisplayCampaignRouteMatchParam, StaticContext, { from?: string, campaignId?: string }>;

class EditCampaignPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IDisplayCampaignFormService)
  private _displayCampaignFormService: IDisplayCampaignFormService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true, // default true to avoid render x2 on mounting,
      displayCampaignFormData: INITIAL_DISPLAY_CAMPAIGN_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { campaignId: campaignIdFromURLParam },
      },
      location,
    } = this.props;

    const campaignIdFromLocState = location.state && location.state.campaignId;

    const campaignId = campaignIdFromURLParam || campaignIdFromLocState;

    if (campaignId) {
      this._displayCampaignFormService
        .loadCampaign(campaignId, !!campaignIdFromLocState)
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
      match: {
        params: { organisationId },
      },
      notifyError,
      history,
      intl,
      datamart,
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

    return this._displayCampaignFormService
      .saveCampaign(
        organisationId,
        displayCampaignFormData,
        initialDisplayCampaignFormData,
        datamart && datamart.id,
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
      match: {
        params: { campaignId, organisationId },
      },
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
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const { loading, displayCampaignFormData } = this.state;

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    const campaignName =
      displayCampaignFormData.campaign && displayCampaignFormData.campaign.name
        ? formatMessage(messages.breadcrumbTitle3, {
            name: displayCampaignFormData.campaign.name,
          })
        : formatMessage(messages.createCampaingTitle);

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.breadcrumbTitle1),
        path: `/v2/o/${organisationId}/campaigns/display`,
      },
      {
        name: campaignName,
      },
    ];

    const onSelect = (e: DisplayCampaignSubType) =>
      this.setState({
        displayCampaignFormData: {
          ...displayCampaignFormData,
          campaign: {
            ...displayCampaignFormData.campaign,
            subtype: e,
          },
        },
      });

    if (!displayCampaignFormData.campaign.subtype)
      return (
        <DisplayCampaignSelector onSelect={onSelect} close={this.onClose} />
      );

    switch (displayCampaignFormData.campaign.subtype) {
      case 'PROGRAMMATIC':
        return (
          <DisplayCampaignForm
            initialValues={displayCampaignFormData}
            onSubmit={this.save}
            close={this.onClose}
            breadCrumbPaths={breadcrumbPaths}
            onSubmitFail={this.onSubmitFail}
          />
        );
      case 'AD_SERVING':
        return (
          <DisplayAdServingCampaignForm
            initialValues={displayCampaignFormData}
            onSubmit={this.save}
            close={this.onClose}
            breadCrumbPaths={breadcrumbPaths}
            onSubmitFail={this.onSubmitFail}
          />
        );
      case 'TRACKING':
        return 'This feature is not supported yet!';
    }
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectDatamart,
  connect((state: MicsReduxState) => ({
    hasFeature: FeatureSelectors.hasFeature(state),
  })),
  injectNotifications,
)(EditCampaignPage);
