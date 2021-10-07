import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Card, Select, Button, Tag } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  FunnelFilter,
  Steps,
  GroupedByFunnel,
  FunnelIdByDimension,
} from '../../models/datamart/UserActivitiesFunnel';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../containers/Notifications/injectNotifications';
import { compose } from 'recompose';
import { uniqBy } from 'lodash';
import { EmptyChart, LoadingChart } from '@mediarithmics-private/mcs-components-library';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { funnelMessages } from './Constants';
import numeral from 'numeral';
import FunnelStepHover, { DimensionMetrics, GlobalMetrics } from './FunnelStepHover';
import cuid from 'cuid';
import { DimensionsList } from '../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import FunnelEmptyState from './FunnelEmptyState';

interface StepDelta {
  dropOff?: string;
  passThroughPercentage?: string;
}

interface State {
  lastExecutedQueryAskedTime: number;
}

type FunnelProps = {
  funnelId: string;
  startIndex: number;
  isLoading: boolean;
  datamartId: string;
  filter: FunnelFilter[];
  funnelData?: GroupedByFunnel;
  dimensionsList: DimensionsList;
  closeGroupBy: () => void;
  openGroupBy: (index: number, dimensionName: string) => void;
  isStepLoading: boolean;
  initialState: boolean;
};

type Props = FunnelProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<void>;

const getPercentage = (nbr: number, total: number): number => {
  return (nbr * 100) / total;
};

const valueFromPercentage = (percentage: number, drawerAreaHeight: number): number => {
  return (percentage * drawerAreaHeight) / 100;
};

const colors = [
  ['#00a1df', '#e8f7fc'],
  ['#fd7c12', '#ffe7d4'],
  ['#00ab67', '#d1f0e4'],
  ['#7057d1', '#d5ccff'],
  ['#eb5c5d', '#ffcccc'],
];

class Funnel extends React.Component<Props, State> {
  private _cuid = cuid;

  constructor(props: Props) {
    super(props);
    this.state = {
      lastExecutedQueryAskedTime: 0,
    };
  }

  // listener cleanup
  componentWillUnmount() {
    window.removeEventListener('resize', this.drawSteps.bind(this));
  }

  componentDidMount() {
    window.addEventListener('resize', this.drawSteps.bind(this));
  }

  draw = (funnelData: GroupedByFunnel, startIndex: number, stepsDelta: StepDelta[]) => {
    this.drawSteps(funnelData, startIndex, stepsDelta);
  };

  drawSteps = (funnelData: GroupedByFunnel, startIndex: number, stepsDelta: StepDelta[]) => {
    const steps = funnelData.global.steps.slice(startIndex);
    const total = funnelData.global.total;

    steps.forEach((step: Steps, index: number) => {
      const start =
        index === 0 && startIndex === 0
          ? total
          : funnelData.global.steps[startIndex + index - 1].count;
      this.drawCanvas(
        funnelData,
        total,
        start,
        step.count,
        index + 1 + startIndex,
        steps.length,
        stepsDelta,
      );
    });
  };

  drawCanvas = (
    funnelData: GroupedByFunnel,
    total: number,
    startCount: number,
    endCount: number,
    stepIndex: number,
    totalSteps: number,
    stepsDelta: StepDelta[],
  ) => {
    const { funnelId } = this.props;
    const container = document.getElementById(`container_${funnelId}`);
    const canvas = document.getElementById(`canvas_${funnelId}_${stepIndex}`) as HTMLCanvasElement;

    if (canvas) {
      const drawWidth = container && container.offsetWidth / totalSteps;
      canvas.width = drawWidth || 0;

      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      const dpi = window.devicePixelRatio;
      canvas.width = (drawWidth || 0) * dpi;
      canvas.height = 370 * dpi;

      canvas.style.width = (drawWidth || 0).toString() + 'px';
      canvas.style.height = 370 + 'px';

      ctx.scale(dpi, dpi);

      const passThroughPercentage = stepsDelta[stepIndex - 2]
        ? stepsDelta[stepIndex - 2].passThroughPercentage
        : undefined;

      const steps = funnelData.global.steps;
      const passThroughTime = this.isLastStep(funnelData, stepIndex)
        ? moment
            .duration(steps[stepIndex - 1].interaction_duration, 'second')
            .format('d [day] h [hour] m [minute]')
        : undefined;

      this.drawChart(
        ctx,
        total,
        startCount,
        endCount,
        drawWidth || 0,
        passThroughPercentage,
        passThroughTime,
      );
    }
  };

