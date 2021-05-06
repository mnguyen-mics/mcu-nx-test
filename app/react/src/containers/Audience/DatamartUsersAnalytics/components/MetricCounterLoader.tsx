import * as React from 'react';

export class MetricCounterLoader extends React.Component {
  render() {
    return (
      <div className='mcs-metricCounter'>
        <div className='mcs-metricCounter_title'>
          <i className='mcs-table-cell-loading' />
        </div>
        <div className='mcs-metricCounter_result'>
          <i className='mcs-table-cell-loading-large' />
        </div>
      </div>
    );
  }
}
