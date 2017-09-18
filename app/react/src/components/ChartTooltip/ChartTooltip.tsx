import * as React from 'react';
import PropTypes from 'prop-types';

interface ChartTooltipProps {
  tooltipStyle?: {
    xTooltip: number,
    yTooltip: number,
    visibility: string,
  };
  children: any;
}

const ChartTooltip: React.SFC<ChartTooltipProps> = props => {

  const style = {
    left: props.tooltipStyle.xTooltip,
    top: props.tooltipStyle.yTooltip,
    visibility: props.tooltipStyle.visibility,
    position: 'fixed',
  };

  return (
    <div style={this.style}>
      { props.children }
    </div>
  );

}

ChartTooltip.defaultProps = {
  tooltipStyle: {
    xTooltip: 0,
    yTooltip: 0,
    visibility: 'hidden',
  },
};

// ChartTooltip.propTypes = {
//   tooltipStyle: PropTypes.shape({
//     /*
//   * The X pixel where the tooltip will be displayed
//   */
//     xTooltip: PropTypes.number,
//
//   /*
//   * The Y pixel where the tooltip will be displayed
//   */
//     yTooltip: PropTypes.number,
//
//   /*
//   * To show or not the tooltip
//   */
//     visibility: React.PropTypes.string,
//   }),
// };

export default ChartTooltip;
