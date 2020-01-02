import * as React from 'react';
import LineChart from './charts/LineChart';
import PieChart from './charts/PieChart';
import _ from 'lodash';
import { CounterDashboard } from '../../../../components/Counter';
import { CounterProps } from '../../../../components/Counter/Counter';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { ReportView } from '../../../../models/ReportView';import GenericWorldMap from './charts/GenericWorldMap';
import Highcharts from 'highcharts/highmaps';
import GenericStackedBar from './charts/GenericStackedBar';
import { Tabs } from 'antd';
import CardFlex from '../../Dashboard/Components/CardFlex';

export interface FormatDataProps {
  apiResponse: ReportView;
  charts: Chart[];
}

export interface Chart {
  type: string;
  options: Highcharts.Options;
  xKey?: string;
  yKey: string;
  metricName: string;
  icons?: string[];
  counterFormatedProps?: CounterProps[];
  dataset?: any;
}


type Dataset = Array<{ [key: string]: string | number | Date | undefined }>;

class FormatData extends React.Component<FormatDataProps, {}> {

  formatSeriesForChart = (chart: Chart, dataset: Dataset): Highcharts.SeriesOptionsType[] => {
    switch (chart.type) {
      case 'PIE':
        return [
          {
            type: 'pie',
            name: '',
            innerSize: '65%',
            data: dataset.reduce((acc: any, d) => {
              const found = acc.find((a: any) => a.name === d[chart.yKey]);
              const value = d[chart.metricName]; // the element in data property
              if (!found) {
                acc.push({ name: d[chart.yKey], y: value, color: chart.options.colors ? chart.options.colors[0] : undefined }) // not found, so need to add data property
                if (chart.options.colors && chart.options.colors.length > 0) chart.options.colors.splice(0, 1);
              }
              else {
                found.y += value // if found, that means data property exists, so just push new element to found.data.
              }
              return acc;
            }, [])
          }
        ];
      case 'LINE':
        return dataset.reduce((acc: any, d) => {
          const found = acc.find((a: any) => a.name === d[chart.yKey]);
          const value = d[chart.metricName]; // the element in data property
          if (!found) {
            acc.push({ 'name': d[chart.yKey], data: [value], type: 'line', color: chart.options.colors ? chart.options.colors[0] : undefined }) // not found, so need to add data property
            if (chart.options.colors && chart.options.colors.length > 0) chart.options.colors.splice(0, 1);
          }
          else {
            found.data.push(value) // if found, that means data property exists, so just push new element to found.data.
          }
          return acc;
        }, []);
      case 'COUNT':
        return dataset.reduce((acc: any, d: any) => {
          const found = acc.find((a: any) => a.title === d[chart.yKey]);
          //const value = { name: d.name, val: d.value };
          const value = d[chart.metricName]; // the element in data property
          if (!found) {
            acc.push({ 'title': d[chart.yKey], 'iconType': chart.icons[0], value, "unit": "%", "iconStyle": { color: chart.options.colors ? chart.options.colors[0] : undefined }, loading: false }) // not found, so need to add data property
            if (chart.options.colors && chart.options.colors.length > 0) chart.options.colors.splice(0, 1);
            chart.icons.splice(0, 1);
          }
          else {
            found.value += value // if found, that means data property exists, so just push new element to found.data.
          }
          return acc;
        }, []);
      case 'WORLDMAP':
        return dataset.reduce((acc: any, d) => {
          const found = acc.find((a: any) => a.code3 === d[chart.yKey]);
          const value = d[chart.metricName]; // the element in data property
          if (!found) {
            acc.push({ 
              code3: d[chart.yKey],
              value: d[chart.metricName], 
            }) // not found, so need to add data property
          }
          else {
            found.value += value // if found, that means data property exists, so just push new element to found.data.
          }
          return acc;
          }, []);
        case 'STACKEDBAR':
            return dataset.reduce((acc: any, d) => {
              if (acc.length === 0) {
                acc.push({
                  type: 'bar',
                  data: [d[chart.metricName]]
                });
              } else {
                acc[0].data.push(d[chart.metricName]);
              }
              return acc;
            }, []);
      default:
        return [];
    }
  }

  formatSeriesForCounters = (chart: Chart, dataset: Dataset): CounterProps[] => {
    return dataset.reduce((acc: any, d) => {
      const found = acc.find((a: any) => a.title === d[chart.yKey]);
      const value = d[chart.metricName]; // the element in data property
      if (!found) {
        acc.push({ 'title': d[chart.yKey], 'iconType': chart.icons ? chart.icons[0] : undefined, value, "unit": "%", "iconStyle": { color: chart.options.colors ? chart.options.colors[0] : undefined } }) // not found, so need to add data property
        if (chart.options.colors && chart.options.colors.length > 0) chart.options.colors.splice(0, 1);
        if (chart.icons && chart.icons.length > 0) chart.icons.splice(0, 1);
      }
      else {
        found.value += value // if found, that means data property exists, so just push new element to found.data.
      }
      return acc;
    }, []);
  }

  getXAxisValues = (dataset: Dataset, xKey: string) => {
    return dataset.map(d => {
      return d[xKey] as string;
    })
  }

  generateComponent = (charts: Chart[], data: any) => {
    return _.map(charts, chart => {

      switch (chart.type) {

        case 'LINE':
          if (!chart.xKey) return null
          chart.options.xAxis = {
            categories: this.getXAxisValues(data, chart.xKey)
          };
          chart.options.series = this.formatSeriesForChart(chart, data);
          return (
            <LineChart
              options={chart.options}
            />
          )
        case 'PIE':
          chart.options.series = this.formatSeriesForChart(chart, data);
          return (
            <PieChart options={chart.options} />
          )
        case 'COUNT':
          chart.counterFormatedProps = this.formatSeriesForCounters(chart, data);
          return (<CounterDashboard counters={chart.counterFormatedProps} />)
        case 'WORLDMAP':
          return (
            <GenericWorldMap options={chart.options} dataset={this.formatSeriesForChart(chart, data)} />
          )
        case 'STACKEDBAR':
          if (!chart.xKey) return null
          chart.options.xAxis = {
            categories: this.getXAxisValues(data, chart.xKey)
          };
          chart.options.series = this.formatSeriesForChart(chart, data);
          return (
            <GenericStackedBar options={chart.options} />
          )
        case 'TABS':
          return (
            <CardFlex>
            <Tabs defaultActiveKey="1">
                  <Tabs.TabPane tab="Traffic Channel" key="1">
                    {this.generateComponent(charts, data)}
                  </Tabs.TabPane>
            </Tabs>
          </CardFlex>

          )
        default:
          return null;
      }
    });
  };

  render() {
    const { charts, apiResponse } = this.props;
    const normalizedData = normalizeReportView<{
      device_name: string;
      user_point_count: number;
    }>(apiResponse);

    return (<div>{this.generateComponent(charts, normalizedData)}</div>)
  }
}

export default FormatData;