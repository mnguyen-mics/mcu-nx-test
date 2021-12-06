import { DATE_SEARCH_SETTINGS, parseSearch } from '../../utils/LocationSearchHelper';
import { formatMcsDate, McsRange } from '../../utils/McsMoment';
import { FunnelDateRange, FunnelFilter } from '../../models/datamart/UserActivitiesFunnel';
import lodash from 'lodash';
import { BooleanOperator, DimensionFilterOperator } from '../../models/ReportRequestBody';
import cuid from 'cuid';
import { Step } from './TimelineStepBuilder';
import { StepProperties } from './FunnelQueryBuilder';
import { ThemeColorsShape } from '@mediarithmics-private/advanced-components/lib/utils/ThemeColors';

interface FormattedDates {
  from: string;
  to: string;
}

export const extractDatesFromProps = (search: string): FunnelDateRange => {
  const dateFilter: McsRange = parseSearch(search, DATE_SEARCH_SETTINGS);
  const formattedDates: FormattedDates = formatMcsDate(dateFilter, true);
  const timeRange = {
    type: 'DATES',
    start_date: formattedDates.from,
    end_date: formattedDates.to,
  };
  return timeRange;
};

export const shouldUpdateFunnelQueryBuilder = (
  previousFunnelFilter: FunnelFilter[],
  nextFunnelFilter: FunnelFilter[],
): boolean => {
  const nextFilterPruned: FunnelFilter[] = JSON.parse(JSON.stringify(nextFunnelFilter));
  nextFilterPruned.forEach(filter => {
    delete filter.group_by_dimension;
    delete filter.id;
    filter.filter_clause.filters.forEach(f => delete f.id);
  });

  const previousFilterPruned: FunnelFilter[] = JSON.parse(JSON.stringify(previousFunnelFilter));
  previousFilterPruned.forEach(filter => {
    delete filter.group_by_dimension;
    delete filter.id;
    filter.filter_clause.filters.forEach(f => delete f.id);
  });
  return !lodash.isEqual(nextFilterPruned, previousFilterPruned);
};

export const hasEmptyExpressions = (filter: FunnelFilter[]) => {
  return !!filter.find(
    x => !!x.filter_clause.filters.find(y => !y.expressions || y.expressions.length === 0),
  );
};

export const shouldRefetchFunnelData = (
  previousRouteParams: any,
  nextRouteParams: any,
): boolean => {
  const previousFunnelFilter: FunnelFilter[] =
    previousRouteParams.filter.length > 0 ? JSON.parse(previousRouteParams.filter) : [];
  const nextFunnelFilter: FunnelFilter[] =
    nextRouteParams.filter.length > 0 ? JSON.parse(nextRouteParams.filter) : [];
  // We don't want to refetch data if the user has only deselected split by
  previousFunnelFilter.forEach(x => delete x.group_by_dimension);
  previousRouteParams.filter = previousFunnelFilter;
  nextRouteParams.filter = nextFunnelFilter;

  return (
    !lodash.isEqual(previousRouteParams, nextRouteParams) &&
    !hasEmptyExpressions(nextRouteParams.filter)
  );
};

export const getDefaultStep = () => {
  return {
    id: cuid(),
    name: 'Step 1',
    properties: {
      max_days_after_previous_step: 0,
      filter_clause: {
        operator: 'AND' as BooleanOperator,
        filters: [
          {
            dimension_name: 'TYPE',
            not: false,
            operator: 'EXACT' as DimensionFilterOperator,
            expressions: [],
            case_sensitive: false,
          },
        ],
      },
    },
  };
};

export const chartColors: Array<keyof ThemeColorsShape> = [
  'mcs-chart-1',
  'mcs-chart-2',
  'mcs-chart-3',
  'mcs-chart-4',
  'mcs-chart-5',
  'mcs-chart-6',
  'mcs-chart-7',
];

export const checkExpressionsNotEmpty = (funnelFilters: FunnelFilter[]) => {
  let result = true;
  funnelFilters.forEach(funelFilter => {
    funelFilter.filter_clause.filters.forEach(filter => {
      if (filter.expressions.length === 0) result = false;
      else
        filter.expressions.forEach(exp => {
          if (!exp || exp.length === 0 || !exp.trim()) result = false;
        });
    });
  });

  return result;
};

export const extractFilters = (steps: Array<Step<StepProperties>>) => {
  return steps.map(step => {
    return {
      id: step.id,
      name: step.name,
      filter_clause: step.properties.filter_clause,
      max_days_after_previous_step: step.properties.max_days_after_previous_step,
    };
  });
};
