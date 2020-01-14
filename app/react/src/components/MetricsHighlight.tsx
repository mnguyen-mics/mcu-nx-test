import * as React from 'react';
import { Col } from 'antd';

interface Metric {
  name?: string;
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
    const { metrics, isLoading } = this.props;

    const nbOfVal: number = metrics ? metrics.length : 1;
    const cellSize: number = Math.round(24 / nbOfVal);

    return (
      <div className="mcs-metrics-column">
        {metrics.map(metric => {
          return (
            <Col key={metric.name} span={cellSize}>
              <div className="title">{metric.name}</div>
              <div className="metric">
                {isLoading ? (
                  <i
                    className="mcs-table-cell-loading"
                    style={{ width: '130px' }}
                  />
                ) : (
                  metric.value
                )}
              </div>
            </Col>
          );
        })}
      </div>
    );
  }
}

export default MetricsColumn;
