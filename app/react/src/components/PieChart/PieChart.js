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

    const {
      identifier,
      options
    } = this.props;

    let classNameOuter = 'mcs-plot-container';
    let classNameInner = 'mcs-area-plot-svg';
    if (options.startAngle || options.endAngle) {
      classNameOuter = 'mcs-plot-container-half';
      classNameInner = 'mcs-area-plot-svg-half';
    }

    return (
      <div className={classNameOuter}>
        <div ref={svg => { this.svg = svg; }} id={identifier} className={classNameInner} />
        <div className="mcs-donut-chart-title">
          <div className="mcs-chart-title">This is a title</div>
        </div>
      </div>
    );
  }

  renderPieChart(svg) {
    const {
      dataset,
      options,
      identifier
    } = this.props;

    const scale = new Plottable.Scales.Linear();
    const colorScale = new Plottable.Scales.InterpolatedColor();
    colorScale.range(options.colors);

    const innerRadius = svg.clientHeight > svg.clientWidth ? svg.clientWidth / 3 : svg.clientHeight / 3;
    const innerRadiusHalf = svg.clientHeight > svg.clientWidth ? svg.clientWidth / 3 : svg.clientHeight / 3;

    const plot = new Plottable.Plots.Pie()
      .addDataset(new Plottable.Dataset(dataset))
      .sectorValue((d) => { return d.val; }, scale)
      .attr('fill', (d) => { return d.val; }, colorScale);

    if (options.innerRadius) {
      if (options.startAngle || options.endAngle) {
        plot.innerRadius(innerRadiusHalf);
      } else {
        plot.innerRadius(innerRadius);
      }
    }

    if (options.startAngle) {
      plot.startAngle(-Math.PI / 2);
    }

    if (options.endAngle) {
      plot.endAngle(Math.PI / 2);
    }

    plot.xAlignment('center');
    plot.yAlignment('center');

    const title = new Plottable.Components.Label('Hello World!')
      .xAlignment('center')
      .yAlignment('center');

    const plots = new Plottable.Components.Group([plot, title]);

    plots.renderTo(`#${identifier}`);

    global.window.addEventListener('resize', () => {
      plots.redraw();
    });
  }

}

PieChart.propTypes = {
  identifier: PropTypes.string.isRequired,
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
