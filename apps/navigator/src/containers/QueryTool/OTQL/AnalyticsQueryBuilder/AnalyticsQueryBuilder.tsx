import { Card, Select } from 'antd';
import * as React from 'react';
import { defineMessages, WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { AnalyticsQueryModel } from '../QueryToolTab';
import { Loading, McsDateRangePicker } from '@mediarithmics-private/mcs-components-library';
import McsMoment from '../../../../utils/McsMoment';
import { McsDateRangePickerMessages } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker';
import {
  convertMessageDescriptorToString,
  mcsDateRangePickerMessages,
} from '../../../../IntlMessages';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import {
  Dimension,
  DimensionFilterClause,
  Metric,
} from '@mediarithmics-private/advanced-components/lib/models/report/ReportRequestBody';
import AnalyticsDimensionFilters from './AnalyticsDimensionFilters';
import { IAnalyticsService } from '../../../../services/AnalyticsService';
import {
  AnalyticsDimension,
  AnalyticsMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/Common';

const Option = Select.Option;

export interface AnalyticsQueryBuilderProps {
  analyticsService: IAnalyticsService<AnalyticsMetric, AnalyticsDimension>;
  analyticsDimensionArray: AnalyticsDimension[];
  analyticsMetricArray: AnalyticsMetric[];
  datamartId: string;
  onQueryChange: (query: AnalyticsQueryModel<AnalyticsMetric, AnalyticsDimension>) => void;
  query: AnalyticsQueryModel<AnalyticsMetric, AnalyticsDimension>;
}

type Props = AnalyticsQueryBuilderProps & WrappedComponentProps;

interface State {
  dimensionValues: Map<AnalyticsDimension, string[]>;
}
class AnalyticsQueryBuilder extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dimensionValues: new Map(),
    };
  }

  onDateRangePickerChange = (newValues: McsDateRangeValue): void => {
    const { query, onQueryChange } = this.props;
    query.date_ranges[0] = {
      start_date: newValues.from.value.toLocaleString(),
      end_date: newValues.to.value.toLocaleString(),
    };
    onQueryChange(query);
  };

  onMetricsMultiSelectChange = (value: string | string[]) => {
    const { query, onQueryChange } = this.props;
    const updatedQueryMetrics = (query.metrics = Array.isArray(value)
      ? value.map(val => {
          return {
            expression: val as AnalyticsMetric,
          };
        })
      : [
          {
            expression: value as AnalyticsMetric,
          } as Metric<AnalyticsMetric>,
        ]);
    onQueryChange({ ...query, metrics: updatedQueryMetrics });
  };

  onDimensionsMultiSelectChange = (value: string | string[]) => {
    const { query, onQueryChange } = this.props;
    const updatedQueryDimension = (query.dimensions = Array.isArray(value)
      ? value.map(val => {
          return {
            name: val as AnalyticsDimension,
          } as Dimension<AnalyticsDimension>;
        })
      : [
          {
            name: value as AnalyticsDimension,
          } as Dimension<AnalyticsDimension>,
        ]);
    onQueryChange({ ...query, dimensions: updatedQueryDimension });
  };

  renderMultiSelect = (
    onSelectChange: (value: string | string[]) => void,
    placeholder: string,
    classname: string,
    options?: string[],
    selectedOptions?: string[],
  ) => {
    const dropdownOptions = options?.map(option => {
      return (
        <Option key={option} value={option}>
          {option}
        </Option>
      );
    });
    return (
      <Select
        mode='tags'
        showArrow={false}
        placeholder={placeholder}
        className={classname}
        dropdownMatchSelectWidth={false}
        onChange={onSelectChange}
        dropdownRender={
          !options
            ? (menu: React.ReactElement) => {
                return <Loading isFullScreen={true} />;
              }
            : undefined
        }
        value={selectedOptions}
      >
        {dropdownOptions}
      </Select>
    );
  };

  onAnalyticsDimensionFiltersChange = (dimensionFilterClause: DimensionFilterClause) => {
    const { query, onQueryChange } = this.props;
    onQueryChange({ ...query, dimension_filter_clauses: dimensionFilterClause });
  };

  render() {
    const {
      intl,
      datamartId,
      analyticsService,
      query,
      analyticsMetricArray,
      analyticsDimensionArray,
    } = this.props;

    return (
      <Card className='mcs-analyticsQueryBuilder'>
        <div className='mcs-analyticsQueryBuilder_mainQueryBuilder'>
          {intl.formatMessage(messages.select)}
          {this.renderMultiSelect(
            this.onMetricsMultiSelectChange,
            'Metric',
            'mcs-analyticsQueryBuilder_metricsInput',
            analyticsMetricArray,
            query.metrics.map(metric => metric.expression),
          )}
          {intl.formatMessage(messages.by)}
          {this.renderMultiSelect(
            this.onDimensionsMultiSelectChange,
            'nothing',
            'mcs-analyticsQueryBuilder_dimensionsInput',
            analyticsDimensionArray,
            query.dimensions.map(dimension => dimension.name),
          )}
          {intl.formatMessage(messages.for)}
          <McsDateRangePicker
            values={{
              from: new McsMoment(query.date_ranges[0].start_date),
              to: new McsMoment(query.date_ranges[0].end_date),
            }}
            onChange={this.onDateRangePickerChange}
            messages={
              convertMessageDescriptorToString(
                mcsDateRangePickerMessages,
                this.props.intl,
              ) as McsDateRangePickerMessages
            }
            className='mcs-datePicker_container mcs-analyticsQueryBuilder_datePicker'
          />
        </div>
        <AnalyticsDimensionFilters
          analyticsService={analyticsService}
          analyticsDimensionArray={analyticsDimensionArray}
          datamartId={datamartId}
          dimensionFilterClause={query.dimension_filter_clauses!}
          onAnalyticsDimensionFiltersChange={this.onAnalyticsDimensionFiltersChange}
          renderMultiSelect={this.renderMultiSelect}
        />
      </Card>
    );
  }
}

export default compose<{}, AnalyticsQueryBuilderProps>(injectIntl)(AnalyticsQueryBuilder);

const messages = defineMessages({
  select: {
    id: 'analyticsQueryBuilder.select',
    defaultMessage: 'Select',
  },
  by: {
    id: 'analyticsQueryBuilder.by',
    defaultMessage: 'by',
  },
  for: {
    id: 'analyticsQueryBuilder.for',
    defaultMessage: 'for',
  },
});
