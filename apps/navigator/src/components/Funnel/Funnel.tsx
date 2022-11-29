import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Card, Select, Button, Tag } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  FunnelFilter,
  Step,
  GroupedByFunnel,
  FunnelIdByDimension,
  isFieldValueFunnelResource,
  isFieldValueFunnelMultipleGroupByResource,
  FieldValuesFunnelResource,
} from '../../models/datamart/UserActivitiesFunnel';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../containers/Notifications/injectNotifications';
import { compose } from 'recompose';
import { uniqBy } from 'lodash';
import { EmptyChart, LoadingChart } from '@mediarithmics-private/mcs-components-library';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { funnelMessages } from './Constants';
import numeral from 'numeral';
import FunnelStepHover, { DimensionMetrics, GlobalMetrics } from './FunnelStepHover';
import cuid from 'cuid';
import { DimensionsList } from '../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import FunnelEmptyState from './FunnelEmptyState';
import { ComplementaryInfo } from './FunnelWrapper';
import { FunnelData, StepDelta } from './FunnelDataFetcher';

interface State {
  lastExecutedQueryAskedTime: number;
}

const FULL_HEIGHT = 370;
const REDUCED_HEIGHT = 260;

type FunnelProps = {
  funnelId: string;
  title?: string;
  startIndex: number;
  isLoading: boolean;
  datamartId: string;
  filter: FunnelFilter[];
  funnelData?: FunnelData;
  dimensionsList: DimensionsList;
  isStepLoading: boolean;
  initialState: boolean;
  stepsNumber?: number;
  fullHeight: boolean;
  shouldRenderHeader: boolean;
  enableSplitBy: boolean;
  closeGroupBy: () => void;
  openGroupBy: (index: number, dimensionName: string) => void;
  openComplementaryFunnel?: (complementaryInfo: ComplementaryInfo) => void;
  closeFunnel?: () => void;
};

