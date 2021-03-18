import {
  ReportRequestBody,
  DateRange,
  Dimension,
  Metric,
  DimensionFilterClause,
} from '../models/ReportRequestBody';
import McsMoment, { isNowFormat } from './McsMoment';

export type ScenarioAnalyticsDimension =
  | 'organisation_id'
  | 'datamart_id'
  | 'scenario_id'
  | 'node_id'
  | 'exit_condition_id'
  | 'user_point_id'
  | 'execution_id'
  | 'date_yyyy_mm_dd'
  | 'date_yyyy_mm_dd_hh'
  | 'ts';

export type ScenarioAnalyticsMetric =
  | 'user_points_count'
  | 'avg_scenario_duration'
  | 'avg_node_duration';

export function buildScenarioAnalyticsRequestBody(
  metrics: ScenarioAnalyticsMetric[],
  from: McsMoment,
  to: McsMoment,
  dimensions?: ScenarioAnalyticsDimension[],
  dimensionFilterClauses?: DimensionFilterClause,
): ReportRequestBody {
  const UTC = !(isNowFormat(from.value) && isNowFormat(to.value));
  const startDate: string = new McsMoment(from.value)
    .toMoment()
    .utc(UTC)
    .startOf('day')
    .format()
    .replace('Z', '');
  const endDate: string = new McsMoment(to.value)
    .toMoment()
    .utc(UTC)
    .endOf('day')
    .format()
    .replace('Z', '');
  const dimensionsList: ScenarioAnalyticsDimension[] = dimensions || [];
  return buildReport(
    startDate,
    endDate,
    dimensionsList,
    metrics,
    dimensionFilterClauses,
  );
}

function buildReport(
  startDate: string,
  endDate: string,
  dimensionsList: ScenarioAnalyticsDimension[],
  metricsList: ScenarioAnalyticsMetric[],
  dimensionFilterClauses?: DimensionFilterClause,
): ReportRequestBody {
  const dateRange: DateRange = {
    start_date: startDate,
    end_date: endDate,
  };

  const dateRanges: DateRange[] = [dateRange];

  // DIMENSIONS
  const dimensions: Dimension[] = dimensionsList.map((dimension) => {
    return { name: dimension };
  });

  // METRICS
  const metrics: Metric[] = metricsList.map((metric) => {
    return { expression: metric };
  });

  const report: ReportRequestBody = {
    date_ranges: dateRanges,
    dimensions: dimensions,
    dimension_filter_clauses: dimensionFilterClauses,
    metrics: metrics,
  };
  return report;
}
