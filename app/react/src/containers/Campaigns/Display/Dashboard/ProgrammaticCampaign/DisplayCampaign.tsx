// import locale from 'antd/lib/time-picker/locale/pt_PT';
import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Layout, Alert } from 'antd';
import { compose } from 'recompose';
import { CampaignRouteParams } from '../../../../../models/campaign/CampaignResource';
import {
  AdInfoResource,
  DisplayCampaignInfoResource,
} from '../../../../../models/campaign/display/DisplayCampaignInfoResource';
import { AdGroupResource } from '../../../../../models/campaign/display/AdGroupResource';
import CampaignDashboardHeader from '../../../Common/CampaignDashboardHeader';
import DisplayCampaignDashboard from './DisplayCampaignDashboard';
import { UpdateMessage } from './DisplayCampaignAdGroupTable';
import DisplayCampaignActionbar from './DisplayCampaignActionbar';
import messages from '../messages';
import { injectDrawer } from '../../../../../components/Drawer/index';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { AdResource } from '../../../../../models/campaign/display/AdResource';
import AdCard from './AdCard';
import AdGroupCard from './AdGroupCard';
import { Labels } from '../../../../Labels/index';
import { GoalsCampaignRessource, Items, ItemsById } from './domain';
import { OverallStat } from '../Charts/DisplayStackedAreaChart';
import { MediaPerformance } from '../Charts/MediaPerformanceTable';
import { formatListView } from '../../../../../utils/Normalizer';

const { Content } = Layout;

interface DisplayCampaignProps {
  campaign: Omit<DisplayCampaignInfoResource, 'ad_groups'>;
  ads: {
    data: ItemsById<AdInfoResource>;
    performance: ItemsById<OverallStat>;
  };
  adGroups: {
    data: ItemsById<AdGroupResource>;
    performance: ItemsById<OverallStat>;
  };
  updateAd: (
    adId: string,
    body: Partial<AdResource>,
    undoBody?: Partial<AdResource>,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
  ) => Promise<any>;
  updateAdGroup: (
    adGroupId: string,
    body: Partial<AdGroupResource>,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
    undoBody?: Partial<AdGroupResource>,
  ) => Promise<any>;
  updateCampaign: (
    campaignId: string,
    object: {
      status: string;
      type: string;
    },
  ) => void;
  dashboardPerformance: {
    media: Items<MediaPerformance>;
    overall: Items<OverallStat>;
    campaign: Items<OverallStat>;
  };
  goals: GoalsCampaignRessource[];
}

type JoinedProps = DisplayCampaignProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedDrawerProps &
  InjectedIntlProps;

class DisplayCampaign extends React.Component<JoinedProps> {
  render() {
    const {
      campaign,
      ads,
      adGroups,
      updateAd,
      updateAdGroup,
      updateCampaign,
      dashboardPerformance,
      goals,
      intl: { formatMessage },
      match: {
        params: { organisationId, campaignId },
      },
    } = this.props;

    return (
      <div className="ant-layout">
        <DisplayCampaignActionbar
          campaign={campaign}
          updateCampaign={updateCampaign}
          isFetchingStats={
            dashboardPerformance.campaign.isLoading &&
            adGroups.performance.isLoading &&
            ads.performance.isLoading &&
            dashboardPerformance.media.isLoading
          }
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <CampaignDashboardHeader campaign={campaign} />
            {campaign && campaign.model_version === 'V2014_06' ? (
              <Alert
                className="m-b-20"
                message={formatMessage(messages.editionNotAllowed)}
                type="warning"
              />
            ) : null}
            <Labels
              labellableId={campaignId}
              organisationId={organisationId}
              labellableType="DISPLAY_CAMPAIGN"
            />
            <DisplayCampaignDashboard
              isFetchingCampaignStat={dashboardPerformance.campaign.isLoading}
              campaignStat={dashboardPerformance.campaign.items}
              mediaStat={dashboardPerformance.media.items}
              isFetchingMediaStat={dashboardPerformance.media.isLoading}
              isFetchingOverallStat={dashboardPerformance.overall.isLoading}
              overallStat={dashboardPerformance.overall.items}
              goals={goals}
            />

            <AdGroupCard
              title={formatMessage(messages.adGroups)}
              isFetching={adGroups.data.isLoading}
              isFetchingStat={adGroups.performance.isLoading}
              dataSet={formatListView(adGroups.data, adGroups.performance)}
              updateAdGroup={updateAdGroup}
              campaign={campaign}
            />

            <AdCard
              title={formatMessage(messages.creatives)}
              isFetching={ads.data.isLoading}
              isFetchingStat={ads.performance.isLoading}
              dataSet={formatListView(ads.data, ads.performance)}
              updateAd={updateAd}
            />
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<JoinedProps, DisplayCampaignProps>(
  injectIntl,
  withRouter,
  injectDrawer,
)(DisplayCampaign);
