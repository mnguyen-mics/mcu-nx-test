import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

function BasicTooltip({ content }) {

  const buildStyle = (c) => ({ fill: c, r: 6 });
  let tooltipTableContent = [];

  if (content) {
    tooltipTableContent = content.entries.map((entry, index) => {

      return (
        <tr key={index.toString()}>
          <td>
            <svg width="12" height="12">
              <circle width="12" height="12" cx="6" cy="6" style={buildStyle(entry.color)} />
            </svg>
          </td>
          <td className={'key'}>
            {entry.label && <FormattedMessage {...entry.label} />}
          </td>
          <td className={'value'}>
            {entry.value}
          </td>
        </tr>
      );
    });
  } else {
    tooltipTableContent = (<tr />);
  }

  return (
    <div className="mcs-tooltip">
      <table>
        <thead>
          <tr><th colSpan="3">{content ? content.xLabel : ''}</th></tr>
        </thead>
        <tbody>
          {tooltipTableContent}
        </tbody>
      </table>
    </div>
  );
}

BasicTooltip.defaultProps = {
  content: {
    xLabel: '',
    entries: [{
      label: null,
      color: '',
      value: 0,
    }],
  },
};

BasicTooltip.propTypes = {

  content: PropTypes.shape({
    xLabel: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
      React.PropTypes.instanceOf(Date),
    ]).isRequired,

  /*
  * The content of the tooltip
  */
    entries: PropTypes.arrayOf(
      PropTypes.shape({

        /*
        * The legend of the plot entry
        */
        label: PropTypes.object,

        /*
        * The color of the plot entry
        */
        color: PropTypes.string,

        /*
        * The value of the plot entry
        */
        value: PropTypes.number,
      }),
    ).isRequired,
  }),

};

export default BasicTooltip;
