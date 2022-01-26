import React from 'react';
import { BASE_CHART_HEIGHT } from '../../../../components/Charts/domain';
import { Select } from 'antd';

export type chartType = 'radar' | 'bar' | 'table' | 'metric' | 'pie';

export interface QuickOption {
  key: string;
  value: string;
  label: string;
}

export interface QuickOptionsSelector {
  title: string;
  options: QuickOption[];
}

export function getLegend(_chartType: chartType, value: string) {
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
  }
  return {};
}

export function getOption(_chartType: chartType, key: string, value: string) {
  switch (key) {
    case 'legend':
      return getLegend(_chartType, value);
    case 'format':
      return {
        format: value,
      };
    case 'pie':
      return {
        innerRadius: value === 'donut',
      };
    case 'bar':
      return _chartType === 'bar'
        ? {
            type: value,
          }
        : {};
  }
  return {};
}

export function getBaseChartProps(_chartType: chartType) {
  switch (_chartType) {
    case 'bar':
      return {
        xKey: 'key',
        yKeys: [
          {
            key: 'count',
            message: 'count',
          },
        ],
        xAxis: { title: { text: '' } },
        chartOptions: {
          yAxis: { title: { text: '' } },
        },
        colors: ['#00a1df'],
        legend: {
          enabled: true,
        },
      };
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
      };
    case 'pie':
      return {
        height: BASE_CHART_HEIGHT,
        innerRadius: false,
        dataLabels: {
          enabled: true,
        },
      };
  }
  return {};
}

export function getQuickOptionsForChartType(_chartType: chartType) {
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
      },
      {
        key: 'percentage',
        value: 'percentage',
        label: 'Percentage',
      },
      {
        key: 'index',
        value: 'index',
        label: 'Index',
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

  switch (_chartType) {
    case 'bar':
      return [legendOptions, formatOptions, barOptions];
    case 'pie':
      return [legendOptions, pieOptions];
    case 'radar':
      return [legendOptions, formatOptions];
    case 'metric':
      return [formatOptions];
  }
  return [];
}

function renderQuickOptionsSelector(
  quickOptionSelector: QuickOptionsSelector,
  onChangeQuickOption: (title: string, value: string) => void,
) {
  const onChange = (value: string) => onChangeQuickOption(quickOptionSelector.title, value);
  return (
    <Select
      className='mcs-otqlChart_items_quick_option'
      key={quickOptionSelector.title}
      onChange={onChange}
      defaultValue={quickOptionSelector.options[0].value}
      bordered={false}
    >
      {quickOptionSelector.options.map(option => {
        return (
          <Select.Option key={option.key} title={option.key} value={option.value}>
            {option.label}
          </Select.Option>
        );
      })}
    </Select>
  );
}

export const renderQuickOptions = (
  selectedChart: chartType,
  onChangeQuickOption: (title: string, value: string) => void,
) => {
  const quickOptions = getQuickOptionsForChartType(selectedChart);
  return (
    <div>
      {quickOptions.map(quickOptionSelector => {
        return renderQuickOptionsSelector(quickOptionSelector, onChangeQuickOption);
      })}
    </div>
  );
};
