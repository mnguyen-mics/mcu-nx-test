import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Plottable from 'plottable';
import moment from 'moment';
import { areDatesSameDay, truncateUpToHour } from '../../utils/DateHelper';

import { ChartTooltip, BasicTooltip } from '../ChartTooltip/index.ts';

const HOUR_MILLIS = 3600 * 1000
const DAY_MILLIS = 24 * HOUR_MILLIS

class StackedAreaPlotDoubleAxis extends Component {
  constructor(props) {
    super(props);
    this.renderStackedAreaPlotDoubleAxis = this.renderStackedAreaPlotDoubleAxis.bind(this);
    this.defineSvg = this.defineSvg.bind(this);
    this.setTooltip = this.setTooltip.bind(this);
    this.plot = null;
    this.plotDataset = null;
    this.pointers = [];
    this.pointersAttached = [];
    this.state = {
      xTooltip: null,
      yTooltip: null,
      content: null,
      visibility: 'hidden',
    };

    this.svgBoundingClientRect = null;
  }

  setTooltip(chartTooltipProps) {
    if (chartTooltipProps) {
      this.setState({
        xTooltip: chartTooltipProps.xTooltip,
        yTooltip: chartTooltipProps.yTooltip,
        content: chartTooltipProps.content,
        visibility: chartTooltipProps.visibility,
      });
    }
  }

  componentDidMount() {
    this.renderStackedAreaPlotDoubleAxis();
    console.log("COMPONENT DID MOUNT");
    this.svgBoundingClientRect = this.svg.getBoundingClientRect();
  }

  componentWillUnmount() {
    this.pointersAttached.forEach(pointer => {
      pointer.enabled(false);
    });
    this.plot.destroy();
  }

  componentDidUpdate() {
    this.svgBoundingClientRect = this.svg.getBoundingClientRect();
  }

  componentWillReceiveProps() {
    this.plot.detach();
    this.plot.destroy();
    console.log("COMPONENT RECEIVED PROPS");
    this.renderStackedAreaPlotDoubleAxis();
    this.svgBoundingClientRect = this.svg.getBoundingClientRect();
  }

  defineSvg = svg => {
    this.svg = svg;
  };

