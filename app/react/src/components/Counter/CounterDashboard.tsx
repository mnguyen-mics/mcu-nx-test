import * as React from 'react';
import Counter, { CounterProps } from './Counter';
import { Row, Col } from 'antd/lib/grid';

export interface Props {
  counters: CounterProps[];
  invertedColor?: boolean;
}

export default class CounterDashboard extends React.Component<Props> {
  render() {
    const { counters, invertedColor } = this.props;

    if (counters.length === 0) return null;

    const computedSpan = Math.floor(24 / counters.length);

    return (
      <div className={`counter-dashboard ${invertedColor ? 'inverted' : ''}`}>
        <Row>
          {counters.map((counter, index) => {
            return (
              <Col
                key={index}
                span={computedSpan}
                className={
                  index !== counters.length - 1 ? 'border-right' : ''
                }
              >
                <Counter {...counter} />
              </Col>
            );
          })}
        </Row>
      </div>
    );
  }
}
