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

ChartTooltip.propTypes = {
  /*
  * The X pixel where the tooltip will be displayed
  */
  xTooltip: PropTypes.number.isRequired,

  /*
  * The Y pixel where the tooltip will be displayed
  */
  yTooltip: PropTypes.number.isRequired,

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
        value: PropTypes.string.isRequired
      })
    )
  }).isRequired,

  /*
  * To show or not the tooltip
  */
  visibility: React.PropTypes.string.isRequired
};

export default ChartTooltip;
