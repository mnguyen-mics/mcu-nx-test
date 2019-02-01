import * as React from 'react';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import McsIcon from '../McsIcon';

interface OverlapTooltipProps {
  content: {
    segment_initial: {
      name: string;
      population: number;
    };
    segment_overlaping: {
      name: string;
      population: number;
    };
    overlap: {
      population: number;
    };
  };
}

const OverlapTooltip: React.SFC<OverlapTooltipProps> = ({ content }) => {
  if (!content) {
    return <div />;
  }

  const { overlap, segment_initial, segment_overlaping } = content;
  const rmax = 30;
  const strokeWidth = 1;
  const o = overlap.population;
  const s1 = segment_initial.population;
  const s2 = segment_overlaping.population;
  const r1 = (rmax / Math.max(s1, s2)) * s1;
  const r2 = (rmax / Math.max(s1, s2)) * s2;
  const c2x = 2 * r1 + r2 - (o / s1) * (r1 * 2);

  const svgHeight = 2 * rmax;
  const svgWidth = 2 * r1 + 2 * r2 - (o / s1) * r1;

  const svg = (
    <svg
      width={svgWidth + 2 * strokeWidth}
      height={svgHeight + 4 * strokeWidth}
    >
      <circle
        cx={r1}
        cy={svgHeight / 2 + strokeWidth}
        r={r1}
        fill="#00A1DF"
        stroke="#979797"
      />
      <circle
        cx={c2x}
        cy={svgHeight / 2 + strokeWidth}
        r={r2}
        fill="#003056"
        stroke="#979797"
        fillOpacity="0.38"
      />
    </svg>
  );

  return (
    <div className="mcs-tooltip">
      <div className="text-center">{svg}</div>
      <table>
        <tbody>
          <tr key="overlaping">
            <td>Overlaping</td>
            <td>
              {Math.round(
                (overlap.population / segment_initial.population) * 100 * 100,
              ) / 100}
              %
            </td>
          </tr>
          <tr key="extension">
            <td>Extension Power</td>
            <td>
              {Math.round(
                ((segment_overlaping.population - overlap.population) /
                  segment_initial.population) *
                  100 *
                  100,
              ) / 100}
              %
            </td>
          </tr>
        </tbody>
      </table>
      <div className="text-center">
        <Button type="primary">
          <McsIcon type="bolt" />
          <FormattedMessage id="ACTIVATE" defaultMessage="Activate" />
        </Button>
      </div>
    </div>
  );
};

export default OverlapTooltip;
