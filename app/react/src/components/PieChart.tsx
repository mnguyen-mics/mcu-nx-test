import * as React from 'react';
import Plottable, {Point} from 'plottable';
import ChartUtils from './ChartUtils';
import {IPiePlotEntity, Pie} from 'plottable/build/src/plots';
import BasicTooltip from './ChartTooltip/BasicTooltip';
import TooltipArea from './ChartTooltip/TooltipArea';

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

interface Bounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface PieChartState {
  mousePos: Point;
  svgBounds: Bounds;
  tooltipVisible: boolean;
  selectedDatum: DatasetProps | undefined;
}

class PieChart extends React.Component<PieChartProps, PieChartState> {

  svg: any;
  plot: any;
  interactionsAttached: Plottable.Interaction[];

  constructor(props: PieChartProps) {
    super(props);

    this.state = {
      mousePos: {
        x: 0,
        y: 0,
      },
      svgBounds: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      tooltipVisible: false,
      selectedDatum: this.props.dataset[0],
    };
    this.plot = null;
    this.interactionsAttached = [];
  }

  componentDidMount() {
    const { dataset } = this.props;
    this.renderPieChart(this.svg);
    this.attachInteractions(this.plot, dataset, this.svg);
  }

  componentDidUpdate() {
    const { dataset } = this.props;
    this.plot.destroy();
    this.renderPieChart(this.svg);
    this.attachInteractions(this.plot, dataset, this.svg);
  }

  componentWillUnmount() {
    this.plot.destroy();
    this.interactionsAttached.forEach((interaction: Plottable.Interaction) => {
      interaction.detach();
    });
  }

  computeOuterRadius(svg: any, options: OptionsProps) {
    return options.isHalf ?
      (svg.clientHeight) - 20 :
      ((Math.min(svg.clientWidth, svg.clientHeight) / 2) - 20);
  }

  attachInteractions(plot: Pie, dataset: DatasetProps[], svg: any) {
    this.interactionsAttached.forEach((interactionAttached: Plottable.Interaction) => {
      interactionAttached.detach();
    });

    const interaction = new Plottable.Interactions.Pointer();
    interaction.onPointerMove((p: Point) => {
      plot.entities().forEach((entity: IPiePlotEntity) => {
        entity.selection.attr('fill', entity.datum.color);
      });

      const entityNearest: IPiePlotEntity[] = plot.entitiesAt(p);
      if (entityNearest.length && entityNearest[0]) {
        entityNearest[0].selection.attr('fill', 'red');
        this.setState((previousState: PieChartState) => {
          return {
            ...previousState,
            svgBounds: svg.getBoundingClientRect(),
            mousePos: p,
            tooltipVisible: true,
            selectedDatum: entityNearest[0].datum,
          };
        });
      }
    });

    interaction.onPointerExit(() => {
      this.setState((previousState: PieChartState) => {
        return {
          ...previousState,
          tooltipVisible: false,
          selectedDatum: undefined,
        };
      });
    });

    interaction.attachTo(plot);
    this.interactionsAttached.push(interaction);
  }

  renderPieChart = (svg: any) => {
    const { dataset, options, identifier } = this.props;
    const scale = new Plottable.Scales.Linear();
    const colorScale = new Plottable.Scales.InterpolatedColor();
    colorScale.range(options.colors);

    const outerRadius = this.computeOuterRadius(svg, options);
    const plotData = new Plottable.Dataset(dataset);

    const plot = new Plottable.Plots.Pie()
      .addDataset(plotData)
      .sectorValue((d) => { return d.value; }, scale)
      .attr('fill', (d) => { return d.color; });

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

    this.plot = plot;
    plot.renderTo(`#${identifier}`);
    ChartUtils.addResizeListener(plot, svg, options, this.computeOuterRadius);
  }

  render() {
    const { identifier, options } = this.props;
    const { svgBounds, mousePos, selectedDatum, tooltipVisible } = this.state;

    let classNameOuter = 'mcs-plot-container';
    let classNameInner = 'mcs-area-plot-svg';

    if (options.isHalf) {
      classNameOuter = 'mcs-plot-container-half';
      classNameInner = 'mcs-area-plot-svg-half';
    }

    const entries = [];
    if (selectedDatum) {
      const entry = {
        label: undefined,
        color: selectedDatum.color,
        value: selectedDatum.value,
      };
      entries.push(entry);
    }

    const content = {
      xLabel: selectedDatum ? selectedDatum.key : '',
      entries: entries,
    };

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
          <TooltipArea
            bounds={svgBounds}
            mousePos={mousePos}
            visible={tooltipVisible}
          >
            <BasicTooltip
              content={content}
            />
          </TooltipArea>
        </div>
      )
    );
  }
}
export default PieChart;
