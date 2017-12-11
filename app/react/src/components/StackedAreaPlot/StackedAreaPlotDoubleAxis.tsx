import * as React from 'react';
import Plottable, {AxisOrientation, Plot, XYPlot} from 'plottable';
import moment from 'moment';
import ChartUtils from './ChartUtils';

import { areDatesSameDay, truncateUpToHour } from '../../utils/DateHelper';

import { ChartTooltip, BasicTooltip } from '../ChartTooltip/index';
import {QuantitativeScale} from 'plottable/build/src/scales/quantitativeScale';
import * as Plots from 'plottable/build/src/plots/commons';
import {Component} from 'plottable/build/src/components/component';
import {Pointer} from 'plottable/build/src/interactions';
import {XDragBoxLayer} from 'plottable/build/src/components';
import {ITickGenerator} from 'plottable/build/src/scales/tickGenerators';

const HOUR_MILLIS = 3600 * 1000;
const DAY_MILLIS = 24 * HOUR_MILLIS;

interface ChartOptions {
  colors: string[];
  yKeys: any[];
  xKey: string;
  lookbackWindow: number;
  isDraggable: boolean;
  onDragEnd: any;
}

interface StackedAreaPlotDoubleAxisProps {
  identifier: string;
  dataset: any[];
  options: ChartOptions;
  style: any;
}

interface StackedAreaPlotDoubleAxisState {
  xTooltip: any;
  yTooltip: any;
  content: any;
  visibility: string;
}

interface ChartTooltipProps {
  xTooltip: number;
  yTooltip: number;
  content: any;
  visibility: string;
}

interface Entry {
  label: string;
  value: number;
  color: string;
}

interface LineCrossHair {
  drawAt: any;
  hide: any;
  vLine: any;
}

interface DotsCrossHair {
  drawAt: any;
  hide: any;
  circle: any;
}

interface Position {
  x: number;
  y: number;
}

interface Point {
  pointer: Pointer;
  plot: Plot;
}

interface PlotComponents {
  areaComponents: Array<XYPlot<Date, number>>;
  pointComponents: Component[];
  other: Component[];
}

class StackedAreaPlotDoubleAxis extends React.Component<StackedAreaPlotDoubleAxisProps, StackedAreaPlotDoubleAxisState> {

  svgBoundingClientRect = {
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  };
  plot: any = null;
  plotDataset = null;
  pointers: Point[] = [];
  pointersAttached: Pointer[] = [];
  svg: any = null;
  mountLock: boolean = false;

  constructor(props: StackedAreaPlotDoubleAxisProps) {
    super(props);
    this.renderStackedAreaPlotDoubleAxis = this.renderStackedAreaPlotDoubleAxis.bind(this);
    this.defineSvg = this.defineSvg.bind(this);
    this.setTooltip = this.setTooltip.bind(this);
    this.state = {
      xTooltip: null,
      yTooltip: null,
      content: null,
      visibility: 'hidden',
    };
  }

  setTooltip(chartTooltipProps: ChartTooltipProps) {
    if (chartTooltipProps) {
      this.setState({
        xTooltip: chartTooltipProps.xTooltip,
        yTooltip: chartTooltipProps.yTooltip,
        content: chartTooltipProps.content,
        visibility: chartTooltipProps.visibility,
      });
    }
  }

  componentWillUnmount() {
    this.pointersAttached.forEach(pointer => {
      pointer.enabled(false);
    });
    this.plot.detach();
    this.plot.destroy();
  }

  updateBoundingRect() {
    const newBoundingRect = this.svg.getBoundingClientRect();
    this.svgBoundingClientRect.top = newBoundingRect.top;
    this.svgBoundingClientRect.left = newBoundingRect.left;
    this.svgBoundingClientRect.right = newBoundingRect.right;
    this.svgBoundingClientRect.bottom = newBoundingRect.bottom;
  }

  componentDidUpdate() {
    this.updateBoundingRect();
  }

  componentDidMount() {
    if (!this.mountLock)
      this.renderStackedAreaPlotDoubleAxis(this.props);
  }

  componentWillReceiveProps(nextProps: StackedAreaPlotDoubleAxisProps) {
    if (this.mountLock)
      this.renderStackedAreaPlotDoubleAxis(nextProps);
    this.mountLock = true;
    this.updateBoundingRect();
  }

  defineSvg = (svg: any) => {
    this.svg = svg;
  }