  drawChart = (
    ctx: CanvasRenderingContext2D,
    total: number,
    startCount: number,
    endCount: number,
    drawWidth: number,
    passThroughPercentage?: string,
    passThroughTime?: string,
  ) => {
    const { intl } = this.props;
    const drawerHeight = 370;

    const percentageStart = getPercentage(total - startCount, total);
    const percentageEnd = getPercentage(total - endCount, total);
    const stepStart = drawerHeight && valueFromPercentage(percentageStart, drawerHeight);
    const stepEnd = drawerHeight && valueFromPercentage(percentageEnd, drawerHeight);

    ctx.beginPath();
    ctx.moveTo(30, stepStart);
    ctx.lineTo(drawWidth, stepEnd);
    ctx.lineTo(drawWidth, 1000);
    ctx.lineTo(30, 1000);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, '#1ad2f263');
    gradient.addColorStop(1, '#0ba6e126');
    ctx.fillStyle = gradient;
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#00a1df';
    ctx.rect(0, stepStart + 5, 30, drawerHeight);
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = '#00a1df';
    ctx.fill();

    ctx.fillStyle = '#003056';
    ctx.font = '14px LLCircularWeb-Medium';
    ctx.fillText(`${passThroughPercentage}%`, 7, stepStart - 20);
    const textMeasure = ctx.measureText(`${passThroughPercentage}%`);

