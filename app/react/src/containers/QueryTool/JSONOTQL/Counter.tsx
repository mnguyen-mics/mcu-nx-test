import * as React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { formatMetric } from '../../../utils/MetricHelper';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

export interface CounterProps {
  name: string;
  value?: number;
  loading?: boolean;
  error?: boolean;
  stale?: boolean;
  onRefresh: () => void;
  width: string;
  hideValue?: boolean;
}

interface State {
  hover: boolean;
}

export default class Counter extends React.Component<CounterProps, State> {
  constructor(props: CounterProps) {
    super(props);
    this.state = { hover: false };
  }

  render() {
    const {
      name,
      value,
      loading,
      error,
      stale,
      onRefresh,
      width,
      hideValue,
    } = this.props;

    const onHover = (type: 'enter' | 'leave') => () =>
      this.setState({ hover: type === 'enter' ? true : false });

    const restOfCounter = !hideValue && (
      <React.Fragment>
        <div className="view-value">
          {loading ? (
            <i
              className="mcs-table-cell-loading"
              style={{ maxWidth: '100%' }}
            />
          ) : (
            formatMetric(value, '0,0')
          )}
        </div>
        {loading && <div className={'refresh-overlay'} onClick={onRefresh} />}
        {loading && (
          <div className="refresh-text">
            <LoadingOutlined />
          </div>
        )}
        {(stale || this.state.hover) && !loading && (
          <div className={'refresh-overlay'} onClick={onRefresh} />
        )}
        {(stale || this.state.hover) && !loading && (
          <div className="refresh-text" onClick={onRefresh}>
            <McsIcon type="refresh" />
          </div>
        )}
        {error && !loading && (
          <div className={'refresh-overlay error'} onClick={onRefresh} />
        )}
        {error && !loading && (
          <div className="refresh-text error" onClick={onRefresh}>
            <McsIcon type="refresh" />
          </div>
        )}
      </React.Fragment>
    );

    return (
      <div
        className="m-t-20"
        style={{
          float: 'left',
          width: width,
          padding: '0 8px',
          position: 'relative',
        }}
        onMouseEnter={onHover('enter')}
        onMouseLeave={onHover('leave')}
      >
        <div className="mcs-card no-margin-bottom result-view">
          <div className="view-name">{name}</div>
          {restOfCounter}
        </div>
      </div>
    );
  }
}
