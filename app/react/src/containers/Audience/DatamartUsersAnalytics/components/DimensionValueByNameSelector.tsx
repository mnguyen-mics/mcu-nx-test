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

interface AdditionalOptions {
  dimensionName: string,
  from: McsMoment,
  to: McsMoment
}

class DimensionFetcher implements ResourceFetcher<NamedSelectable> {
  @lazyInject(TYPES.IDatamartUsersAnalyticsService)
  private _datamartUsersAnalyticsService: IDatamartUsersAnalyticsService;

  getForKeyword(options: GetOptions & AdditionalOptions): Promise<NamedSelectable[]> {
    const filter: DimensionFilter = {
      dimension_name: options.dimensionName,
      operator: 'LIKE' as DimensionFilterOperator,
      expressions: [options.keywords],
      case_sensitive: false
    }
    const clause: DimensionFilterClause = {
      operator: 'OR' as BooleanOperator,
      filters: [filter]
    }
    return this._datamartUsersAnalyticsService.getAnalytics(options.datamart_id, [], options.from, options.to, [options.dimensionName as DatamartUsersAnalyticsDimension], clause).then((reportView: ReportViewResponse) => {
      return reportView.data.report_view.rows.map(x => {
        return { id: x[0].toString(), name: x[0].toString() }
      }).sort((a, b) => a.name.localeCompare(b.name))
    })
  }
}

const DimensionValueByNameSelector = ResourceByKeywordSelector<NamedSelectable, AdditionalOptions>(displayNameAdapted<NamedSelectable>(),
  new DimensionFetcher(),
  `Search by keyword`)
export default DimensionValueByNameSelector;