import * as React from 'react';
import numeral from 'numeral';
import cuid from 'cuid';
import { injectIntl, WrappedComponentProps, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import FunnelStepMetric from './FunnelStepMetric';
import { Alert, Tag } from 'antd';
import { FunnelIdByDimension } from '../../models/datamart/UserActivitiesFunnel';

interface Metrics {
  value: number;
  pourcentage: number;
  color: string;
}

export interface GlobalMetrics {
  userPoints: number;
  conversions?: number;
  amounts?: number;
}

export interface DimensionMetrics {
  userPoints: Metrics;
  conversions?: Metrics;
  amounts?: Metrics;
}

interface FunnelStepHoverProps {
  dimensionMetrics: DimensionMetrics[];
  globalMetrics: GlobalMetrics;
  idByDimension: FunnelIdByDimension[];
  stepNumber: number;
  hasTransactionConfirmed: boolean;
}

const messages = defineMessages({
  funnelNumberOfElementsShownWarning: {
    id: 'funnel.funnel-hover.number-of-elements-shown-warning',
    defaultMessage: 'Only top 5 elements are displayed. Export the result to see everything !',
  },
});

type Props = FunnelStepHoverProps & WrappedComponentProps;

class FunnelStepHover extends React.Component<Props> {
  private _cuid = cuid;
  constructor(props: Props) {
    super(props);
  }

  private getConversionDescription = (conversion?: number, amount?: number) => {
    const { hasTransactionConfirmed } = this.props;
    if (hasTransactionConfirmed) {
      return (
        <p className={'mcs-funnel_stepInfo_desc'}>
          {conversion && (
            <span>
              Users bought{' '}
              <span className={'mcs-funnel_stepInfo_metric'}>
                {numeral(conversion).format('0,0')}
              </span>{' '}
              units
            </span>
          )}
          {amount && (
            <span>
              <br /> for a total of{' '}
              <span className={'mcs-funnel_stepInfo_metric'}>{numeral(amount).format('0,0')}€</span>
            </span>
          )}
        </p>
      );
    }
    return (
      <p className={'mcs-funnel_stepInfo_desc'}>
        {conversion && (
          <span>
            <span className={'mcs-funnel_stepInfo_metric'}>
              {numeral(conversion).format('0,0')}
            </span>{' '}
            units were linked to this step
          </span>
        )}
        {amount && (
          <span>
            <br /> for a total of{' '}
            <span className={'mcs-funnel_stepInfo_metric'}>{numeral(amount).format('0,0')}€</span>
          </span>
        )}
      </p>
    );
  };

  render() {
    const { dimensionMetrics, globalMetrics, idByDimension, stepNumber } = this.props;
    if (!dimensionMetrics) return <div />;
    return (
      <div className={'mcs-funnelStepHover'}>
        <p className={'mcs-funnelStepHover_desc'}>
          <Alert
            className={'mcs-funnelStepHover_message'}
            message={this.props.intl.formatMessage(messages.funnelNumberOfElementsShownWarning)}
          />
        </p>
        <p className={'mcs-funnelStepHover_desc'}>
          <span className={'mcs-funnelStepHover_metric'}>
            {numeral(globalMetrics.userPoints).format('0,0')}
          </span>{' '}
          user points at step {stepNumber}
        </p>
        <div className={'mcs-funnelStepHover_metrics'}>
          {dimensionMetrics &&
            dimensionMetrics.map(dimension => {
              return (
                <FunnelStepMetric
                  key={this._cuid()}
                  value={dimension.userPoints.value}
                  pourcentage={dimension.userPoints.pourcentage}
                  color={dimension.userPoints.color}
                />
              );
            })}
        </div>
        <div className={'mcs-funnelStepHover_desc mcs-funnelStepHover_desc--secondary'}>
          {this.getConversionDescription(globalMetrics.conversions, globalMetrics.amounts)}
        </div>
        <div className={'mcs-funnelStepHover_metrics'}>
          {dimensionMetrics &&
            dimensionMetrics.map(dimension => {
              return (
                dimension.amounts && (
                  <FunnelStepMetric
                    key={this._cuid()}
                    value={dimension.amounts.value}
                    pourcentage={dimension.amounts.pourcentage}
                    color={dimension.amounts.color}
                    unit={'€'}
                  />
                )
              );
            })}
        </div>
        <div className={'mcs-funnelStepHover_metrics'}>
          {dimensionMetrics &&
            dimensionMetrics.map(dimension => {
              return (
                dimension.conversions && (
                  <FunnelStepMetric
                    key={this._cuid()}
                    value={dimension.conversions.value}
                    pourcentage={dimension.conversions.pourcentage}
                    color={dimension.conversions.color}
                  />
                )
              );
            })}
        </div>
        <div className={'mcs-funnelStepHover_totalsByDimension'}>
          {idByDimension.map((item: FunnelIdByDimension) => {
            return (
              <Tag
                key={this._cuid()}
                className={'mcs-funnelStepHover_totalsByDimension_tags'}
                color={item.colors[1]}
                style={{ color: item.colors[0] }}
              >
                {item.decorator ? `${item.decorator} : ${item.id}` : item.id}
              </Tag>
            );
          })}
        </div>
      </div>
    );
  }
}

export default compose<Props, FunnelStepHoverProps>(injectIntl)(FunnelStepHover);
