import * as React from 'react';
import LineChart from '../charts/LineChart';
import _ from 'lodash';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import GenericWorldMap from '../charts/GenericWorldMap';
import GenericStackedBar from '../charts/GenericStackedBar';
import GenericColumn from '../charts/GenericColumn';
import { Tabs, Statistic } from 'antd';
import * as Highcharts from 'highcharts';
import {
  TabItem,
  BarSeriesDataOptions,
  MapSeriesDataOptions,
  Dataset,
  Chart,
  AreaSeriesDataOptions,
  ColumnSeriesDataOptions,
} from '../../../../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { ReportView } from '../../../../../models/ReportView';
import { AREA_OPACITY } from '../../../../../components/Charts/domain';
import moment from 'moment';
import numeral from 'numeral';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../../Helpers/injectThemeColors';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { EmptyRecords } from '../../../../../components';
import { DatamartUsersAnalyticsDimension } from '../../../../../utils/DatamartUsersAnalyticsReportHelper';
import {
  EmptyChart,
  CounterDashboard,
  PieChart,
} from '@mediarithmics-private/mcs-components-library';
import { CounterProps } from '@mediarithmics-private/mcs-components-library/lib/components/counters/counter';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';

const messages = defineMessages({
  noData: {
    id: 'datamartUsersAnalytics.noData',
    defaultMessage: 'No data',
  },
});

export interface FormatDataProps {
  apiResponse: ReportView;
  apiResponseToCompareWith?: ReportView;
  chart: Chart;
  resourceNames: {
    resourceName?: string;
    compareWithSegmentName?: string;
  };
}

type JoinedProp = FormatDataProps & InjectedThemeColorsProps & InjectedIntlProps;

class FormatDataToChart extends React.Component<JoinedProp, {}> {
  getXAxisValues = (dataset: Dataset[], xKey: string) => {
    return dataset.map(d => {
      return d[xKey] as string;
    });
  };

