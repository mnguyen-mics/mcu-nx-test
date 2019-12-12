import * as React from 'react';
// import SessionsByCountry from './components/SessionsByCountry';
// import SessionsByDevice from './components/SessionsByDevice';
// import UsersByTimeOfDay from './components/UsersByTimeOfDay';
import { Responsive, WidthProvider } from 'react-grid-layout';
// import ActiveUsers from './components/ActiveUsers';
// import MultipleData from './components/MultipleData';
import _ from 'lodash';
import ApiQueryWrapper from './components/ApiQueryWrapper';
import CardFlex from '../Dashboard/Components/CardFlex';

const ResponsiveGridLayout = WidthProvider(Responsive);

const dashboardJsonConfig = [
  // {
  //   title: 'Test toto',
  //   query: {
  //     type: 'api',
  //     playload: 'this the playload'
  //   },
  //   layout: {
  //     "i": "1",
  //     "h": 4,
  //     "static": false,
  //     "w": 6,
  //     "x": 6,
  //     "y": 0
  //   },
  //   charts: [
  //     {
  //       type: 'LINE',
  //       options: {
  //         height: 300,
  //         "colors": ["#5c94d1", "#5eabd2", "#95cdcb"],
  //         credits: {
  //           enabled: false
  //         },
  //         chart: {
  //           reflow: true
  //         },
  //         xAxis: {
  //           //categories: this.getXAxisValues(normalizedData, 'day'),
  //           title: undefined
  //         },
  //         yAxis: {
  //           title: undefined
  //         },
  //         legend: {
  //           align: 'right',
  //           layout: 'vertical',
  //           verticalAlign: 'middle',
  //           itemMarginBottom: 25
  //         }
  //       },
  //       yKey: 'device_name',
  //       metricName: 'user_point_count'
  //     }
  //   ]
  // },
  {
    title: 'Session by device',
    query: {
      type: 'api',
      playload: 'this the playload'
    },
    layout: {
      "i": "0",
      "h": 4,
      "static": false,
      "w": 6,
      "x": 0,
      "y": 0
    },
    charts: [
      {
        type: 'PIE',
        options: {
          "colors": ["#5c94d1", "#5eabd2", "#95cdcb"],
          "chart": {
            "plotShadow": false,
            "type": "pie",
            "animation": false,
            "height": 350,
            "style": {
              "fontFamily": ""
            }
          },
          "title": "Object",
          "credits": {
            enabled: false
          },
          "plotOptions": {
            "pie": {
              "dataLabels": {
                "enabled": false,
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
          }
        },
        yKey: 'device_name',
        metricName: 'user_point_count'
      },
      {
        type: 'COUNT',
        icons: ["laptop", "smartphone", "tablet"],
        options: {
          "colors": ["#5c94d1", "#5eabd2", "#95cdcb"]
        },
        yKey: 'device_name',
        metricName: 'user_point_count'
      }
    ]
  }
];


export default class DatamartAnalysisContent extends React.Component {

  generateDOM() {
    return _.map(dashboardJsonConfig, (comp: any, i: any) => {
      if (comp.query.type === "api") {
        return (
          <CardFlex
            title={comp.title}
            key={i.toString()}
            className={comp.layout.static ? 'static' : ''}
            style={{ backgroundColor: '#fff' }}
          >
            <ApiQueryWrapper query={comp.query.playload} charts={comp.charts} />
          </CardFlex>
        );
      }
      return (<div>No chart to display</div>)
    });
  }

  render() {
    const layouts = dashboardJsonConfig.map((cl, i) => ({ ...cl.layout, i: i.toString() }));
    return (
      <ResponsiveGridLayout className="layout"
        layouts={{ lg: layouts }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        isDraggable={false}
        isResizable={false}
        measureBeforeMount={false}>
        {/* <div key="0"> <SessionsByCountry /></div>
        <div key="1"><SessionsByDevice /></div>
        <div key="2"><UsersByTimeOfDay /></div>
        <div key="3"><ActiveUsers /></div>
        <div key="4"><MultipleData /></div> */}
        {
          this.generateDOM()
        }
      </ResponsiveGridLayout>
    );
  }
}
