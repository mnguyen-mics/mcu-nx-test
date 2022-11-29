import * as React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { compose } from 'recompose';

export interface GenericColumnProps {
  options: Highcharts.Options;
}

export interface MapData {
  [key: string]: string | number | number[];
}

type Props = GenericColumnProps & WrappedComponentProps;

class GenericColumn extends React.Component<Props> {
  render() {
    const { options } = this.props;
    return <HighchartsReact highcharts={Highcharts} options={options} style={{ width: '100%' }} />;
  }
}

export default compose<Props, GenericColumnProps>(injectIntl)(GenericColumn);
