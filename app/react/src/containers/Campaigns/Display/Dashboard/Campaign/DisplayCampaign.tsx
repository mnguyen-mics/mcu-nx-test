// import locale from 'antd/lib/time-picker/locale/pt_PT';
import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Layout } from 'antd';
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
import { InjectDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { AdResource } from '../../../../../models/campaign/display/AdResource';
import AdCard from './AdCard';
import AdGroupCard from './AdGroupCard';
import { Labels } from '../../../../Labels/index';

const { Content } = Layout;

export interface CampaignSubProps<T> {
  isLoadingList: boolean;
  isLoadingPerf: boolean;
  items?: T[];
}

interface DashboardPerformanceSubProps {
  isLoading: boolean;
  hasFetched: boolean;
  items?: object[];
}

interface DisplayCampaignProps {
  campaign: {
    isLoadingList?: boolean;
    isLoadingPerf?: boolean;
    items: DisplayCampaignInfoResource;
  };
  ads: CampaignSubProps<AdInfoResource>;
  adGroups: CampaignSubProps<AdGroupResource>;
  updateAd: (
    adId: string,
    body: Partial<AdResource>,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
    undoBody?: Partial<AdResource>,
  ) => void;
  updateAdGroup: (
    adGroupId: string,
    body: Partial<AdGroupResource>,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
    undoBody?: Partial<AdGroupResource>,
  ) => void;
  updateCampaign: (
    campaignId: string,
    object: {
      status: string;
      type: string;
    },
  ) => void;
  dashboardPerformance: {
    media: DashboardPerformanceSubProps;
    overall: DashboardPerformanceSubProps;
    campaign: DashboardPerformanceSubProps;
  };
  goals: object[];
}

interface MapStateProps {
  notifyError: (err: any) => void;
}

type JoinedProps = DisplayCampaignProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectDrawerProps &
  MapStateProps &
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
      match: { params: { organisationId, campaignId } },
    } = this.props;

    return (
      <div className="ant-layout">
        <DisplayCampaignActionbar
          campaign={campaign}
          updateCampaign={updateCampaign}
          isFetchingStats={
            dashboardPerformance.campaign.isLoading &&
            adGroups.isLoadingPerf &&
            ads.isLoadingPerf &&
            dashboardPerformance.media.isLoading
          }
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <CampaignDashboardHeader campaign={campaign.items} />
            <Labels
              labellableId={campaignId}
              organisationId={organisationId}
              labellableType="DISPLAY_CAMPAIGN"
            />
            <DisplayCampaignDashboard
              isFetchingCampaignStat={dashboardPerformance.campaign.isLoading}
              hasFetchedCampaignStat={dashboardPerformance.campaign.hasFetched}
              campaignStat={dashboardPerformance.campaign.items}
              mediaStat={dashboardPerformance.media.items}
              isFetchingMediaStat={dashboardPerformance.media.isLoading}
              hasFetchedMediaStat={dashboardPerformance.media.hasFetched}
              isFetchingOverallStat={dashboardPerformance.overall.isLoading}
              hasFetchedOverallStat={dashboardPerformance.overall.hasFetched}
              overallStat={dashboardPerformance.overall.items}
              goals={goals}
            />

            <AdGroupCard
              title={formatMessage(messages.adGroups)}
              isFetching={adGroups.isLoadingList}
              isFetchingStat={adGroups.isLoadingPerf}
              dataSet={adGroups.items}
              updateAdGroup={updateAdGroup}
            />

            <AdCard
              title={formatMessage(messages.creatives)}
              isFetching={ads.isLoadingList}
              isFetchingStat={ads.isLoadingPerf}
              dataSet={ads.items}
              updateAd={updateAd}
            />
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<DisplayCampaignProps, JoinedProps>(
  injectIntl,
  withRouter,
  injectDrawer,
)(DisplayCampaign);
