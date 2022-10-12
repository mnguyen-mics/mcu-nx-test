import {
  ActivitiesAnalyticsDimension,
  ActivitiesAnalyticsMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/ActivitiesAnalyticsReportHelper';

const activitiesAnalyticsMetricArray: ActivitiesAnalyticsMetric[] = [
  'users',
  'sessions',
  'avg_session_duration',
  'avg_number_of_user_events',
  'conversion_rate',
  'avg_number_of_transactions_per_user_point',
  'number_of_transactions',
  'avg_transaction_amount',
  'avg_revenue_per_user_point',
  'revenue',
];

const activitiesAnalyticsDimensionArray: ActivitiesAnalyticsDimension[] = [
  'date_yyyy_mm_dd',
  'channel_id',
  'channel_name',
  'device_form_factor',
  'device_browser_family',
  'device_os_family',
  'origin_source',
  'origin_channel',
  'resource_name',
  'number_of_confirmed_transactions',
  'event_type',
];

export { activitiesAnalyticsMetricArray, activitiesAnalyticsDimensionArray };
