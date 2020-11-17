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
  from: McsMoment,
  to: McsMoment
}

class DimensionFetcher implements ResourceFetcher<NamedSelectable> {
  @lazyInject(TYPES.IDatamartUsersAnalyticsService)
  private _datamartUsersAnalyticsService: IDatamartUsersAnalyticsService;

  private dimensionName: string
  constructor(dimensionName: string) {
    this.dimensionName = dimensionName
  }

  getForKeyword(options: GetOptions & AdditionalOptions): Promise<NamedSelectable[]> {
    const filter: DimensionFilter = {
      dimension_name: this.dimensionName,
      operator: 'LIKE' as DimensionFilterOperator,
      expressions: [options.keywords],
      case_sensitive: false
    }
    const clause: DimensionFilterClause = {
      operator: 'OR' as BooleanOperator,
      filters: [filter]
    }
    return this._datamartUsersAnalyticsService.getAnalytics(options.datamart_id, [], options.from, options.to, [this.dimensionName as DatamartUsersAnalyticsDimension], clause).then((reportView: ReportViewResponse) => {
      return reportView.data.report_view.rows.map(x => {
        return { id: x[0].toString(), name: x[0].toString() }
      }).sort((a, b) => a.name.localeCompare(b.name))
    })
  }
}

const DimensionValueByNameSelector = (dimensionName: string) => ResourceByKeywordSelector<NamedSelectable, AdditionalOptions>(displayNameAdapted<NamedSelectable>(),
  new DimensionFetcher(dimensionName),
  `Search ${dimensionName} by keyword`)

const Category1ByNameSelector = DimensionValueByNameSelector('CATEGORY1');
const Category2ByNameSelector = DimensionValueByNameSelector('CATEGORY2');
const Category3ByNameSelector = DimensionValueByNameSelector('CATEGORY3');
const Category4ByNameSelector = DimensionValueByNameSelector('CATEGORY4');
const BrandByNameSelector = DimensionValueByNameSelector('BRAND');
const ProductIdByNameSelector = DimensionValueByNameSelector('PRODUCT_ID');
const DeviceBrandByNameSelector = DimensionValueByNameSelector('DEVICE_BRAND');
const TypeByNameSelector = DimensionValueByNameSelector('TYPE');
const DeviceCarrierByNameSelector = DimensionValueByNameSelector('DEVICE_CARRIER');
const DeviceModelByNameSelector = DimensionValueByNameSelector('DEVICE_MODEL');

export {
  Category1ByNameSelector,
  Category2ByNameSelector,
  Category3ByNameSelector,
  Category4ByNameSelector,
  BrandByNameSelector,
  ProductIdByNameSelector,
  DeviceBrandByNameSelector,
  TypeByNameSelector,
  DeviceCarrierByNameSelector,
  DeviceModelByNameSelector
};