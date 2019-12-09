import * as React from 'react';
import CardFlex from '../../Dashboard/Components/CardFlex';
// import LineChart from './charts/LineChart';

class ActiveUsers extends React.Component {
  render() {
    return (
      <CardFlex title={'Active Users'}>
        {/* <LineChart  dataset={[]} height={300}/> */}
      </CardFlex>);
  }
}

export default ActiveUsers;