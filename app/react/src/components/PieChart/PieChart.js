import React, { Component, PropTypes } from 'react';
import Plottable from 'plottable';

class PieChart extends Component {

  constructor(props) {
    super(props);
    this.renderPieChart = this.renderPieChart.bind(this);
  }

  componentDidMount() {
    this.renderPieChart(this.svg);
  }

  render() {

    const defineSvg = svg => { this.svg = svg; };

    return (
      <div className="mcs-pie-chart-container">
        <div ref={defineSvg} className="mcs-pie-chart-svg" />
      </div>
    );
  }

  renderPieChart(svg) {
    const {
      dataset,
      options
    } = this.props;

    const pie = new Plottable.Plots.Pie();

    pie.addDataset(new Plottable.Dataset(dataset))
      .sectorValue(d => d.value)
      .attr('opacity', 0.5)
      .attr('fill', d => d.color);

    if (options.innerRadius) {
      const innerRadius = svg.clientHeight > svg.clientWidth ? svg.clientWidth / 3.5 : svg.clientHeight / 3.5;
      pie.innerRadius(innerRadius);
    }
    if (options.startAngle) pie.startAngle(options.startAngle);
    if (options.endAngle) pie.endAngle(options.endAngle);

    pie.renderTo(svg);
  }

}

PieChart.propTypes = {
  dataset: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    value: PropTypes.number,
    color: PropTypes.string
  })).isRequired,
  options: PropTypes.shape({
    innerRadius: PropTypes.bool,
    startAngle: PropTypes.number,
    endAngle: PropTypes.number
  }).isRequired
};

export default PieChart;
