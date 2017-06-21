import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';

import { EmptyCharts } from '../../../../../components/EmptyCharts';
import * as CampaignEmailActions from '../../../../../state/Campaign/Email/actions';
import { McsDateRangePicker } from '../../../../../components/McsDateRangePicker';
import { StackedAreaPlot } from '../../../../../components/StackedAreaPlot';
import { LegendChart } from '../../../../../components/LegendChart';

import { EMAIL_DASHBOARD_SEARCH_SETTINGS } from '../constants';

import {
  updateSearch,
  parseSearch
} from '../../../../../utils/LocationSearchHelper';

import { getTableDataSource } from '../../../../../state/Campaign/Email/selectors';

class EmailStackedAreaChart extends Component {

  updateLocationSearch(params) {
    const {
      history,
      location: {
        search: currentSearch,
        pathname
      }
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, EMAIL_DASHBOARD_SEARCH_SETTINGS)
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const {
      history: {
        location: {
          search
        }
      }
    } = this.props;

    const filter = parseSearch(search, EMAIL_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
      from: filter.from,
      to: filter.to
    };

    const onChange = (newValues) => this.updateLocationSearch({
      rangeType: newValues.rangeType,
      lookbackWindow: newValues.lookbackWindow,
      from: newValues.from,
      to: newValues.to,
    });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  renderStackedAreaCharts() {
    const {
      location: {
        search
      },
      dataSource,
      hasFetchedCampaignStat
    } = this.props;

    const filter = parseSearch(search, EMAIL_DASHBOARD_SEARCH_SETTINGS);

    const { lookbackWindow } = filter;

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
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  hasFetchedCampaignStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired
};

const mapStateToProps = state => ({
  translations: state.translations,
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

EmailStackedAreaChart = withRouter(EmailStackedAreaChart);

export default EmailStackedAreaChart;
