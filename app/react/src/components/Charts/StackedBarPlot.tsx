import * as React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { generateTooltip, BASE_CHART_HEIGHT } from './domain';

export interface StackedBarPlotProps {
  dataset: Dataset;
  options: ChartOptions;
  style?: any;
}

type Dataset = Array<{ [key: string]: string | number | Date | undefined }>;

interface ChartOptions {
  colors: string[];
  yKeys: yKey[];
  xKey: string;
  isDraggable?: boolean;
  onDragEnd?: any;
}

type yKey = { key: string; message: FormattedMessage.MessageDescriptor };

type Props = StackedBarPlotProps & InjectedIntlProps;

class StackedBarPlot extends React.Component<Props, {}> {

  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  getXAxisValues = (dataset: Dataset, xKey: string) => {
    return dataset.map(d => {
      return d[xKey] as string;
    })
  }

  formatSerieData = (dataset: Dataset, y: yKey) => {
    return dataset.map(d => {
      return d[y.key] as number;
    });
  }

  formatSeries = (dataset: Dataset, yKeys: yKey[]): Highcharts.SeriesOptionsType[] => {
    const {intl: {formatMessage}} = this.props;
    return yKeys.map(y => {
      return {
        name: formatMessage(y.message),
        data: this.formatSerieData(dataset, y)
      } as any
    });
  }

  render() {
    const {
      dataset,
      options: { colors, xKey, yKeys },
    } = this.props;

    const options: Highcharts.Options = {
      chart: {
        type: 'column',
        height: BASE_CHART_HEIGHT,
      },
      title: {
        text: ''
      },
      colors: colors,
      plotOptions: {
        column: {
          
        },
      },
      xAxis: {
        categories: this.getXAxisValues(dataset, xKey)
      },
      series: this.formatSeries(dataset, yKeys),
      credits: {
        enabled: false,
      },
      tooltip: {
        shared: true,
        ...generateTooltip(),
      },
    };

    return (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
          style={{ width: "100%" }}
        />
    );
  }
}

export default compose<Props, StackedBarPlotProps>(injectIntl)(StackedBarPlot);
