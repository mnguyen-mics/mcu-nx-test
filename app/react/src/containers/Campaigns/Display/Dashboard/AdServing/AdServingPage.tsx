import * as React from 'react';
import { Layout, Row, Col } from 'antd';
import { Labels } from '../../../../Labels';
import { DisplayCampaignInfoResource } from '../../../../../models/campaign/display';
import CampaignDashboardHeader from '../../../Common/CampaignDashboardHeader';
import AdServingActionBar from './AdServingActionBar';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import AdCard from './AdCard';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import {
  isSearchValid,
  buildDefaultSearch,
  compareSearches,
} from '../../../../../utils/LocationSearchHelper';
import messages from '../messages';
import { FormattedMessage } from 'react-intl';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { flatten } from 'plottable/build/src/utils/arrayUtils';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDisplayCampaignService } from '../../../../../services/DisplayCampaignService';

const { Content } = Layout;

export interface DisplayCampaignProps {
  campaign: DisplayCampaignInfoResource;
}

type Props = DisplayCampaignProps &
  RouteComponentProps<{ organisationId: string; campaignId: string }> &
  InjectedNotificationProps;

class AdServing extends React.Component<Props> {
  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  componentDidMount() {
    const {
      history,
      location: { search, pathname },
    } = this.props;

    if (!isSearchValid(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
      });
    }
  }

  componentDidUpdate(previousProps: Props) {
    const {
      location: { pathname, search },
      history,
    } = this.props;

    const {
      location: { search: previousSearch },
    } = previousProps;

    if (!compareSearches(search, previousSearch)) {
      if (!isSearchValid(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(
            search,
            DISPLAY_DASHBOARD_SEARCH_SETTINGS,
          ),
        });
      }
    }
  }

  archiveCampaign = (campaignId: string) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    return this._displayCampaignService
      .updateCampaign(campaignId, { archived: true })
      .then(() => {
        history.push({
          pathname: `/v2/o/${organisationId}/campaigns/display`,
        });
      })
      .catch(err => {
        this.props.notifyError(err);
      });
  };

  public render() {
    const {
      campaign,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const adCards = flatten(
      campaign.ad_groups.map(adgroup => {
        return adgroup.ads.map(ad => (
          <AdCard key={ad.id} ad={ad} adGroupId={adgroup.id} />
        ));
      }),
    );

    return (
      <div className="ant-layout">
        <AdServingActionBar
          campaign={campaign}
          archiveCampaign={this.archiveCampaign}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <CampaignDashboardHeader campaign={campaign} showStatus={false} />
            <Labels
              labellableId={campaign.id}
              organisationId={organisationId}
              labellableType="DISPLAY_CAMPAIGN"
            />
            {adCards}
            {adCards.length === 0 && (
              <Row>
                <Col
                  span={24}
                  className="mcs-table-view-empty"
                  style={{ marginTop: 200 }}
                >
                  <FormattedMessage {...messages.emptyAds} />
                </Col>
              </Row>
            )}
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<Props, DisplayCampaignProps>(
  withRouter,
  injectNotifications,
)(AdServing);
