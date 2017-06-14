import React, { Component, PropTypes } from 'react';
import TooltipContent from './TooltipContent';

class ChartTooltip extends Component {

  render() {
    const {
      xTooltip,
      yTooltip,
      content,
      visibility
    } = this.props;

    const style = {
      left: xTooltip,
      top: yTooltip,
      visibility,
      position: 'fixed'
    };

    if (content) {
      return (
        <div
          style={style}
        >
          <TooltipContent xLabel={content.xLabel} contentTooltip={content.entries} />
        </div>
      );
    }
    return (
      null
    );
  }
}

ChartTooltip.defaultProps = {
  xTooltip: 0,
  yTooltip: 0,
  content: {
    xLabel: '',
    entries: [{
      label: '',
      color: '',
      value: 0
    }]
  },
  visibility: 'hidden'
};

ChartTooltip.propTypes = {
  /*
  * The X pixel where the tooltip will be displayed
  */
  xTooltip: PropTypes.number,

  /*
  * The Y pixel where the tooltip will be displayed
  */
  yTooltip: PropTypes.number,

  /*
  * The content of the tooltip
  */
  content: PropTypes.shape({

   /*
   * The value of xAxis to display
   */
    xLabel: PropTypes.string,

   /*
    * Values of Y axises correspondent to the x value
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
    )
  }),

  /*
  * To show or not the tooltip
  */
  visibility: React.PropTypes.string
};

export default ChartTooltip;
