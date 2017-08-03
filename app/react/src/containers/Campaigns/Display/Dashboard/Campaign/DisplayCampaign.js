import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { withRouter, Link } from 'react-router-dom';
import { Layout, Button } from 'antd';
import { compose } from 'recompose';

import DisplayCampaignHeader from '../Common/DisplayCampaignHeader';
import DisplayCampaignDashboard from './DisplayCampaignDashboard';
import DisplayCampaignAdGroupTable from './DisplayCampaignAdGroupTable';
import DisplayCampaignAdTable from '../Common/DisplayCampaignAdTable';
import Card from '../../../../../components/Card/Card';
import McsDateRangePicker from '../../../../../components/McsDateRangePicker';
import DisplayCampaignActionbar from './DisplayCampaignActionbar';

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';

import {
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';

const { Content } = Layout;

class DisplayCampaign extends Component {

  updateLocationSearch(params) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      history: {
        location: {
          search,
        },
      },
    } = this.props;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues) => this.updateLocationSearch({
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
        params: { organisationId },
      },
      campaign,
      ads,
      adGroups,
      updateAd,
      updateAdGroup,
      updateCampaign,
      dashboardPerformance,
      intl: {
        formatMessage,
      },
    } = this.props;

    const adGroupButtons = (
      <span>
        <Link to={`/${organisationId}/campaigns/display/expert/edit/${campaign.items.id}/edit-ad-group/T1`}>
          <Button className="m-r-10" type="primary">
            <FormattedMessage {...messages.newAdGroups} />
          </Button>
        </Link>
        {this.renderDatePicker()}
      </span>
    );

    const adButtons = (
      <span>
        {this.renderDatePicker()}
      </span>
    );

    return (
      <div className="ant-layout">
        <DisplayCampaignActionbar
          campaign={campaign.items}
          updateCampaign={updateCampaign}
          archiveCampaign={() => {}}
          isFetchingStats={dashboardPerformance.campaign.isLoading && adGroups.isLoadingPerf && ads.isLoadingPerf && dashboardPerformance.media.isLoading}
          campaignStats={dashboardPerformance.campaign.items}
          mediasStats={dashboardPerformance.media.items}
          adGroupsStats={adGroups.items}
          adsStats={ads.items}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <DisplayCampaignHeader object={campaign.items} translationKey="CAMPAIGN" />
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
            />
            <Card title={formatMessage(messages.adGroups)} buttons={adGroupButtons}>
              <DisplayCampaignAdGroupTable
                isFetching={adGroups.isLoadingList}
                isFetchingStat={adGroups.isLoadingPerf}
                dataSet={adGroups.items}
                updateAdGroup={updateAdGroup}
              />
            </Card>
            <Card title={formatMessage(messages.creatives)} buttons={adButtons}>
              <DisplayCampaignAdTable
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

DisplayCampaign.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  ads: PropTypes.shape({
    isLoadingList: PropTypes.bool,
    isLoadingPerf: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  adGroups: PropTypes.shape({
    isLoadingList: PropTypes.bool,
    isLoadingPerf: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  campaign: PropTypes.shape({
    isLoadingList: PropTypes.bool,
    isLoadingPerf: PropTypes.bool,
    items: PropTypes.object,
  }).isRequired,
  dashboardPerformance: PropTypes.shape({
    media: PropTypes.shape({
      isLoading: PropTypes.bool,
      hasFetched: PropTypes.bool,
      items: PropTypes.arrayOf(PropTypes.object),
    }),
    overall: PropTypes.shape({
      isLoading: PropTypes.bool,
      hasFetched: PropTypes.bool,
      items: PropTypes.arrayOf(PropTypes.object),
    }),
    campaign: PropTypes.shape({
      isLoading: PropTypes.bool,
      hasFetched: PropTypes.bool,
      items: PropTypes.arrayOf(PropTypes.object),
    }),
  }).isRequired,
  updateCampaign: PropTypes.func.isRequired,
  updateAdGroup: PropTypes.func.isRequired,
  updateAd: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

DisplayCampaign = compose(
  injectIntl,
  withRouter,
)(DisplayCampaign);

export default DisplayCampaign;
