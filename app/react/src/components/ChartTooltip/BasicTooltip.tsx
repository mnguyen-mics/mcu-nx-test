import * as React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

interface BasicTooltipProps {
  content: {
    xLabel: string | number | Date;
    entries: [{
      label?: FormattedMessage.Props;
      color: string;
      value: number;
    }];
  };
}

const BasicTooltip: React.SFC<BasicTooltipProps> = ({ content }) => {

  const buildStyle = (c) => ({ fill: c, r: 6 });
  let tooltipTableContent = [];

  if (content) {
    tooltipTableContent =content.entries.map((entry, index) => {

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
    let tooltipTableContent = (<tr />);
  }

  return (
    <div className="mcs-tooltip">
      <table>
        <thead>
          <tr>
            <th colSpan={3}>
              {content ? content.xLabel : ''}
            </th>
          </tr>
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
    // The content of the tooltip
    entries: [{
      // The legend of the plot entry
      label: null,
      // The color of the plot entry
      color: '',
      // The value of the plot entry
      value: 0,
    }],
  },
};

export default BasicTooltip;
