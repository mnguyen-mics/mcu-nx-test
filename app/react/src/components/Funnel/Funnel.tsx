import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Card, Select, Button } from 'antd';
import moment from 'moment';
import { IUserActivitiesFunnelService } from '../../services/UserActivitiesFunnelService';
import { TYPES } from '../../constants/types';
import { lazyInject } from '../../config/inversify.config';
import { FunnelFilter, FunnelTimeRange, Steps, GroupedByFunnel, FunnelIdByDimension } from '../../models/datamart/UserActivitiesFunnel';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../containers/Notifications/injectNotifications';
import { compose } from 'recompose';
import { debounce } from 'lodash';
import { EmptyChart, LoadingChart } from '@mediarithmics-private/mcs-components-library';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import {
  updateSearch,
  parseSearch
} from '../../utils/LocationSearchHelper';
import { funnelMessages, FUNNEL_SEARCH_SETTING } from './Constants';
import { extractDatesFromProps } from './Utils';
import numeral from 'numeral';
import FunnelStepHover, { DimensionMetrics, GlobalMetrics } from './FunnelStepHover';
import cuid from 'cuid';
import { IUsersAnalyticsService } from '../../services/UsersAnalyticsService';
import { DimensionsList } from '../../models/datamartUsersAnalytics/datamartUsersAnalytics';


const Option = Select.Option;

interface StepDelta {
  dropOff?: string;
  passThroughPercentage?: string;
}

interface State {
  isLoading: boolean;
  funnelData: GroupedByFunnel;
  stepsDelta: StepDelta[];
  dimensionMetrics: DimensionMetrics[][];
  lastExecutedQueryAskedTime: number;
  promiseCanceled: boolean;
  splitByView: boolean;
  dimensionsList: DimensionsList;
}

type FunnelProps = {
  datamartId: string;
  filter: FunnelFilter[];
  title: string;
  parentCallback: (isLoading: boolean) => void;
  launchExecutionAskedTime: number;
  cancelQueryAskedTime: number;
}

type Props = FunnelProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<void>;

const getPercentage = (nbr: number, total: number): number => {
  return (nbr * 100) / total;
}

const deepCopy = (value: any) => {
  return JSON.parse(JSON.stringify(value));
}

const valueFromPercentage = (percentage: number, drawerAreaHeight: number): number => {
  return (percentage * drawerAreaHeight) / 100;
}

const colors = [
  ['#00a1df','#e8f7fc'], 
  ['#fd7c12','#ffe7d4'], 
  ['#00ab67','#d1f0e4'],
  ['#7057d1','#d5ccff'],
  ['#eb5c5d','#ffcccc']
];

class Funnel extends React.Component<Props, State> {
  @lazyInject(TYPES.IUsersAnalyticsService)
  private _usersAnalyticsService: IUsersAnalyticsService;
  @lazyInject(TYPES.IUserActivitiesFunnelService)
  private _userActivitiesFunnelService: IUserActivitiesFunnelService;
  private _debounce = debounce;
  private _cuid = cuid;