  render() {
    const { identifier, options } = this.props;

    const { xTooltip, yTooltip, content, visibility } = this.state;
    const tooltipStyle = {
      xTooltip,
      yTooltip,
      visibility,
    };
    const feDropShadow = ChartUtils.renderFeDropShadow();
    return (
      <div className="mcs-plot-container" style={{ ...this.props.style }}>
        <svg style={{ height: '0px', width: '0px' }}>
          <defs>
            {options.colors.map((color, index) => {
              return (
                <linearGradient
                  key={options.yKeys[index].key}
                  id={`${options.yKeys[index].key}${identifier}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="100%"
                >
                  <stop stopOpacity="0.4" offset="50%" stopColor={color} />
                  <stop stopOpacity="0" offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
              );
            })}
            <filter id="shadow">
              {feDropShadow}
            </filter>
          </defs>
        </svg>
        <div
          id={identifier}
          ref={svg => {
            this.svg = svg;
          }}
          className="mcs-area-plot-svg"
        />
        <ChartTooltip tooltipStyle={tooltipStyle}>
          <BasicTooltip content={content} />
        </ChartTooltip>
      </div>
    );
  }

  extractTickInterval(dataset: any[], hasHoursOfDay: boolean) {
    let tickInterval = 10;
    if (dataset.length) {
      const lastDate = moment(new Date(dataset[dataset.length - 1].day));
      const firstDate = moment(new Date(dataset[0].day));
      const diffInMillis = lastDate.subtract(firstDate.milliseconds(), 'milliseconds').milliseconds();
      if (hasHoursOfDay) {
        // TO FIX for using moment dates
        tickInterval = areDatesSameDay(lastDate, firstDate) ? HOUR_MILLIS : (diffInMillis) / 7;
      } else {
        const avgInterval = (diffInMillis) / 7;
        let avgDay = avgInterval / (DAY_MILLIS);
        if (Math.round(avgDay) === 0) {
          avgDay = 1;
        }
        tickInterval = Math.round(avgDay) * (DAY_MILLIS);
      }
    }
    return tickInterval;
  }

  buildXScale(dataset: any[], hasHourOfDay: boolean): QuantitativeScale<Date> {
    const xScale = new Plottable.Scales.Time().padProportion(0);
    const tickInterval: number = this.extractTickInterval(dataset, hasHourOfDay);

    // UGLY HACK but it's Plottable fault for not providing a way to build a ITickGenerator<Date>
    const tickGenerator: ITickGenerator<Date> = Plottable.Scales.TickGenerators.intervalTickGenerator(tickInterval) as any;
    xScale.tickGenerator(tickGenerator);
    return xScale;
  }

  buildYScale(): QuantitativeScale<number> {
    return new Plottable.Scales.Linear()
      .addIncludedValuesProvider(() => {
        return [0];
      })
      .addPaddingExceptionsProvider(() => {
        return [0];
      })
      .padProportion(0.2);
  }

  buildYScales(yKeys: string[]): { [s: string]: QuantitativeScale<number> } {
    const yScale = this.buildYScale();
    const secondYScale = this.buildYScale();
    const firstKey = yKeys[0];
    const secondKey = yKeys[1];
    const scales: { [s: string]: QuantitativeScale<number> } = {};
    scales[firstKey] = yScale;
    scales[secondKey] = secondYScale;
    return scales;
  }

  formatYAxis(yScale: QuantitativeScale<number>, side: AxisOrientation) {
    return new Plottable.Axes.Numeric(yScale, side).showEndTickLabels(false);
  }

  buildColorScale(yKeys: string[], colors: string[]) {
    const colorScale = new Plottable.Scales.Color();
    colorScale.range(colors);
    colorScale.domain(yKeys);
    return colorScale;
  }

  buildDragBox(
    xScale: QuantitativeScale<Date>,
    onDragEnd: any,
  ) {
    const dragBox = new Plottable.Components.XDragBoxLayer();
    dragBox.resizable(true);
    dragBox.onDragEnd((bounds) => {
      const min = moment(xScale.invert(bounds.topLeft.x));
      const duration: number = (moment(xScale.invert(bounds.bottomRight.x)).diff(min, 'milliseconds'));
      const max =  duration > DAY_MILLIS ?
        moment(xScale.invert(bounds.bottomRight.x)) :
        moment(xScale.invert(bounds.bottomRight.x)).add(1, 'days');

      onDragEnd([min, max]);
    });
    xScale.onUpdate(() => {
      dragBox.boxVisible(true);
      const xDomain = xScale.domain();
      dragBox.bounds({
        topLeft: { x: xScale.scale(xDomain[0]), y: 0 },
        bottomRight: { x: xScale.scale(xDomain[1]), y: 0 },
      });
    });
    return dragBox;
  }

  buildPlot(
    plotComponent: XYPlot<Date, number>,
    item: string,
    plottableDataSet: Plottable.Dataset,
    options: ChartOptions,
    xScale: QuantitativeScale<Date>,
    yScales: { [s: string]: QuantitativeScale<number> },
  ) {
    plotComponent
      .addDataset(plottableDataSet)
      .x((d: any) => {
        const date = new Date(d[options.xKey]);
        truncateUpToHour(date, d.hour_of_day);
        return date;
      }, xScale)
      .y((d: any) => {
        return d[item];
      }, yScales[item])
      .animated(true);
    return plotComponent;
  }

  buildPlots(
    dataset: any[],
    plottableDataSet: Plottable.Dataset,
    yKeys: string[],
    options: ChartOptions,
    xScale: QuantitativeScale<Date>,
    yScales: { [s: string]: QuantitativeScale<number> },
    identifier: string,
    colorScale: Plottable.Scales.Color,
    gridlines: Component,
  ): PlotComponents {
    const areaPlots = Object.keys(dataset[0])
                                .filter(item => item !== options.xKey && yKeys.indexOf(item) > -1)
                                .map(item => {
                                  const plot = this.buildPlot(
                                    new Plottable.Plots.Area(),
                                    item,
                                    plottableDataSet,
                                    options,
                                    xScale,
                                    yScales,
                                  );
                                  return {
                                    plot: plot,
                                    item: item,
                                  };
                                })
                                .map(plotitem => {
                                  return plotitem.plot
                                    .attr('fill', `url(#${plotitem.item}${identifier})`)
                                    .attr(
                                      'stroke',
                                      () => {
                                        return plotitem.item;
                                      },
                                      colorScale,
                                    );
                                });

    const pointComponents: Component[] = Object.keys(dataset[0])
                                   .filter(item => item !== options.xKey && yKeys.indexOf(item) > -1)
                                   .map(item => {
                                     const plot = this.buildPlot(
                                       new Plottable.Plots.Scatter(),
                                       item,
                                       plottableDataSet,
                                       options,
                                       xScale,
                                       yScales,
                                     );
                                     return {
                                       plot: plot,
                                       item: item,
                                     };
                                   })
                                   .map(plotitem => {
                                     return plotitem.plot.attr(
                                       'fill',
                                       () => {
                                         return plotitem.item;
                                       },
                                       colorScale,
                                     );
                                   });

    const guideline = new Plottable.Components.GuideLineLayer(Plottable.Components.GuideLineLayer.ORIENTATION_VERTICAL).scale(xScale);
    pointComponents.push(guideline);

    return {
      areaComponents: areaPlots,
      pointComponents: pointComponents,
      other: [gridlines],
    };
  }

  renderPlots(
    options: ChartOptions,
    gridlines: Component,
    plots: Plottable.Components.Group,
    areaComponents: Array<XYPlot<Date, number>>,
    identifier: string,
    dragBox: XDragBoxLayer | null,
    yAxis: Plottable.Axes.Numeric,
    secondYAxis: Plottable.Axes.Numeric,
    xAxis: Plottable.Axes.Numeric,
  ) {
    const chartComponents: Component[] = dragBox ? [plots, dragBox] : [plots];
    const chart = new Plottable.Components.Group(chartComponents);
    const table = new Plottable.Components.Table([[yAxis, chart, secondYAxis], [null, xAxis, null]]);

    table.renderTo(`#${identifier}`);
    this.plot = table;

    gridlines.content()
      .selectAll('line')
      .attr('stroke', '#8CA0B3')
      .attr('opacity', '0.6')
      .attr('stroke-dasharray', '2, 2');

    areaComponents.forEach((plot: Plottable.Plots.Area<Date>) => {
      const crosshair = this.createDotsCrosshair(plot);
      const line = this.createLineCrosshair(plot, options);
      const pointer = new Plottable.Interactions.Pointer();
      this.pointersAttached.push(pointer);
      pointer.onPointerMove(p => {
        const nearestEntity = plot.entityNearestByXThenY(p);
        line.hide();
        line.drawAt(p, nearestEntity);
        crosshair.drawAt(nearestEntity.position);
      });
      pointer.onPointerExit(() => {
        line.hide();
        crosshair.hide();
        this.setTooltip({
          xTooltip: -100,
          yTooltip: -100,
          content: {},
          visibility: 'hidden',
        });
      });
      pointer.attachTo(plot);
      const point = {
        pointer: pointer,
        plot: plot,
      };
      this.pointers.push(point);
    });
  }

  renderStackedAreaPlotDoubleAxis(nextProps: StackedAreaPlotDoubleAxisProps) {
    const { identifier } = this.props;
    const { dataset, options } = nextProps;

    const setMetadata: { [s: string]: string } = {};
    const yKeys = options.yKeys.map(item => {
      return item.key;
    });
    this.pointersAttached.forEach(pointer => {
      pointer.enabled(false);
    });

    options.colors.forEach((color, i) => {
      setMetadata[yKeys[i]] = color;
    });

    const plottableDataSet = new Plottable.Dataset(dataset, setMetadata);

    if (this.plot !== null) {
      this.plot.destroy();
    }

    const hasHoursOfDay = dataset.length && dataset[0].hour_of_day !== undefined ? true : false;
    const xScale = this.buildXScale(dataset, hasHoursOfDay);
    const xAxis = ChartUtils.formatXAxis(xScale, dataset, hasHoursOfDay);

    const yScales = this.buildYScales(yKeys);
    const firstYScale = yScales[yKeys[0]];
    const yAxis = this.formatYAxis(firstYScale, 'left');
    const secondYAxis = this.formatYAxis(yScales[yKeys[1]], 'right');

    const colorScale = this.buildColorScale(yKeys, options.colors);
    const dragBox = options.isDraggable ? this.buildDragBox(xScale, options.onDragEnd) : null;

    const gridlines = new Plottable.Components.Gridlines(xScale, firstYScale).addClass('gridline');
    const plotComponents = this.buildPlots(
      dataset,
      plottableDataSet,
      yKeys,
      options,
      xScale,
      yScales,
      identifier,
      colorScale,
      gridlines,
    );
    const componentsToRender: Component[] = plotComponents.other
                                                          .concat(plotComponents.areaComponents)
                                                          .concat(plotComponents.pointComponents);
    const componentsGroupToRender = new Plottable.Components.Group(componentsToRender);
    this.renderPlots(
      options,
      gridlines,
      componentsGroupToRender,
      plotComponents.areaComponents,
      identifier,
      dragBox,
      yAxis,
      secondYAxis,
      xAxis,
    );

    ChartUtils.attachEventListeners(this.plot);
  }

  createDotsCrosshair(plot: Plot): DotsCrossHair {
    const crosshairContainer = plot.foreground().append('g').style('visibility', 'hidden');

    const circle = crosshairContainer.append('circle').attr('fill', 'white').attr('filter', 'url(#shadow)').attr('r', 8);

    const drawAt = (p: Position) => {
      circle.attr('cx', p.x);
      circle.attr('cy', p.y);
      crosshairContainer.style('visibility', 'visible');
    };
    const hide = () => {
      crosshairContainer.style('visibility', 'hidden');
    };

    return {
      circle: circle,
      drawAt: drawAt,
      hide: hide,
    };
  }

  createLineCrosshair(plot: Plot, options: ChartOptions): LineCrossHair {
    const { xKey, yKeys } = options;

    const crosshairContainer = plot.foreground().append('g').style('visibility', 'hidden');
    const svgBoundingClientRect = this.svgBoundingClientRect;
    const setTooltip = this.setTooltip;

    const vLine = crosshairContainer
      .append('line')
      .attr('stroke', '#8ca0b3')
      .attr('opacity', 0.5)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5, 5')
      .attr('y1', 0)
      .attr('y2', plot.height());

    const drawAt = (mousePosition: Position, navInfo: Plots.ILightweightPlotEntity) => {
      const navPosition = navInfo.position;
      vLine.attr('x1', navPosition.x);
      vLine.attr('x2', navPosition.x);

      const entries: Entry[] = [];
      yKeys.forEach(item => {
        const entry = {
          label: item.message,
          color: navInfo.dataset.metadata()[item.key],
          value: navInfo.datum[item.key],
        };
        entries.push(entry);
      });
      let xLabel = navInfo.datum[xKey];
      if (navInfo.datum[xKey] && navInfo.datum.hour_of_day) {
        xLabel = `${navInfo.datum[xKey]} - ${navInfo.datum.hour_of_day}:00`;
      }
      const tooltipContent = {
        xLabel: xLabel,
        entries: entries,
      };

      const width = svgBoundingClientRect.right - svgBoundingClientRect.left;
      const height = svgBoundingClientRect.bottom - svgBoundingClientRect.top;
      const xTooltip = mousePosition.x + 320 < width
                        ? (svgBoundingClientRect.left + mousePosition.x) + 80
                        : (svgBoundingClientRect.left + mousePosition.x) - 200;
      const yTooltip = mousePosition.y + 120 < height
                        ? svgBoundingClientRect.top + mousePosition.y
                        : (svgBoundingClientRect.top + mousePosition.y) - 50;
      setTooltip({
        xTooltip: xTooltip,
        yTooltip: yTooltip,
        content: tooltipContent,
        visibility: 'visible',
      });

      crosshairContainer.style('visibility', 'visible');
    };
    const hide = () => {
      crosshairContainer.style('visibility', 'hidden');
    };

    return {
      hide: hide,
      drawAt: drawAt,
      vLine: vLine,
    };
  }
}
export default StackedAreaPlotDoubleAxis;
