import * as React from 'react';
import { Card } from 'antd';
import moment from 'moment';
import { IUserActivitiesFunnelService } from '../../services/UserActivitiesFunnelService';
import { TYPES } from '../../constants/types';
import { lazyInject } from '../../config/inversify.config';
import { FunnelFilter, FunnelTimeRange, FunnelResponse } from '../../models/datamart/UserActivitiesFunnel';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../containers/Notifications/injectNotifications';
import { compose } from 'recompose';

interface StepDelta {
  step: number
  diff: number;
  percentageOfSucceeded?: number;
}

interface State {
  isLoading: boolean;
  funnelData: FunnelResponse;
  stepDelta: StepDelta[];
  timeRange: FunnelTimeRange;
}

type FunnelProps = {
  datamartId: string;
  filter: FunnelFilter;
  title: string;
}

type Props = FunnelProps &
  InjectedNotificationProps;

const getPercentage = (nbr: number, total: number): number => {
  return (nbr * 100) / total;
}

const valueFromPercentage = (percentage: number, drawerAreaHeight: number): number => {
  return (percentage * drawerAreaHeight) / 100;
}

class Funnel extends React.Component<Props, State> {
  @lazyInject(TYPES.IUserActivitiesFunnelService)
  private _userActivitiesFunnelService: IUserActivitiesFunnelService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      funnelData: {
        total: 0,
        steps: []
      },
      stepDelta: [],
      timeRange: {
        offset: 183600,
        unit: 'DAY'
      }
    }
  }

  componentDidMount() {
    const { datamartId, filter } = this.props;
    const { timeRange } = this.state;
    this.fetchData(datamartId, filter, timeRange);

    window.addEventListener('resize', this.drawSteps.bind(this));
  }

  // listener cleanup
  componentWillUnmount() {
    window.removeEventListener('resize', this.drawSteps.bind(this))
  }

  fetchData = (datamartId: string, filter: FunnelFilter, timeRange: FunnelTimeRange) => {
    this.setState({
      isLoading: true
    });
    return this._userActivitiesFunnelService
      .getUserActivitiesFunnel(datamartId, filter, timeRange).then((response) => {
        this.setState({
          isLoading: false,
          funnelData: response
        }, () => {
          setTimeout(() => {
            this.drawSteps();
          });
        });
      })
      .catch(e => {
        this.props.notifyError(e);
        this.setState({
          isLoading: false,
        });
      });;
  }

  drawSteps = () => {
    const { funnelData } = this.state;

    funnelData.steps.map((step, index) => {
      const start = index === 0 ? funnelData.total : funnelData.steps[index - 1].count;
      this.drawCanvas((funnelData.total - start), (funnelData.total - step.count), index + 1, funnelData.steps.length);
    });
  }

  drawCanvas = (startCount: number, endCount: number, stepNumber: number, totalSteps: number) => {
    const { funnelData } = this.state;
    const container = document.getElementById("container");
    const canvas: any = document.getElementById(`canvas_${stepNumber}`);

    const drawWidth = container && (container.offsetWidth / totalSteps);
    const drawerAreaHeight = 370;
    canvas.width = drawWidth || 0;

    const percentageStart = getPercentage(startCount, funnelData.total);
    const percentageEnd = getPercentage(endCount, funnelData.total);
    const stepStart = drawerAreaHeight && valueFromPercentage(percentageStart, drawerAreaHeight);
    const stepEnd = drawerAreaHeight && valueFromPercentage(percentageEnd, drawerAreaHeight);

    this.setStepDelta(stepNumber, percentageStart, percentageEnd);

    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.moveTo(0, stepStart);
    ctx.lineTo(drawWidth, stepEnd);
    ctx.strokeStyle = '#0ba6e1';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, stepStart && stepStart - 1);
    ctx.lineTo(drawWidth, stepEnd && stepEnd - 1);
    ctx.lineTo(drawWidth, 0);
    ctx.closePath();

    ctx.fillStyle = "white";
    ctx.fill();
  }

  setStepDelta = (stepNumber: number, percentageEnd: number, percentageStart: number) => {
    this.setState(state => {
      state.stepDelta.push({
        step: stepNumber,
        diff: (stepNumber - 1) !== 2 ? Math.round(percentageEnd) : Math.round(100 - percentageEnd),
        percentageOfSucceeded: (stepNumber > 1) ? Math.round(100 - percentageStart) : undefined
      })

      return {
        stepDelta: state.stepDelta
      }
    });
  }

  isLastStep = (stepNumber: number) => {
    const { funnelData } = this.state;
    return funnelData.steps.length === stepNumber;
  }

  render() {
    const { funnelData, stepDelta } = this.state;
    const { title } = this.props;

    return (
      <Card>
        <div className="mcs-funnel" id="container" >
          <div className="mcs-funnel_header">
            <h1 className="mcs-funnel_header_title">{title}</h1>
            <button className="mcs-funnel_header_datePicker">
              over the last 14 days
            </button>
          </div>
          <div className="mcs-funnel_steps" >

            {funnelData.steps.map((step, index) => {
              return (<div key={index.toString()} style={{ flex: 1 }} >
                <div className={"mcs-funnel_stepName"}>
                  <h3 className="mcs-funnel_stepName_title">Step {index + 1}</h3>
                  <p className="mcs-funnel_stepName_desc">{step.name}</p>
                </div>
                <div className={"mcs-funnel_userPoints"}>
                  <div className="mcs-funnel_userPoints_title">UserPoints</div>
                  <div className="mcs-funnel_userPoints_nbr">{index === 0 ? funnelData.total : step.count}</div>
                </div>
                <div className={"mcs-funnel_chart"}>
                  {stepDelta[index] && stepDelta[index].percentageOfSucceeded && <div className="mcs-funnel_percentageOfSucceeded">
                    <div className="mcs-funnel_arrow mcs_funnel_arrowStep" />
                    <p className="mcs-funnel_stepInfo"><b>{`${stepDelta[index].percentageOfSucceeded}%`}</b> have succeeded in <b>{moment.duration(funnelData.steps[index - 1].interactionDuration, "second").format("d [days] h [hour]")}</b></p>
                  </div>}
                  {<canvas id={`canvas_${index + 1}`} className={"mcs-funnel_canvas"} height="370" />}
                  <div className="mcs-funnel_conversionInfo">
                    <div className={this.isLastStep(index + 1) ? "mcs-funnel_arrow mcs-funnel_arrow--success" : "mcs-funnel_arrow  mcs-funnel_arrow--failed"} />
                    <p className="mcs-funnel_stepInfo">
                      <b>{stepDelta[index] && `${stepDelta[index].diff}%`}</b><br />
                      <p>{this.isLastStep(index + 1) ? "Conversions" : "Dropoffs"}</p>
                    </p>
                  </div>

                </div>
              </div>
              )
            })}

          </div>
        </div>
      </Card >)
  }
}

export default compose<FunnelProps, FunnelProps>(
  injectNotifications,
)(Funnel);