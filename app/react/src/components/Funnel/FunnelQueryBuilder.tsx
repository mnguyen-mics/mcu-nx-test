import * as React from 'react';
import { Card, Input, Select, Row, Col, Button } from "antd";
import cuid from 'cuid';
import { TYPES } from '../../constants/types';
import { lazyInject } from '../../config/inversify.config';
import { IUsersAnalyticsService } from '../../services/UsersAnalyticsService';
import { DimensionsList } from '../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { compose } from 'recompose';
import injectNotifications, { InjectedNotificationProps } from '../../containers/Notifications/injectNotifications';
import { booleanOperator, dimensionFilterOperator } from './constants';
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
  steps: Step[];
  isLoading: boolean;
  dimensionsList: DimensionsList;
}

interface FunnelQueryBuilderProps {
  datamartId: string;
}

type Props = FunnelQueryBuilderProps &
  InjectedNotificationProps;

class FunnelQueryBuilder extends React.Component<Props, State> {
  private _cuid = cuid;
  @lazyInject(TYPES.IUsersAnalyticsService)
  private _usersAnalyticsService: IUsersAnalyticsService;

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
      dimensionsList: {
        dimensions: []
      },
      isLoading: false
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;
    this.fetchDimensions(datamartId);
  }

  fetchDimensions = (datamartId: string) => {
    this.setState({
      isLoading: true
    });
    return this._usersAnalyticsService
      .getDimensions(datamartId).then((response) => {
        this.setState({
          isLoading: false,
          dimensionsList: response.data
        });
      })
      .catch(e => {
        this.props.notifyError(e);
        this.setState({
          isLoading: false,
        });
      });;
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
        const filterStepDimensions = step.dimensions.filter(dimension => dimension.id !== dimensionId);
        step.dimensions = filterStepDimensions;
      }
    });

    this.setState({ steps: newSteps });
  }

  render() {
    const Option = Select.Option;
    const { steps, dimensionsList } = this.state;

    return (<Card title="Steps">
      {steps.map((step, index) => {
        return (
          <div key={this._cuid()}>
            <div className={"mcs-funnelQueryBuilder_step"}>
              <Row>
                <Col span={24}>
                  <span>{`${index + 1}.`}</span> <Input size="small" placeholder="Step name" className={"mcs-funnelQueryBuilder_stepName"} />
                </Col>
              </Row>
              {step.dimensions.map((dimension, dimensionIndex) => {
                return (
                  <div key={this._cuid()}>
                    {dimensionIndex > 0 && <Select
                      showArrow={false}
                      defaultValue={"OR"}
                      className={"mcs-funnelQueryBuilder_select mcs-funnelQueryBuilder_select--booleanOperators"}
                    >
                      {booleanOperator.map(bo => {
                        return (
                          <Option key={this._cuid()} value={bo}>
                            {bo}
                          </Option>)
                      })}
                    </Select>}
                    <div className={"mcs-funnelQueryBuilder_step_dimensions"}>
                      <Select
                        showSearch={true}
                        showArrow={false}
                        placeholder="Dimension name"
                        className={"mcs-funnelQueryBuilder_select mcs-funnelQueryBuilder_select--dimensions"}
                      >
                        {dimensionsList.dimensions.map(d => {
                          return (
                            <Option key={this._cuid()} value={d}>
                              {d}
                            </Option>)
                        })}
                      </Select>
                      <Select
                        showArrow={false}
                        className={"mcs-funnelQueryBuilder_select mcs-funnelQueryBuilder_select--dimensionsFilter"}
                        defaultValue="EXACT"
                      >
                        {dimensionFilterOperator.map(operator => {
                          return (
                            <Option key={this._cuid()} value={operator}>
                              {operator}
                            </Option>)
                        })}
                      </Select>
                      <Input size="small" placeholder="Dimension value" className={"mcs-funnelQueryBuilder_dimensionValue"} />
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

export default compose<FunnelQueryBuilderProps, FunnelQueryBuilderProps>(
  injectNotifications,
)(FunnelQueryBuilder);