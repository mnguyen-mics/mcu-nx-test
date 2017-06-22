
import { Component, PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

const React = require('react');

class TooltipContent extends Component {

  render() {

    const buildStyle = (c) => {
      return {
        fill: c,
        r: 6
      };
    };

    const tooltipTableContent = this.props.contentTooltip.map((entry, index) => {

      return (
        <tr key={index.toString()}>
          <td >
            <svg width="12" height="12">
              <circle width="12" height="12" cx="6" cy="6" style={buildStyle(entry.color)} />
            </svg>
          </td>
          <td className={'key'}>
            <FormattedMessage id={entry.label} />
          </td>
          <td className={'value'}>
            {entry.value}
          </td>
        </tr>
      );
    });

    return (
      <div className="mcs-tooltip">
        <table>
          <thead>
            <tr><th colSpan="3">{this.props.xLabel}</th></tr>
          </thead>
          <tbody>
            {tooltipTableContent}
          </tbody>
        </table>
      </div>
    );

  }
}

TooltipContent.propTypes = {

   /*
   * The value of xAxis to display
   */
  xLabel: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
    React.PropTypes.instanceOf(Date)
  ]).isRequired,

  /*
  * The content of the tooltip
  */
  contentTooltip: PropTypes.arrayOf(
      PropTypes.shape({

        /*
        * The legend of the plot entry
        */
        label: PropTypes.string.isRequired,

        /*
        * The color of the plot entry
        */
        color: PropTypes.string.isRequired,

        /*
        * The value of the plot entry
        */
        value: PropTypes.number.isRequired
      })
    ).isRequired,
  intl: intlShape.isRequired
};

export default TooltipContent;
