import React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import cuid from 'cuid';

export interface LineChartProps {
  options: Highcharts.Options;
}

type Props = LineChartProps;

class LineChart extends React.Component<Props, {}> {
  cuid: string;

  constructor(props: Props) {
    super(props);
    this.cuid = cuid();
  }

  render() {
    const { options } = this.props;

    return <HighchartsReact highcharts={Highcharts} options={options} />;
  }
}

export default LineChart;
