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
  options: any;
}

type Props = PieChartProps & InjectedIntlProps;

class PieChart extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      options
    } = this.props;

    return (
      <div
        style={{
          overflow: 'hidden'
        }}
      >
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          style={{ width: '100%' }}
        />
      </div>
    );
  }
}

export default compose<Props, PieChartProps>(injectIntl)(PieChart);

