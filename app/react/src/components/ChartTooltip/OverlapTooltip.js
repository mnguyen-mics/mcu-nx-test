/* eslint-disable react/require-default-props */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';

const OverlapTooltip = (props) => {

  const rmax = 30;
  const strokeWidth = 1;
  const o = props.content.overlap.population;
  const s1 = props.content.segment_initial.population;
  const s2 = props.content.segment_overlaping.population;
  const r1 = (rmax / Math.max(s1, s2)) * s1;
  const r2 = (rmax / Math.max(s1, s2)) * s2;
  const c2x = ((2 * r1) + r2) - ((o / s1) * r1);

  const svgHeight = 2 * rmax;
  const svgWidth = ((2 * r1) + (2 * r2)) - ((o / s1) * r1);

  const svg = (
    <svg width={svgWidth + (2 * strokeWidth)} height={svgHeight + (4 * strokeWidth)}>
      <circle cx={r1} cy={svgHeight / 2} r={r1} fill="#00A1DF" stroke="#979797" />
      <circle cx={c2x} cy={svgHeight / 2} r={r2} fill="#003056" stroke="#979797" fillOpacity="0.38" />
    </svg>
  );

  return (
    <div className="mcs-tooltip">
      <table>
        <thead className="text-center">
          {svg}
        </thead>
        <tbody>
          <tr key="overlaping">
            <td >
              Overlaping
            </td>
            <td>
              { Math.round((props.content.overlap.population / props.content.segment_initial.population) * 100, -2) }%
            </td>
          </tr>
          <tr key="extension">
            <td >
              Extension Power
            </td>
            <td>
              { Math.round(((props.content.segment_overlaping.population - props.content.overlap.population) / props.content.segment_initial.population) * 100, -2) }%
            </td>
          </tr>
          <tr key="button" className="text-center">
            <Button type="primary">
              test
            </Button>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

OverlapTooltip.defaultProps = {
  content: {
    segment_initial: {
      name: '',
      population: 0
    },
    segment_overlaping: {
      name: '',
      population: 0
    },
    overlap: {
      population: 0
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
