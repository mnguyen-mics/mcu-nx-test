import * as React from 'react';
import { Card, Input, Select, Row, Col, Button } from "antd";
import * as Antd from 'antd';
import cuid from 'cuid';
interface Dimension {
  id: string;
  name: string;
  equality: string;
  value: string;
}

interface Step {
  id: string;
  name: string;
  dimensions: Dimension[];
}
interface State {
  steps: Step[]
}

interface Props { }

class FunnelQueryBuilder extends React.Component<Props, State> {
  private _cuid = cuid;

  constructor(props: Props) {
    super(props);

    this.state = {
      steps: [{
        id: this._cuid(),
        name: "",
        dimensions: [{
          id: this._cuid(),
          name: "",
          equality: "is",
          value: "",
        }]
      }],
    };
  }

  addStep = () => {

    const { steps } = this.state;

    const newSteps = steps;

    newSteps.push({
      id: this._cuid(),
      name: "",
      dimensions: [{
        id: this._cuid(),
        name: "",
        equality: "is",
        value: "",
      }]
    });

    this.setState({ steps: newSteps });
  }

  addDimensionToStep = (stepId: string) => {
    const { steps } = this.state;

    const newSteps = steps;

    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.dimensions.push({
          id: this._cuid(),
          name: "",
          equality: "is",
          value: "",
        });
      }
    });

    this.setState({ steps: newSteps });
  }


  removeDimensionFromStep = (stepId: string, dimensionId: string) => {
    const { steps } = this.state;


    const newSteps = steps;

    newSteps.forEach(step => {
      if (step.id === stepId) {
        const toto = step.dimensions.filter(dimension => dimension.id !== dimensionId);
        step.dimensions = toto;
      }
    });

    this.setState({ steps: newSteps });
  }

  render() {
    const Option = Antd.Select.Option;
    const { steps } = this.state;

    return (<Card title="Steps">
      {steps.map((step, index) => {
        return (
          <div>
            <div className={"mcs-funnelQueryBuilder_step"}>
              <Row>
                <Col span={24}>
                  <span>{`${index + 1}.`}</span> <Input size="small" placeholder="Step name" className={"mcs-funnelQueryBuilder_stepName"} />
                </Col>
              </Row>
              {step.dimensions.map((dimension, dimensionIndex) => {
                return (
                  <div>
                    {dimensionIndex > 0 && <Select
                      showArrow={false}
                      style={{ width: 50, display: "block" }}
                      defaultValue={"or"}
                      className={"mcs-funnelQueryBuilder_select "}
                    >
                      <Option key={"1"} value={"or"}>
                        {"or"}
                      </Option>
                      <Option key={"1"} value={"and"}>
                        {"and"}
                      </Option>
                    </Select>}
                    <div className={"mcs-funnelQueryBuilder_step_dimensions"}>
                      <Select
                        showSearch
                        showArrow={false}
                        style={{ width: 176 }}
                        placeholder="Dimension name"
                        className={"mcs-funnelQueryBuilder_select"}
                      >
                        <Option key={"1"} value={"Dimension name 1"}>
                          {"Dimension name 1"}
                        </Option>
                        <Option key={"1"} value={"Dimension name 2"}>
                          {"Dimension name 2"}
                        </Option>
                      </Select>
                      <Select
                        showArrow={false}
                        style={{ width: 50 }}
                        className={"mcs-funnelQueryBuilder_select"}
                        defaultValue="is"
                      >
                        <Option key={"1"} value={"is"}>
                          {"is"}
                        </Option>
                        <Option key={"1"} value={"is not"}>
                          {"is not"}
                        </Option>
                      </Select>
                      <Input size="small" style={{ width: 176 }} placeholder="Dimension value" className={"mcs-funnelQueryBuilder_dimensionValue"} />
                      <Button type="primary" shape="circle" icon="cross" className={"mcs-funnelQueryBuilder_removeStepBtn"} onClick={this.removeDimensionFromStep.bind(this, step.id, dimension.id)} />
                    </div>
                  </div>)
              })}

              <Button className={"mcs-funnelQueryBuilder_addDimensionBtn"} onClick={this.addDimensionToStep.bind(this, step.id)}>Add dimension</Button>
            </div>
          </div>
        )
      })}
      <div className={"mcs-funnelQueryBuilder_step"}>
        <Row>
          <Col span={24}>
            <span>{`${steps.length + 1}.`}</span> <Button className={"mcs-funnelQueryBuilder_addDimensionBtn"} onClick={this.addStep}>Add step</Button>
          </Col>
        </Row>
      </div>
    </Card>)
  }
}

export default FunnelQueryBuilder;