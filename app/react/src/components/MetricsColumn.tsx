import * as React from 'react';

interface Metric {
  name: string;
  value?: string;
}

interface MetricsColumnProps {
  metrics: Metric[];
  isLoading?: boolean;
}

class MetricsColumn extends React.Component<MetricsColumnProps> {

  static defaultProps = {
    isLoading: false,
  };

  
  render() {
    const {
      metrics,
      isLoading,
    } = this.props;

    const height = 375;
    const nbOfVal: number = metrics ? metrics.length : 1;
    const cellHeight: number = height / nbOfVal;

    return (
      <div className="p-r-20 mcs-metrics-column">
        {metrics.map(metric => {
          return (
            <div key={metric.name} style={{ height: `${cellHeight}px` }}>
              <div className="title">{metric.name}</div>
              <div className="metric">{isLoading ? <i className="mcs-table-cell-loading" style={{ width: '130px' }} /> : metric.value}</div>
            </div>);
        })}
      </div>
    );
  }

}

export default MetricsColumn;
