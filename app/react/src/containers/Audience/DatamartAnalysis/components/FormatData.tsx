import * as React from 'react';
import LineChart from './charts/LineChart';
import _ from 'lodash';

export interface FormatDataProps {
  data: any
  charts: any
}

const normalizedData = [
  {
    "user_point_count": 10,
    "day": "2019-12-02",
    "sync_type": "toto"
  },
  {
    "user_point_count": 15,
    "day": "2019-12-03",
    "sync_type": "toto"
  },
  {
    "user_point_count": 20,
    "day": "2019-12-04",
    "sync_type": "toto"
  },
  {
    "user_point_count": 54,
    "day": "2019-12-02",
    "sync_type": "tata"
  },
  {
    "user_point_count": 23,
    "day": "2019-12-03",
    "sync_type": "tata"
  },
  {
    "user_point_count": 12,
    "day": "2019-12-04",
    "sync_type": "tata"
  }
];


type Dataset = Array<{ [key: string]: string | number | Date | undefined }>;

class FormatData extends React.Component<FormatDataProps, {}> {


  getXAxisValues = (dataset: Dataset, xKey: string) => {
    return dataset.map(d => {
      return d[xKey] as string;
    })
  }

  formatSeries = (dataset: Dataset, yKey: string, metric: string) => {
    return dataset.reduce((acc: any, d: any) => {
      const found = acc.find((a: any) => a.name === d[yKey]);
      //const value = { name: d.name, val: d.value };
      const value = d[metric]; // the element in data property
      if (!found) {
        acc.push({'name': d[yKey], data: [value], type: 'line'}) // not found, so need to add data property
      }
      else {
        found.data.push(value) // if found, that means data property exists, so just push new element to found.data.
      }
      return acc;
    }, []);
  }

  options: Highcharts.Options = {
    title: {
      text: undefined,
    },
    credits: {
      enabled: false
    },
    chart: {
      reflow: true
    },
    xAxis: {
      categories: this.getXAxisValues(normalizedData, 'day'),
      title: undefined
    },
    yAxis: {
      title: undefined
    },
    legend: {
      align: 'right',
      layout: 'vertical',
      verticalAlign: 'middle',
      itemMarginBottom: 25
    },
    series: this.formatSeries(normalizedData, 'sync_type', 'user_point_count')
  };

  generateComponent = (charts: any) => {
    return _.map(charts, chart => {
      switch (chart.type) {
        case 'LINE':
          return (
            <LineChart
              options={this.options}
            />
          )

        default:
          return null;
      }
    });
  };
  render() {
    const { charts } = this.props;
    return (<div>{this.generateComponent(charts)}</div>)
  }
}

export default FormatData;