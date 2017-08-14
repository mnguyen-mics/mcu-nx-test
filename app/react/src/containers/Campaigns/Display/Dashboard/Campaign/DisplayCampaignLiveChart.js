import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';
import { injectIntl } from 'react-intl';
import { compose } from 'recompose';

import { EmptyCharts, LoadingChart } from '../../../../../components/EmptyCharts';
import McsDateRangePicker from '../../../../../components/McsDateRangePicker';
import { StackedAreaPlotDoubleAxis } from '../../../../../components/StackedAreaPlot';
import { LegendChart } from '../../../../../components/LegendChart';

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';

import { updateSearch, parseSearch } from '../../../../../utils/LocationSearchHelper';

class DisplayCampaignLiveChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      key1: 'impressions',
      key2: 'clicks',
    };
  }

  createLegend() {
    const { translations } = this.props;
    const legends = [
      {
        key: 'impressions',
        domain: translations['impressions'.toUpperCase()],
      },
      {
        key: 'clicks',
        domain: translations['clicks'.toUpperCase()],
      },
      {
        key: 'ctr',
        domain: translations['ctr'.toUpperCase()],
      },
      {
        key: 'cpa',
        domain: translations['cpa'.toUpperCase()],
      },
      {
        key: 'impressions_cost',
        domain: translations['impressions_cost'.toUpperCase()],
      },
      {
        key: 'cpm',
        domain: translations['cpm'.toUpperCase()],
      },
      {
        key: 'cpc',
        domain: translations['cpc'.toUpperCase()],
      },
    ];

    return legends;
  }

  updateLocationSearch(params) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
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
      to: filter.to,
    };

    const onChange = newValues =>
      this.updateLocationSearch({
        rangeType: newValues.rangeType,
        lookbackWindow: newValues.lookbackWindow,
        from: newValues.from,
        to: newValues.to,
      });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  renderStackedAreaCharts() {
    const { location: { search }, dataSource, hasFetchedCampaignStat } = this.props;
    const { key1, key2 } = this.state;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const { lookbackWindow } = filter;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: key1, message: messages[key1] },
        { key: key2, message: messages[key2] },
      ],
      lookbackWindow: lookbackWindow.as('milliseconds'),
      colors: ['#ff9012', '#00a1df'],
    };
    return hasFetchedCampaignStat
      ? (
        <StackedAreaPlotDoubleAxis
          identifier="StackedAreaChartEmailOverview"
          dataset={dataSource} options={optionsForChart}
        />
      )
      : <LoadingChart />;
  }

  render() {
    const {
      translations,
      dataSource,
      hasFetchedCampaignStat,
      isFetchingCampaignStat,
    } = this.props;
    const { key1, key2 } = this.state;
    const legendOptions = [
      {
        key: key1,
        domain: translations[key1.toUpperCase()],
        color: '#ff9012',
      },
      {
        key: key2,
        domain: translations[key2.toUpperCase()],
        color: '#00a1df',
      },
    ];

    const legends = this.createLegend();

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {dataSource.length === 0 && hasFetchedCampaignStat && isFetchingCampaignStat
              ? <div />
              : <LegendChart
                identifier="chartLegend"
                options={legendOptions}
                legends={legends}
                onLegendChange={(a, b) => { this.setState({ key1: a, key2: b }); }}
              />}
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">
              {this.renderDatePicker()}
            </span>
          </Col>
        </Row>
        {dataSource.length === 0 && hasFetchedCampaignStat && isFetchingCampaignStat
          ? <EmptyCharts title={translations.NO_EMAIL_STATS} />
          : this.renderStackedAreaCharts()}
      </div>
    );

    return chartArea;
  }
}

DisplayCampaignLiveChart.propTypes = {
  translations: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  hasFetchedCampaignStat: PropTypes.bool.isRequired,
  isFetchingCampaignStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
});

DisplayCampaignLiveChart = connect(mapStateToProps)(DisplayCampaignLiveChart);

DisplayCampaignLiveChart = compose(injectIntl, withRouter)(DisplayCampaignLiveChart);

export default DisplayCampaignLiveChart;
