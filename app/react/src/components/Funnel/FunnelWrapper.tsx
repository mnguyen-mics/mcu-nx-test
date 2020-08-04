import * as React from 'react';
import { Card, Row, Col } from 'antd';
import moment from 'moment';

interface Steps {
  name: string;
  count: number;
  interactionDuration: number;
  diff?: number;
  percentageOfSucceeded?: number;
}
interface State {
  isLoading: boolean;
  total: number;
  steps: Steps[];
}

type Props = {}

const getPercentage = (nbr: number, total: number): number => {
  return (nbr * 100) / total;
}

const valueFromPercentage = (percentage: number, drawerAreaHeight: number): number => {
  return (percentage * drawerAreaHeight) / 100;
}

class FunnelWrapper extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      total: 6000,
      steps: [{
        name: "step 1 description",
        count: 4000,
        interactionDuration: 183600
      },
      {
        name: "step 2 description",
        count: 3500,
        interactionDuration: 277200
      },
      {
        name: "step 3 description",
        count: 500,
        interactionDuration: 12545
      }]
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.drawSteps();
      this.setState({
        isLoading: false
      });
    }, 300);

    window.addEventListener('resize', this.drawSteps.bind(this));
  }
  
  drawSteps = () => {
    const { total, steps } = this.state;

    steps.map((step, index) => {
      const start = index === 0 ? total : steps[index - 1].count;
      this.drawCanvas((total - start), (total - step.count), index + 1);
    });
  }

  drawCanvas = (startCount: number, endCount: number, stepNumber: number) => {
    const { total } = this.state;
    const container = document.getElementById("container");
    const c1: any = document.getElementById(`canvas_${stepNumber}`);
    const drawWidth = container && container.offsetWidth / 3;
    const drawerAreaHeight = 370;
    c1.width = drawWidth || 0;

    const percentageStart = getPercentage(startCount, total);
    const percentageEnd = getPercentage(endCount, total);
    const stepStart = drawerAreaHeight && valueFromPercentage(percentageStart, drawerAreaHeight);
    const stepEnd = drawerAreaHeight && valueFromPercentage(percentageEnd, drawerAreaHeight);
    this.setState(state => {
      state.steps[stepNumber - 1].diff = (stepNumber - 1) !== 2 ? Math.round(percentageEnd) : Math.round(100 - percentageEnd);
      if (stepNumber > 1) state.steps[stepNumber - 1].percentageOfSucceeded = Math.round(100 - percentageStart);
    });

    const ctx = c1.getContext("2d");
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

  render() {
    const { steps, total } = this.state;
    return (
      <Card>
        <div className="mcs-funnel">
          <Row type="flex"  >
            <Col span={24} >
              <div className="mcs-funnel_header">
                <h1 className="mcs-funnel_header_title">My Funnel name</h1>
                <button className="mcs-funnel_header_datePicker">
                  over the last 14 days
                </button>
              </div>
            </Col>
          </Row>
          <Row>
            {steps.map((step, index) => {
              return (<Col span={8} key={index.toString()}>
                <div className={index === 1 ? "mcs-funnel_stepName mcs-funnel_stepName--middle" : "mcs-funnel_stepName"}>
                  <h3 className="mcs-funnel_stepName_title">Step {index + 1}</h3>
                  <p className="mcs-funnel_stepName_desc">{step.name}</p>
                </div>
              </Col>)
            })}
          </Row>
          <Row>
            {steps.map((step, index) => {
              return (<Col span={8} key={index.toString()}>
                <div className={index === 1 ? "mcs-funnel_userPoints mcs-funnel_userPoints--middle" : "mcs-funnel_userPoints"}>
                  <div className="mcs-funnel_userPoints_title">UserPoints</div>
                  <div className="mcs-funnel_userPoints_nbr">{index === 0 ? total : step.count}</div>
                </div>
              </Col>)
            })}
          </Row>
          <Row type="flex" id="container">
            {steps.map((step, index) => {
              return (<Col span={8} key={index.toString()}>
                <div className={index === 1 ? "mcs-funnel_chart mcs-funnel_chart--middle" : "mcs-funnel_chart"}>
                  {<canvas id={`canvas_${index + 1}`} height="370" />}
                  <div className="conversion-info">
                    <div className={index === 2 ? "arrow arrow-success" : "arrow arrow-failed"} />
                    <p className="mcs-funnel_stepInfo">
                      <b>{`${step.diff}%`}</b><br />
                      <p>{index === 2 ? "Conversions" : "Dropoffs"}</p>
                    </p>
                  </div>
                  {step.percentageOfSucceeded && <div className="step-info">
                    <div className="arrow arrow-step" />
                    <p className="mcs-funnel_stepInfo"><b>{`${step.percentageOfSucceeded}%`}</b> have succeeded in <b>{moment.duration(steps[index - 1].interactionDuration, "second").format("d [days] h [hour]")}</b></p>
                  </div>}
                </div>
              </Col>)
            })}
          </Row>
        </div>
      </Card>)
  }
}

export default FunnelWrapper;
