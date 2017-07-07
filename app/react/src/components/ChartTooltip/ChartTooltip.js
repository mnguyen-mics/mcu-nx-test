import React from 'react';
import PropTypes from 'prop-types';

const ChartTooltip = ({ tooltipStyle, children }) => {

  const style = {
    left: tooltipStyle.xTooltip,
    top: tooltipStyle.yTooltip,
    visibility: tooltipStyle.visibility,
    position: 'fixed'
  };

  return (
    <div style={style}>
      { children }
    </div>
  );

};

ChartTooltip.defaultProps = {
  tooltipStyle: {
    xTooltip: 0,
    yTooltip: 0,
    visibility: 'hidden'
  }
};

ChartTooltip.propTypes = {
  tooltipStyle: PropTypes.shape({
    /*
  * The X pixel where the tooltip will be displayed
  */
    xTooltip: PropTypes.number,

  /*
  * The Y pixel where the tooltip will be displayed
  */
    yTooltip: PropTypes.number,

  /*
  * To show or not the tooltip
  */
    visibility: React.PropTypes.string
  }),
};

export default ChartTooltip;
