import * as React from 'react';
import * as Highcharts from 'highcharts';
require('highcharts/highcharts-more')(Highcharts);
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { generateTooltip, BASE_CHART_HEIGHT } from '../domain';

export interface RadarSpiderPlotProps {
  dataset: Dataset;
  options: RadarSpiderPlotOptions;
  height?: number;
}

type Dataset = Array<{ [key: string]: string | number | Date | undefined }>;

export interface RadarSpiderPlotOptions {
  colors: string[];
  yKeys: yKey[];
  xKey: string;
  showLegend?: boolean;
  type?: string;
  vertical?: boolean;
}

type yKey = { key: string; message: FormattedMessage.MessageDescriptor | string };

type Props = RadarSpiderPlotProps & InjectedIntlProps;

class RadarSpiderPlot extends React.Component<Props, {}> {

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
      return d[y.key] ? d[y.key] as number : 0;
    });
  }

  formatSeries = (dataset: Dataset, yKeys: yKey[]): Highcharts.SeriesOptionsType[] => {
    const {intl: {formatMessage}} = this.props;
    return yKeys.map(y => {
      return {
        name: typeof y.message === "string" ? y.message : formatMessage(y.message),
        data: this.formatSerieData(dataset, y),
        pointPlacement: 'on'
      } as any
    });
  }

  render() {
    const {
      dataset,
      options: { colors, xKey, yKeys, showLegend },
      height,
    } = this.props;

    const options: Highcharts.Options = {
      chart: {
        polar: true,
        type: 'line',
        height: height ? height : BASE_CHART_HEIGHT,
      },
      title: {
        text: ''
      },
      colors: colors,
      xAxis: {
        categories: this.getXAxisValues(dataset, xKey),
        tickmarkPlacement: 'on',
        lineWidth: 0
      },
      yAxis: {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0
      },
      series: this.formatSeries(dataset, yKeys),
      credits: {
        enabled: false,
      },
      tooltip: {
        shared: true,
        ...generateTooltip(),
      },
      legend: {
        enabled: showLegend === undefined ? false : showLegend,
      }
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

export default compose<Props, RadarSpiderPlotProps>(injectIntl)(RadarSpiderPlot);
