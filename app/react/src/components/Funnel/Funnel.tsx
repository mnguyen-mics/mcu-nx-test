import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Card } from 'antd';
import moment from 'moment';
import { IUserActivitiesFunnelService } from '../../services/UserActivitiesFunnelService';
import { TYPES } from '../../constants/types';
import { lazyInject } from '../../config/inversify.config';
import { FunnelFilter, FunnelTimeRange, FunnelResource } from '../../models/datamart/UserActivitiesFunnel';
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
import chroma from 'chroma-js';

interface StepDelta {
  dropOff?: string;
  passThroughPercentage?: string;
}

interface State {
  isLoading: boolean;
  funnelData: FunnelResource;
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
        total: 0,
        steps: []
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
          total: 0,
          steps: []
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
        total: 0,
        steps: []
      }
    }, () => {
      parentCallback(this.state.isLoading)
    });

    return this._userActivitiesFunnelService.getUserActivitiesFunnel(datamartId, filter, timeRange).
      then(response => {
        // Enhance api data with last conversion step
        if (!this.state.promiseCanceled) {
          const apiResponse: FunnelResource = response.data.global || response.data;
          apiResponse.steps.push(apiResponse.steps[apiResponse.steps.length - 1]);
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

    funnelData.steps.forEach((step, index) => {
      const start = index === 0 ? funnelData.total : funnelData.steps[index - 1].count;
      this.drawCanvas((funnelData.total - start), (funnelData.total - step.count), index + 1, funnelData.steps.length, funnelData.steps[index].splitPerChannel);
    });
  }

  drawCanvas = (startCount: number, endCount: number, stepNumber: number, totalSteps: number, channels: any) => {
    const { funnelData, splitPerChannel } = this.state;
    const container = document.getElementById("container");
    const canvas: any = document.getElementById(`canvas_${stepNumber}`);

    const drawWidth = container && (container.offsetWidth / totalSteps);
    const drawerAreaHeight = 370;
    canvas.width = drawWidth || 0;


    const ctx = canvas.getContext("2d");
    const colors = ['green', 'orange', 'pink']
    if (splitPerChannel) {
      const splitPerChannel = funnelData.steps[stepNumber - 1].splitPerChannel
      if (splitPerChannel) {
        splitPerChannel.forEach((channel, index) => {
      
          const stepIndex = (stepNumber === 1) ?  stepNumber - 1 : stepNumber;

          const startCount = stepIndex === 0 ? funnelData.total : (funnelData.steps[stepNumber - 2].splitPerChannel as any)[index].count
          if (stepIndex > 0) console.log((funnelData.steps[stepIndex - 1].splitPerChannel as any)[index].count)
          const percentageStart = getPercentage((funnelData.total - startCount), funnelData.total);
          const percentageEnd = getPercentage((funnelData.total - channel.count), funnelData.total);
          const stepStart = drawerAreaHeight && valueFromPercentage(percentageStart, drawerAreaHeight);
          const stepEnd = drawerAreaHeight && valueFromPercentage(percentageEnd, drawerAreaHeight);
          
          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.moveTo(0, stepStart);
          ctx.lineTo(drawWidth, stepEnd);
          ctx.strokeStyle = colors[index];
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(0, stepStart + 1);
          ctx.lineTo(drawWidth, stepEnd);
          ctx.lineTo(drawWidth, 1000);
          ctx.lineTo(0, 1000);
          ctx.closePath();
      
          ctx.fillStyle = colors[index];
          ctx.fill();
        })
      }

    }
    else {
      const percentageStart = getPercentage(startCount, funnelData.total);
      const percentageEnd = getPercentage(endCount, funnelData.total);
      const stepStart = drawerAreaHeight && valueFromPercentage(percentageStart, drawerAreaHeight);
      const stepEnd = drawerAreaHeight && valueFromPercentage(percentageEnd, drawerAreaHeight);

      ctx.beginPath();

      ctx.lineWidth = 3;
      ctx.moveTo(0, stepStart);
      ctx.lineTo(drawWidth, stepEnd);
      ctx.strokeStyle = '#0ba6e1';
      ctx.stroke();
  
      ctx.moveTo(0, 0);
      ctx.lineTo(0, stepStart && stepStart - 1);
      ctx.lineTo(drawWidth, stepEnd && stepEnd - 1);
      ctx.lineTo(drawWidth, 0);
  
      ctx.fillStyle = "white";
      ctx.fill();
  
      ctx.closePath();
    }


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
    return funnelData.steps.length === stepNumber;
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
    return (
      <Card className="mcs-funnel">
        <div id="container" >
          <div className="mcs-funnel_header">
            <h1 className="mcs-funnel_header_title">{title}</h1>
          </div>
          {funnelData.steps.length === 0 || funnelData.total === 0 ?
            <div className="mcs-funnel_empty">
              <EmptyChart title={intl.formatMessage(funnelMessages.noData)} icon='warning' />
            </div> :
            <div className="mcs-funnel_steps" >
              {funnelData.steps.map((step, index) => {

                const conversion = index > 0 && funnelData.steps[index - 1].hasOwnProperty("conversion") && funnelData.steps[index - 1].conversion != null ?
                    numeral(funnelData.steps[index - 1].conversion).format('0,0') : undefined;
                const amount = index > 0 && funnelData.steps[index - 1].hasOwnProperty("amount") && funnelData.steps[index - 1].amount != null ?
                    `${numeral(funnelData.steps[index - 1].amount).format('0,0')}€` : undefined;

                return <div key={index.toString()} style={{ flex: 1 }} >
                  <div className={"mcs-funnel_stepName"}>
                    <h3 className="mcs-funnel_stepName_title">{index === 0 ? 'Total' : 'Step ' + index} </h3>
                  </div>
                  <div className={"mcs-funnel_metricsBlock"}>
                    <div className={"mcs-funnel_metric"}>
                      <div className="mcs-funnel_metric_title">UserPoints</div>
                      <div className="mcs-funnel_metric_nbr">{numeral(index === 0 ? funnelData.total : funnelData.steps[index - 1].count).format('0,0')}</div>
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
                      <p className="mcs-funnel_stepInfo"><strong>{`${stepsDelta[index].passThroughPercentage}%`}</strong> have succeeded {this.getDurationMessage(index, 0 )}</p>
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