    ctx.font = '12px LLCircularWeb-Book';
    ctx.fillText(
      `${intl.formatMessage(funnelMessages.hasSucceeded)} ${
        passThroughTime ? `${intl.formatMessage(funnelMessages.in)} ${passThroughTime}` : ''
      }`,
      textMeasure.width + 9,
      stepStart - 20,
    );
  };

  formatPercentageValue = (value: number) => {
    if (value >= 0.01) {
      return value.toFixed(2);
    } else if (value >= 0.0001) {
      return value.toFixed(4);
    } else if (value === 0) {
      return value.toString();
    } else {
      const exponentialDigits = 2;
      return value.toExponential(exponentialDigits);
    }
  };

  computeStepDelta = (upCountsPerStep: number[]) => {
    const stepsDelta: StepDelta[] = upCountsPerStep.map((step, i) => {
      let dropOff;

      if (i < upCountsPerStep.length - 1) {
        const nextStep = upCountsPerStep[i + 1];
        const passThroughPercentage = nextStep > 0 && step > 0 ? (nextStep / step) * 100 : 0;
        dropOff = 100 - passThroughPercentage;
        return {
          passThroughPercentage: this.formatPercentageValue(passThroughPercentage),
          dropOff: this.formatPercentageValue(dropOff),
        };
      } else {
        return {
          dropOff: this.formatPercentageValue(
            step > 0 && upCountsPerStep[0] > 0 ? (step / upCountsPerStep[0]) * 100 : 0,
          ),
        };
      }
    });

    return stepsDelta;
  };

  computeDimensionMetrics = (funnelData: GroupedByFunnel, index: number) => {
    const dimensionMetrics: DimensionMetrics[][] = [];
    funnelData.global.steps.forEach((steps, i) => {
      dimensionMetrics.push([]);
      funnelData.grouped_by?.forEach((dimension, j) => {
        if (dimension.dimension_value !== null && dimension.funnel.steps[i]) {
          dimensionMetrics[i].push({
            userPoints: {
              value: dimension.funnel.steps[i].count,
              pourcentage: getPercentage(dimension.funnel.steps[i].count, steps.count),
              color: colors[j][0],
            },
            conversions:
              dimension.funnel.steps[i].conversion || dimension.funnel.steps[i].conversion === 0
                ? {
                    value: dimension.funnel.steps[i].conversion as number,
                    pourcentage: getPercentage(
                      dimension.funnel.steps[i].conversion as number,
                      steps.conversion as number,
                    ),
                    color: colors[j][0],
                  }
                : undefined,
            amounts:
              dimension.funnel.steps[i].amount || dimension.funnel.steps[i].amount === 0
                ? {
                    value: dimension.funnel.steps[i].amount as number,
                    pourcentage: getPercentage(
                      dimension.funnel.steps[i].amount as number,
                      steps.amount as number,
                    ),
                    color: colors[j][0],
                  }
                : undefined,
          });
        }
      });
    });
    return dimensionMetrics;
  };

  handleSplitByDimension = (index: number, value: string) => {
    const { openGroupBy } = this.props;
    openGroupBy(index, value);
  };

  closeSplitByHover = () => {
    const { closeGroupBy } = this.props;
    closeGroupBy();
  };

  isLastStep = (funnelData: GroupedByFunnel, stepNumber: number) => {
    return funnelData.global.steps.length === stepNumber;
  };

  isFirstStep = (stepNumber: number) => {
    return stepNumber === 0;
  };

  getLabelValueForDimension = (dimensionValue: string) => {
    const { dimensionsList } = this.props;
    const dimensionLabelValue = dimensionsList.dimensions.find(d => d.value === dimensionValue);
    return (
      (dimensionValue === 'CHANNEL_ID' ||
        dimensionValue === 'DEVICE_FORM_FACTOR' ||
        dimensionValue === 'BRAND' ||
        dimensionValue === 'PRODUCT_ID') && (
        <Select.Option
          className='mcs-funnelSplitBy_option'
          key={this._cuid()}
          value={dimensionLabelValue?.value || ''}
        >
          {dimensionLabelValue?.label}
        </Select.Option>
      )
    );
  };

  private getStepHover = (
    funnelData: GroupedByFunnel,
    index: number,
    dimensionMetrics: DimensionMetrics[],
    filter: FunnelFilter,
  ) => {
    const globalMetrics: GlobalMetrics = {
      userPoints: funnelData.global.steps[index - 1].count,
      conversions: funnelData.global.steps[index - 1].conversion,
      amounts: funnelData.global.steps[index - 1].amount,
    };

    const idByDimension: FunnelIdByDimension[] = [];
    funnelData.grouped_by?.forEach((dimension, i) => {
      if (dimension.dimension_value !== null) {
        idByDimension.push({
          name: dimension.dimension_name,
          id: dimension.dimension_value,
          colors: colors[i],
          decorator: dimension.dimension_decorator,
        });
      }
    });

    return (
      <FunnelStepHover
        key={this._cuid()}
        globalMetrics={globalMetrics}
        idByDimension={idByDimension}
        dimensionMetrics={dimensionMetrics}
        stepNumber={index}
        hasTransactionConfirmed={this.hasTransactionConfirmed(filter)}
      />
    );
  };

  private hasTransactionConfirmed = (filter: FunnelFilter) =>
    filter.filter_clause &&
    !!filter.filter_clause.filters.find(f => f.expressions.includes('$transaction_confirmed'));

  private getConversionDescription = (
    filter: FunnelFilter,
    conversion?: string,
    amount?: string,
  ) => {
    if (this.hasTransactionConfirmed(filter)) {
      return (
        <p className={'mcs-funnel_stepInfo_desc'}>
          {conversion && (
            <span>
              Users bought <span className={'mcs-funnel_stepInfo_metric'}>{conversion}</span> units
            </span>
          )}
          {amount && (
            <span>
              <br /> for a total of <span className={'mcs-funnel_stepInfo_metric'}>{amount}</span>
            </span>
          )}
        </p>
      );
    }
    return (
      <p className={'mcs-funnel_stepInfo_desc'}>
        {conversion && (
          <span>
            <span className={'mcs-funnel_stepInfo_metric'}>{conversion}</span> units were linked to
            this step
          </span>
        )}
        {amount && (
          <span>
            <br /> for a total of <span className={'mcs-funnel_stepInfo_metric'}>{amount}</span>
          </span>
        )}
      </p>
    );
  };

  displaySplitByDropdown = (filter: FunnelFilter) => {
    return filter.filter_clause.filters.find(
      f =>
        f.dimension_name === 'CHANNEL_ID' ||
        f.dimension_name === 'DEVICE_FORM_FACTOR' ||
        f.dimension_name === 'BRAND' ||
        f.dimension_name === 'PRODUCT_ID',
    );
  };

  isDisplayAdStep = (filter: FunnelFilter) => {
    return filter.filter_clause.filters.find(f => f.expressions.includes('DISPLAY_AD'));
  };

  getStepTitle = (funnelData: GroupedByFunnel, index: number, totalOfUserPoints?: number) => {
    const { filter, intl } = this.props;
    const total = funnelData.global.total;
    return (
      <p className={'mcs-funnel_stepInfo_desc'}>
        <span className={'mcs-funnel_stepInfo_metric'}>
          {numeral(index === 0 ? total : totalOfUserPoints).format('0,0')}{' '}
        </span>
        {index > 0
          ? filter[index - 1] && this.isDisplayAdStep(filter[index - 1])
            ? intl.formatMessage(funnelMessages.exposedUserPoints)
            : `${intl.formatMessage(funnelMessages.userPointsAtStep)} ${index}`
          : intl.formatMessage(funnelMessages.upHadAnActivity)}
      </p>
    );
  };

  private splitIndex(filter: FunnelFilter[]): number {
    return filter.findIndex(x => !!x.group_by_dimension);
  }

  renderStep(
    funnelData: GroupedByFunnel,
    index: number,
    steps: Steps[],
    stepsDelta: StepDelta[],
    dimensionMetrics: any,
  ) {
    const { funnelId, intl, filter, isStepLoading } = this.props;
    const getPopupContainer = () => document.getElementById('mcs-funnel_splitBy')!;

    const conversion =
      index > 0 && steps[index - 1].hasOwnProperty('conversion')
        ? numeral(steps[index - 1].conversion).format('0,0')
        : undefined;
    const amount =
      index > 0 && steps[index - 1].hasOwnProperty('amount')
        ? `${numeral(steps[index - 1].amount).format('0,0')}€`
        : undefined;

    let splitIndex = this.splitIndex(filter);
    splitIndex = splitIndex === -1 ? splitIndex : splitIndex + 1;

    return (
      <div key={index.toString()} className={'mcs-funnel_chart'}>
        <div className={'mcs-funnel_stepInfo'}>
          {this.getStepTitle(funnelData, index, steps[index - 1]?.count)}

          {index > 0 && filter[index - 1]
            ? this.getConversionDescription(filter[index - 1], conversion, amount)
            : undefined}

          <div className={'mcs-funnel_splitBy'} id='mcs-funnel_splitBy'>
            {index > 0 &&
            steps[index - 1] &&
            steps[index - 1].count > 0 &&
            filter[index - 1] &&
            this.displaySplitByDropdown(filter[index - 1]) ? (
              <Select
                key={this._cuid()}
                disabled={splitIndex === index && isStepLoading}
                loading={splitIndex === index && isStepLoading}
                className='mcs-funnel_splitBy_select'
                value={filter[index - 1].group_by_dimension}
                placeholder='Split by'
                onChange={this.handleSplitByDimension.bind(this, index)}
                getPopupContainer={getPopupContainer}
              >
                {uniqBy(filter[index - 1].filter_clause.filters, 'dimension_name').map(dimension =>
                  this.getLabelValueForDimension(dimension.dimension_name),
                )}
              </Select>
            ) : undefined}
          </div>
        </div>
        {this.isLastStep(funnelData, index + 1) && stepsDelta[index] && (
          <Tag className={'mcs-funnel_conversions'}>
            {stepsDelta[index].dropOff}% {intl.formatMessage(funnelMessages.conversions)}
          </Tag>
        )}
        {index > 0 && index === splitIndex && !isStepLoading ? (
          <Button
            shape='circle'
            icon={<CloseOutlined />}
            className={'mcs-funnel_disableStepHover'}
            onClick={this.closeSplitByHover}
          />
        ) : undefined}
        {index > 0 && filter[index - 1] && index === splitIndex && !isStepLoading
          ? this.getStepHover(funnelData, index, dimensionMetrics[index - 1], filter[index - 1])
          : undefined}
        <canvas
          id={`canvas_${funnelId}_${index + 1}`}
          className={'mcs-funnel_canvas'}
          height='370'
        />
        {index > 0 && (
          <div className='mcs-funnel_conversionInfo'>
            <div className={'mcs-funnel_arrow  mcs-funnel_arrow--failed'} />
            <p className='mcs-funnel_deltaInfo'>
              <b>{stepsDelta[index - 1] && `${stepsDelta[index - 1].dropOff}%`}</b>{' '}
              {intl.formatMessage(funnelMessages.didntComplete)}
            </p>
          </div>
        )}
      </div>
    );
  }

  renderSteps(funnelData: GroupedByFunnel) {
    const { startIndex, filter } = this.props;

    let splitIndex = this.splitIndex(filter);
    splitIndex = splitIndex === -1 ? splitIndex : splitIndex + 1;

    const steps = funnelData.global.steps;

    splitIndex = splitIndex === -1 ? splitIndex : splitIndex + 1;
    const splitBy = splitIndex !== -1;

    const upCountsPerStep = funnelData.global.steps.map(step => step.count);
    upCountsPerStep.unshift(funnelData.global.total);
    upCountsPerStep.pop();
    const stepsDelta = this.computeStepDelta(upCountsPerStep);
    const dimensionMetrics =
      funnelData.grouped_by && splitBy ? this.computeDimensionMetrics(funnelData, splitIndex) : [];

    this.draw(funnelData, startIndex, stepsDelta);

    return (
      <div className='mcs-funnel_steps'>
        {steps.map((step, index) => {
          return index >= startIndex
            ? this.renderStep(funnelData, index, steps, stepsDelta, dimensionMetrics)
            : undefined;
        })}
      </div>
    );
  }

  render() {
    const { startIndex, funnelData, filter, intl, isLoading, funnelId, initialState } = this.props;
    if (isLoading) return <LoadingChart />;

    return (
      <div id='outerContainer' style={{ display: 'flex', flexFlow: 'row' }}>
        <div style={{ flexBasis: 1, flexGrow: startIndex, position: 'relative' }} />
        <div style={{ flexBasis: 1, flexGrow: filter.length - startIndex, position: 'relative' }}>
          <Card className='mcs-funnel' bordered={false}>
            <div id={`container_${funnelId}`}>
              {!funnelData ||
              funnelData.global.steps.length === 0 ||
              funnelData.global.total === 0 ? (
                <div className='mcs-funnel_empty'>
                  {filter.length > 0 && !initialState ? (
                    <EmptyChart title={intl.formatMessage(funnelMessages.noData)} icon='warning' />
                  ) : (
                    <FunnelEmptyState />
                  )}
                </div>
              ) : (
                this.renderSteps(funnelData)
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }
}

export default compose<Props, FunnelProps>(injectNotifications, injectIntl, withRouter)(Funnel);
