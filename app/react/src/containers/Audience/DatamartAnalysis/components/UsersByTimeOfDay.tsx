import * as React from 'react';
import HeatMap from './charts/heatMap';
import CardFlex from '../../Dashboard/Components/CardFlex';

class UsersByTimeOfDay extends React.Component {
  render() {
    return (
      <CardFlex title={'User by time of day'}>
        <HeatMap dataset={[]} height={300} />
      </CardFlex>);
  }
}

export default UsersByTimeOfDay;