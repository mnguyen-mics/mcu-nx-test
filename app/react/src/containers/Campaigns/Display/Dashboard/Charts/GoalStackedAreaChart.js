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

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';

import { updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches, } from '../../../../../utils/LocationSearchHelper';
import { formatMetric } from '../../../../../utils/MetricHelper';
import ReportService from '../../../../../services/ReportService';

class GoalStackedAreaChart extends Component {

  state = {
    performance: [],
    selectedAttributionModelId: '',
    isFetchingPerformance: false,
    hasData: true,
  };

  updateLocationSearch(params) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  componentDidMount() {
    const {
      goal,
      history,
      location: {
        search,
        pathname,
      },
      match: {
        params: {
          campaignId,
          organisationId,
        }
      }
    } = this.props;

    if (!isSearchValid(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
      });
    } else {

      this.getPerformanceForGoalAndAttribution(organisationId, campaignId, goal);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      goal: nextGoal,
      location: {
        search: nextSearch,
        pathname: nextPathname
      },
      match: {
        params: {
          campaignId: nextCampaignId,
          organisationId: nextOrganisationId,
        }
      }
    } = nextProps;

    const {
      goal,
      history,
      location: {
        search,
      },
      match: {
        params: {
          campaignId,
          organisationId,
        }
      }
    } = this.props;

    if (!compareSearches(search, nextSearch) || campaignId !== nextCampaignId || organisationId !== nextOrganisationId || goal !== nextGoal) {
      if (!isSearchValid(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
        });
      } else {
        this.getPerformanceForGoalAndAttribution(nextOrganisationId, nextCampaignId, nextGoal);
      }
    }
  }

  getPerformanceForGoalAndAttribution = (organisationId, campaignId, goal) => {
    const filters = [`campaign_id==${campaignId}`, `goal_id==${goal.goal_id}`];

    const { history: { location: { search } } } = this.props;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      rangeType: filter.rangeType,
      lookbackWindow: filter.lookbackWindow,
      from: filter.from,
      to: filter.to,
    };
    let attributionId = null;
    if (this.state.selectedAttributionModelId !== '') {
      attributionId = this.state.selectedAttributionModelId;
    } else if (this.state.selectedAttributionModelId === '' && goal.attribution.length) {
      this.setState({ selectedAttributionModelId: goal.attribution[0].attribution_model_id });
      attributionId = goal.attribution[0].attribution_model_id;
    }

    if (attributionId) { filters.push(`attribution_model_id==${attributionId}`); }
    return this.setState({ isFetchingPerformance: true }, () => {
      ReportService.getConversionAttributionPerformance(organisationId, values.from, values.to, filters, ['day'])
        .then(results => results.data)
        .then(results => {
          this.setState({ performance: results, isFetchingPerformance: false, hasData: results.length ? true : false });
        });
    });
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

  // renderStackedAreaCharts() {
  //   const {
  //     location: { search },
  //     colors,
  //   } = this.props;
  //   const { key1, key2 } = this.state;

  //   const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

  //   const { lookbackWindow } = filter;

  //   const optionsForChart = {
  //     xKey: 'day',
  //     yKeys: [
  //       { key: key1, message: messages[key1] },
  //       { key: key2, message: messages[key2] },
  //     ],
  //     lookbackWindow: lookbackWindow.as('milliseconds'),
  //     colors: [colors['mcs-warning'], colors['mcs-info']],
  //     isDraggable: true,
  //     onDragEnd: (values) => {
  //       this.updateLocationSearch({
  //         from: values[0],
  //         to: values[1],
  //         lookbackWindow: moment.duration(values[1] - values[0]),
  //         rangeType: 'absolute',
  //       });
  //     },
  //   };

  //   return (!isFetchingCampaignStat && hasFetchedCampaignStat)
  //     ? (
  //       <StackedAreaPlotDoubleAxis
  //         identifier={`${1}StackedAreaChartDisplayOverview`}
  //         dataset={dataSource}
  //         options={optionsForChart}
  //         style={{ flex: '1' }}
  //       />
  //     )
  //     : <LoadingChart />;
  // }

  render() {
    // const { translations, colors } = this.props;
    // const { key1, key2 } = this.state;

    // const legendOptions = [
    //   {
    //     key: key1,
    //     domain: translations[key1.toUpperCase()],
    //     color: colors['mcs-warning'],
    //   },
    //   {
    //     key: key2,
    //     domain: translations[key2.toUpperCase()],
    //     color: colors['mcs-info'],
    //   },
    // ];
    // const legends = this.createLegend();

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
        : <Row><Col span={24}>{this.renderStackedAreaCharts()}</Col></Row>}
      </div>
    );

    return chartArea;
  }
}

GoalStackedAreaChart.defaultProps = {
  renderCampaignProgress: false,
};

GoalStackedAreaChart.propTypes = {
  match: PropTypes.shape().isRequired,
  translations: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  renderCampaignProgress: PropTypes.bool,
  goal: PropTypes.shape().isRequired,
  colors: PropTypes.shape().isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  colors: state.theme.colors,
});

GoalStackedAreaChart = connect(mapStateToProps)(GoalStackedAreaChart);

GoalStackedAreaChart = compose(injectIntl, withRouter)(GoalStackedAreaChart);

export default GoalStackedAreaChart;
