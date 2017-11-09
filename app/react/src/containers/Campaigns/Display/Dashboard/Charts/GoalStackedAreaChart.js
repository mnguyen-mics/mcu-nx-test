import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Row, Col, Menu, Dropdown, Button, Icon } from 'antd';
import { injectIntl, intlShape } from 'react-intl';
import { compose } from 'recompose';

import { EmptyCharts, LoadingChart } from '../../../../../components/EmptyCharts/index.ts';
import McsDateRangePicker from '../../../../../components/McsDateRangePicker.tsx';
import { StackedAreaPlot } from '../../../../../components/StackedAreaPlot';
import { LegendChart } from '../../../../../components/LegendChart';

import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';

import { updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches, } from '../../../../../utils/LocationSearchHelper';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import ReportService from '../../../../../services/ReportService';

class GoalStackedAreaChart extends Component {

  state = {
    performance: [],
    selectedAttributionModelId: '',
    selectedAttributionModel: {},
    isFetchingPerformance: false,
    hasFetchedPerformance: false,
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
      const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);
      const attributionId = this.getSetAttribution(this.state, goal);
      this.getPerformanceForGoalAndAttribution(organisationId, campaignId, goal, attributionId, filter.from, filter.to);
    }
  }

  getSetAttribution = (state, goal) => {
    let attributionId = null;
    if (Object.keys(state.selectedAttributionModel).length) {
      attributionId = state.selectedAttributionModel.id;
    } else if (Object.keys(state.selectedAttributionModel).length === 0 && goal.attribution.length) {
      this.setState({ selectedAttributionModel: goal.attribution[0] });
      attributionId = goal.attribution[0].id;
    }
    return attributionId;
  }

  componentWillUpdate(nextProps, nextState) {
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

    const {
      selectedAttributionModelId
    } = this.state;

    const {
      selectedAttributionModelId: nextSelectedAttributionModelId,
    } = nextState;

    if (!compareSearches(search, nextSearch) || campaignId !== nextCampaignId || organisationId !== nextOrganisationId || goal !== nextGoal || nextSelectedAttributionModelId !== selectedAttributionModelId) {
      if (!isSearchValid(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
        });
      } else {
        const filter = parseSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS);
        const attributionId = this.getSetAttribution(nextState, nextGoal);
        this.getPerformanceForGoalAndAttribution(nextOrganisationId, nextCampaignId, nextGoal, attributionId, filter.from, filter.to);
      }
    }
  }

  getPerformanceForGoalAndAttribution = (organisationId, campaignId, goal, attributionId, from, to) => {
    const filters = [`campaign_id==${campaignId}`, `goal_id==${goal.goal_id}`];

    if (attributionId) { filters.push(`attribution_model_id==${attributionId}`); }
    return this.setState({ isFetchingPerformance: true }, () => {
      ReportService.getConversionAttributionPerformance(organisationId, from, to, filters, ['day'])
        .then(results => normalizeReportView(results.data.report_view))
        .then(results => {
          this.setState({ performance: results, isFetchingPerformance: false, hasData: results.length ? true : false, hasFetchedPerformance: true });
        });
    });
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
      colors,
      goal,
    } = this.props;

    const { performance, isFetchingPerformance } = this.state;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const { lookbackWindow } = filter;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: 'weighted_conversions', message: messages.weightedConversion },
      ],
      lookbackWindow: lookbackWindow.as('milliseconds'),
      colors: [colors['mcs-success']],
      isDraggable: false,
    };

    return (!isFetchingPerformance && performance.length !== 0)
      ? (
        <StackedAreaPlot
          identifier={`Goal${goal.id}StackedAreaChartDisplayOverview`}
          dataset={performance}
          options={optionsForChart}
        />
      )
      : <LoadingChart />;
  }

  renderAttributionSelect = () => {
    const {
      goal,
      match: {
        params: {
          campaignId,
          organisationId,
        }
      },
      location: { search },
    } = this.props;

    const handleClick = ({ key }) => {
      const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);
      this.setState({ selectedAttributionModel: goal.attribution.find(item => item.id === key) }, () => {
        this.getPerformanceForGoalAndAttribution(organisationId, campaignId, goal, this.state.selectedAttributionModel.id, filter.from, filter.to);
      });

    };

    const menu = (
      <Menu onClick={handleClick}>
        {goal.attribution.map(attribution => {
          return attribution.id !== this.state.selectedAttributionModel.id ? <Menu.Item key={attribution.id}>{attribution.attribution_model_name}</Menu.Item> : null;
        })}
      </Menu>
    );

    return (<Dropdown overlay={menu} trigger={['click']}>
      <Button style={{ marginRight: 8 }}>
        <span>{ this.state.selectedAttributionModel.attribution_model_name }</span> <Icon type="down" />
      </Button>
    </Dropdown>);
  }

  render() {
    const {
      colors,
      intl: {
        formatMessage
      }
    } = this.props;

    const { hasFetchedPerformance, hasData, isFetchingPerformance } = this.state;

    const legendOptions = {
      colors: [colors['mcs-success']],
      domains: [formatMessage(messages.weightedConversion)]
    };

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          {<Col span={12}>
            {hasData && (isFetchingPerformance)
            ? <div />
            : <LegendChart
              identifier="chartLegend"
              options={legendOptions}
            />}
          </Col>}
          <Col span={12}>
            <span className="mcs-card-button">
              {this.renderAttributionSelect()}
              {this.renderDatePicker()}
            </span>
          </Col>
        </Row>
        {!hasData && (hasFetchedPerformance)
        ? <EmptyCharts title={'no stats'} />
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
  location: PropTypes.shape().isRequired,
  history: PropTypes.shape().isRequired,
  goal: PropTypes.shape().isRequired,
  colors: PropTypes.shape().isRequired,
  intl: intlShape.isRequired
};

const mapStateToProps = state => ({
  colors: state.theme.colors,
});

GoalStackedAreaChart = connect(mapStateToProps)(GoalStackedAreaChart);

GoalStackedAreaChart = compose(injectIntl, withRouter)(GoalStackedAreaChart);

export default GoalStackedAreaChart;
