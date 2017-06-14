import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import lodash from 'lodash';
import { Row, Col } from 'antd';
import { EmptyCharts } from '../../../../../components/EmptyCharts';
import * as CampaignEmailActions from '../../../../../state/Campaign/Email/actions';
import { McsDateRangePicker } from '../../../../../components/McsDateRangePicker';
import { StackedAreaPlot } from '../../../../../components/StackedAreaPlot';
import { LegendChart } from '../../../../../components/LegendChart';

import {
  CAMPAIGN_EMAIL_QUERY_SETTINGS
} from '../../../RouteQuerySelector';

import {
  updateQueryWithParams,
  deserializeQuery
} from '../../../../../services/RouteQuerySelectorService';

import {
  getTableDataSource
 } from '../../../../../state/Campaign/Email/selectors';

class EmailStackedAreaChart extends Component {
  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, CAMPAIGN_EMAIL_QUERY_SETTINGS)
    });
  }

  renderDatePicker() {
    const {
      query
    } = this.props;

    const filter = deserializeQuery(query, CAMPAIGN_EMAIL_QUERY_SETTINGS);

    const values = {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
      from: filter.from,
      to: filter.to
    };

    const onChange = (newValues) => this.updateQueryParams({
      rangeType: newValues.rangeType,
      lookbackWindow: newValues.lookbackWindow,
      from: newValues.from,
      to: newValues.to,
    });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  renderStackedAreaCharts() {
    const {
      translations,
      dataSource,
      hasFetchedCampaignStat,
      query
    } = this.props;

    const filter = deserializeQuery(query, CAMPAIGN_EMAIL_QUERY_SETTINGS);

    const {
      lookbackWindow
    } = filter;

    const optionsForChart = {
      xKey: 'day',
      yKeys: ['email_sent', 'clicks', 'impressions', 'email_hard_bounced'],
      lookbackWindow: lookbackWindow.as('milliseconds'),
      colors: ['#ff9012', '#00a1df', '#00ad68', '#f12f2f']
    };
    return hasFetchedCampaignStat ? (<StackedAreaPlot identifier="StackedAreaChartEmailOverview" dataset={dataSource} options={optionsForChart} />) : (<span>Loading</span>);
  }

  render() {
    const {
      translations,
      dataSource,
      hasFetchedCampaignStat,
    } = this.props;

    const options = {
      domains: ['email_sent', 'clicks', 'impressions', 'email_hard_bounced'],
      colors: ['#ff9012', '#00a1df', '#00ad68', '#f12f2f']
    };

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            { (dataSource.length === 0 && hasFetchedCampaignStat) ? <div /> : <LegendChart identifier="chartLegend" options={options} /> }
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">
              { this.renderDatePicker() }
            </span>
          </Col>
        </Row>
        { (dataSource.length === 0 && hasFetchedCampaignStat) ? <EmptyCharts title={translations.NO_EMAIL_STATS} /> : this.renderStackedAreaCharts() }
      </div>
    );

    return chartArea;
  }
}

EmailStackedAreaChart.propTypes = {
  translations: PropTypes.object.isRequired,  // eslint-disable-line react/forbid-prop-types
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  params: PropTypes.shape({
    campaignId: PropTypes.string
  }).isRequired,
  loadCampaignEmailAndDeliveryReport: PropTypes.func.isRequired,
  isFetchingCampaignStat: PropTypes.bool.isRequired,
  hasFetchedCampaignStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  resetCampaignEmail: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  translations: state.translationsState.translations,
  params: ownProps.router.params,
  query: ownProps.router.location.query,
  isFetchingCampaignStat: state.campaignEmailSingle.campaignEmailPerformance.isFetching,
  hasFetchedCampaignStat: state.campaignEmailSingle.campaignEmailPerformance.hasFetched,
  dataSource: getTableDataSource(state)
});


const mapDispatchToProps = {
  loadCampaignEmailAndDeliveryReport: CampaignEmailActions.loadCampaignEmailAndDeliveryReport,
  resetCampaignEmail: CampaignEmailActions.resetCampaignEmail
};

EmailStackedAreaChart = connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailStackedAreaChart);

export default EmailStackedAreaChart;