  updateLocationSearch = (params: any) => {
    const {
      history
    } = this.props;

    const {
      location: { search: currentSearch, pathname }
    } = history;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, FUNNEL_SEARCH_SETTING),
    };
    history.push(nextLocation);
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      funnelData: {
        global: {
          total: 0,
          steps: []
        },
        grouped_by: []
      },
      stepsDelta: [],
      dimensionMetrics: [],
      lastExecutedQueryAskedTime: 0,
      promiseCanceled: false,
      splitByView: false,
      dimensionsList: {
        dimensions: []
      }
    }

    this.fetchData = this._debounce(this.fetchData.bind(this), 800);
  }

  componentDidMount() {
    const {
      datamartId,
      filter,
      history: { location: { search } }, } = this.props;
    const timeRange = extractDatesFromProps(search);
    if (filter.length > 0) this.fetchData(datamartId, filter, timeRange);
    this.fetchDimensions(datamartId);
    window.addEventListener('resize', this.drawSteps.bind(this));
  }

  fetchDimensions = (datamartId: string) => {
    this.setState({
      isLoading: true
    });
    return this._usersAnalyticsService
      .getDimensions(datamartId, true).then((response) => {
        this.setState({
          isLoading: false,
          dimensionsList: {
            dimensions: response.data.dimensions
          }
        });
      })
      .catch(e => {
        this.props.notifyError(e);
        this.setState({
          isLoading: false,
        });
      });
  }

  componentDidUpdate(prevProps: Props) {
    const {
      datamartId,
      location: { search },
      launchExecutionAskedTime,
      cancelQueryAskedTime
    } = this.props;
    const lastExecutedQueryAskedTime = this.state.lastExecutedQueryAskedTime
    const timeRange = extractDatesFromProps(search);
    const routeParams = parseSearch(search, FUNNEL_SEARCH_SETTING);
    const funnelFilter = routeParams.filter.length > 0 ? JSON.parse(routeParams.filter) : {};
    if ((prevProps.location.search !== search || lastExecutedQueryAskedTime !== launchExecutionAskedTime) && funnelFilter.length > 0) {
      this.setState({ lastExecutedQueryAskedTime: launchExecutionAskedTime, promiseCanceled: false })
      this.fetchData(datamartId, funnelFilter, timeRange);
    }

    if (prevProps.cancelQueryAskedTime !== cancelQueryAskedTime) {
      this.setState({
        isLoading: false,
        funnelData: {
          global: {
            total: 0,
            steps: []
          },
          grouped_by: []
        },
        stepsDelta: [],
        promiseCanceled: true,
        splitByView: false
      })
    }
  }

  // listener cleanup
  componentWillUnmount() {
    window.removeEventListener('resize', this.drawSteps.bind(this))
  }

  fetchData = (datamartId: string, filter: FunnelFilter[], timeRange: FunnelTimeRange, splitBy?: boolean, index?: number) => {
    const { parentCallback, notifyError } = this.props;

    this.setState({
      isLoading: !splitBy,
      splitByView: !!splitBy
    }, () => {
      parentCallback(this.state.isLoading)
    });

    return this._userActivitiesFunnelService.getUserActivitiesFunnel(datamartId, filter, timeRange, 5).
      then(response => {
        // Enhance api data with last conversion step
        if (!this.state.promiseCanceled) {
          response.data.global.steps.push(deepCopy(response.data.global.steps[response.data.global.steps.length - 1]));
          response.data.grouped_by?.map((dimension)=> dimension.funnel.steps.push(deepCopy(dimension.funnel.steps[dimension.funnel.steps.length - 1])));
          this.setState({
            isLoading: false,
            funnelData: response.data
          }, () => {
            setTimeout(() => {
              this.drawSteps();
              const upCountsPerStep = response.data.global.steps.map(step => step.count);
              upCountsPerStep.unshift(response.data.global.total);
              upCountsPerStep.pop();
              this.computeStepDelta(upCountsPerStep);
              if (response.data.grouped_by && index) this.computeDimensionMetrics(index);
            });
            parentCallback(this.state.isLoading);
          });
        }
      })
      .catch(e => {
        notifyError(e);
        this.setState({
          isLoading: false,
        }, () => {
          parentCallback(false)
        });
      });
  }

  drawSteps = () => {
    const { funnelData } = this.state;

    funnelData.global.steps.forEach((step: Steps, index: number) => {
      const start = index === 0 ? funnelData.global.total : funnelData.global.steps[index - 1].count;
      this.drawCanvas((funnelData.global.total - start), (funnelData.global.total - step.count), index, funnelData.global.steps.length);
    });
  }

  drawCanvas = (startCount: number, endCount: number, StepIndex: number, totalSteps: number) => {
    const container = document.getElementById("container");
    const canvas = document.getElementById(`canvas_${StepIndex + 1}`) as HTMLCanvasElement;

    const drawWidth = container && (container.offsetWidth / totalSteps);    
    canvas.width = drawWidth || 0;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    this.drawChart(ctx, startCount, endCount, canvas.width, colors[0]);
  }


  drawChart = (ctx: CanvasRenderingContext2D, startCount: number, endCount: number,  drawWidth: number, strokeColors: string[]) => {
    const { funnelData } = this.state;
    const drawerHeight = 370;
    const percentageStart = getPercentage(startCount, funnelData.global.total);
    const percentageEnd = getPercentage(endCount, funnelData.global.total);
    const stepStart = drawerHeight && valueFromPercentage(percentageStart, drawerHeight);
    const stepEnd = drawerHeight && valueFromPercentage(percentageEnd, drawerHeight);

    ctx.beginPath();

    ctx.lineWidth = 2;
    ctx.moveTo(0, stepStart);
    ctx.lineTo(drawWidth, stepEnd);
    ctx.strokeStyle = strokeColors[0];
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, stepStart);
    ctx.lineTo(drawWidth, stepEnd);
    ctx.lineTo(drawWidth, 1000);
    ctx.lineTo(0, 1000);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, '#1ad2f263');
    gradient.addColorStop(1, '#0ba6e126');
    ctx.fillStyle = gradient;
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  formatPercentageValue = (value: number) => {
    if (value >= 0.01) {
      return value.toFixed(2)
    } else if (value >= 0.0001) {
      return value.toFixed(4)
    } else if (value === 0) {
      return value.toString();
    } else {
      const exponentialDigits = 2
      return value.toExponential(exponentialDigits)
    }
  }
  
  computeStepDelta = (upCountsPerStep: number[]) => {
    const stepsDelta: StepDelta[] = upCountsPerStep.map((step, i) => {
      let dropOff;
      
      if (i < upCountsPerStep.length - 1) {
        const nextStep = upCountsPerStep[i + 1];
        const passThroughPercentage = nextStep > 0 && step > 0 ? (nextStep / step) * 100 : 0;
        dropOff = 100 - passThroughPercentage
        return {
          passThroughPercentage: this.formatPercentageValue(passThroughPercentage),
          dropOff: this.formatPercentageValue(dropOff),
        }
      }
      else {
        return { 
          dropOff: this.formatPercentageValue(step > 0 && upCountsPerStep[0] > 0 ? (step / upCountsPerStep[0]) * 100  : 0)
        };
      }
    });

    this.setState({
      stepsDelta
    });
  }

  computeDimensionMetrics = (index: number) => {
    const { funnelData } = this.state;
    const dimensionMetrics: DimensionMetrics[][] = [];
    funnelData.global.steps.forEach((steps, i) => {
      dimensionMetrics.push([]);
      funnelData.grouped_by?.forEach((dimension, j) => {
        if (dimension.dimension_value !== null) {
          dimensionMetrics[i].push({
            userPoints: {
              value: dimension.funnel.steps[i].count,
              pourcentage: getPercentage(dimension.funnel.steps[i].count, steps.count),
              color: colors[j][0]
            },
            conversions: dimension.funnel.steps[i].conversion || dimension.funnel.steps[i].conversion === 0  ? {
              value: dimension.funnel.steps[i].conversion as number,
              pourcentage: getPercentage(dimension.funnel.steps[i].conversion as number, steps.conversion as number),
              color: colors[j][0]
            } : undefined,
            amounts: dimension.funnel.steps[i].amount || dimension.funnel.steps[i].amount === 0 ? {
              value: dimension.funnel.steps[i].amount as number,
              pourcentage: getPercentage(dimension.funnel.steps[i].amount as number, steps.amount as number),
              color: colors[j][0]
            } : undefined
          });
        }
      });
    });
    funnelData.global.steps[index].splitedView = true;
    funnelData.global.steps[index].isLoading = false;
    this.setState({
      funnelData,
      dimensionMetrics,
      splitByView: true
    });
  }

  handleSplitByDimension = (index: number, value: string) => {
    const { funnelData } = this.state;
    const {
      datamartId,
      location: { search }
    } = this.props;
    funnelData.global.steps[index].isLoading = true;

    funnelData.global.steps.forEach((step)=> step.splitedView = false);
    const timeRange = extractDatesFromProps(search);
    const routeParams = parseSearch(search, FUNNEL_SEARCH_SETTING);
    const funnelFilter = routeParams.filter.length > 0 ? JSON.parse(routeParams.filter) : {};
    funnelFilter[index - 1].group_by_dimension = value.toLocaleLowerCase();
    this.fetchData(datamartId, funnelFilter, timeRange, true, index);
    this.setState({
      funnelData
    });
  }

  closeSplitByHover = (index: number,) => {
    const { funnelData } = this.state;
    funnelData.global.steps[index].splitedView = false;
    this.setState({
      funnelData,
      splitByView: false
    });
  }

  isLastStep = (stepNumber: number) => {
    const { funnelData } = this.state;
    return funnelData.global.steps.length === stepNumber;
  }

  isFirstStep = (stepNumber: number) => {
    return stepNumber === 0;
  }

  getLabelValueForDimension = (dimensionValue: string) => {
    const { dimensionsList } = this.state;
    const dimensionLabelValue = dimensionsList.dimensions.find((d) => d.value === dimensionValue)
    return dimensionValue === 'CHANNEL_ID' && <Option className="mcs-funnelSplitBy_option" key={this._cuid()} value={dimensionLabelValue?.value}>{dimensionLabelValue?.label}</Option>
  }

  private getDurationMessage(stepIndex: number, seconds: number) {
    return this.isFirstStep(stepIndex) ? <span /> : <span> in <span className={"mcs-funnel_metric"}>{moment.duration(seconds, "second").format("d [day] h [hour] m [minute]")}</span></span>
  }

  private getStepHover = (index: number, dimensionMetrics: DimensionMetrics[], filter: FunnelFilter) => {
    const { funnelData } = this.state;
    const globalMetrics: GlobalMetrics = {
      userPoints: funnelData.global.steps[index - 1].count,
      conversions: funnelData.global.steps[index - 1].conversion,
      amounts: funnelData.global.steps[index - 1].amount
    };

    const idByDimension: FunnelIdByDimension[] = [];
    funnelData.grouped_by?.forEach((dimension, i) => {
      if (dimension.dimension_value !== null) {
        idByDimension.push({
          name: dimension.dimension_name,
          id: dimension.dimension_value,
          colors: colors[i]
        });
      }

    });

    return <FunnelStepHover 
              key={this._cuid()}
              globalMetrics={globalMetrics} 
              idByDimension={idByDimension} 
              dimensionMetrics={dimensionMetrics} 
              stepNumber={index} 
              hasTransactionConfirmed={this.hasTransactionConfirmed(filter)} />
  }

  private hasTransactionConfirmed = (filter: FunnelFilter) => filter.filter_clause && !!filter.filter_clause.filters.find(f => f.expressions.includes('$transaction_confirmed'));

  private getConversionDescription = (filter: FunnelFilter, conversion?: string, amount?: string) => {
    if (this.hasTransactionConfirmed(filter)) {
      return (<p className={'mcs-funnel_stepInfo_desc'}>
        {conversion && <span>Users bought <span className={'mcs-funnel_stepInfo_metric'}>{conversion}</span> units</span>}{ amount && <span><br /> for a total of <span className={'mcs-funnel_stepInfo_metric'}>{amount}</span></span>}
      </p>)
    }
    return (<p className={'mcs-funnel_stepInfo_desc'}>
              {conversion && <span><span className={'mcs-funnel_stepInfo_metric'}>{conversion}</span> units were linked to this step</span>}{ amount && <span><br /> for a total of <span className={'mcs-funnel_stepInfo_metric'}>{amount}</span></span>}
            </p>)
  }

  displaySplitByDropdown = (filter: FunnelFilter) => {
    return filter.filter_clause.filters.find(f=> f.dimension_name === 'CHANNEL_ID');
  }

  render() {
    const { funnelData, stepsDelta, dimensionMetrics, isLoading } = this.state;
    const { filter } = this.props;
    const { intl } = this.props;
    if (isLoading) return (<LoadingChart />);
    const steps = funnelData.global.steps;
    const total = funnelData.global.total;
    return (
      <Card className="mcs-funnel">
        <div id="container" >
          {steps.length === 0 || total === 0 ?
            <div className="mcs-funnel_empty">
              <EmptyChart title={intl.formatMessage(funnelMessages.noData)} icon='warning' />
            </div> :
            <div className="mcs-funnel_steps" >
              {steps.map((step, index) => {

                const conversion = index > 0 && steps[index - 1].hasOwnProperty("conversion") ?
                    numeral(steps[index - 1].conversion).format('0,0') : undefined;
                const amount = index > 0 && steps[index - 1].hasOwnProperty("amount") ?
                    `${numeral(steps[index - 1].amount).format('0,0')}€` : undefined;
                return <div key={index.toString()} style={{ flex: 1, position: 'relative' }} >
                  <div className={"mcs-funnel_chart"}>
                    <div className={"mcs-funnel_stepInfo"}>
                      <p className={'mcs-funnel_stepInfo_desc'}><span className={'mcs-funnel_stepInfo_metric'}>{numeral(index === 0 ? total : steps[index - 1].count).format('0,0')} </span>{index > 0 ? `user points at step ${index}` : 'total user points'}</p>
                      {index > 0 && filter[index - 1] ? this.getConversionDescription(filter[index - 1], conversion, amount) : undefined}

                      <div className={"mcs-funnel_splitBy"}>               
                        {(index > 0 && steps[index - 1] && steps[index - 1].count > 0 && (filter[index - 1] && this.displaySplitByDropdown(filter[index - 1]))) ?  <Select key={this._cuid()} disabled={steps[index].isLoading} loading={steps[index].isLoading} className="mcs-funnel_splitBy_select" value={filter[index - 1].group_by_dimension} placeholder="Split by" onChange={this.handleSplitByDimension.bind(this, index)}>
                            {filter[index - 1].filter_clause.filters.map((dimension)=> this.getLabelValueForDimension(dimension.dimension_name))} 
                          </Select> : undefined}
                      </div>
                    </div>
               
                  {(index > 0 && steps[index].splitedView) ? 
                    <Button
                      icon="cross"
                      className={"mcs-funnel_disableStepHover"}
                      onClick={this.closeSplitByHover.bind(this, index)} /> : undefined}
                    {index > 0 && filter[index - 1] && steps[index].splitedView ? this.getStepHover(index, dimensionMetrics[index-1], filter[index - 1]) : undefined}
                
                    {stepsDelta[index] && stepsDelta[index].passThroughPercentage && (steps[index + 1] && !steps[index + 1].splitedView)? <div className="mcs-funnel_percentageOfSucceeded">
                      <div className="mcs-funnel_arrow mcs_funnel_arrowStep" />
                      <p className="mcs-funnel_deltaInfo"><span className={"mcs-funnel_metric"}>{`${stepsDelta[index ].passThroughPercentage}%`}</span> have succeeded {this.getDurationMessage(index, steps[index + 1].interaction_duration )}</p>
                    </div> : undefined}
                    <canvas id={`canvas_${index + 1}`} className={"mcs-funnel_canvas"} height="370" />
                    <div className="mcs-funnel_conversionInfo">
                      <div className={this.isLastStep(index + 1) ? "mcs-funnel_arrow mcs-funnel_arrow--success" : "mcs-funnel_arrow  mcs-funnel_arrow--failed"} />
                      <div className="mcs-funnel_deltaInfo">
                        <b>{stepsDelta[index] && `${stepsDelta[index].dropOff}%`}</b><br />
                        <p>{this.isLastStep(index + 1) ? "Conversions" : "Dropoffs"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              }
              )}
            </div>
          }
        </div>
      </Card >
    )
  }
}

export default compose<Props, FunnelProps>(
  injectNotifications,
  injectIntl,
  withRouter
)(Funnel);