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


type Props = {
  toto?: boolean;
}

const getPercentage = (number: number, total: number): number => {
  return (number * 100) / total;
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

    const { total, steps } = this.state;
    setTimeout(() => {
      steps.map((step, index) => {
        var start = index === 0 ? total : steps[index - 1].count;
        this.drawCanvas((total - start), (total - step.count), index + 1);
      });

      this.setState({
        isLoading: false
      });
    }, 300);

    window.addEventListener('resize', this.drawCanvas.bind(this));
  }

  drawCanvas = (startCount: number, endCount: number, stepNumber: number) => {
    const { total } = this.state;
    var toto = document.getElementById("toto");
    var c1: any = document.getElementById(`myCanvas${stepNumber}`);
    var drawWidth = toto && toto.offsetWidth / 3;
    var drawerAreaHeight = 370;
    c1.width = drawWidth || 0;

    var percentageStart = getPercentage(startCount, total);
    var percentageEnd = getPercentage(endCount, total);
    var stepStart = drawerAreaHeight && valueFromPercentage(percentageStart, drawerAreaHeight);
    var stepEnd = drawerAreaHeight && valueFromPercentage(percentageEnd, drawerAreaHeight);
    console.log(percentageStart, percentageEnd);
    console.log(stepStart, stepEnd);
    this.setState(state => {
      state.steps[stepNumber - 1].diff = (stepNumber - 1) !== 2 ? Math.round(percentageEnd) : Math.round(100 - percentageEnd);
      if (stepNumber > 1) state.steps[stepNumber - 1].percentageOfSucceeded = Math.round(100 - percentageStart);
    });

    var ctx = c1.getContext("2d");
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.moveTo(0, stepStart);
    ctx.lineTo(drawWidth, stepEnd);
    ctx.strokeStyle = '#0ba6e1';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, stepStart && stepStart - 1); //your dynamic values
    ctx.lineTo(drawWidth, stepEnd && stepEnd - 1); //your dynamic values
    ctx.lineTo(drawWidth, 0); //end
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
              return (<Col span={8}>
                <div className={index === 1 ? "mcs-funnel_stepName mcs-funnel_stepName--middle" : "mcs-funnel_stepName"}>
                  <h3 className="mcs-funnel_stepName_title">Step {index + 1}</h3>
                  <p className="mcs-funnel_stepName_desc">{step.name}</p>
                </div>
              </Col>)
            })}
          </Row>
          <Row>
            {steps.map((step, index) => {
              return (<Col span={8}>
                <div className={index === 1 ? "mcs-funnel_userPoints mcs-funnel_userPoints--middle" : "mcs-funnel_userPoints"}>
                  <div className="mcs-funnel_userPoints_title">UserPoints</div>
                  <div className="mcs-funnel_userPoints_nbr">{index === 0 ? total : step.count}</div>
                </div>
              </Col>)
            })}
          </Row>
          <Row type="flex" id="toto">
            {steps.map((step, index) => {
              return (<Col span={8}>
                <div className={index === 1 ? "mcs-funnel_chart mcs-funnel_chart--middle" : "mcs-funnel_chart"}>
                  {<canvas id={`myCanvas${index + 1}`} height="370"></canvas>}
                  <div className="conversion-info">
                    <div className={index === 2 ? "arrow arrow-success" : "arrow arrow-failed"}></div>
                    <p className="mcs-funnel_stepInfo">
                      <b>{`${step.diff}%`}</b><br />
                      <p>{index === 2 ? "Conversions" : "Dropoffs"}</p>
                    </p>
                  </div>
                  {step.percentageOfSucceeded && <div className="step-info">
                    <div className="arrow arrow-step"></div>
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


// <Row>
// <Col span={8}>
//   <div className="mcs-funnel_stepName">
//     <h3 className="mcs-funnel_stepName_title">Step 1</h3>
//     <p className="mcs-funnel_stepName_desc">This is the name of step 1</p>
//   </div>
// </Col>
// <Col span={8}>
//   <div className="mcs-funnel_stepName mcs-funnel_stepName--middle">
//     <h3 className="mcs-funnel_stepName_title">Step 2</h3>
//     <p className="mcs-funnel_stepName_desc">This is the name of step 2</p>
//   </div>

// </Col>
// <Col span={8}>
//   <div className="mcs-funnel_stepName">
//     <h3 className="mcs-funnel_stepName_title">Step 3</h3>
//     <p className="mcs-funnel_stepName_desc">This is the name of step 3</p>
//   </div>
// </Col>
// </Row>
// <Row>
// <Col span={8}>
//   <div className="mcs-funnel_userPoints">
//     <div className="mcs-funnel_userPoints_title">UserPoints</div>
//     <div className="mcs-funnel_userPoints_nbr">123’324’234</div>
//   </div>
// </Col>
// <Col span={8}>
//   <div className="mcs-funnel_userPoints mcs-funnel_userPoints--middle">
//     <div className="mcs-funnel_userPoints_title">UserPoints</div>
//     <div className="mcs-funnel_userPoints_nbr">62’324’234</div>
//   </div>
// </Col>
// <Col span={8}>
//   <div className="mcs-funnel_userPoints">
//     <div className="mcs-funnel_userPoints_title">UserPoints</div>
//     <div className="mcs-funnel_userPoints_nbr">21’324’234</div>
//   </div>
// </Col>
// </Row>
// <Row type="flex" id="toto">
// <Col span={8}>
//   <div className="mcs-funnel_chart">
//     {<canvas id="myCanvas" height="370"></canvas>}
//     <div className="conversion-info">
//       <div className="arrow arrow-failed "></div>
//       <p className="mcs-funnel_stepInfo">
//         <b>60%</b><br />
//         <p>Dropoffs</p>
//       </p>
//     </div>
//   </div>
// </Col>
// <Col span={8}>
//   <div className="mcs-funnel_chart  mcs-funnel_chart--middle">
//     {<canvas id="myCanvas2" height="370"></canvas>}
//     <div className="conversion-info">
//       <div className="arrow arrow-failed "></div>
//       <p className="mcs-funnel_stepInfo">
//         <b>75%</b><br />
//         <p>Dropoffs</p>
//       </p>
//     </div>
//     <div className="step-info">
//       <div className="arrow arrow-step"></div>
//       <p className="mcs-funnel_stepInfo"><b>40%</b> have succeeded in <b>2 days 3 hours</b></p>
//     </div>
//   </div>
// </Col>
// <Col span={8}>
//   <div className="mcs-funnel_chart">
//     {<canvas id="myCanvas3" height="370"></canvas>}
//     <div className="conversion-info">
//       <div className="arrow arrow-success"></div>
//       <p className="mcs-funnel_stepInfo">
//         <b>10%</b><br />
//         <p>Conversions</p>
//       </p>
//     </div>
//     <div className="step-info">
//       <div className="arrow arrow-step"></div>
//       <p className="mcs-funnel_stepInfo"><b>25%</b> have succeeded in <b>3 days 1 hour</b></p>
//     </div>
//   </div>
// </Col>
// </Row>