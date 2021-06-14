import * as React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

require('highcharts/highcharts-more')(Highcharts);

interface RadarChartProps {
  options: Highcharts.Options;
}

type Props = RadarChartProps;

class RadarChart extends React.Component<Props> {
  render() {
    const { options } = this.props;
    return <HighchartsReact highcharts={Highcharts} options={options} style={{ width: '100%' }} />;
  }
}

export default RadarChart;
