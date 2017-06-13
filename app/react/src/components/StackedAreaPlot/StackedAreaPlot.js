import React, { Component, PropTypes } from 'react';
import Plottable from 'plottable';
import { ChartTooltip } from '../ChartTooltip';

class StackedAreaPlot extends Component {

  constructor(props) {
    super(props);
    this.renderStackedAreaPlot = this.renderStackedAreaPlot.bind(this);
    this.defineSvg = this.defineSvg.bind(this);
    this.setTooltip = this.setTooltip.bind(this);
    this.plot = null;
    this.plotDataset = null;
    this.pointers = [];
    this.state = {
      xTooltip: null,
      yTooltip: null,
      content: null,
      visibility: 'hidden'
    };

    this.svgBoundingClientRect = null;
  }

  setTooltip(chartTooltipProps) {
    if (chartTooltipProps) {
      this.setState({
        xTooltip: chartTooltipProps.xTooltip,
        yTooltip: chartTooltipProps.yTooltip,
        content: chartTooltipProps.content,
        visibility: chartTooltipProps.visibility
      });
    }
  }

  componentDidMount() {
    const {
      options,
      dataset
    } = this.props;

    const setMetadata = {};
    options.colors.forEach((color, i) => {
      setMetadata[options.yKeys[i]] = color;
    });

    const plottableDataSet = new Plottable.Dataset(dataset, setMetadata);
    this.renderStackedAreaPlot(plottableDataSet);
    this.svgBoundingClientRect = this.svg.getBoundingClientRect();
  }

  // shouldComponentUpdate() {
  //   if (this.props.dataset) {
  //     console.log('update');
  //   }
  //   return false;
  // }

  componentWillUnmount() {
    this.plot.destroy();
    // global.window.removeEventListener('resize');
  }

  componentDidUpdate() {
    this.svgBoundingClientRect = this.svg.getBoundingClientRect();
  }

  componentWillReceiveProps(nextProps) {
    const {
      dataset: nextDataset
    } = nextProps;

    const {
      options,
      dataset
    } = this.props;

    const setMetadata = {};
    options.colors.forEach((color, i) => {
      setMetadata[options.yKeys[i]] = color;
    });
    this.pointers.forEach(point => {
      point.pointer.detachFrom(point.plot);
    });
    const plottableDataSet = new Plottable.Dataset(nextDataset, setMetadata);
    this.renderStackedAreaPlot(plottableDataSet);
    this.svgBoundingClientRect = this.svg.getBoundingClientRect();
  }

  defineSvg = svg => { this.svg = svg; };

  render() {
    const {
      identifier
    } = this.props;

    const {
      xTooltip,
      yTooltip,
      content,
      visibility
    } = this.state;

    return (
      <div className="mcs-plot-container">
        <ChartTooltip
          xTooltip={xTooltip}
          yTooltip={yTooltip}
          content={content}
          visibility={visibility}
        />
        <div id={identifier} ref={svg => { this.svg = svg; }} className="mcs-area-plot-svg" />
      </div>
    );
  }

