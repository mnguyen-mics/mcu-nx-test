import React, { Component, PropTypes } from 'react';
import Plottable from 'plottable';

class StackedAreaPlot extends Component {

  constructor(props) {
    super(props);
    this.renderStackedAreaPlot = this.renderStackedAreaPlot.bind(this);
  }

  componentDidMount() {
    this.renderStackedAreaPlot(this.svg);
  }

  render() {

    const defineSvg = svg => { this.svg = svg; };

    return (
      <div className="mcs-stacked-area-plot-container">
        <div ref={defineSvg} className="mcs-stacked-area-plot-svg" />
      </div>
    );
  }

  renderStackedAreaPlot(svg) {
    const {
      datasets
    } = this.props;

    const xScale = new Plottable.Scales.Linear();
    const yScale = new Plottable.Scales.Linear();
    const colorScale = new Plottable.Scales.InterpolatedColor();
    const plot = new Plottable.Plots.StackedArea();

    datasets.forEach((dataset, index) => {
      plot.addDataset(new Plottable.Dataset(dataset).metadata((index + 1) * 5));
    });

    plot
      .x(d => d.x, xScale)
      .y(d => d.y, yScale)
      .attr('fill', (d, i, dataset) => dataset.metadata(), colorScale.range(['#BDCEF0', '#5279C7']));

    const xAxis = new Plottable.Axes.Numeric(xScale, 'bottom');
    const yAxis = new Plottable.Axes.Numeric(yScale, 'left');

    const chart = new Plottable.Components.Table([
      [yAxis, plot],
      [null, xAxis]
    ]);

    chart.renderTo(svg);
  }

}

StackedAreaPlot.propTypes = {
  datasets: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string,
        value: PropTypes.number,
        color: PropTypes.string
      })
    )
  ).isRequired,
  options: PropTypes.shape({
    innerRadius: PropTypes.bool,
    startAngle: PropTypes.number,
    endAngle: PropTypes.number
  }).isRequired
};

export default StackedAreaPlot;
