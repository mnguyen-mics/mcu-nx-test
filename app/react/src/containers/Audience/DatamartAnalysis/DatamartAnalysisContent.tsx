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
/* 
var layout = [
  {
    "i": "0",
    "h": 4,
    "static": false,
    "w": 6,
    "x": 0,
    "y": 0
  },
  {
    "i": "1",
    "h": 4,
    "static": false,
    "w": 6,
    "x": 6,
    "y": 0
  },
  {
    "i": "2",
    "h": 3,
    "static": false,
    "w": 6,
    "x": 0,
    "y": 5
  },
  {
    "i": "3",
    "h": 3,
    "static": false,
    "w": 6,
    "x": 6,
    "y": 5
  },
  {
    "i": "4",
    "h": 3,
    "static": false,
    "w": 12,
    "x": 0,
    "y": 8
  }
];
 */
const dashboardJsonConfig = [
  {
    title: 'Test toto',
    query: {
      type: 'api',
      playload: 'this the playload'
    },
    layout:   {
      "i": "0",
      "h": 4,
      "static": false,
      "w": 6,
      "x": 0,
      "y": 0
    },
    charts: [
      {
        type: 'LINE',
        height: 300
      },
      {
        type: 'heatmap'
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
    const layouts = dashboardJsonConfig.map((cl, i) => ({...cl.layout, i: i.toString()}));
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