  renderStackedAreaPlot(plottableDataSet) {
    const {
      identifier,
      options,
      dataset
    } = this.props;

    if (this.plot !== null) {
      this.plot.destroy();
    }

    const xScale = new Plottable.Scales.Time().padProportion(0);
    const yScale = new Plottable.Scales.Linear().addIncludedValuesProvider(() => { return [0]; }).addPaddingExceptionsProvider(() => { return [0]; }).padProportion(0.2);

    const colorScale = new Plottable.Scales.Color();
    colorScale.range(options.colors);
    colorScale.domain(options.yKeys);

    const xAxis = new Plottable.Axes.Numeric(xScale, 'bottom');
    const yAxis = new Plottable.Axes.Numeric(yScale, 'left').showEndTickLabels(false);

    xAxis.formatter(Plottable.Formatters.multiTime());
    const plts = [];
    const pnts = [];


    const guideline = new Plottable.Components.GuideLineLayer(
      Plottable.Components.GuideLineLayer.ORIENTATION_VERTICAL
    ).scale(xScale);

    pnts.push(guideline);
    if (dataset.length > 0) {
      Object.keys(dataset[0]).forEach(item => {
        if (item !== options.xKey && options.yKeys.indexOf(item) > -1) {

          const plot = new Plottable.Plots.Area()
            .addDataset(plottableDataSet)
            .x((d) => { return new Date(d[options.xKey]); }, xScale)
            .y((d) => { return d[item]; }, yScale)
            .animated(true)
            .attr('fill', () => { return item; }, colorScale)
            .attr('stroke', () => { return item; }, colorScale);

          const selectedPoint = new Plottable.Plots.Scatter()
            .x((d) => { return new Date(d[options.xKey]); }, xScale)
            .y((d) => { return d[item]; }, yScale)
            .size(10)
            .attr('fill', () => { return item; }, colorScale)
            .addDataset(plottableDataSet);

          plts.push(plot);
          pnts.push(selectedPoint);

        }
      });
    }

    const plots = new Plottable.Components.Group(plts.concat(pnts));

    // TODO KEEP IT AND MAKE IT SIMPLER
    /*
    new Plottable.Interactions.PanZoom(xScale, null)
      .attachTo(plots)
      .minDomainExtent(xScale, 1000 * 60 * 60 * 24 * 3)
      .maxDomainExtent(xScale, options.lookbackWindow);
    */

    const table = new Plottable.Components.Table([
      [yAxis, plots],
      [null, xAxis]
    ]);

    table.renderTo(`#${identifier}`);
    this.plot = table;


    plts.forEach((plot) => {
      // colorScale.range([plot.foreground().style('fill')]);
      const crosshair = this.createDotsCrosshair(plot);
      const line = this.createLineCrosshair(plot);
      const pointer = new Plottable.Interactions.Pointer();
      pointer.onPointerMove((p) => {
        const nearestEntity = plot.entityNearestByXThenY(p);
        line.hide();
        line.drawAt(nearestEntity.position, p, nearestEntity);
        crosshair.drawAt(nearestEntity.position);
      });
      pointer.onPointerExit(() => {
        line.hide();
        crosshair.hide();
        this.setTooltip({
          visible: 'hidden'
        });
      });
      pointer.attachTo(plot);
      const point = {
        pointer: pointer,
        plot: plot
      };
      this.pointers.push(point);
    });

    global.window.addEventListener('resize', () => {
      table.redraw();
    });

  }

  createDotsCrosshair(plot) {

    const crosshair = {};

    const crosshairContainer = plot.foreground().append('g').style('visibility', 'hidden');

    crosshair.circle = crosshairContainer.append('circle')
                      .attr('fill', 'white')
                      .attr('r', 8);
    crosshair.drawAt = (p) => {

      crosshair.circle.attr('cx', p.x);
      crosshair.circle.attr('cy', p.y);

      crosshairContainer.style('visibility', 'visible');
    };
    crosshair.hide = () => {
      crosshairContainer.style('visibility', 'hidden');
    };
    return crosshair;
  }

  createLineCrosshair(plot) {
    const {
      options: {
        xKey,
        yKeys
      }
    } = this.props;

    const crosshair = {};
    const crosshairContainer = plot.foreground().append('g').style('visibility', 'hidden');

    crosshair.vLine = crosshairContainer.append('line')
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
          label: item,
          color: navInfo.dataset.metadata()[item],
          value: navInfo.datum[item]
        };
        entries.push(entry);
      });

      const tooltipContent = {
        xLabel: navInfo.datum[xKey],
        entries: entries
      };

      const width = this.svgBoundingClientRect.right - this.svgBoundingClientRect.left;
      const height = this.svgBoundingClientRect.bottom - this.svgBoundingClientRect.top;
      this.setTooltip({
        xTooltip: mousePosition.x + 320 < width ? this.svgBoundingClientRect.left + mousePosition.x + 80 : (this.svgBoundingClientRect.left + mousePosition.x) - 180,
        yTooltip: mousePosition.y + 120 < height ? this.svgBoundingClientRect.top + mousePosition.y : (this.svgBoundingClientRect.top + mousePosition.y) - 50,
        content: tooltipContent,
        visibility: 'visible'
      });

      crosshairContainer.style('visibility', 'visible');
    };
    crosshair.hide = () => {
      crosshairContainer.style('visibility', 'hidden');
    };
    return crosshair;
  }

}

StackedAreaPlot.propTypes = {
  identifier: PropTypes.string.isRequired,
  dataset: PropTypes.arrayOf(
    PropTypes.object // eslint-disable-line react/forbid-prop-types
  ).isRequired,
  options: PropTypes.shape({
    innerRadius: PropTypes.bool,
    startAngle: PropTypes.number,
    endAngle: PropTypes.number,
    yKeys: PropTypes.arrayOf(PropTypes.string),
    xKey: PropTypes.string,
    lookbackWindow: PropTypes.number,
  }).isRequired
};

export default StackedAreaPlot;
