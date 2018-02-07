import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { withRouter, Link } from 'react-router-dom';
import { Button, Layout } from 'antd';
import { compose } from 'recompose';

import CampaignDashboardHeader from '../../../Common/CampaignDashboardHeader';
import AdGroupAdTable from '../Common/DisplayCampaignAdTable';
import AdGroupsDashboard from './AdGroupsDashboard';
import AdGroupActionbar from './AdGroupActionbar';
import { Card } from '../../../../../components/Card/index';
import McsDateRangePicker, {
  McsDateRangeValue,
} from '../../../../../components/McsDateRangePicker';

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';
import {
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import {
  AdInfoResource,
  DisplayCampaignInfoResource,
  AdResource,
} from '../../../../../models/campaign/display/index';
import { AdGroupResource } from '../../../../../models/campaign/display/AdGroupResource';
import { UpdateMessage } from '../Campaign/DisplayCampaignAdGroupTable';
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
  items: T;
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
  updateAdGroup: (adGroupId: string, body: Partial<AdGroupResource>) => void;
  updateAd: (
    adId: string,
    body: Partial<AdResource>,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
    undoBody?: Partial<AdResource>,
  ) => void;
}

type JoinedProps = AdGroupProps &
  InjectedIntlProps &
  RouteComponentProps<CampaignRouteParams>;

class AdGroup extends React.Component<JoinedProps> {
  updateLocationSearch(params: McsDateRangeValue) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        DISPLAY_DASHBOARD_SEARCH_SETTINGS,
      ),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const { history: { location: { search } } } = this.props;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue) =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

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
        <Link to={`/${organisationId}/campaigns/email/edit/`}>
          <Button className="m-r-10" type="primary">
            <FormattedMessage {...messages.newCreatives} />
          </Button>
        </Link>
        {this.renderDatePicker()}
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
          <Card
            title={intl.formatMessage(messages.creatives)}
            buttons={adButtons}
          >
            <AdGroupAdTable
              dataSet={ads.items}
              isFetching={ads.isLoadingList}
              isFetchingStat={ads.isLoadingPerf}
              updateAd={updateAd}
            />
          </Card>
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
