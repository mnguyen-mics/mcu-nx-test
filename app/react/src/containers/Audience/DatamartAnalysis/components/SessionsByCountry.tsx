import * as React from 'react';
import CardFlex from '../../Dashboard/Components/CardFlex';
import StackedBarPlot from '../../../../components/Charts/CategoryBased/StackedBarPlot';
import GenericWorldMap from './charts/GenericWorldMap';

const optionsForChart = {
  xKey: 'xKey',
  yKeys: [{ key: 'yKey', message: '' }],
  colors: ['#5186ec'],
  labelsEnabled: true,
  showTooltip: true,
  type: 'bar'
};
const data = [
  {
    xKey: 'United States',
    yKey: 25
  },
  {
    xKey: 'United Kingdom',
    yKey: 15
  },
  {
    xKey: 'Poland',
    yKey: 12
  },
  {
    xKey: 'France',
    yKey: 6
  },
  {
    xKey: 'Pakistan',
    yKey: 9
  }
]
class SessionsByCountry extends React.Component {
  render() {
    return (
      <CardFlex title={'Session by country'}>
        <GenericWorldMap dataset={[{
          code3: 'USA',
          name: 'United States',
          code: 'US',
          value: 25
        },
        {
          code3: 'FRA',
          name: 'FRANCE',
          code: 'FR',
          value: 15
        },
        {
          code3: 'PAK',
          name: 'Pakistan',
          code: 'PA',
          value: 10
        },
        {
          code3: 'RUS',
          name: 'Russia',
          code: 'RU',
          value: 5
        },
        ]} height={350} legend={true} />
        <StackedBarPlot dataset={data} options={optionsForChart} height={200} />
      </CardFlex>
    );
  }
}

export default SessionsByCountry;