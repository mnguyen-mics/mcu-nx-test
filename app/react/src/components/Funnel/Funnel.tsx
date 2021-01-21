import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Card } from 'antd';
import moment from 'moment';
import { IUserActivitiesFunnelService } from '../../services/UserActivitiesFunnelService';
import { TYPES } from '../../constants/types';
import { lazyInject } from '../../config/inversify.config';
import { FunnelFilter, FunnelTimeRange, Steps, GroupedByFunnel } from '../../models/datamart/UserActivitiesFunnel';
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


interface StepDelta {
  dropOff?: string;
  passThroughPercentage?: string;
}

interface State {
  isLoading: boolean;
  funnelData: GroupedByFunnel;
  stepsDelta: StepDelta[];
  lastExecutedQueryAskedTime: number;
  promiseCanceled: boolean;
  splitPerChannel: boolean;
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

const valueFromPercentage = (percentage: number, drawerAreaHeight: number): number => {
  return (percentage * drawerAreaHeight) / 100;
}


class Funnel extends React.Component<Props, State> {
  @lazyInject(TYPES.IUserActivitiesFunnelService)
  private _userActivitiesFunnelService: IUserActivitiesFunnelService;
  private _debounce = debounce;

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
      lastExecutedQueryAskedTime: 0,
      promiseCanceled: false,
      splitPerChannel: true
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
    window.addEventListener('resize', this.drawSteps.bind(this));
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
        promiseCanceled: true
      })
    }
  }

  // listener cleanup
  componentWillUnmount() {
    window.removeEventListener('resize', this.drawSteps.bind(this))
  }

  fetchData = (datamartId: string, filter: FunnelFilter[], timeRange: FunnelTimeRange) => {
    const { parentCallback, notifyError } = this.props;

    this.setState({
      isLoading: true,
      stepsDelta: [],
      funnelData: {
        global: {
          total: 0,
          steps: []
        },
        grouped_by: []
      },
    }, () => {
      parentCallback(this.state.isLoading)
    });

    return this._userActivitiesFunnelService.getUserActivitiesFunnel(datamartId, filter, timeRange).
      then(response => {
        // Enhance api data with last conversion step
        if (!this.state.promiseCanceled) {
          const apiResponse: FunnelResource = response.data.global;
          apiResponse.steps.push(apiResponse.steps[apiResponse.steps.length - 1]);
          apiResponse.grouped_by.map((channel)=> channel.funnel.steps.push(channel.funnel.steps[channel.funnel.steps.length - 1]))
          this.setState({
            isLoading: false,
            funnelData: apiResponse
          }, () => {
            setTimeout(() => {
              this.drawSteps();
              const upCountsPerStep = apiResponse.steps.map(step => step.count);
              upCountsPerStep.unshift(apiResponse.total);
              upCountsPerStep.pop();
              this.computeStepDelta(upCountsPerStep);
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
    const { funnelData, splitPerChannel } = this.state;
    const container = document.getElementById("container");
    const canvas = document.getElementById(`canvas_${StepIndex + 1}`) as HTMLCanvasElement;

    const drawWidth = container && (container.offsetWidth / totalSteps);

    canvas.width = drawWidth || 0;

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const colors = [
      ['#2a67e7','#9ebeff'], 
      ['#c64522','#ffb494'], 
      ['#119345','#86daa7'],
      ['#3e19b2','#b799ff'],
      ['#fdc72f','#ffe39f']
    ];  

    if (splitPerChannel) {
        funnelData.grouped_by.forEach((channel, index) => {  
          const startCountForSplit = StepIndex === 0 ? funnelData.global.total : channel.funnel.steps[StepIndex - 1].count
          this.drawChart(
            ctx, 
            (funnelData.global.total - startCountForSplit), 
            (funnelData.global.total - channel.funnel.steps[StepIndex].count), 
            canvas.width,
            colors[index]
          )
        })
    }
    else {
      this.drawChart(ctx, startCount, endCount, canvas.width, colors[0])
    }
  }


  drawChart = (ctx: CanvasRenderingContext2D, startCount: number, endCount: number,  drawWidth: number, colors: string[]) => {
    const { funnelData } = this.state;
    const drawerHeight = 370;
    const percentageStart = getPercentage(startCount, funnelData.global.total);
    const percentageEnd = getPercentage(endCount, funnelData.global.total);
    const stepStart = drawerHeight && valueFromPercentage(percentageStart, drawerHeight);
    const stepEnd = drawerHeight && valueFromPercentage(percentageEnd, drawerHeight);

    ctx.beginPath();

    ctx.lineWidth = 3;
    ctx.moveTo(0, stepStart);
    ctx.lineTo(drawWidth, stepEnd);
    ctx.strokeStyle = colors[0];
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, stepStart);
    ctx.lineTo(drawWidth, stepEnd);
    ctx.lineTo(drawWidth, 1000);
    ctx.lineTo(0, 1000);
    ctx.closePath();

    ctx.fillStyle = colors[1];
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


  isLastStep = (stepNumber: number) => {
    const { funnelData } = this.state;
    return funnelData.global.steps.length === stepNumber;
  }

  isFirstStep = (stepNumber: number) => {
    return stepNumber === 0;
  }

  private getDurationMessage(stepIndex: number, seconds: number) {
    return this.isFirstStep(stepIndex) ? <span /> : <span> in <strong>{moment.duration(seconds, "second").format("d [day] h [hour] m [minute]")}</strong></span>
  }

  render() {
    const { funnelData, stepsDelta, isLoading } = this.state;
    const { title, intl } = this.props;
    if (isLoading) return (<LoadingChart />);
    const steps = funnelData.global.steps;
    const total = funnelData.global.total;
    return (
      <Card className="mcs-funnel">
        <div id="container" >
          <div className="mcs-funnel_header">
            <h1 className="mcs-funnel_header_title">{title}</h1>
          </div>
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

                return <div key={index.toString()} style={{ flex: 1 }} >
                  <div className={"mcs-funnel_stepName"}>
                    <h3 className="mcs-funnel_stepName_title">{index === 0 ? 'Total' : 'Step ' + index} </h3>
                  </div>
                  <div className={"mcs-funnel_metricsBlock"}>
                    <div className={"mcs-funnel_metric"}>
                      <div className="mcs-funnel_metric_title">UserPoints</div>
                      <div className="mcs-funnel_metric_nbr">{numeral(index === 0 ? total : steps[index - 1].count).format('0,0')}</div>
                    </div>
                    {conversion && <div className={"mcs-funnel_metric"}>
                      <div className="mcs-funnel_metric_title">Conversion</div>
                      <div className="mcs-funnel_metric_nbr">{conversion}</div>
                    </div>}
                    {amount && <div className={"mcs-funnel_metric"}>
                      <div className="mcs-funnel_metric_title">Amount</div>
                      <div className="mcs-funnel_metric_nbr">{amount}</div>
                    </div>}
                  </div>
     
                  <div className={"mcs-funnel_chart"}>

                    {stepsDelta[index] && stepsDelta[index].passThroughPercentage ? <div className="mcs-funnel_percentageOfSucceeded">
                      <div className="mcs-funnel_arrow mcs_funnel_arrowStep" />
                      <p className="mcs-funnel_stepInfo"><strong>{`${stepsDelta[index].passThroughPercentage}%`}</strong> have succeeded {this.getDurationMessage(index, steps[index + 1].interaction_duration )}</p>
                    </div> : ""}

                    {<canvas id={`canvas_${index + 1}`} className={"mcs-funnel_canvas"} height="370" />}

                    <div className="mcs-funnel_conversionInfo">
                      <div className={this.isLastStep(index + 1) ? "mcs-funnel_arrow mcs-funnel_arrow--success" : "mcs-funnel_arrow  mcs-funnel_arrow--failed"} />
                      <div className="mcs-funnel_stepInfo">
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