import React, { Component, PropTypes } from 'react';
import Plottable from 'plottable';

class LegendChart extends Component {

  constructor(props) {
    super(props);
    this.legend = null;
  }

  componentDidMount() {
    this.renderLegend(this.svg);
  }

  componentWillUnmount() {
    this.legend.destroy();
  }

  componentWillReceiveProps() {
    this.legend.redraw();
  }

  render() {
    const {
      identifier,
    } = this.props;

    return (
      <div className="mcs-legend-container">
        <div ref={svg => { this.svg = svg; }} id={identifier} className="mcs-legend-svg" />
      </div>
    );
  }

  renderLegend() {
    const {
      identifier,
      options: {
        colors,
        domains
      }
    } = this.props;

    const cs = new Plottable.Scales.Color();
    cs.range(colors);
    cs.domain(domains);
    const legend = new Plottable.Components.Legend(cs);
    const circleFactory = Plottable.SymbolFactories.circle();
    legend.symbol(() => circleFactory);
    legend.xAlignment('left');
    legend.yAlignment('center');
    legend.maxEntriesPerRow(7);
    legend.addClass('mcs-legend-font');
    legend.renderTo(`#${identifier}`);
    this.legend = legend;
    global.window.addEventListener('resize', () => {
      legend.redraw();
    });
  }
}

LegendChart.propTypes = {
  identifier: PropTypes.string.isRequired,
  options: PropTypes.shape({
    colors: PropTypes.arrayOf(PropTypes.string),
    domains: PropTypes.arrayOf(PropTypes.string)
  }).isRequired
};

export default LegendChart;
