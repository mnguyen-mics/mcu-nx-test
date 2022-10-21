import React from 'react';
import { BASE_CHART_HEIGHT } from '../../../../components/Charts/domain';
import { Select } from 'antd';
import moment from 'moment';
import { AbstractSource } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/datasource_tree';
import {
  AreaChartOptions,
  BarChartOptions,
  PieChartOptions,
  RadarChartOptions,
} from '@mediarithmics-private/advanced-components/lib/services/ChartDatasetService';

export type chartType = 'radar' | 'bar' | 'table' | 'metric' | 'pie' | 'area';
import { WrappedAbstractDataset } from '../QueryResultRenderer';
import { ChartType } from '@mediarithmics-private/advanced-components';

export interface QuickOption {
  key: string;
  value: string;
  label: string;
  className?: string;
}

export interface QuickOptionsSelector {
  title: string;
  options: QuickOption[];
  selectedValue?: string;
}

export function getLegend(value?: string) {
  const key = 'legend';
  switch (value) {
    case 'no_legend':
      return {
        [key]: {
          enabled: false,
        },
      };
    case 'legend_bottom':
      return {
        [key]: {
          enabled: true,
          position: 'bottom',
        },
      };
    case 'legend_right':
      return {
        [key]: {
          enabled: true,
          position: 'right',
        },
      };
    default:
      return undefined;
  }
  return undefined;
}

export function getSelectLegend(options: { [key: string]: any }) {
  if (options) {
    if (options.enabled) {
      switch (options.position) {
        case 'right':
          return 'legend_right';
        case 'bottom':
          return 'legend_bottom';
        default:
          return 'no_legend';
      }
    } else {
      return 'no_legend';
    }
  } else return 'no_legend';
}

export function getChartOption(chartType: ChartType, key: string, value?: string) {
  switch (key) {
    case 'legend':
      return getLegend(value);
    case 'format':
      return {
        format: value,
      };
    case 'pie':
      return {
        innerRadius: value === 'donut',
      };
    case 'bar':
    case 'bars':
    case 'type':
      return chartType === 'bars'
        ? {
            type: value,
          }
        : {};
    case 'date_format':
      return {
        date_options: {
          format: value,
        },
      };
    case 'area':
      return chartType === 'area'
        ? {
            type: value,
          }
        : {};
  }
  return undefined;
}

export function formatDate(str: string, format?: string, toUtc?: boolean) {
  if (!!format) {
    let formatted = !!toUtc ? moment.utc(str).utc().format(format) : moment(str).format(format);
    if (formatted === 'Invalid date') {
      const STRICT = true;
      formatted = moment.utc(str, 'x', STRICT).format(format);
      if (formatted === 'Invalid date') {
        throw Error(`Date ${str} is not formatted correctly`);
      } else {
        return formatted;
      }
    } else {
      return formatted;
    }
  } else {
    return str;
  }
}

/**
 * Fixed chart props
 * @param chartType
 * @returns
 */
export function getBaseChartProps(
  chartType: ChartType,
  hasLegend: boolean,
): BarChartOptions | RadarChartOptions | PieChartOptions | AreaChartOptions | undefined {
  switch (chartType) {
    case 'bars':
      return {
        xKey: 'key',
        yKeys: [
          {
            key: 'count',
            message: 'count',
          },
        ],
        legend: {
          enabled: hasLegend,
        },
      } as BarChartOptions;
    case 'radar':
      return {
        height: BASE_CHART_HEIGHT,
        xKey: 'xKey',
        yKeys: [
          {
            key: 'value',
            message: 'count',
          },
        ],
        dataLabels: {
          enabled: false,
        },
      } as RadarChartOptions;
    case 'pie':
      return {
        xKey: '',
        yKeys: [],
        height: BASE_CHART_HEIGHT,
        innerRadius: false,
        dataLabels: {
          enabled: true,
        },
        ledgend: hasLegend,
      } as PieChartOptions;
    case 'area':
      return {
        xKey: { key: 'key', mode: 'DEFAULT' },
        yKeys: [
          {
            key: 'count',
            message: 'count',
          },
        ],
        legend: {
          enabled: hasLegend,
        },
      } as AreaChartOptions;
    default:
      return {
        xKey: '',
        yKeys: [],
      };
  }
}

