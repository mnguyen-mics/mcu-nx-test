import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { message } from 'antd';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { injectDrawer } from '../../../../../components/Drawer/index';
import * as FeatureSelectors from '../../../../../redux/Features/selectors';
import { AdGroupFormData, EditAdGroupRouteMatchParam, INITIAL_AD_GROUP_FORM_DATA } from './domain';
import { DisplayCampaignResource } from '../../../../../models/campaign/display/DisplayCampaignResource';
import messages from '../messages';
import AdGroupForm from './AdGroupForm';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDisplayCampaignService } from '../../../../../services/DisplayCampaignService';
import { IAdGroupFormService } from './AdGroupFormService';
import { Loading } from '@mediarithmics-private/mcs-components-library';

interface State {
  campaign?: DisplayCampaignResource;
  adGroupFormData: AdGroupFormData;
  loading: boolean;
}

type Props = WrappedComponentProps &
  InjectedDrawerProps &
  InjectedNotificationProps &
  RouteComponentProps<EditAdGroupRouteMatchParam, {}, { adGroupId?: string }>;

class EditAdGroupPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  @lazyInject(TYPES.IAdGroupFormService)
  private _adGroupFormService: IAdGroupFormService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true, // default true to avoid render x2 on mounting
      adGroupFormData: INITIAL_AD_GROUP_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { campaignId, adGroupId: adGroupIdFromURLParam },
      },
      location,
    } = this.props;

    const adGroupIdFromLocState = location.state && location.state.adGroupId;

    const adGroupId = adGroupIdFromURLParam || adGroupIdFromLocState;

    Promise.all([
      this._displayCampaignService.getCampaignDisplay(campaignId),
      adGroupId
        ? this._adGroupFormService.loadAdGroup(campaignId, adGroupId, !!adGroupIdFromLocState)
        : Promise.resolve(null),
    ])
      .then(([campaignApiRes, adGroupFormData]) => {
        this.setState(prevState => {
          const newState = {
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

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  save = (adGroupFormData: AdGroupFormData) => {
    const {
      match: {
        params: { organisationId, campaignId },
      },
      notifyError,
      history,
      intl,
    } = this.props;

    const { adGroupFormData: initialAdGroupFormData } = this.state;

    const hideSaveInProgress = message.loading(intl.formatMessage(messages.savingInProgress), 0);

    this.setState({
      loading: true,
    });

    return this._adGroupFormService
      .saveAdGroup(organisationId, campaignId, adGroupFormData, initialAdGroupFormData)
      .then(adGroupId => {
        hideSaveInProgress();
        const adGroupDashboardUrl = `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${adGroupId}`;
        history.push(adGroupDashboardUrl);
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
      match: {
        params: { adGroupId, campaignId, organisationId },
      },
    } = this.props;

    const defaultRedirectUrl = adGroupId
      ? `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${adGroupId}`
      : `/v2/o/${organisationId}/campaigns/display/${campaignId}`;

    return history.push(defaultRedirectUrl);
  };

  render() {
    const {
      match: {
        params: { organisationId, campaignId, adGroupId },
      },
      intl: { formatMessage },
    } = this.props;

    const { loading, campaign, adGroupFormData } = this.state;

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    const campaignName = campaign ? campaign.name : campaignId;
    const adGroupName = adGroupId
      ? formatMessage(messages.breadcrumbTitle3, {
          name:
            adGroupFormData.adGroup && adGroupFormData.adGroup.name
              ? adGroupFormData.adGroup.name
              : adGroupId,
        })
      : formatMessage(messages.breadcrumbTitle2);

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/campaigns/display`}>
        {formatMessage(messages.breadcrumbTitle1)}
      </Link>,
      <Link key='2' to={`/v2/o/${organisationId}/campaigns/display/${campaignId}`}>
        {campaignName}
      </Link>,
      adGroupName,
    ];

    return (
      <AdGroupForm
        initialValues={adGroupFormData}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
      />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  hasFeature: FeatureSelectors.hasFeature(state),
});

export default compose(
  withRouter,
  injectIntl,
  injectDrawer,
  injectNotifications,
  connect(mapStateToProps, undefined),
)(EditAdGroupPage);
