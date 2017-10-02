import * as React from 'react';
import PropTypes from 'prop-types';

interface ChartTooltipProps {
  tooltipStyle?: {
    xTooltip: number,
    yTooltip: number,
    visibility: string,
  };
}

const ChartTooltip: React.SFC<ChartTooltipProps> = ({ tooltipStyle, children }) => {

  const style = {
    tooltipStyle: {
    left: tooltipStyle.xTooltip,
    top: tooltipStyle.yTooltip,
    visibility: tooltipStyle.visibility,
    position: 'fixed',
    }
  };

  return (
    <div style={style}></div>
  );

}

ChartTooltip.defaultProps = {
  tooltipStyle: {
    xTooltip: 0,
    yTooltip: 0,
    visibility: 'hidden',
  },
};

export default ChartTooltip;
