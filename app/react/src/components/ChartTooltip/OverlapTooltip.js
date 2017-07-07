/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import { McsIcons } from '../McsIcons';


const OverlapTooltip = (props) => {
  if (!props.content) {
    return (<div />);
  }

  const rmax = 30;
  const strokeWidth = 1;
  const o = props.content.overlap.population;
  const s1 = props.content.segment_initial.population;
  const s2 = props.content.segment_overlaping.population;
  const r1 = (rmax / Math.max(s1, s2)) * s1;
  const r2 = (rmax / Math.max(s1, s2)) * s2;
  const c2x = ((2 * r1) + r2) - ((o / s1) * (r1 * 2));

  const svgHeight = 2 * rmax;
  const svgWidth = ((2 * r1) + (2 * r2)) - ((o / s1) * r1);

  const svg = (
    <svg width={svgWidth + (2 * strokeWidth)} height={svgHeight + (4 * strokeWidth)}>
      <circle cx={r1} cy={(svgHeight / 2) + strokeWidth} r={r1} fill="#00A1DF" stroke="#979797" />
      <circle cx={c2x} cy={(svgHeight / 2) + strokeWidth} r={r2} fill="#003056" stroke="#979797" fillOpacity="0.38" />
    </svg>
  );

  return (
    <div className="mcs-tooltip">
      <div className="text-center">
        {svg}
      </div>
      <table>
        <tbody>
          <tr key="overlaping">
            <td >
              Overlaping
            </td>
            <td>
              { Math.round(((props.content.overlap.population / props.content.segment_initial.population) * 100) * 100) / 100 }%
            </td>
          </tr>
          <tr key="extension">
            <td >
              Extension Power
            </td>
            <td>
              { Math.round((((props.content.segment_overlaping.population - props.content.overlap.population) / props.content.segment_initial.population) * 100) * 100) / 100 }%
            </td>
          </tr>
        </tbody>
      </table>
      <div className="text-center">
        <Button type="primary" onClick={() => { console.log('clicked'); }} >
          <McsIcons type="bolt" /><FormattedMessage id="ACTIVATE" defaultMessage="Activate" />
        </Button>
      </div>
    </div>
  );
};

OverlapTooltip.defaultProps = {
  content: {
    segment_initial: {
      name: '',
      population: 1
    },
    segment_overlaping: {
      name: '',
      population: 1
    },
    overlap: {
      population: 1
    }
  }
};

OverlapTooltip.propTypes = {
  content: PropTypes.shape({
    segment_initial: PropTypes.shape({
      name: PropTypes.string,
      population: PropTypes.number
    }),
    segment_overlaping: PropTypes.shape({
      name: PropTypes.string,
      population: PropTypes.number
    }),
    overlap: PropTypes.shape({
      population: PropTypes.number
    }),
  }),
};

export default OverlapTooltip;
