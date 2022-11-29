import {
  DateRange,
  Dimension,
  Metric,
  DimensionFilterClause,
  OrderBy,
} from '@mediarithmics-private/advanced-components/lib/models/report/ReportRequestBody';
import { ReportViewResponse } from '@mediarithmics-private/advanced-components/lib/models/report/ReportView';

export interface IAnalyticsService<M, D> {
  getAnalytics: (
    datamartId: string,
    metrics: Array<Metric<M>>,
    dateRanges: DateRange[],
    dimensions?: Array<Dimension<D>>,
    dimensionFilterClauses?: DimensionFilterClause,
    sampling?: number,
    orderBy?: OrderBy,
  ) => Promise<ReportViewResponse>;
}