export function getQuickOptionsForChartType(
  chartType: ChartType,
  hasDateHistogram: boolean,
  selectedValues?: { [key: string]: any },
) {
  const legendOptions: QuickOptionsSelector = {
    title: 'legend',
    options: [
      {
        key: 'legend_bottom',
        value: 'legend_bottom',
        label: 'Bottom',
      },
      {
        key: 'legend_right',
        value: 'legend_right',
        label: 'Right',
      },
      {
        key: 'no_legend',
        value: 'no_legend',
        label: 'No legend',
      },
    ],
  };

  const formatOptions: QuickOptionsSelector = {
    title: 'format',
    options: [
      {
        key: 'count',
        value: 'count',
        label: 'Count',
        className: 'mcs-chartOptions_count',
      },
      {
        key: 'percentage',
        value: 'percentage',
        label: 'Percentage',
        className: 'mcs-chartOptions_percentage',
      },
      {
        key: 'index',
        value: 'index',
        label: 'Index',
        className: 'mcs-chartOptions_index',
      },
    ],
  };

  const pieOptions: QuickOptionsSelector = {
    title: 'pie',
    options: [
      {
        key: 'pie',
        value: 'pie',
        label: 'Pie',
      },
      {
        key: 'donut',
        value: 'donut',
        label: 'Donut',
      },
    ],
  };

  const barOptions: QuickOptionsSelector = {
    title: 'bar',
    options: [
      {
        key: 'bar',
        value: 'bar',
        label: 'Bar',
      },
      {
        key: 'column',
        value: 'column',
        label: 'Column',
      },
    ],
  };

  const areaOptions: QuickOptionsSelector = {
    title: 'area',
    options: [
      {
        key: 'area',
        value: 'area',
        label: 'Area',
      },
      {
        key: 'line',
        value: 'line',
        label: 'Line',
      },
    ],
  };

  const formatDateOptions: QuickOptionsSelector = {
    title: 'date_format',
    options: [
      { key: 'YYYY-MM-DD hh:mm', value: 'YYYY-MM-DD hh:mm', label: 'YYYY-MM-DD hh:mm' },
      { key: 'YYYY-MM-DD', value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
      { key: 'YYYY-MM', value: 'YYYY-MM', label: 'YYYY-MM' },
    ],
  };

  const result = [];
  if (hasDateHistogram) {
    result.push(formatDateOptions);
  }

  if (selectedValues?.legend) {
    let legendValue;
    if (!selectedValues.legend.enabled) {
      legendValue = 'no_legend';
    } else {
      switch (selectedValues.legend.position) {
        case 'right':
          legendValue = 'legend_right';
          break;
        case 'bottom':
          legendValue = 'legend_bottom';
          break;
        default:
          break;
      }
    }

    legendOptions.selectedValue = legendValue;
  }
  if (selectedValues?.format) {
    formatOptions.selectedValue = selectedValues.format;
  }
  if (selectedValues?.date_format) {
    formatDateOptions.selectedValue = selectedValues.date_format;
  }
  if (selectedValues?.type === 'bar' || selectedValues?.type === 'column') {
    barOptions.selectedValue = selectedValues.type;
  }
  if (selectedValues?.pie) {
    pieOptions.selectedValue = selectedValues.pie;
  }

  switch (chartType) {
    case 'bars':
      return result.concat([legendOptions, formatOptions, barOptions]);
    case 'pie':
      return result.concat([legendOptions, pieOptions]);
    case 'radar':
      return result.concat([legendOptions, formatOptions]);
    case 'metric':
      return result.concat([formatOptions]);
    case 'area':
      return result.concat([legendOptions, formatOptions, areaOptions]);
  }
  return [];
}

function renderQuickOptionsSelector(
  quickOptionSelector: QuickOptionsSelector,
  onChangeQuickOption: (title: string, value: string) => void,
  selectedValue?: string,
) {
  const onChange = (value: string) => onChangeQuickOption(quickOptionSelector.title, value);
  return (
    <Select
      className='mcs-otqlChart_items_quick_option'
      key={quickOptionSelector.title}
      onChange={onChange}
      defaultValue={selectedValue || quickOptionSelector.options[0].value}
      bordered={false}
    >
      {quickOptionSelector.options.map(option => {
        return (
          <Select.Option
            key={option.key}
            title={option.key}
            value={option.value}
            className={option.className}
          >
            {option.label}
          </Select.Option>
        );
      })}
    </Select>
  );
}

export const renderQuickOptions = (
  selectedChart: ChartType,
  onChangeQuickOption: (title: string, value: string) => void,
  hasDateHistogram: boolean,
  selectedValues: { [key: string]: string },
) => {
  const quickOptions = getQuickOptionsForChartType(selectedChart, hasDateHistogram, selectedValues);
  return (
    <div>
      {quickOptions.map(quickOptionSelector => {
        const selectedValue = quickOptionSelector.selectedValue;
        return renderQuickOptionsSelector(quickOptionSelector, onChangeQuickOption, selectedValue);
      })}
    </div>
  );
};

const hasPercentageTransformation = (quickOptions: any) => {
  return quickOptions.format === 'percentage';
};

const hasDateFormatTransformation = (quickOptions: any) => {
  return quickOptions.date_options && quickOptions.date_options.format !== undefined;
};

export const getChartDataset = (
  dataset: WrappedAbstractDataset | AbstractSource,
  isDataset: boolean,
  chartProps: any,
) => {
  const childProperty = isDataset ? 'children' : 'sources';
  let source: any = {
    ...dataset,
    type: (dataset as AbstractSource)?.type || 'otql',
  };

  if (hasPercentageTransformation(chartProps)) {
    source = {
      type: 'to-percentages',
      [childProperty]: [source],
    };
  }

  if (hasDateFormatTransformation(chartProps)) {
    source = {
      type: 'format-dates',
      date_options: chartProps.date_options,
      [childProperty]: [source],
    };
  }

  return source;
};
