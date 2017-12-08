// import locale from 'antd/lib/time-picker/locale/pt_PT';
import * as React from 'react';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Layout, Button } from 'antd';
import { compose } from 'recompose';
import { CampaignRouteParams } from '../../../../../models/campaign/CampaignResource';
import { AdInfoResource, DisplayCampaignInfoResource } from '../../../../../models/campaign/display/DisplayCampaignInfoResource';
import { AdGroupResource } from '../../../../../models/campaign/display/AdGroupResource';
import DisplayCampaignHeader from '../Common/DisplayCampaignHeader';
import DisplayCampaignDashboard from './DisplayCampaignDashboard';
import DisplayCampaignAdGroupTable from './DisplayCampaignAdGroupTable';
import DisplayCampaignAdTable from '../Common/DisplayCampaignAdTable';
import Card from '../../../../../components/Card/Card';
import McsDateRangePicker, { McsDateRangeValue } from '../../../../../components/McsDateRangePicker';
import DisplayCampaignActionbar from './DisplayCampaignActionbar';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';
import {
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';

const { Content } = Layout;

const DisplayCampaignAdGroupTableJS = DisplayCampaignAdGroupTable as any;
const DisplayCampaignAdTableJS = DisplayCampaignAdTable as any;

export interface CampaignSubProps<T> {
  isLoadingList?: boolean;
  isLoadingPerf?: boolean;
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
  updateAd: (arg: any) => void;
  updateAdGroup: (arg: any) => void;
  updateCampaign: (campaignId: string, object: {
    status: string,
    type: string,
  }) => void;
  dashboardPerformance: {
    media: DashboardPerformanceSubProps;
    overall: DashboardPerformanceSubProps;
    campaign: DashboardPerformanceSubProps;
  };
  goals: object[];
}

type JoinedProps =
  DisplayCampaignProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedIntlProps;

class DisplayCampaign extends React.Component<JoinedProps> {

  updateLocationSearch(params: McsDateRangeValue) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
        location: {
          search,
        },
    } = this.props;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue): void => this.updateLocationSearch({
      rangeType: newValues.rangeType,
      lookbackWindow: newValues.lookbackWindow,
      from: newValues.from,
      to: newValues.to,
    });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  render() {

    const {
      match: {
        params: {
          campaignId,
          organisationId,
        },
      },
      campaign,
      ads,
      adGroups,
      location,
      updateAd,
      updateAdGroup,
      updateCampaign,
      dashboardPerformance,
      goals,
      intl: {
        formatMessage,
      },
    } = this.props;

    const adGroupButtons: JSX.Element = (
      <span>
        <Link
          to={{
            pathname: `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/create`,
            state: { from: `${location.pathname}${location.search}` },
          }}
        >
          <Button className="m-r-10" type="primary">
            <FormattedMessage {...messages.newAdGroups} />
          </Button>
        </Link>
        {this.renderDatePicker()}
      </span>
    );

    const adButtons: JSX.Element = (
      <span>
        {this.renderDatePicker()}
      </span>
    );

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
            <DisplayCampaignHeader
              object={campaign.items}
              translationKey="CAMPAIGN"
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
            <Card title={formatMessage(messages.adGroups)} buttons={adGroupButtons}>
              <DisplayCampaignAdGroupTableJS
                isFetching={adGroups.isLoadingList}
                isFetchingStat={adGroups.isLoadingPerf}
                dataSet={adGroups.items}
                updateAdGroup={updateAdGroup}
              />
            </Card>
            <Card title={formatMessage(messages.creatives)} buttons={adButtons}>
              <DisplayCampaignAdTableJS
                isFetching={ads.isLoadingList}
                isFetchingStat={ads.isLoadingPerf}
                dataSet={ads.items}
                updateAd={updateAd}
              />
            </Card>
          </Content>
        </div>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
)(DisplayCampaign);
