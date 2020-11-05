import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { ResourceFetcher, GetOptions, ResourceByKeywordSelector } from './helpers/utils'
import { IDatamartUsersAnalyticsService } from '../../../../services/DatamartUsersAnalyticsService';
import { DatamartUsersAnalyticsDimension } from '../../../../utils/DatamartUsersAnalyticsReportHelper';
import { DimensionFilter, DimensionFilterOperator, DimensionFilterClause, BooleanOperator } from '../../../../models/ReportRequestBody';
import { ReportViewResponse } from '../../../../services/ReportService';
import { displayNameAdapted } from '../../Common/DimensionNameDisplay';
import McsMoment from '@mediarithmics-private/mcs-components-library/lib/utils/McsMoment';

interface NamedSelectable {
  id: string,
  name: string
}

class DimensionFetcher implements ResourceFetcher<NamedSelectable> {
  @lazyInject(TYPES.IDatamartUsersAnalyticsService)
  private _datamartUsersAnalyticsService: IDatamartUsersAnalyticsService;

  private dimension: string
  private from: McsMoment
  private to: McsMoment

  constructor(dimension: string, from: McsMoment, to: McsMoment) {
    this.dimension = dimension;
    this.from = from;
    this.to = to;
  }

  getForKeyword(options: GetOptions): Promise<NamedSelectable[]> {
    const filter: DimensionFilter = {
      dimension_name: this.dimension,
      operator: 'LIKE' as DimensionFilterOperator,
      expressions: [options.keywords],
      case_sensitive: false
    }
    const clause: DimensionFilterClause = {
      operator: 'OR' as BooleanOperator,
      filters: [filter]
    }
    return this._datamartUsersAnalyticsService.getAnalytics(options.datamart_id, [], this.from, this.to, [this.dimension as DatamartUsersAnalyticsDimension], clause).then((reportView: ReportViewResponse) => {
      return reportView.data.report_view.rows.map(x => {
        return { id: x[0].toString(), name: x[0].toString() }
      })
    })
  }
}

const DimensionValueByNameSelector = (dimensionName: string, from: McsMoment, to: McsMoment) => ResourceByKeywordSelector(displayNameAdapted<NamedSelectable>(),
  new DimensionFetcher(dimensionName, from, to),
  `Search ${dimensionName} by name`)

export default DimensionValueByNameSelector;