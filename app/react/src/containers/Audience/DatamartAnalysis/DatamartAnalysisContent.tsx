import * as React from 'react';
import SessionsByCountry from './components/SessionsByCountry';
import SessionsByDevice from './components/SessionsByDevice';
import UsersByTimeOfDay from './components/UsersByTimeOfDay';
import { Responsive, WidthProvider } from 'react-grid-layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

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
  }
];
export default class DatamartAnalysisContent extends React.Component {
  render() {
    return (


      <ResponsiveGridLayout className="layout" layouts={{ lg: layout }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        isDraggable={false}
        isResizable={false}
        measureBeforeMount={false}>
        <div key="0"> <SessionsByCountry /></div>
        <div key="1"><SessionsByDevice /></div>
        <div key="2"><UsersByTimeOfDay /></div>
      </ResponsiveGridLayout>

    );
  }
}
