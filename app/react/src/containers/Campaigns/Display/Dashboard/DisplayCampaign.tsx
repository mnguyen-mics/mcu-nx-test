import * as React from 'react';
import { DisplayCampaignInfoResource } from '../../../../models/campaign/display';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import DisplayCampaignProgrammaticPage from './ProgrammaticCampaign/DisplayCampaignPage';
import DisplayCampaignAdServingPage from './AdServing/AdServingPage';
import { Loading } from '../../../../components';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IDisplayCampaignService } from '../../../../services/DisplayCampaignService';

type Props = RouteComponentProps<{
  organisationId: string;
  campaignId: string;
}> &
  InjectedNotificationProps;

interface State {
  campaign?: DisplayCampaignInfoResource;
  loading: boolean;
}

class DisplayCampaign extends React.Component<Props, State> {
  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { campaignId },
      },
    } = this.props;

    this.fetchAllData(campaignId);
  }

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { campaignId },
      },
    } = this.props;
    const {
      match: {
        params: { campaignId: previousCampaignId },
      },
    } = previousProps;

    if (campaignId !== previousCampaignId) {
      this.fetchAllData(campaignId);
    }
  }

  fetchAllData = (campaignId: string) => {
    return this._displayCampaignService
      .getCampaignDisplayViewDeep(campaignId, {
        view: 'deep',
      })
      .then(res => {
        this.setState({ campaign: res.data, loading: false });
      })
      .catch(err => this.props.notifyError(err));
  };

  public render() {
    if (this.state.loading || !this.state.campaign)
      return <Loading className="loading-full-screen" />;

    switch (this.state.campaign.subtype) {
      case 'PROGRAMMATIC':
      case 'TRACKING':
        return <DisplayCampaignProgrammaticPage />;
      case 'AD_SERVING':
        return <DisplayCampaignAdServingPage campaign={this.state.campaign} />;
    }
  }
}

export default compose<Props, {}>(
  withRouter,
  injectNotifications,
)(DisplayCampaign);
