import * as React from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { generateTooltip, BASE_CHART_HEIGHT } from '../domain';

export interface DatasetProps {
  key: string;
  value: number;
  color: string;
}

interface TextProps {
  value?: string;
  text?: string;
}

export interface PiePlotOptionsProps {
  innerRadius: boolean;
  isHalf: boolean;
  text?: TextProps;
  colors: string[];
  showTooltip?: boolean;
  showLabels?: boolean;
  showHover?: boolean;
}

export interface PiePlotProps {
  dataset: DatasetProps[];
  options: PiePlotOptionsProps;
  height?: number;
}

type Props = PiePlotProps & InjectedIntlProps;

class PiePlot extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  formatSeries = (
    dataset: DatasetProps[],
    innerRadius: boolean,
    showLabels?: boolean,
  ): Highcharts.SeriesOptionsType[] => {
    return [
      {
        type: 'pie',
        name: '',
        innerSize: innerRadius ? '65%' : '0%',
        data: dataset.map(d => {
          return {
            name: d.key,
            y: d.value,
            selected: showLabels ? !showLabels : true,
          };
        }),
      },
    ];
  };

  render() {
    const {
      dataset,
      options: { innerRadius, isHalf, text, colors, showTooltip, showLabels },
      height,
    } = this.props;

    const options: Highcharts.Options = {
      chart: {
        plotBackgroundColor: undefined,
        plotBorderWidth: undefined,
        plotShadow: false,
        type: 'pie',
        animation: false,
        height: height,
        style: { fontFamily: '' },
      },
      title: {
        text: text
          ? `<div>${text.value}</div><br /><div>${text.text}</div>`
          : '',
        align: 'center',
        verticalAlign: 'middle',
        y: isHalf ? -30 : -5,
      },
      colors: colors,
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: showLabels ? showLabels : false,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: 'rgba(0, 0, 0, 0.65)',
            },
          },
          startAngle: isHalf ? -90 : 0,
          endAngle: isHalf ? 90 : 0,
          center: ['50%', '50%'],
          size: showLabels ? '80%' : '100%',
          selected: true,
        },
      },
      series: this.formatSeries(dataset, innerRadius, showLabels),
      credits: {
        enabled: false,
      },
      tooltip: {
        shared: true,
        ...generateTooltip(showTooltip ? showTooltip : false),
      },
    };

    return (
      <div
        style={{
          overflow: 'hidden',
          height: isHalf ? BASE_CHART_HEIGHT / 2 : BASE_CHART_HEIGHT,
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

export default compose<Props, PiePlotProps>(injectIntl)(PiePlot);
