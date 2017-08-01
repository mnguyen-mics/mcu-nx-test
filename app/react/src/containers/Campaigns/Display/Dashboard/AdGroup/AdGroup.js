import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { withRouter, Link } from 'react-router-dom';
import { Button, Layout } from 'antd';

import AdGroupHeader from '../Common/CampaignDisplayHeader';
import AdGroupAdTable from '../Common/CampaignDisplayAdTable';
import AdGroupsDashboard from './AdGroupsDashboard';
import AdGroupActionbar from './AdGroupActionbar';
import { Card } from '../../../../../components/Card';
import { McsDateRangePicker } from '../../../../../components/McsDateRangePicker';

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';
import { parseSearch, updateSearch } from '../../../../../utils/LocationSearchHelper';

const { Content } = Layout;

class AdGroup extends Component {
  updateLocationSearch(params) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_DASHBOARD_SEARCH_SETTINGS)
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const { history: { location: { search } } } = this.props;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
      from: filter.from,
      to: filter.to
    };

    const onChange = newValues =>
      this.updateLocationSearch({
        rangeType: newValues.rangeType,
        lookbackWindow: newValues.lookbackWindow,
        from: newValues.from,
        to: newValues.to
      });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  render() {
    const {
      match: {
        params: {
          organisationId
        }
      },
      translations,
      adGroups,
      ads,
      campaign,
      updateAdGroup,
      dashboardPerformance,
      updateAd
    } = this.props;

    const adButtons = (
      <span>
        <Link to={`/${organisationId}/campaigns/email/edit/`}>
          <Button className="m-r-10" type="primary">
            <FormattedMessage {...messages.newAdGroups} />
          </Button>
        </Link>
        {this.renderDatePicker()}
      </span>
    );

    return (
      <div className="ant-layout">
        <AdGroupActionbar adGroup={adGroups.items} displayCampaign={campaign.items} updateAdGroup={updateAdGroup} archiveAdGroup={() => {}} />
        <Content className="mcs-content-container">
          <AdGroupHeader object={adGroups.items} translationKey="AD_GROUP" />
          <AdGroupsDashboard isFetchingMediaStat={dashboardPerformance.media.isLoading} mediaStat={dashboardPerformance.media.items} hasFetchedMediaStat={dashboardPerformance.media.hasFetched} adGroupStat={dashboardPerformance.adGroups.items} isFetchingAdGroupStat={dashboardPerformance.adGroups.isLoading} hasFetchedAdGroupStat={dashboardPerformance.adGroups.hasFetched} />
          <Card title={translations.CREATIVES} buttons={adButtons}>
            <AdGroupAdTable dataSet={ads.items} isFetching={ads.isLoadingList} isFetchingStat={ads.isLoadingPerf} updateAd={updateAd} />
          </Card>
        </Content>
      </div>
    );
  }
}

AdGroup.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  ads: PropTypes.shape({
    isLoadingList: PropTypes.bool.isRequired,
    isLoadingPerf: PropTypes.bool.isRequired,
    items: PropTypes.array.isRequired,
  }).isRequired,
  adGroups: PropTypes.shape({
    isLoadingList: PropTypes.bool.isRequired,
    items: PropTypes.object.isRequired,
  }).isRequired,
  campaign: PropTypes.shape({
    isLoadingList: PropTypes.bool.isRequired,
    items: PropTypes.object.isRequired,
  }).isRequired,
  dashboardPerformance: PropTypes.shape({
    media: PropTypes.shape({
      isLoading: PropTypes.bool.isRequired,
      hasFetched: PropTypes.bool.isRequired,
      items: PropTypes.array.isRequired,
    }),
    adGroups: PropTypes.shape({
      isLoading: PropTypes.bool.isRequired,
      hasFetched: PropTypes.bool.isRequired,
      items: PropTypes.array.isRequired,
    }),
  }).isRequired,
  updateAdGroup: PropTypes.func.isRequired,
  updateAd: PropTypes.func.isRequired,

};

const mapStateToProps = state => ({
  translations: state.translations,
});

const mapDispatchToProps = {
};

AdGroup = connect(mapStateToProps, mapDispatchToProps)(AdGroup);

AdGroup = withRouter(AdGroup);

export default AdGroup;
