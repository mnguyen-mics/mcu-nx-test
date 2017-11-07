import React from 'react';

interface Options {
  color: string;
  domain: string;
}

interface LegendChartProps {
  identifier: string;
  options: Options[];
}

const LegendChart = (props: LegendChartProps) => {
  const {
    options,
  } = props;

  return (
  <div className="mcs-legend-container">
    {options.map(option => {
      return (
        <div key={option.domain} style={{ float: 'left' }}>
          <div
            style={{
              backgroundColor: option.color,
              marginLeft: '10px',
              width: '30px',
              height: '4px',
              borderRadius: '5px',
              marginTop: '18px',
              float: 'left',
            }}
          />
          <span
            style={{
              float: 'right',
              lineHeight: '40px',
              marginLeft: '5px',
            }}
          >
            {option.domain}
          </span>
        </div>
      );
    })}
  </div>);
};

export default LegendChart;
