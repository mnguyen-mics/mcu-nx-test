import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col } from 'antd';
import { injectIntl } from 'react-intl';
import { compose } from 'recompose';
import moment from 'moment';

import { EmptyCharts, LoadingChart } from '../../../../../components/EmptyCharts';
import { McsDateRangePicker } from '../../../../../components/McsDateRangePicker';
import { StackedAreaPlotDoubleAxis } from '../../../../../components/StackedAreaPlot';
import { LegendChartWithModal } from '../../../../../components/LegendChart';

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';

import { updateSearch, parseSearch } from '../../../../../utils/LocationSearchHelper';

class DisplayStackedAreaChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      key1: 'impressions',
      key2: 'clicks'
    };
  }

  updateLocationSearch(params) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_DASHBOARD_SEARCH_SETTINGS)
    };

    history.push(nextLocation);
  }

  createLegend() {
    const { translations } = this.props;
    const legends = [
      {
        key: 'impressions',
        domain: translations['impressions'.toUpperCase()]
      },
      {
        key: 'clicks',
        domain: translations['clicks'.toUpperCase()]
      },
      {
        key: 'ctr',
        domain: translations['ctr'.toUpperCase()]
      },
      {
        key: 'impressions_cost',
        domain: translations.IMPRESSIONS_COST
      },
      {
        key: 'cpm',
        domain: translations['cpm'.toUpperCase()]
      },
      {
        key: 'cpc',
        domain: translations['cpc'.toUpperCase()]
      }
    ];

    return legends;
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

  renderStackedAreaCharts() {
    const { location: { search }, dataSource, hasFetchedCampaignStat, isFetchingCampaignStat } = this.props;
    const { key1, key2 } = this.state;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const { lookbackWindow } = filter;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [{ key: key1, message: messages[key1] }, { key: key2, message: messages[key2] }],
      lookbackWindow: lookbackWindow.as('milliseconds'),
      colors: ['#ff9012', '#00a1df'],
      isDraggable: true,
      onDragEnd: (values) => { this.updateLocationSearch({ from: values[0], to: values[1], lookbackWindow: moment.duration(values[1] - values[0]), rangeType: 'absolute' }); }
    };
    return (!isFetchingCampaignStat && hasFetchedCampaignStat)
      ? <StackedAreaPlotDoubleAxis identifier="StackedAreaChartDisplayOverview" dataset={dataSource} options={optionsForChart} />
      : <LoadingChart />;
  }

  render() {
    const { translations, dataSource, hasFetchedCampaignStat } = this.props;
    const { key1, key2 } = this.state;

    const legendOptions = [
      {
        key: key1,
        domain: translations[key1.toUpperCase()],
        color: '#ff9012'
      },
      {
        key: key2,
        domain: translations[key2.toUpperCase()],
        color: '#00a1df'
      }
    ];
    const legends = this.createLegend();

    const chartArea = (
      <div>
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
          : this.renderStackedAreaCharts()}
      </div>
    );

    return chartArea;
  }
}

DisplayStackedAreaChart.propTypes = {
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  hasFetchedCampaignStat: PropTypes.bool.isRequired,
  isFetchingCampaignStat: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations
});

DisplayStackedAreaChart = connect(mapStateToProps)(DisplayStackedAreaChart);

DisplayStackedAreaChart = compose(injectIntl, withRouter)(DisplayStackedAreaChart);

export default DisplayStackedAreaChart;