  formatSeriesForChart = (chart: Chart, dataset: Dataset[]) => {
    const dimensionName = chart.dimensions ? chart.dimensions[0] : '';

    switch (chart.type) {
      case 'PIE':
        return [
          {
            type: 'pie',
            name: '',
            innerSize: '65%',
            data: dataset.map((data: Dataset) => {
              return {
                name: data[dimensionName] || 'null',
                y: data[chart.metricNames[0]],
              };
            }),
          },
        ];
      case 'AREA':
        return dataset.reduce((acc: AreaSeriesDataOptions[], d: Dataset) => {
          const found = acc.find((a: AreaSeriesDataOptions) => a.name === d[dimensionName]);
          const value = d[chart.metricNames[0]];
          let xValue;
          if (chart.dimensions) {
            xValue =
              chart.dimensions[chart.dimensions.length - 1] === 'date_yyyy_mm_dd'
                ? this.formatDateToTs(d[chart.dimensions[chart.dimensions.length - 1]] as string)
                : d[chart.dimensions[chart.dimensions.length - 1]];
          }
          if (!found) {
            acc.push({
              visible: acc.length < 4,
              name: d[dimensionName] as string,
              data: [[xValue, value]] as number[][],
              fillOpacity: 0.5,
              fillColor: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1,
                },
                stops: [
                  [
                    0,
                    (Highcharts as any)
                      .Color(chart.options.colors ? chart.options.colors[0] : '#2fa1de')
                      .setOpacity(AREA_OPACITY)
                      .get('rgba'),
                  ],
                  [
                    1,
                    (Highcharts as any)
                      .Color(chart.options.colors ? chart.options.colors[0] : '#2fa1de')
                      .setOpacity(0)
                      .get('rgba'),
                  ],
                ],
              },
              type: 'area',
            });
          } else {
            found.data.push([xValue, value] as number[]);
          }
          return acc;
        }, []);
      case 'WORLD_MAP':
        return dataset.reduce((acc: MapSeriesDataOptions[], d: Dataset) => {
          const found = acc.find((a: MapSeriesDataOptions) => a.code3 === d[dimensionName]);
          const value = d[chart.metricNames[0]];
          if (!found) {
            acc.push({
              code3: d[dimensionName] as string,
              value: d[chart.metricNames[0]] as number,
            });
          } else {
            found.value += value as number;
          }
          return acc;
        }, []);
      case 'STACKED_BAR':
        return dataset.reduce((acc: BarSeriesDataOptions[], d: Dataset) => {
          if (acc.length === 0) {
            acc.push({
              type: 'bar',
              data: [
                {
                  name: '0',
                  y: d[chart.metricNames[0]] as number,
                  count: 0,
                },
              ],
            });
          } else {
            acc[0].data.push({
              name: '0',
              y: d[chart.metricNames[0]] as number,
              count: 0,
            });
          }
          return acc;
        }, []);
      case 'COLUMN':
        return dataset.reduce((acc: ColumnSeriesDataOptions[], d: Dataset) => {
          if (acc.length === 0) {
            acc.push({
              type: 'column',
              data: [d[chart.metricNames[0]]] as number[],
              showInLegend: false,
              name: chart.metricNames[0],
            });
          } else {
            acc[0].data.push(d[chart.metricNames[0]] as number);
          }
          return acc;
        }, []);
      default:
        return [];
    }
  };

  formatSeriesForCounters = (chart: Chart, dataset: Dataset[]): CounterProps[] => {
    const dimensionName = chart.dimensions ? chart.dimensions[0] : '';

    return dataset.reduce((acc: CounterProps[], d: Dataset) => {
      const found = acc.find((a: CounterProps) => a.title === d[dimensionName]);
      const value = d[chart.metricNames[0]];
      if (!found) {
        acc.push({
          title: d[dimensionName],
          iconType: chart.icons ? (chart.icons[0] as McsIconType) : 'data',
          value: value as number,
          unit: '%',
          iconStyle: {
            color: chart.options.colors ? chart.options.colors[0] : undefined,
          },
        });
        if (chart.options.colors && chart.options.colors.length > 0)
          chart.options.colors.splice(0, 1);
        if (chart.icons && chart.icons.length > 0) chart.icons.splice(0, 1);
      } else {
        found.value = (found.value as number) + (value as number);
      }
      return acc;
    }, []);
  };

  formatDateToTs = (date: string) => {
    return moment(date).seconds(0).hours(0).milliseconds(0).minutes(0).valueOf();
  };

  generateCharElements = (
    chart: Chart,
    data: Dataset[],
    dataToCompareWith?: Dataset[],
  ): React.ReactNode => {
    const { colors } = this.props;
    const dimensionName = chart.dimensions ? chart.dimensions[0] : '';

    switch (chart.type) {
      case 'AREA':
        if (!chart.dimensions || chart.dimensions.length === 0) return null;
        chart.options.series = this.formatSeriesForChart(
          chart,
          data,
        ) as Highcharts.SeriesOptionsType[];
        return <LineChart options={chart.options} />;
      case 'PIE':
        chart.options.series = this.formatSeriesForChart(
          chart,
          data,
        ) as Highcharts.SeriesOptionsType[];
        return <PieChart options={chart.options} />;
      case 'COUNT':
        chart.counterFormatedProps = this.formatSeriesForCounters(chart, data);
        return <CounterDashboard counters={chart.counterFormatedProps} />;
      case 'WORLD_MAP':
        return (
          <GenericWorldMap
            options={chart.options}
            dataset={this.formatSeriesForChart(chart, data) as MapSeriesDataOptions[]}
          />
        );
      case 'STACKED_BAR':
        if (!chart.dimensions) return null;
        chart.options.series = this.formatSeriesForChart(
          chart,
          data,
        ) as Highcharts.SeriesMapOptions[];
        return <GenericStackedBar options={chart.options} />;
      case 'COLUMN':
        if (!chart.dimensions) return null;
        chart.options.series = this.formatSeriesForChart(
          chart,
          data,
        ) as Highcharts.SeriesMapOptions[];
        chart.options.xAxis = {
          categories: this.getXAxisValues(data, dimensionName),
        };

        return <GenericColumn options={chart.options} />;
      case 'TABS':
        return (
          <Tabs key={0}>
            {_.map(chart.tabs, (tab: TabItem, e: number) => {
              return (
                <Tabs.TabPane tab={tab.title} key={e.toString()}>
                  {this.generateCharElements(tab, data, dataToCompareWith)}
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        );
      case 'SINGLE_STAT':
        let statValue;
        const apiMetricValue = dataToCompareWith
          ? dataToCompareWith[0][chart.metricNames[0]] === null ||
            dataToCompareWith[0][chart.metricNames[0]] === 'NaN'
            ? 0
            : dataToCompareWith[0][chart.metricNames[0]]
          : data[0][chart.metricNames[0]] === null || data[0][chart.metricNames[0]] === 'NaN'
          ? 0
          : data[0][chart.metricNames[0]];

        if (chart.unit === 'time') {
          statValue = moment.duration(apiMetricValue, 'second').format('h[hr] m[min] s[s]');
        } else if (chart.unit === '%') {
          statValue = numeral((apiMetricValue as number) * 100).format('0.00');
        } else if (chart.unit === '€') {
          statValue = numeral(apiMetricValue).format('0.00a');
        } else {
          statValue = numeral(apiMetricValue as number).format('0.00');
        }
        const originalValue = data[0][chart.metricNames[0]];
        const newValue = dataToCompareWith ? dataToCompareWith[0][chart.metricNames[0]] : undefined;

        let trend;
        if (dataToCompareWith) {
          trend =
            (((originalValue as number) - (newValue as number)) / (originalValue as number)) * 100;
          if (isNaN(trend)) {
            trend = undefined;
          }
        } else trend = undefined;

        return (
          <div className='mcs-metricCounter'>
            <div className='mcs-metricCounter_title'>
              {chart.options.title && chart.options.title.text}
            </div>
            <div className='mcs-metricCounter_result'>
              <Statistic
                className={'mcs-datamartUsersAnalytics_charts_singleStat'}
                value={statValue}
                precision={chart.unit !== 'number' ? 2 : undefined}
                suffix={chart.unit !== 'time' && chart.unit !== 'number' ? chart.unit : undefined}
              />

              {trend && (
                <Statistic
                  className={'mcs-datamartUsersAnalytics_charts_trend'}
                  value={numeral(Math.abs(trend)).format('0.00')}
                  precision={2}
                  valueStyle={{
                    color: Math.sign(trend) > -1 ? colors['mcs-error'] : colors['mcs-success'],
                  }}
                  prefix={Math.sign(trend) > -1 ? <CaretDownOutlined /> : <CaretUpOutlined />}
                  suffix='%'
                />
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  getEmptyDataComponent(chartType: string, message: string) {
    return chartType !== 'SINGLE_STAT' ? (
      <EmptyChart title={message} icon='warning' />
    ) : (
      <EmptyRecords message={message} />
    );
  }

  areAnalyticsReady = (items: any[]) => {
    const isItemNull = items[0] && items[0][0] === null;
    const isItemNaN = items[0] && items[0][0] === 'NaN';
    const isReady = !(isItemNull || isItemNaN);
    return isReady;
  };

  shouldDisplayData = () => {
    const { apiResponse, apiResponseToCompareWith } = this.props;
    return (
      apiResponse &&
      (apiResponse.total_items > 0 ||
        (apiResponseToCompareWith && apiResponseToCompareWith.total_items > 0)) &&
      (this.areAnalyticsReady(apiResponse.rows) ||
        (apiResponseToCompareWith && this.areAnalyticsReady(apiResponseToCompareWith.rows)))
    );
  };

  addSegmentNameToReportView = (reportView: ReportView, resourceName?: string) => {
    const newHeaders = ['resource_name'].concat(reportView.columns_headers);
    const newRows = reportView.rows.map(r => [resourceName].concat(r));
    return {
      ...reportView,
      columns_headers: newHeaders,
      rows: newRows,
    };
  };

  getMergedApiResponse = (apiResponse: ReportView, apiResponseToCompareWith?: ReportView) => {
    const { resourceNames } = this.props;
    const newApiResponse = this.addSegmentNameToReportView(apiResponse, resourceNames.resourceName);

    return {
      ...newApiResponse,
      rows: apiResponseToCompareWith
        ? newApiResponse.rows.concat(
            this.addSegmentNameToReportView(
              apiResponseToCompareWith,
              resourceNames.compareWithSegmentName,
            ).rows,
          )
        : newApiResponse.rows,
    };
  };

  getChartVariables = () => {
    const { chart, apiResponse, apiResponseToCompareWith } = this.props;

    if (chart.enhancedManualReportView) {
      const mergedApiResponses = this.getMergedApiResponse(apiResponse, apiResponseToCompareWith);
      const enhancedChartWithDefaultDimension: Chart = {
        ...chart,
        dimensions: chart.dimensions
          ? ['resource_name' as DatamartUsersAnalyticsDimension].concat(chart.dimensions)
          : [],
      };
      return [
        enhancedChartWithDefaultDimension,
        normalizeReportView(mergedApiResponses),
        apiResponseToCompareWith ? normalizeReportView(apiResponseToCompareWith) : undefined,
      ];
    } else {
      return [
        chart,
        normalizeReportView(apiResponse),
        apiResponseToCompareWith ? normalizeReportView(apiResponseToCompareWith) : undefined,
      ];
    }
  };

  render() {
    const { chart, intl } = this.props;

    return this.shouldDisplayData() ? (
      <div>
        {this.generateCharElements(
          this.getChartVariables()[0] as Chart,
          this.getChartVariables()[1] as Dataset[],
          this.getChartVariables()[2] as Dataset[],
        )}
      </div>
    ) : (
      this.getEmptyDataComponent(chart.type, intl.formatMessage(messages.noData))
    );
  }
}

export default compose<FormatDataProps, FormatDataProps>(
  injectThemeColors,
  injectIntl,
)(FormatDataToChart);
