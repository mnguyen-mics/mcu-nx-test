import * as React from 'react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { withRouter, Link, RouteComponentProps } from 'react-router-dom';
import { Button, Layout, Alert } from 'antd';
import { compose } from 'recompose';
import CampaignDashboardHeader from '../../../Common/CampaignDashboardHeader';
import AdCard from '../ProgrammaticCampaign/AdCard';
import AdGroupsDashboard from './AdGroupsDashboard';
import AdGroupActionbar from './AdGroupActionbar';
import messages from '../messages';
import {
  AdInfoResource,
  DisplayCampaignInfoResource,
  AdResource,
} from '../../../../../models/campaign/display/index';
import { AdGroupResource } from '../../../../../models/campaign/display/AdGroupResource';
import { UpdateMessage } from '../ProgrammaticCampaign/DisplayCampaignAdGroupTable';
import { CampaignRouteParams } from '../../../../../models/campaign/CampaignResource';
import { Items, ItemsById } from '../ProgrammaticCampaign/domain';
import { OverallStat } from '../Charts/DisplayStackedAreaChart';
import { MediaPerformance } from '../Charts/MediaPerformanceTable';
import { formatListView } from '../../../../../utils/Normalizer';

const { Content } = Layout;

interface AdGroupProps {
  ads: {
    data: ItemsById<AdInfoResource>;
    performance: ItemsById<OverallStat>;
  };
  adGroups: {
    data: Items<AdGroupResource>;
    overallPerformance: Items<OverallStat>;
    performance: Items<OverallStat>;
    mediaPerformance: Items<MediaPerformance>;
  };
  campaign: {
    data: Items<Omit<DisplayCampaignInfoResource, 'ad_groups'>>;
  };
  dashboardPerformance: {
    media: Items<MediaPerformance>;
    adGroups: Items<OverallStat>;
    overallPerformance: Items<OverallStat>;
  };
  updateAdGroup: (adGroupId: string, body: Partial<AdGroupResource>) => Promise<any>;
  updateAd: (
    adId: string,
    body: Partial<AdResource>,
    undoBody?: Partial<AdResource>,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
  ) => Promise<any>;
}

type JoinedProps = AdGroupProps & InjectedIntlProps & RouteComponentProps<CampaignRouteParams>;

class AdGroup extends React.Component<JoinedProps> {
  archiveAdGroup = () => {
    //
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      adGroups,
      ads,
      campaign,
      updateAdGroup,
      dashboardPerformance,
      updateAd,
      intl,
    } = this.props;

    const adButtons = (
      <span>
        <Link to={`/v2/o/${organisationId}/creatives/display/create`}>
          <Button className='m-r-10' type='primary'>
            <FormattedMessage {...messages.newCreatives} />
          </Button>
        </Link>
      </span>
    );

    return (
      <div className='ant-layout'>
        <AdGroupActionbar
          adGroup={adGroups.data.items[0]}
          displayCampaign={campaign.data.items[0]}
          updateAdGroup={updateAdGroup}
          archiveAdGroup={this.archiveAdGroup}
        />
        <Content className='mcs-content-container'>
          <CampaignDashboardHeader
            campaign={
              adGroups.data.items && adGroups.data.items[0] ? adGroups.data.items[0] : undefined
            }
          />
          {campaign.data.items &&
          campaign.data.items[0] &&
          campaign.data.items[0].model_version === 'V2014_06' ? (
            <Alert
              className='m-b-20'
              message={intl.formatMessage(messages.editionNotAllowed)}
              type='warning'
            />
          ) : null}
          <AdGroupsDashboard
            isFetchingMediaStat={dashboardPerformance.media.isLoading}
            mediaStat={dashboardPerformance.media.items}
            adGroupStat={dashboardPerformance.adGroups.items}
            isFetchingAdGroupStat={dashboardPerformance.adGroups.isLoading}
            isFetchingOverallStat={dashboardPerformance.overallPerformance.isLoading}
            overallStat={dashboardPerformance.overallPerformance.items}
          />
          <AdCard
            title={intl.formatMessage(messages.creatives)}
            dataSet={formatListView(ads.data, ads.performance)}
            isFetching={ads.data.isLoading}
            isFetchingStat={ads.performance.isLoading}
            updateAd={updateAd}
            additionalButtons={adButtons}
          />
        </Content>
      </div>
    );
  }
}

export default compose<JoinedProps, AdGroupProps>(withRouter, injectIntl)(AdGroup);