  render() {
    const { identifier, options } = this.props;

    const { xTooltip, yTooltip, content, visibility } = this.state;
    const tooltipStyle = {
      xTooltip,
      yTooltip,
      visibility,
    };
    return (
      <div className="mcs-plot-container" style={{ ...this.props.style }}>
        <svg style={{ height: '0px', width: '0px' }}>
          <defs>
            {options.colors.map((color, index) => {
              return (
                <linearGradient key={options.yKeys[index].key} id={`${options.yKeys[index].key}${identifier}`} x1="0" y1="0" x2="0" y2="100%">
                  <stop stopOpacity="0.4" offset="50%" stopColor={color} />
                  <stop stopOpacity="0" offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
              );
            })}
            <filter id="shadow">
              <feDropShadow dx="0" dy="0.5" opacity="0.5" stdDeviation="0.5" />
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

  extractTickInterval(dataset, hasHoursOfDay) {
    let tickInterval = 10;
    if (dataset.length) {
      if (hasHoursOfDay) {
        const lastDate = new Date(dataset[dataset.length - 1].day);
        const firstDate = new Date(dataset[0].day);
        if (areDatesSameDay(lastDate, firstDate)) {
          tickInterval = HOUR_MILLIS;
        } else {
          tickInterval = ((new Date(dataset[dataset.length - 1].day) - new Date(dataset[0].day)) / 7);
        }
      } else {
        const avgInterval = (new Date(dataset[dataset.length - 1].day) - new Date(dataset[0].day)) / 7;
        let avgDay = avgInterval / (DAY_MILLIS);
        if (Math.round(avgDay) === 0) {
          avgDay = 1;
        }
        tickInterval = Math.round(avgDay) * (DAY_MILLIS);
      }
    }
    return tickInterval;
  }

  buildXScale(dataset) {
    const xScale = new Plottable.Scales.Time().padProportion(0);
    const tickInterval = this.extractTickInterval(dataset);
    xScale.tickGenerator(Plottable.Scales.TickGenerators.intervalTickGenerator(tickInterval));
    return xScale;
  }

  formatXAxis(xScale, dataset, hasHoursOfDay) {
    const xAxis = new Plottable.Axes.Numeric(xScale, 'bottom');
    xAxis.formatter(d => {
      const d1 = new Date(d);
      const lastDate = new Date(dataset[dataset.length - 1].day);
      const firstDate = new Date(dataset[0].day);
      if (hasHoursOfDay && areDatesSameDay(lastDate, firstDate)) {
        return moment(d1).format('HH:00');
      } else if (hasHoursOfDay) {
        return moment(d1).format('YYYY-MM-DD HH:00');
      }
      return moment(d1).format('YYYY-MM-DD');
    });
    return xAxis;
  }

  buildYScale() {
    return new Plottable.Scales.Linear()
      .addIncludedValuesProvider(() => {
        return [0];
      })
      .addPaddingExceptionsProvider(() => {
        return [0];
      })
      .padProportion(0.2);
  }

  buildYScales(yKeys) {
    const yScale = this.buildYScale();
    const secondYScale = this.buildYScale();
    const firstKey = yKeys[0];
    const secondKey = yKeys[1];
    const scales = {};
    scales[firstKey] = yScale;
    scales[secondKey] = secondYScale;
    return scales;
  }

  formatYAxis(yScale, side) {
    return new Plottable.Axes.Numeric(yScale, side).showEndTickLabels(false);
  }

  buildColorScale(yKeys, options) {
    const colorScale = new Plottable.Scales.Color();
    colorScale.range(options.colors);
    colorScale.domain(yKeys);
    return colorScale;
  }

  buildDragBox(options, xScale) {
    const dragBox = options.isDraggable ? new Plottable.Components.XDragBoxLayer() : null;
    if (dragBox) {
      dragBox.resizable(true);
      dragBox.onDrag(() => {
      });
      dragBox.onDragEnd((bounds) => {
        const min = moment(xScale.invert(bounds.topLeft.x));
        const max = (moment(xScale.invert(bounds.bottomRight.x)) - min) > DAY_MILLIS ? moment(xScale.invert(bounds.bottomRight.x)) : moment(xScale.invert(bounds.bottomRight.x)).add(1, 'days');
        options.onDragEnd([min, max]);
      });
      xScale.onUpdate(() => {
        dragBox.boxVisible(true);
        const xDomain = xScale.domain();
        dragBox.bounds({
          topLeft: { x: xScale.scale(xDomain[0]), y: null },
          bottomRight: { x: xScale.scale(xDomain[1]), y: null },
        });
      });
    }
    return dragBox;
  }

  buildPlot(
    plotComponent,
    item,
    plottableDataSet,
    options,
    xScale,
    yScales,
    identifier,
    colorScale
  ) {
    plotComponent
      .addDataset(plottableDataSet)
      .x(d => {
        const date = new Date(d[options.xKey]);
        truncateUpToHour(date, d.hour_of_day);
        return date;
      }, xScale)
      .y(d => {
        return d[item];
      }, yScales[item])
      .animated(true)
      .attr('fill', `url(#${item}${identifier})`)
      .attr(
        'stroke',
        () => {
          return item;
        },
        colorScale,
      );
    return plotComponent;
  }

  buildPlots(
    dataset,
    plottableDataSet,
    yKeys,
    options,
    xScale,
    yScales,
    identifier,
    colorScale,
    gridlines
  ) {
    const areaPlots = Object.keys(dataset[0])
                                .filter(item => item !== options.xKey && yKeys.indexOf(item) > -1)
                                .map(item => {
                                  return this.buildPlot(
                                    new Plottable.Plots.Area(),
                                    item,
                                    plottableDataSet,
                                    options,
                                    xScale,
                                    yScales,
                                    identifier,
                                    colorScale
                                  );
                                });

    const pointComponents = Object.keys(dataset[0])
                                   .filter(item => item !== options.xKey && yKeys.indexOf(item) > -1)
                                   .map(item => {
                                     return this.buildPlot(
                                       new Plottable.Plots.Scatter(),
                                       item,
                                       plottableDataSet,
                                       options,
                                       xScale,
                                       yScales,
                                       identifier,
                                       colorScale
                                     );
                                   });

    const guideline = new Plottable.Components.GuideLineLayer(Plottable.Components.GuideLineLayer.ORIENTATION_VERTICAL).scale(xScale);
    pointComponents.push(guideline);

    return {
      areaComponents: areaPlots,
      pointComponents: pointComponents,
      other: [gridlines]
    };
  }


  renderPlots(
    options,
    gridlines,
    plots,
    areaComponents,
    identifier,
    dragBox,
    yAxis,
    secondYAxis,
    xAxis
  ) {
    const chart = new Plottable.Components.Group([plots, dragBox]);
    const table = new Plottable.Components.Table([[yAxis, chart, secondYAxis], [null, xAxis, null]]);

    table.renderTo(`#${identifier}`);
    this.plot = table;

    //Needs to be done after rendering!
    gridlines.content()
      .selectAll('line')
      .attr('stroke', '#8CA0B3')
      .attr('opacity', '0.6')
      .attr('stroke-dasharray', '2, 2');

    areaComponents.forEach(plot => {
      const crosshair = this.createDotsCrosshair(plot);
      const line = this.createLineCrosshair(plot, options);
      const pointer = new Plottable.Interactions.Pointer();
      this.pointersAttached.push(pointer);
      pointer.onPointerMove(p => {
        const nearestEntity = plot.entityNearestByXThenY(p);
        line.hide();
        line.drawAt(nearestEntity.position, p, nearestEntity);
        crosshair.drawAt(nearestEntity.position);
      });
      pointer.onPointerExit(() => {
        line.hide();
        crosshair.hide();
        this.setTooltip({
          xTooltip: -100,
          yTooltip: -100,
          visible: 'hidden',
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

  attachEventListeners(table) {
    global.window.addEventListener('resize', () => {
      table.redraw();
    });

    global.window.addEventListener('redraw', () => {
      setTimeout(() => {
        table.redraw();
      }, 500);
    });
  }

  renderStackedAreaPlotDoubleAxis() {
    const { identifier, dataset, options } = this.props;

    const setMetadata = {};
    const yKeys = options.yKeys.map(item => {
      return item.key;
    });
    options.colors.forEach((color, i) => {
      setMetadata[yKeys[i]] = color;
    });
    this.pointers.forEach(point => {
      point.pointer.detachFrom(point.plot);
    });
    const plottableDataSet = new Plottable.Dataset(dataset, setMetadata);

    if (this.plot !== null) {
      this.plot.destroy();
    }

      // .addPaddingExceptionsProvider(() => {
      //   const date = new Date();
      //   date.setHours(0);
      //   date.setMinutes(0);
      //   date.setSeconds(0);
      //   return [date];
      // })
      // .padProportion(0);

    const hasHoursOfDay = dataset.length && dataset[0].hour_of_day !== undefined ? true : false;
    const xScale = this.buildXScale(dataset, hasHoursOfDay);
    const xAxis = this.formatXAxis(xScale, dataset, hasHoursOfDay);

    const yScales = this.buildYScales();
    const firstYScale = yScales[yKeys[0]];
    const yAxis = this.formatYAxis(firstYScale, 'left');
    const secondYAxis = this.formatYAxis(yScales[yKeys[1]], 'right');

    const colorScale = this.buildColorScale(yKeys, options);
    const dragBox = this.buildDragBox(options, xScale);

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
      gridlines
    );
    const plotComponentsToRender = new Plottable.Components.Group(plotComponents.pointComponents
                                                                                .concat(plotComponents.areaComponents)
                                                                                .concat(plotComponents.other))

    this.renderPlots(
      options,
      gridlines,
      plotComponentsToRender,
      plotComponents.areaComponents,
      identifier,
      dragBox,
      yAxis,
      secondYAxis,
      xAxis
    );

    this.attachEventListeners(this.plot);
    console.log("CHART REFRESHED")
  }

  createDotsCrosshair(plot) {
    const crosshair = {};

    const crosshairContainer = plot.foreground().append('g').style('visibility', 'hidden');

    crosshair.circle = crosshairContainer.append('circle').attr('fill', 'white').attr('filter', 'url(#shadow)').attr('r', 8);
    crosshair.drawAt = p => {
      crosshair.circle.attr('cx', p.x);
      crosshair.circle.attr('cy', p.y);

      crosshairContainer.style('visibility', 'visible');
    };
    crosshair.hide = () => {
      crosshairContainer.style('visibility', 'hidden');
    };
    return crosshair;
  }

  createLineCrosshair(plot, options) {
    const { xKey, yKeys } = options;

    const crosshair = {};
    const crosshairContainer = plot.foreground().append('g').style('visibility', 'hidden');

    crosshair.vLine = crosshairContainer
      .append('line')
      .attr('stroke', '#8ca0b3')
      .attr('opacity', 0.5)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5, 5')
      .attr('y1', 0)
      .attr('y2', plot.height());

    crosshair.drawAt = (p, mousePosition, navInfo) => {
      crosshair.vLine.attr('x1', p.x);
      crosshair.vLine.attr('x2', p.x);

      const entries = [];
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

      const width = this.svgBoundingClientRect.right - this.svgBoundingClientRect.left;
      const height = this.svgBoundingClientRect.bottom - this.svgBoundingClientRect.top;
      this.setTooltip({
        xTooltip: mousePosition.x + 320 < width
          ? (this.svgBoundingClientRect.left + mousePosition.x) + 80
          : (this.svgBoundingClientRect.left + mousePosition.x) - 200,
        yTooltip: mousePosition.y + 120 < height
          ? this.svgBoundingClientRect.top + mousePosition.y
          : (this.svgBoundingClientRect.top + mousePosition.y) - 50,
        content: tooltipContent,
        visibility: 'visible',
      });

      crosshairContainer.style('visibility', 'visible');
    };
    crosshair.hide = () => {
      crosshairContainer.style('visibility', 'hidden');
    };
    return crosshair;
  }
}

StackedAreaPlotDoubleAxis.propTypes = {
  identifier: PropTypes.string.isRequired,
  dataset: PropTypes.arrayOf(
    PropTypes.object, // eslint-disable-line react/forbid-prop-types
  ).isRequired,
  options: PropTypes.shape({
    color: PropTypes.string,
    yKeys: PropTypes.arrayOf(PropTypes.object),
    xKey: PropTypes.string,
    isDraggable: PropTypes.bool,
    onDragEnd: PropTypes.func,
  }).isRequired,
  style: PropTypes.shape().isRequired,
};

export default StackedAreaPlotDoubleAxis;
