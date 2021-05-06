import * as React from 'react';

interface Options {
  color: string;
  domain: string;
}

interface LegendChartProps {
  identifier: string;
  options: Options[];
}

const LegendChart = (props: LegendChartProps) => {
  const { options } = props;

  return (
    <div className='mcs-legend-container'>
      {options.map(option => {
        return (
          <div key={option.domain} className='wrapper'>
            <div
              style={{
                backgroundColor: option.color,
              }}
              className='mcs-line'
            />
            <span className='mcs-legend'>{option.domain}</span>
          </div>
        );
      })}
    </div>
  );
};

export default LegendChart;
