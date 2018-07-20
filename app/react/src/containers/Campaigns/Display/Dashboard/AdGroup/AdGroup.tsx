import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { withRouter, Link } from 'react-router-dom';
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
import { RouteComponentProps } from 'react-router';
import { CampaignRouteParams } from '../../../../../models/campaign/CampaignResource';

const { Content } = Layout;

export interface AdGroupSubProps<T> {
  isLoadingList: boolean;
  isLoadingPerf: boolean;
  items: T[];
}

interface AdGroupActionBarSubProps<T> {
  isLoadingList: boolean;
  isLoadingPerf: boolean;
  items?: T;
}

export interface DashboardPerformanceSubProps {
  isLoading: boolean;
  hasFetched: boolean;
  items?: object[];
}

interface AdGroupProps {
  ads: AdGroupSubProps<AdInfoResource>;
  adGroups: AdGroupActionBarSubProps<AdGroupResource>;
  campaign: AdGroupActionBarSubProps<DisplayCampaignInfoResource>;
  dashboardPerformance: {
    media: DashboardPerformanceSubProps;
    adGroups: DashboardPerformanceSubProps;
    overallPerformance: DashboardPerformanceSubProps;
  };
  updateAdGroup: (
    adGroupId: string,
    body: Partial<AdGroupResource>,
  ) => Promise<any>;
  updateAd: (
    adId: string,
    body: Partial<AdResource>,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
    undoBody?: Partial<AdResource>,
  ) => Promise<any>;
}

type JoinedProps = AdGroupProps &
  InjectedIntlProps &
  RouteComponentProps<CampaignRouteParams>;

class AdGroup extends React.Component<JoinedProps> {
  archiveAdGroup = () => {
    //
  };

  render() {
    const {
      match: { params: { organisationId } },
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
          <Button className="m-r-10" type="primary">
            <FormattedMessage {...messages.newCreatives} />
          </Button>
        </Link>
      </span>
    );

    return (
      <div className="ant-layout">
        <AdGroupActionbar
          adGroup={adGroups.items}
          displayCampaign={campaign.items}
          updateAdGroup={updateAdGroup}
          archiveAdGroup={this.archiveAdGroup}
        />
        <Content className="mcs-content-container">
          <CampaignDashboardHeader campaign={adGroups.items} />
          {campaign.items && campaign.items.model_version === 'V2014_06' ? < Alert className="m-b-20" message={intl.formatMessage(messages.editionNotAllowed)} type="warning" /> : null}
          <AdGroupsDashboard
            isFetchingMediaStat={dashboardPerformance.media.isLoading}
            mediaStat={dashboardPerformance.media.items}
            hasFetchedMediaStat={dashboardPerformance.media.hasFetched}
            adGroupStat={dashboardPerformance.adGroups.items}
            isFetchingAdGroupStat={dashboardPerformance.adGroups.isLoading}
            hasFetchedAdGroupStat={dashboardPerformance.adGroups.hasFetched}
            isFetchingOverallStat={
              dashboardPerformance.overallPerformance.isLoading
            }
            hasFetchedOverallStat={
              dashboardPerformance.overallPerformance.hasFetched
            }
            overallStat={dashboardPerformance.overallPerformance.items}
          />
          <AdCard
            title={intl.formatMessage(messages.creatives)}
            dataSet={ads.items}
            isFetching={ads.isLoadingList}
            isFetchingStat={ads.isLoadingPerf}
            updateAd={updateAd}
            additionalButtons={adButtons}
          />
        </Content>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  translations: state.translations,
});

export default compose<JoinedProps, AdGroupProps>(
  withRouter,
  injectIntl,
  connect(mapStateToProps, undefined),
)(AdGroup);
