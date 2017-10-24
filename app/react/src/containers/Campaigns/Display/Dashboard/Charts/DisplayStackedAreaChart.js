import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';
import { injectIntl } from 'react-intl';
import { compose } from 'recompose';
import moment from 'moment';

import { EmptyCharts, LoadingChart } from '../../../../../components/EmptyCharts/index.ts';
import McsDateRangePicker from '../../../../../components/McsDateRangePicker.tsx';
import { StackedAreaPlotDoubleAxis } from '../../../../../components/StackedAreaPlot';
import { LegendChartWithModal } from '../../../../../components/LegendChart';
import MetricsColumn from '../../../../../components/MetricsColumn.tsx';
import CampaignDisplayProgress from './CampaignDisplayProgress';

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';

import { updateSearch, parseSearch } from '../../../../../utils/LocationSearchHelper';
import { formatMetric } from '../../../../../utils/MetricHelper';

class DisplayStackedAreaChart extends Component {
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
        key: 'impressions_cost',
        domain: translations.IMPRESSIONS_COST,
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
    const {
      location: { search },
      dataSource,
      hasFetchedCampaignStat,
      isFetchingCampaignStat,
      hasFetchedOverallStat,
      isFetchingOverallStat,
      overallStat,
    } = this.props;
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
      isDraggable: true,
      onDragEnd: (values) => {
        this.updateLocationSearch({
          from: values[0],
          to: values[1],
          lookbackWindow: moment.duration(values[1] - values[0]),
          rangeType: 'absolute',
        });
      },
    };

    const metrics = [{
      name: 'CPA',
      value: hasFetchedOverallStat ? formatMetric(overallStat[0].cpa, '0,0[.]00', '', '€') : null,
    }, {
      name: 'CPC',
      value: hasFetchedOverallStat ? formatMetric(overallStat[0].cpc, '0,0[.]00', '', '€') : null,
    }, {
      name: 'CTR',
      value: hasFetchedOverallStat ? formatMetric(parseFloat(overallStat[0].ctr) / 100, '0.000 %') : null,
    }, {
      name: 'CPM',
      value: hasFetchedOverallStat ? formatMetric(overallStat[0].ctr, '0,0[.]00', '', '€') : null,
    }, {
      name: 'Spent',
      value: hasFetchedOverallStat ? formatMetric(overallStat[0].impressions_cost, '0,0[.]00', '', '€') : null,
    }];

    return (!isFetchingCampaignStat && hasFetchedCampaignStat)
      ? (
        <div style={{ display: 'flex' }}>
          <MetricsColumn metrics={metrics} isLoading={isFetchingOverallStat || !hasFetchedOverallStat} style={{ float: 'left' }} />
          <StackedAreaPlotDoubleAxis
            identifier="StackedAreaChartDisplayOverview"
            dataset={dataSource}
            options={optionsForChart}
            style={{ flex: '1' }}
          />
        </div>
      )
      : <LoadingChart />;
  }

  render() {
    const { translations, dataSource, hasFetchedCampaignStat, renderCampaignProgress } = this.props;
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
        { renderCampaignProgress ? <CampaignDisplayProgress /> : null }
        { renderCampaignProgress ? <hr /> : null}
        <Row className="mcs-chart-header">
          <Col span={12}>
            {dataSource.length === 0 && (hasFetchedCampaignStat)
              ? <div />
              : <LegendChartWithModal
                identifier="chartLegend"
                options={legendOptions}
                legends={legends}
                onLegendChange={(a, b) => this.setState({ key1: a, key2: b })}
              />}
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">
              {this.renderDatePicker()}
            </span>
          </Col>
        </Row>
        {dataSource.length === 0 && (hasFetchedCampaignStat)
          ? <EmptyCharts title={translations.NO_EMAIL_STATS} />
          : <Row gutter={20}><Col span={24}>{this.renderStackedAreaCharts()}</Col></Row>}
      </div>
    );

    return chartArea;
  }
}

DisplayStackedAreaChart.defaultProps = {
  renderCampaignProgress: false,
};

DisplayStackedAreaChart.propTypes = {
  translations: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  hasFetchedCampaignStat: PropTypes.bool.isRequired,
  isFetchingCampaignStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  isFetchingOverallStat: PropTypes.bool.isRequired,
  hasFetchedOverallStat: PropTypes.bool.isRequired,
  overallStat: PropTypes.arrayOf(PropTypes.object).isRequired,
  renderCampaignProgress: PropTypes.bool,
};

const mapStateToProps = state => ({
  translations: state.translations,
});

DisplayStackedAreaChart = connect(mapStateToProps)(DisplayStackedAreaChart);

DisplayStackedAreaChart = compose(injectIntl, withRouter)(DisplayStackedAreaChart);

export default DisplayStackedAreaChart;
