import * as React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';

export interface DatasetProps {
  key: string;
  value: number;
  color: string;
}

export interface PieChartProps {
  options: Highcharts.Options;
}

type Props = PieChartProps & InjectedIntlProps;

class PieChart extends React.Component<Props> {

  render() {
    const {
      options
    } = this.props;

    return (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
        />
    );
  }
}

export default compose<Props, PieChartProps>(injectIntl)(PieChart);

