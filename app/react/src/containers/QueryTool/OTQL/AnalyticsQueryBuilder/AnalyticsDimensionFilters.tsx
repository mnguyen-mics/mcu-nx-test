import { DimensionFilterOperator } from '@mediarithmics-private/advanced-components/lib/models/report/ReportRequestBody';
import {
  AnalyticsDimension,
  AnalyticsMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/Common';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { Select, Switch } from 'antd';
import cuid from 'cuid';
import * as React from 'react';
import { defineMessages, WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { DimensionFilter, DimensionFilterClause } from '../../../../models/ReportRequestBody';
import { IAnalyticsService } from '../../../../services/AnalyticsService';
import { ReportViewResponse } from '../../../../services/ReportService';
import AnalyticsDimensionValuesMultiSelect from './AnalyticsDimensionValuesMultiSelect';

const Option = Select.Option;

export interface AnalyticsDimensionFiltersProps {
  analyticsService: IAnalyticsService<AnalyticsMetric, AnalyticsDimension>;
  analyticsDimensionArray: AnalyticsDimension[];
  datamartId: string;
  dimensionFilterClause: DimensionFilterClause;
  onAnalyticsDimensionFiltersChange: (dimensionFilterClause: DimensionFilterClause) => void;
  renderMultiSelect: (
    onSelectChange: (value: string | string[]) => void,
    placeholder: string,
    classname: string,
    options?: string[],
    selectedOptions?: string[],
  ) => React.ReactNode;
}

type Props = AnalyticsDimensionFiltersProps & WrappedComponentProps;

interface State {
  dimensionValues: Map<AnalyticsDimension, string[]>;
}

class AnalyticsDimensionFilters extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dimensionValues: new Map(),
    };
  }

  renderDimensionSelect = (dimension: DimensionFilter) => {
    const { analyticsDimensionArray } = this.props;
    const dropdownOptions = analyticsDimensionArray.map(option => {
      return (
        <Option key={option} value={option}>
          {option}
        </Option>
      );
    });

    const onDimensionSelectChange = (value: AnalyticsDimension) => {
      const { dimensionFilterClause, onAnalyticsDimensionFiltersChange } = this.props;
      const updatedFilters = dimensionFilterClause.filters.map(dimensionFilter => {
        if (dimensionFilter.id === dimension.id) {
          return {
            dimension_name: value,
            expressions: [],
            operator: 'EXACT',
          } as DimensionFilter;
        } else return dimensionFilter;
      });
      onAnalyticsDimensionFiltersChange({ ...dimensionFilterClause, filters: updatedFilters });
    };

    return (
      <Select
        showArrow={false}
        className={'mcs-analyticsQueryBuilder_dimensionsInput'}
        dropdownMatchSelectWidth={false}
        onSelect={onDimensionSelectChange}
        value={dimension.dimension_name}
      >
        {dropdownOptions}
      </Select>
    );
  };

  handleNotSwitcherChange = (dimensionFilterId?: string) => () => {
    const { dimensionFilterClause, onAnalyticsDimensionFiltersChange } = this.props;
    const updatedFilters = dimensionFilterClause.filters.map(dimensionFilter => {
      return {
        ...dimensionFilter,
        not: dimensionFilter.id === dimensionFilterId ? !dimensionFilter.not : dimensionFilter.not,
      };
    });
    onAnalyticsDimensionFiltersChange({ ...dimensionFilterClause, filters: updatedFilters });
  };

  renderDimensionValuesMultiSelect = (dimension: DimensionFilter) => {
    const {
      datamartId,
      renderMultiSelect,
      dimensionFilterClause,
      onAnalyticsDimensionFiltersChange,
      analyticsService,
    } = this.props;

    const getDimensionValues = () => {
      const { dimensionValues } = this.state;
      const dimensionName = dimension.dimension_name as AnalyticsDimension;
      if (dimensionValues.has(dimensionName)) return dimensionValues.get(dimensionName);
      else {
        analyticsService
          .getAnalytics(
            datamartId,
            [],
            [{ start_date: 'now-30d', end_date: 'now' }],
            [{ name: dimensionName }],
          )
          .then((reportView: ReportViewResponse) => {
            const options = reportView.data.report_view.rows.map(x => {
              return x[0].toString();
            });
            dimensionValues.set(dimensionName, options);
            this.setState({ dimensionValues: dimensionValues });
          })
          .catch(() => {
            dimensionValues.set(dimensionName, []);
            this.setState({ dimensionValues: dimensionValues });
          });
        return undefined;
      }
    };

    const onDimensionsValuesMultiSelectChange = (value: string[]) => {
      const updatedFilters = dimensionFilterClause.filters.map(dimensionFilter => {
        if (dimensionFilter.id === dimension.id) {
          return {
            ...dimensionFilter,
            expressions: value,
            operator: (value.length > 1 ? 'IN_LIST' : 'EXACT') as DimensionFilterOperator,
          };
        } else dimensionFilter;
        return dimensionFilter;
      });
      onAnalyticsDimensionFiltersChange({ ...dimensionFilterClause, filters: updatedFilters });
    };

    return (
      <AnalyticsDimensionValuesMultiSelect
        dimensionValues={getDimensionValues()}
        dimensionSelectedValues={dimension.expressions}
        onAnalyticsDimensionValuesChange={onDimensionsValuesMultiSelectChange}
        renderMultiSelect={renderMultiSelect}
      />
    );
  };

  removeDimensionFilter = (dimensionFilterId?: string) => () => {
    const { dimensionFilterClause, onAnalyticsDimensionFiltersChange } = this.props;
    const updatedFilters = dimensionFilterClause.filters.filter(
      dimensionFilter => dimensionFilter.id !== dimensionFilterId,
    );
    onAnalyticsDimensionFiltersChange({ ...dimensionFilterClause, filters: updatedFilters });
  };

  renderDimensionFilterOperator = (operator: DimensionFilterOperator) => {
    switch (operator) {
      case 'IN_LIST':
        return 'in';
      default:
      case 'EXACT':
        return 'equals';
    }
  };

  renderDimensionFilters = () => {
    const { intl, dimensionFilterClause } = this.props;

    return dimensionFilterClause.filters.map(dimensionFilter => {
      return (
        <div key={dimensionFilter.id} className='mcs-analyticsQueryBuilder_dimensionFilter'>
          {intl.formatMessage(messages.filterOn)}
          {this.renderDimensionSelect(dimensionFilter)}
          <span className='mcs-analyticsQueryBuilder_switch'>
            <Switch
              defaultChecked={!dimensionFilter.not}
              unCheckedChildren='NOT'
              onChange={this.handleNotSwitcherChange(dimensionFilter.id)}
              className='mcs-analyticsQueryBuilder_switch_btn'
            />
          </span>
          {this.renderDimensionFilterOperator(dimensionFilter.operator)}
          {this.renderDimensionValuesMultiSelect(dimensionFilter)}
          <McsIcon
            type='close'
            onClick={this.removeDimensionFilter(dimensionFilter.id)}
            className='mcs-analyticsQueryBuilder_dimensionFilters_close'
          />
        </div>
      );
    });
  };

  addDimensionFilter = () => {
    const { dimensionFilterClause, onAnalyticsDimensionFiltersChange, analyticsDimensionArray } =
      this.props;
    onAnalyticsDimensionFiltersChange({
      ...dimensionFilterClause,
      filters: [
        ...dimensionFilterClause.filters,
        {
          id: cuid(),
          dimension_name: analyticsDimensionArray[0],
          operator: 'EXACT',
          expressions: [],
        },
      ],
    });
  };

  render() {
    const { intl } = this.props;
    return (
      <div>
        <div>{this.renderDimensionFilters()}</div>
        <div className='mcs-analyticsQueryBuilder_addFilter'>
          <span onClick={this.addDimensionFilter}>{intl.formatMessage(messages.addFilter)}</span>
        </div>
      </div>
    );
  }
}

export default compose<{}, AnalyticsDimensionFiltersProps>(injectIntl)(AnalyticsDimensionFilters);

const messages = defineMessages({
  addFilter: {
    id: 'analyticsQueryBuilder.addFilter',
    defaultMessage: 'Add a filter',
  },
  filterOn: {
    id: 'analyticsQueryBuilder.filterOn',
    defaultMessage: 'Filter on',
  },
});
