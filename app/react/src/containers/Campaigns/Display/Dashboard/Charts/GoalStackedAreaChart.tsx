import React from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { Row, Col, Menu, Dropdown, Button, Icon } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { ClickParam } from 'antd/lib/menu';

import { EmptyCharts, LoadingChart } from '../../../../../components/EmptyCharts/index';
import McsDateRangePicker, { McsDateRangeValue } from '../../../../../components/McsDateRangePicker';
import { StackedAreaPlot } from '../../../../../components/StackedAreaPlot';
import { LegendChart } from '../../../../../components/LegendChart';

import { GoalSelectionResource, AttributionSelectionResource } from '../../../../../models/goal';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';

import { updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearches } from '../../../../../utils/LocationSearchHelper';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import ReportService from '../../../../../services/ReportService';
import McsMoment from '../../../../../utils/McsMoment';

const StackedAreaPlotTS = StackedAreaPlot as any;
const LegendChartTS = LegendChart as any;

interface RouterMatchParams {
  organisationId: string;
  campaignId: string;
}

interface McsColors {
  'mcs-primary': string;
  'mcs-normal': string;
  'mcs-info': string;
  'mcs-success': string;
  'mcs-error': string;
  'mcs-highlight': string;
  'mcs-warning': string;
}

interface PerformanceValue {
  day: string;
  weighted_conversions: string;
  interaction_to_conversion_duration: string;
}

interface Goal extends GoalSelectionResource {
  attribution: AttributionSelectionResource[];
}

interface GoalStackedAreaChartProps {
  goal: Goal;
  colors: McsColors;
}

interface GoalStackedAreaChartState {
  performance: PerformanceValue[];
  selectedAttributionModel?: AttributionSelectionResource;
  isFetchingPerformance: boolean;
  hasFetchedPerformance: boolean;
  hasData: boolean;
}

type JoinedProps = GoalStackedAreaChartProps & RouteComponentProps<RouterMatchParams> & InjectedIntlProps;

class GoalStackedAreaChart extends React.Component<JoinedProps, GoalStackedAreaChartState> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      performance: [],
      isFetchingPerformance: false,
      hasFetchedPerformance: false,
      hasData: true,
    };
  }

  updateLocationSearch(params: McsDateRangeValue) {
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
        },
      },
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

  getSetAttribution = (state: GoalStackedAreaChartState, goal: Goal) => {
    let attributionId = null;
    if (state.selectedAttributionModel !== undefined) {
      attributionId = state.selectedAttributionModel.id;
    } else if (state.selectedAttributionModel === undefined && goal.attribution.length) {
      this.setState({ selectedAttributionModel: goal.attribution[0] });
      attributionId = goal.attribution[0].id;
    }
    return attributionId;
  }

  componentWillUpdate(nextProps: JoinedProps, nextState: GoalStackedAreaChartState) {
    const {
      goal: nextGoal,
      location: {
        search: nextSearch,
        pathname: nextPathname,
      },
      match: {
        params: {
          campaignId: nextCampaignId,
          organisationId: nextOrganisationId,
        },
      },
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
        },
      },
    } = this.props;

    const {
      selectedAttributionModel,
    } = this.state;

    const {
      selectedAttributionModel: nextSelectedAttributionModel,
    } = nextState;

    if (!compareSearches(search, nextSearch)
      || campaignId !== nextCampaignId
      || organisationId !== nextOrganisationId
      || goal !== nextGoal
      || selectedAttributionModel !== nextSelectedAttributionModel) {
      if (!isSearchValid(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
        });
      } else {
        const filter = parseSearch(nextSearch, DISPLAY_DASHBOARD_SEARCH_SETTINGS);
        const nextAttributionId = nextSelectedAttributionModel ? nextSelectedAttributionModel.id : null;
        this.getPerformanceForGoalAndAttribution(nextOrganisationId, nextCampaignId, nextGoal, nextAttributionId, filter.from, filter.to);
      }
    }
  }

  getPerformanceForGoalAndAttribution = (
    organisationId: string,
    campaignId: string,
    goal: Goal,
    attributionId: string | null,
    from: McsMoment,
    to: McsMoment,
  ) => {
    const filters = [`campaign_id==${campaignId}`, `goal_id==${goal.goal_id}`];

    if (attributionId) { filters.push(`attribution_model_id==${attributionId}`); }
    return this.setState({ isFetchingPerformance: true }, () => {
      ReportService.getConversionAttributionPerformance(organisationId, from, to, filters, ['day'], undefined)
        .then((results) => normalizeReportView(results.data.report_view))
        .then(results => {
          this.setState({
            performance: results,
            isFetchingPerformance: false,
            hasData: !!results.length,
            hasFetchedPerformance: true,
          });
        });
    });
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

  renderStackedAreaCharts() {
    const {
      colors,
      goal,
    } = this.props;

    const { performance, isFetchingPerformance } = this.state;

    const optionsForChart = {
      xKey: 'day',
      yKeys: [
        { key: 'weighted_conversions', message: messages.weightedConversion },
      ],
      colors: [colors['mcs-success']],
      isDraggable: false,
    };

    return (!isFetchingPerformance && performance.length !== 0)
      ? (
        <StackedAreaPlotTS
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
        },
      },
      location: { search },
    } = this.props;

    const handleClick = ({ key }: ClickParam) => {
      const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);
      this.setState(prevState => {

        const selectedAttributionModel = goal.attribution.find(item => item.id === key);

        this.getPerformanceForGoalAndAttribution(
          organisationId,
          campaignId,
          goal,
          selectedAttributionModel!.id,
          filter.from,
          filter.to,
        );

        return {
          selectedAttributionModel,
        };

      });

    };

    const menu = (
      <Menu onClick={handleClick}>
        {goal.attribution.map(attribution => {
          return (this.state.selectedAttributionModel && attribution.id !== this.state.selectedAttributionModel.id) ?
            <Menu.Item key={attribution.id}>{attribution.attribution_model_name}</Menu.Item> : null;
        })}
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button style={{ marginRight: 8 }}>
          <span>
            {this.state.selectedAttributionModel && this.state.selectedAttributionModel.attribution_model_name}
          </span> <Icon type="down" />
        </Button>
      </Dropdown>
    );
  }

  render() {
    const {
      colors,
      intl: {
        formatMessage,
      },
    } = this.props;

    const { hasFetchedPerformance, hasData, isFetchingPerformance } = this.state;

    const legendOptions = [{
      color: colors['mcs-success'],
      domain: formatMessage(messages.weightedConversion),
    }];

    const chartArea = (
      <div>
        <Row className="mcs-chart-header">
          <Col span={12}>
            {hasData && (isFetchingPerformance)
            ? <div />
            : <LegendChartTS
              identifier="chartLegend"
              options={legendOptions}
            />}
          </Col>
          <Col span={12}>
            <span className="mcs-card-button">
              {this.renderAttributionSelect()}
              {this.renderDatePicker()}
            </span>
          </Col>
        </Row>
        {!hasData && (hasFetchedPerformance)
        ? <EmptyCharts title={formatMessage(messages.noGoalStatAvailable)} />
        : <Row><Col span={24}>{this.renderStackedAreaCharts()}</Col></Row>}
      </div>
    );

    return chartArea;
  }
}

export default compose<JoinedProps, GoalStackedAreaChartProps>(
  injectIntl,
  withRouter,
  connect(
    (state: any) => ({
      colors: state.theme.colors,
    }),
  ),
)(GoalStackedAreaChart);
