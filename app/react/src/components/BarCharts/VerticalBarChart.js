import React, { Component, PropTypes } from 'react';
import Plottable from 'plottable';
import { OverlapTooltip, ChartTooltip } from '../ChartTooltip';

class VerticalBarChart extends Component {

  constructor(props) {
    super(props);
    this.renderBarChart = this.renderBarChart.bind(this);
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

    this.renderBarChart(dataset);
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

  componentWillReceiveProps(nextProps) {
    const {
      dataset
    } = nextProps;

    this.pointers.forEach(point => {
      point.pointer.detachFrom(point.plot);
    });
    this.renderBarChart(dataset);
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

    const tooltipStyle = {
      xTooltip,
      yTooltip,
      visibility
    };

    const contentOverlap = {
      segment_initial: {
        name: 'Test Initial',
        population: 10927336
      },
      segment_overlaping: {
        name: 'Test Overlaping',
        population: 1237824
      },
      overlap: {
        population: 112232
      }
    };

    return (
      <div className="mcs-plot-container">
        <svg style={{ height: '0px', width: '0px' }}>
          <defs>
            <linearGradient
              id="verticalGradientBlue"
              x1="0" y1="0" x2="0" y2="100%"
            >
              <stop offset="0%" stopColor="#2FBCF2" />
              <stop offset="100%" stopColor="#269CC9" />
            </linearGradient>
          </defs>
        </svg>
        <div id={identifier} ref={svg => { this.svg = svg; }} className="mcs-area-plot-svg overlap" />

        <ChartTooltip tooltipStyle={tooltipStyle}>
          <OverlapTooltip content={content} />
        </ChartTooltip>
      </div>
    );
  }

  renderBarChart(dataset) {
    const {
      identifier,
      options
    } = this.props;

    if (this.plot !== null) {
      this.plot.destroy();
    }

    const xScale = new Plottable.Scales.Category();
    const yScale = new Plottable.Scales.Linear().addIncludedValuesProvider(() => { return [0]; }).addPaddingExceptionsProvider(() => { return [0]; }).padProportion(0.2);

    const colorScale = new Plottable.Scales.Color();
    colorScale.range(options.colors);
    colorScale.domain(options.yKeys);

    const xAxis = new Plottable.Axes.Category(xScale, 'bottom');
    xAxis.tickLabelAngle(-90)
      .tickLabelMaxWidth(140)
      .tickLabelMaxLines(2);
    const yAxis = new Plottable.Axes.Numeric(yScale, 'left').showEndTickLabels(false);

    const plts = [];
    const pnts = [];


    const guideline = new Plottable.Components.GuideLineLayer(
      Plottable.Components.GuideLineLayer.ORIENTATION_VERTICAL
    ).scale(xScale);
    pnts.push(guideline);
    if (dataset.length > 0) {
      const datasets = {};
      options.yKeys.forEach(yKey => {
        const formatedDataset = [];
        dataset.forEach(dataObject => {
          const data = {
            x: dataObject[options.xKey],
            y: dataObject[yKey],
          };
          formatedDataset.push(data);
        });
        datasets[yKey] = (formatedDataset);
      });
      const plot = new Plottable.Plots.Bar('vertical');
      options.yKeys.forEach(yKey => {
        plot.addDataset(new Plottable.Dataset(datasets[yKey]).metadata(yKey));
      });
      plot.x((d) => { return d.x.toString(); }, xScale)
        .y((d) => { return d.y; }, yScale)
        .animated(true)
        .attr('fill', 'url(#verticalGradientBlue)')
        .attr('cursor', 'pointer')
        .attr('width', () => { return 50; });

      plts.push(plot);
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

    /*
    plts.forEach((plot) => {
      // colorScale.range([plot.foreground().style('fill')]);
      const line = this.createLineCrosshair(plot);
      const pointer = new Plottable.Interactions.Pointer();
      this.pointersAttached.push(pointer);
      pointer.onPointerMove((p) => {
        const nearestEntity = plot.entityNearest(p);
        const entities = plot.entitiesAt(nearestEntity.position);
        entities.forEach((entity, i) => {
          nearestEntity.datum[options.yKeys[i]] = entity.datum.y;
        });
        line.hide();
        line.drawAt(nearestEntity.position, p, nearestEntity);
      });
      pointer.onPointerExit(() => {
        line.hide();
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
    */

    plts.forEach((plot) => {
      const tooltip = this.createTooltipCrosshair(plot);
      const interaction = new Plottable.Interactions.Click();
      interaction.onClick((point) => {
        plot.selections().attr('fill', 'url(#verticalGradientBlue)');
        tooltip.hide();
        if (plot.entitiesAt(point).length) {
          const selection = plot.entitiesAt(point)[0].selection;
          const nearestEntity = plot.entityNearest(point);
          const entities = plot.entitiesAt(nearestEntity.position);
          entities.forEach((entity, i) => {
            nearestEntity.datum[options.yKeys[i]] = entity.datum.y;
          });
          tooltip.drawAt(nearestEntity.position, point, nearestEntity);
          selection.attr('fill', '#ff9012');
        }
      });
      interaction.attachTo(plot);
      this.pointersAttached.push(interaction);
    });

    global.window.addEventListener('resize', () => {
      table.redraw();
    });

  }


  createTooltipCrosshair(plot) {
    const {
      options: {
        yKeys,
        colors
      },
      dataset
    } = this.props;

    const crosshair = {};
    const crosshairContainer = plot.foreground().append('g').style('visibility', 'hidden');

    crosshair.drawAt = (p, mousePosition, navInfo) => {

      const selectedData = dataset.find((data) => {
        return data.xKey === navInfo.datum.x;
      });
      const entries = {
        segment_initial: {
          name: selectedData.segment_source.name || '',
          population: selectedData.segment_source.number
        },
        segment_overlaping: {
          name: selectedData.segment_intersect_with.name || '',
          population: selectedData.segment_intersect_with.number
        },
        overlap: {
          population: selectedData.overlap_number.number
        }
      };

      const tooltipContent = {
        ...entries
      };

      const width = this.svgBoundingClientRect.right - this.svgBoundingClientRect.left;
      const height = this.svgBoundingClientRect.bottom - this.svgBoundingClientRect.top;
      this.setTooltip({
        xTooltip: mousePosition.x + 320 < width ? this.svgBoundingClientRect.left + mousePosition.x + 80 : (this.svgBoundingClientRect.left + mousePosition.x) - 200,
        yTooltip: mousePosition.y + 120 < height ? this.svgBoundingClientRect.top + mousePosition.y : (this.svgBoundingClientRect.top + mousePosition.y) - 50,
        content: tooltipContent,
        visibility: 'visible'
      });
    };
    crosshair.hide = () => {
      this.setTooltip({
        visibility: 'hidden'
      });
    };
    return crosshair;
  }

}

VerticalBarChart.propTypes = {
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

export default VerticalBarChart;