type Props = FunnelProps &
  WrappedComponentProps &
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
    window.removeEventListener('resize', this.draw.bind(this));
  }

  componentDidMount() {
    window.addEventListener('resize', this.draw.bind(this));
  }

  draw = () => {
    const { funnelData, startIndex } = this.props;
    if (funnelData) this.drawSteps(funnelData, startIndex);
  };

  drawSteps = (funnelData: FunnelData, startIndex: number) => {
    if (!!funnelData) {
      const funnelResult = funnelData.groupedFunnel;
      const stepsDelta = funnelData.stepsDelta;
      const steps = funnelResult.global.steps.slice(startIndex);
      const total = funnelResult.global.total;

      steps.forEach((step: Step, index: number) => {
        const start =
          index === 0 && startIndex === 0
            ? total
            : funnelResult.global.steps[startIndex + index - 1].count;
        this.drawCanvas(
          funnelResult,
          total,
          start,
          step.count,
          index + 1 + startIndex,
          steps.length,
          stepsDelta,
        );
      });
    }
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
    const { funnelId, fullHeight, startIndex } = this.props;
    const container = document.getElementById(`container_${funnelId}`);
    const canvas = document.getElementById(`canvas_${funnelId}_${stepIndex}`) as HTMLCanvasElement;
    const pxHeight = fullHeight ? FULL_HEIGHT : REDUCED_HEIGHT;

    if (canvas) {
      const drawWidth = container && container.offsetWidth / totalSteps;
      const adjustedWidth = (drawWidth || 0) - 1;
      canvas.width = adjustedWidth;

      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      const dpi = window.devicePixelRatio;
      canvas.width = adjustedWidth * dpi;
      canvas.height = pxHeight * dpi;

      canvas.style.width = adjustedWidth.toString() + 'px';
      canvas.style.height = pxHeight + 'px';

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
        stepIndex,
        startIndex,
        ctx,
        total,
        startCount,
        endCount,
        adjustedWidth,
        passThroughPercentage,
        passThroughTime,
      );
    }
  };

  drawChart = (
    stepIndex: number,
    startIndex: number,
    ctx: CanvasRenderingContext2D,
    total: number,
    startCount: number,
    endCount: number,
    drawWidth: number,
    passThroughPercentage?: string,
    passThroughTime?: string,
  ) => {
    const { intl, fullHeight } = this.props;
    const drawerHeight = fullHeight ? FULL_HEIGHT : REDUCED_HEIGHT;
    const heightOffset = 40;

    const percentageStart = getPercentage(total - startCount, total);
    const percentageEnd = getPercentage(total - endCount, total);
    const stepStart =
      drawerHeight &&
      valueFromPercentage(percentageStart, drawerHeight - heightOffset) + heightOffset;
    const stepEnd =
      drawerHeight &&
      valueFromPercentage(percentageEnd, drawerHeight - heightOffset) + heightOffset;

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
    if (stepIndex > 1) ctx.fillText(`${passThroughPercentage}%`, 7, stepStart - 20);
    const textMeasure = ctx.measureText(`${passThroughPercentage}%`);

    ctx.font = '12px LLCircularWeb-Book';
    if (stepIndex > 1 && stepIndex > startIndex + 1) {
      ctx.fillText(
        `${intl.formatMessage(funnelMessages.hasSucceeded)} ${
          passThroughTime ? `${intl.formatMessage(funnelMessages.in)} ${passThroughTime}` : ''
        }`,
        textMeasure.width + 9,
        stepStart - 20,
      );
    }
  };

  computeDimensionMetricsHelper(
    fieldValueResource: FieldValuesFunnelResource,
    i: number,
    j: number,
    step: Step,
  ) {
    return {
      userPoints: {
        value: fieldValueResource.funnel.steps[i].count,
        pourcentage: getPercentage(fieldValueResource.funnel.steps[i].count, step.count),
        color: colors[j][0],
      },
      conversions:
        fieldValueResource.funnel.steps[i].conversion ||
        fieldValueResource.funnel.steps[i].conversion === 0
          ? {
              value: fieldValueResource.funnel.steps[i].conversion as number,
              pourcentage: getPercentage(
                fieldValueResource.funnel.steps[i].conversion as number,
                step.conversion as number,
              ),
              color: colors[j][0],
            }
          : undefined,
      amounts:
        fieldValueResource.funnel.steps[i].amount || fieldValueResource.funnel.steps[i].amount === 0
          ? {
              value: fieldValueResource.funnel.steps[i].amount as number,
              pourcentage: getPercentage(
                fieldValueResource.funnel.steps[i].amount as number,
                step.amount as number,
              ),
              color: colors[j][0],
            }
          : undefined,
    };
  }

  computeDimensionMetrics = (funnelData: GroupedByFunnel, index: number) => {
    const dimensionMetrics: DimensionMetrics[][] = [];
    funnelData.global.steps.forEach((step, i) => {
      dimensionMetrics.push([]);
      funnelData.grouped_by?.forEach((fieldValueResource, j) => {
        if (
          isFieldValueFunnelResource(fieldValueResource) &&
          fieldValueResource.dimension_value !== null &&
          fieldValueResource.funnel.steps[i]
        ) {
          dimensionMetrics[i].push(
            this.computeDimensionMetricsHelper(fieldValueResource, i, j, step),
          );
        } else if (
          isFieldValueFunnelMultipleGroupByResource(fieldValueResource) &&
          fieldValueResource.dimension_values[0] !== null &&
          fieldValueResource.funnel.steps[i]
        ) {
          dimensionMetrics[i].push(
            this.computeDimensionMetricsHelper(fieldValueResource, i, j, step),
          );
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
        dimensionValue === 'ORIGIN_CREATIVE_ID' ||
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
      if (isFieldValueFunnelResource(dimension)) {
        idByDimension.push({
          name: dimension.dimension_name,
          id: dimension.dimension_value,
          colors: colors[i],
          decorator: dimension.dimension_decorator,
        });
      } else {
        idByDimension.push({
          name: dimension.dimension_names[0],
          id: dimension.dimension_values[0],
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

  private hasTransactionConfirmed = (filter?: FunnelFilter) =>
    !!filter &&
    !!filter.filter_clause &&
    !!filter.filter_clause.filters.find(f => f.expressions.includes('$transaction_confirmed'));

  private getConversionDescription = (
    filter?: FunnelFilter,
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

  shouldDisplaySplitByDropdown = (filter: FunnelFilter) => {
    return filter.filter_clause.filters.find(
      f =>
        f.dimension_name === 'CHANNEL_ID' ||
        f.dimension_name === 'DEVICE_FORM_FACTOR' ||
        f.dimension_name === 'BRAND' ||
        f.dimension_name === 'PRODUCT_ID' ||
        f.dimension_name === 'ORIGIN_CREATIVE_ID',
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
    return filter.findIndex(x => !!x.group_by_dimensions?.length);
  }

  renderStep(
    funnelData: GroupedByFunnel,
    index: number,
    steps: Step[],
    stepsDelta: StepDelta[],
    dimensionMetrics: any,
  ) {
    const {
      funnelId,
      intl,
      filter,
      isStepLoading,
      fullHeight,
      startIndex,
      shouldRenderHeader,
      enableSplitBy,
    } = this.props;
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
          {shouldRenderHeader
            ? this.getStepTitle(funnelData, index, steps[index - 1]?.count)
            : undefined}

          {index > 0 && shouldRenderHeader
            ? this.getConversionDescription(filter[index - 1], conversion, amount)
            : undefined}

          <div className={'mcs-funnel_splitBy'} id='mcs-funnel_splitBy'>
            {index > 0 &&
            steps[index - 1] &&
            steps[index - 1].count > 0 &&
            filter[index - 1] &&
            this.shouldDisplaySplitByDropdown(filter[index - 1]) &&
            enableSplitBy ? (
              <Select
                key={this._cuid()}
                disabled={splitIndex === index && isStepLoading}
                loading={splitIndex === index && isStepLoading}
                className='mcs-funnel_splitBy_select'
                value={filter[index - 1].group_by_dimensions?.[0]}
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
          height={fullHeight ? `${FULL_HEIGHT}` : `${REDUCED_HEIGHT}`}
        />
        {index > startIndex && (
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

  renderSteps(funnelData: FunnelData) {
    const { startIndex, filter } = this.props;
    const funnelResult = funnelData.groupedFunnel;
    const stepsDelta = funnelData.stepsDelta;

    let splitIndex = this.splitIndex(filter);
    splitIndex = splitIndex === -1 ? splitIndex : splitIndex + 1;

    const steps = funnelResult.global.steps;

    splitIndex = splitIndex === -1 ? splitIndex : splitIndex + 1;
    const splitBy = splitIndex !== -1;

    const dimensionMetrics =
      funnelResult.grouped_by && splitBy
        ? this.computeDimensionMetrics(funnelResult, splitIndex)
        : [];

    this.draw();
    return (
      <div className='mcs-funnel_steps'>
        {steps.map((step, index) => {
          return index >= startIndex && stepsDelta
            ? this.renderStep(funnelResult, index, steps, stepsDelta, dimensionMetrics)
            : undefined;
        })}
      </div>
    );
  }

  renderShowComplementaryFunnelButtons(
    stepsNumber: number,
    startIndex: number,
    showComplementaryFunnel: (index: number) => void,
  ) {
    const { intl } = this.props;
    const buttonIndices = new Array(stepsNumber + 1).fill(0);
    const buttons = buttonIndices.map((step, index) => {
      const onClick = () => showComplementaryFunnel(index);
      const className =
        index === 0 || index === buttonIndices.length - 1
          ? 'mcs-funnel_complementaryButton_hidden'
          : undefined;
      return (
        <div key={index} className='mcs-funnel_complementaryButton'>
          <Button
            className={className}
            disabled={index === 0 || index === buttonIndices.length - 1}
            onClick={onClick}
          >
            {intl.formatMessage(funnelMessages.showDropoutFunnel)}
          </Button>
        </div>
      );
    });

    return (
      <div id='outerContainer' className='mcs-funnel_container'>
        <div className='mcs-funnel_element' style={{ flexGrow: startIndex }} />
        <div className='mcs-funnel_element' style={{ flexGrow: stepsNumber - startIndex }}>
          <div className='mcs-funnel_steps mcs-funnel_complementaryButtonsContainer'>{buttons}</div>
        </div>
      </div>
    );
  }

  render() {
    const {
      title,
      startIndex,
      funnelData,
      filter,
      intl,
      isLoading,
      funnelId,
      stepsNumber,
      initialState,
      closeFunnel,
      openComplementaryFunnel,
    } = this.props;
    if (isLoading) return <LoadingChart />;

    const _stepsNumber = stepsNumber ? stepsNumber : Math.max(filter.length, 1);
    const funnelResult = funnelData?.groupedFunnel;

    const showComplementaryFunnel = openComplementaryFunnel
      ? (index: number, newFunnelResult: GroupedByFunnel) => {
          const complementaryInfo = {
            index: index,
            funnelData: newFunnelResult,
          };
          openComplementaryFunnel(complementaryInfo);
        }
      : undefined;

    return (
      <div>
        <div
          id='outerContainer'
          className='mcs-funnel_container'
          style={{ display: 'flex', flexFlow: 'row' }}
        >
          <div className='mcs-funnel_element' style={{ flexGrow: startIndex }} />
          <div
            className='mcs-funnel_element'
            style={{ flexGrow: _stepsNumber - startIndex, position: 'relative' }}
          >
            {title ? <div className={'mcs-funnel_title'}>{title}</div> : undefined}
            {closeFunnel ? (
              <Button
                shape='circle'
                icon={<CloseOutlined />}
                className={'mcs-funnel_closeFunnel'}
                onClick={closeFunnel}
              />
            ) : undefined}
            <Card className='mcs-card mcs-funnel' bordered={false}>
              <div id={`container_${funnelId}`}>
                {!funnelResult ||
                funnelResult.global.steps.length === 0 ||
                funnelResult.global.total === 0 ? (
                  <div className='mcs-funnel_empty'>
                    {funnelResult && !initialState ? (
                      <EmptyChart
                        title={intl.formatMessage(funnelMessages.noData)}
                        icon='warning'
                      />
                    ) : (
                      <FunnelEmptyState />
                    )}
                  </div>
                ) : (
                  funnelData && this.renderSteps(funnelData)
                )}
              </div>
            </Card>
          </div>
        </div>
        {showComplementaryFunnel && !!funnelResult
          ? this.renderShowComplementaryFunnelButtons(_stepsNumber, startIndex, index =>
              showComplementaryFunnel(index, funnelResult),
            )
          : undefined}
      </div>
    );
  }
}

export default compose<Props, FunnelProps>(injectNotifications, injectIntl, withRouter)(Funnel);
