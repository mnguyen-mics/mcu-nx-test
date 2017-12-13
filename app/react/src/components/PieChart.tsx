import * as React from 'react';
import Plottable from 'plottable';
import ChartUtils from './ChartUtils';

interface DatasetProps {
  key: string;
  value: number;
  color: string;
}

interface TextProps {
  value?: string;
  text?: string;
}

interface OptionsProps {
  innerRadius: boolean;
  isHalf: boolean;
  text: TextProps;
  colors: string[];
}

interface PieChartProps {
  identifier: string;
  dataset: DatasetProps[];
  options: OptionsProps;
}

class PieChart extends React.Component<PieChartProps> {

  svg: any;
  plot: any;

  constructor(props: PieChartProps) {
    super(props);

    this.plot = null;
  }

  componentDidMount() {
    this.renderPieChart(this.svg);
  }

  componentDidUpdate() {

    this.plot.destroy();
    this.renderPieChart(this.svg);
  }

  componentWillUnmount() {
    this.plot.destroy();
  }

  computeOuterRadius(svg: any, options: OptionsProps) {
    return options.isHalf ?
      (svg.clientHeight) - 20 :
      ((Math.min(svg.clientWidth, svg.clientHeight) / 2) - 20);
  }

  renderPieChart = (svg: any) => {
    const { dataset, options, identifier } = this.props;
    const scale = new Plottable.Scales.Linear();
    const colorScale = new Plottable.Scales.InterpolatedColor();
    colorScale.range(options.colors);

    const outerRadius = (svg.clientHeight > svg.clientWidth / 2
        ? (svg.clientWidth / 2) - 20
        : svg.clientHeight - 20
    );

    const plotData = new Plottable.Dataset(dataset);

    const plot = new Plottable.Plots.Pie()
      .addDataset(plotData)
      .sectorValue((d) => { return d.val; }, scale)
      .attr('fill', (d) => { return d.val; }, colorScale);

    if (options.isHalf) {
      plot.outerRadius(outerRadius);
      plot.innerRadius(outerRadius * 0.606);
    } else {
      plot.outerRadius(outerRadius);
      plot.innerRadius(outerRadius * 0.606);
    }

    if (options.isHalf) {
      plot.startAngle(-Math.PI / 2);
      plot.endAngle(Math.PI / 2);
    }

    plot.xAlignment('center');
    plot.yAlignment('center');

    plot.renderTo(`#${identifier}`);
    this.plot = plot;
    ChartUtils.addResizeListener(plot, svg, options, this.computeOuterRadius);
  }

  render() {
    const { identifier, options } = this.props;
    let classNameOuter = 'mcs-plot-container';
    let classNameInner = 'mcs-area-plot-svg';

    if (options.isHalf) {
      classNameOuter = 'mcs-plot-container-half';
      classNameInner = 'mcs-area-plot-svg-half';
    }

    return (options.isHalf
      ? (
        <div className={`${classNameOuter} donut`}>
          <div
            ref={svg => { this.svg = svg; }}
            id={identifier}
            className={classNameInner}
          />
          <div className="mcs-donut-chart-title" />
          <div className="mcs-chart-title">
            { options.text ? (
              <div className="mcs-half-title">
                <div className="value">{options.text.value}</div>
                <div className="helper">{options.text.text}</div>
              </div>) : (<div />) }
          </div>

        </div>
      )
      : (
        <div className={classNameOuter}>
          <div
            ref={svg => { this.svg = svg; }}
            id={identifier}
            className={classNameInner}
          />
          <div className="mcs-donut-chart-title">
            <div className="mcs-chart-title">
              { options.text
                ? (
                  <div>
                    <div className="value">{options.text.value}</div>
                    <div className="helper">{options.text.text}</div>
                  </div>
                )
                : <div />
              }
            </div>
          </div>
        </div>
      )
    );
  }
}
export default PieChart;
