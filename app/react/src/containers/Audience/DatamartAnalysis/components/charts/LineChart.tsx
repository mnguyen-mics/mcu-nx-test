import React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import cuid from 'cuid';

export interface LineChartProps {
  options:  Highcharts.Options;
}

type Props = LineChartProps & InjectedIntlProps;

class LineChart extends React.Component<Props> {
  cuid: string;

  constructor(props: Props) {
    super(props);
    this.cuid = cuid();
  }

  render() {
    const { options } = this.props;

    return (<div>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        style={{ width: '100%' }}
      />
    </div>)
  }
}

export default compose<Props, LineChartProps>(injectIntl)(LineChart);
