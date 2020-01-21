import {
  ReportRequestBody,
  DateRange,
  Dimension,
  DimensionFilterClause,
  Metric,
  DimensionFilter,
} from '../models/ReportRequestBody';
import McsMoment from './McsMoment';

type DatamartUsersAnalyticsDimension =
  | 'DATE'
  | 'DATAMART_ID'
  | 'USERPOINT_ID'
  | 'CHANNEL_ID'
  | 'SESSION_DURATION'
  | 'UNIQUE_KEY'
  | 'SEGMENTS'
  | 'ORIGIN_TS'
  | 'ORIGIN_SOURCE'
  | 'ORIGIN_CHANNEL'
  | 'ORIGIN_CAMPAIGN_NAME'
  | 'ORIGIN_CAMPAIGN_TECHNICAL_NAME'
  | 'ORIGIN_CAMPAIGN_ID'
  | 'ORIGIN_SUB_CAMPAIGN_TECHNICAL_NAME'
  | 'ORIGIN_SUB_CAMPAIGN_ID'
  | 'ORIGIN_MESSAGE_ID'
  | 'ORIGIN_MESSAGE_TECHNICAL_NAME'
  | 'ORIGIN_KEYWORDS'
  | 'ORIGIN_CREATIVE_NAME'
  | 'ORIGIN_CREATIVE_TECHNICAL_NAME'
  | 'ORIGIN_CREATIVE_ID'
  | 'ORIGIN_ENGAGEMENT_CONTENT_ID'
  | 'ORIGIN_SOCIAL_NETWORK'
  | 'ORIGIN_REFERRAL_PATH'
  | 'ORIGIN_LOG_ID'
  | 'ORIGIN_GCLID'
  | 'LOCATION_SOURCE'
  | 'LOCATION_COUNTRY'
  | 'LOCATION_REGION'
  | 'LOCATION_ISO_REGION'
  | 'LOCATION_CITY'
  | 'LOCATION_ISO_CITY'
  | 'LOCATION_ZIP_CODE'
  | 'LOCATION_LATITUDE'
  | 'LOCATION_LONGITUDE'
  | 'DEVICE_FORM_FACTOR'
  | 'DEVICE_OS_FAMILY'
  | 'DEVICE_BROWSER_FAMILY'
  | 'DEVICE_BROWSER_VERSION'
  | 'DEVICE_BRAND'
  | 'DEVICE_MODEL'
  | 'DEVICE_OS_VERSION'
  | 'DEVICE_CARRIER'
  | 'DEVICE_RAW_VALUE'
  | 'DEVICE_AGENT_TYPE'
  | 'DAY'
  | 'HOUR_OF_DAY';

type DatamartUsersAnalyticsMetric =
  | 'USER_IDENTIFIERS_COUNT'
  | 'SESSION_DURATION_AVG';

export function buildDatamartUsersAnalyticsRequestBody(
  datamartId: string,
): ReportRequestBody {
  const date7daysAgo: string = new McsMoment('now-7d').toMoment().format();
  const dimensionsList: DatamartUsersAnalyticsDimension[] = ['DATE'];
  const metricsList: DatamartUsersAnalyticsMetric[] = ['USER_IDENTIFIERS_COUNT'];
  return buildReport(date7daysAgo, dimensionsList, metricsList, datamartId);
}

function buildReport(
  startDate: string,
  dimensionsList: DatamartUsersAnalyticsDimension[],
  metricsList: DatamartUsersAnalyticsMetric[],
  datamartId: string,
): ReportRequestBody {

  // DATE RANGE
  const dateNow: string = new McsMoment('now').toMoment().format();

  const dateRange: DateRange = {
    start_date: startDate,
    end_date: dateNow,
  };

  const dateRanges: DateRange[] = [dateRange];

  // DIMENSIONS
  const dimensions: Dimension[] = dimensionsList.map(dimension => {
    return { name: dimension };
  });

  // DIMENSION FILTERS
  const dimensionFilter: DimensionFilter = {
    dimension_name: 'DATAMART_ID',
    operator: 'EXACT',
    expressions: [datamartId],
  };

  const dimensionsFilterClauses: DimensionFilterClause = {
    operator: 'OR',
    filters: [dimensionFilter],
  };

  // METRICS
  const metrics: Metric[] = metricsList.map(metric => {
    return { expression: metric };
  });

  const report: ReportRequestBody = {
    date_ranges: dateRanges,
    dimensions: dimensions,
    dimension_filter_clauses: dimensionsFilterClauses,
    metrics: metrics,
  };
  return report;
}
