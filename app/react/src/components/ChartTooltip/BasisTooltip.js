/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';

const BasisTooltip = (props) => {
  const buildStyle = (c) => {
    return {
      fill: c,
      r: 6
    };
  };

  let tooltipTableContent = [];
  if (props.content) {
    tooltipTableContent = props.content.entries.map((entry, index) => {

      return (
        <tr key={index.toString()}>
          <td >
            <svg width="12" height="12">
              <circle width="12" height="12" cx="6" cy="6" style={buildStyle(entry.color)} />
            </svg>
          </td>
          <td className={'key'}>
            {entry.label}
          </td>
          <td className={'value'}>
            {entry.value}
          </td>
        </tr>
      );
    });
  } else {
    tooltipTableContent = (<div />);
  }
  return (
    <div className="mcs-tooltip">
      <table>
        <thead>
          <tr><th colSpan="3">{props.content ? props.content.xLabel : ''}</th></tr>
        </thead>
        <tbody>
          {tooltipTableContent}
        </tbody>
      </table>
    </div>
  );
};

BasisTooltip.defaultProps = {
  content: {
    xLabel: '',
    entries: [{
      label: '',
      color: '',
      value: ''
    }]
  }
};

BasisTooltip.propTypes = {

  content: PropTypes.shape({
    xLabel: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
      React.PropTypes.instanceOf(Date)
    ]).isRequired,

  /*
  * The content of the tooltip
  */
    entries: PropTypes.arrayOf(
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
    ).isRequired
  })

};

export default BasisTooltip;
