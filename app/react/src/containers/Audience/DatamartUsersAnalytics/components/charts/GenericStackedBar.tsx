import React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';

export interface GenericStackedBarProps {
  options: Highcharts.Options;
}

export interface MapData {
  [key: string]: string | number | number[];
}

type Props = GenericStackedBarProps & InjectedIntlProps;

class GenericStackedBar extends React.Component<Props> {
  render() {
    const { options } = this.props;
    return <HighchartsReact highcharts={Highcharts} options={options} style={{ width: '100%' }} />;
  }
}

export default compose<Props, GenericStackedBarProps>(injectIntl)(GenericStackedBar);
