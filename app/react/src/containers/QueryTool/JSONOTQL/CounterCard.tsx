import * as React from 'react';
import { formatMetric } from '../../../utils/MetricHelper';
import { McsIcon } from '../../../components';

export interface Result {
  viewName: string;
  viewValue: number;
  loading?: boolean;
}

export interface CounterCardProps {
  values: Result[];
  shouldRefreshValue: boolean;
  handleRefreshValue: () => void
}

export default class CounterCard extends React.Component<CounterCardProps, any> {

  generateWidth = () => {
    if (this.props.values.length === 1) {
      return '100%'
    } else if (this.props.values.length > 1 && this.props.values.length < 6) {
      return `${ 100 / this.props.values.length }%`
    }
    return '20%'
  }

  render() {
    return (
      <div style={{ position: 'relative', height: 0 }}>
        <div
          style={{
            position: 'absolute',
            padding: '0px 40px',
            left: 0,
            zIndex: 10000,
            display: 'inline-block',
            width: this.props.values.length <= 5 ? `${20 * this.props.values.length}%` : '100%',
            cursor: 'auto'
          }}
        >
          {this.props.values &&
            this.props.values.length &&
            this.props.values.map((v, i) => {
              return (
                <div
                  key={v.viewName}
                  className="m-t-20"
                  style={{
                    float: 'left',
                    width: this.generateWidth(),
                    padding: '0 8px',
                    position: 'relative'
                  }}
                >
                  <div className="mcs-card-container no-margin-bottom result-view">
                    <div className="view-name">{v.viewName}</div>
                    <div className="view-value">{v.loading ?  <i className="mcs-table-cell-loading" style={{ maxWidth: '100%' }} /> : formatMetric(v.viewValue, '0,0')}</div>
                    {this.props.shouldRefreshValue && <div
                      className={'refresh-overlay'}
                      onClick={this.props.handleRefreshValue}
                    />}
                    {this.props.shouldRefreshValue && <div
                      className="refresh-text"
                      onClick={this.props.handleRefreshValue}
                    >
                      <McsIcon type="refresh" />
                    </div>}
                  </div>
                 
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
