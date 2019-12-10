import * as React from 'react';
import LineChart from './charts/LineChart';
import PieChart from './charts/PieChart';
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
  },
  {
    "user_point_count": 15,
    "day": "2019-12-02",
    "sync_type": "titi"
  },
  {
    "user_point_count": 12,
    "day": "2019-12-03",
    "sync_type": "titi"
  },
  {
    "user_point_count": 8,
    "day": "2019-12-04",
    "sync_type": "titi"
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
  // name: d.key,
  // y: d.value,
  formatSeries2 = (dataset: Dataset, yKey: string, metric: string) => {
    return [
      {
        type: 'pie',
        name: '',
        innerSize: '65%',
        data: dataset.reduce((acc: any, d: any) => {
          const found = acc.find((a: any) => a.name === d[yKey]);
          //const value = { name: d.name, val: d.value };
          const value = d[metric]; // the element in data property
          if (!found) {
            acc.push({'name': d[yKey], y: value }) // not found, so need to add data property
          }
          else {
            found.y += value // if found, that means data property exists, so just push new element to found.data.
          }
          return acc;
        }, []),
      }
    ];
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

  options2 = {
    "chart": {
      "plotShadow": false,
      "type": "pie",
      "animation": false,
      "height": 414,
      "style": {
        "fontFamily": ""
      }
    },
    "title": "Object",
    "colors": ["#5c94d1", "#5eabd2", "#95cdcb"],
    "plotOptions": {
      "pie": {
        "dataLabels": {
          "enabled": true,
          "format": "<b>{point.name}</b>: {point.percentage:.1f} %",
          "style": {
            "color": "rgba(0, 0, 0, 0.65)"
          }
        },
        "startAngle": 0,
        "endAngle": 0,
        "center": [
          "50%",
          "50%"
        ],
        "size": "80%",
        "selected": true
      }
    },
    series: this.formatSeries2(normalizedData, 'sync_type', 'user_point_count')
  }



  generateComponent = (charts: any) => {
    return _.map(charts, chart => {
      switch (chart.type) {
        case 'LINE':
          return (
            <LineChart
              options={this.options}
            />
          )
        case 'PIE':
          return (
            <PieChart options={this.options2} />
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

