import * as React from 'react';
import { Card, Input, Select, Row, Col, Button } from "antd";
import cuid from 'cuid';
import { TYPES } from '../../constants/types';
import { lazyInject } from '../../config/inversify.config';
import { IUsersAnalyticsService } from '../../services/UsersAnalyticsService';
import { DimensionsList } from '../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { compose } from 'recompose';
import injectNotifications, { InjectedNotificationProps } from '../../containers/Notifications/injectNotifications';
import { booleanOperator, dimensionFilterOperator, eventTypesDimension, FUNNEL_SEARCH_SETTING } from './Constants';
import { BooleanOperator, DimensionFilterClause, DimensionFilterOperator } from '../../models/ReportRequestBody';
import { RouteComponentProps, withRouter } from 'react-router';
import { updateSearch } from '../../utils/LocationSearchHelper';
import { GoalByKeywordSelector } from '../../containers/Audience/DatamartUsersAnalytics/components/GoalByNameSelector'
import { LabeledValue } from 'antd/lib/select';
import { CampaignByKeywordSelector } from '../../containers/Audience/DatamartUsersAnalytics/components/CampaignByNameSelector';
import SegmentByNameSelector from '../../containers/Audience/DatamartUsersAnalytics/components/SegmentByNameSelector';
import { ChannelByKeywordSelector } from '../../containers/Audience/DatamartUsersAnalytics/components/ChannelByNameSelector';
import { CreativeByKeywordSelector } from '../../containers/Audience/DatamartUsersAnalytics/components/CreativeByNameSelector';

export interface Step {
  id?: string;
  name: string;
  filter_clause: DimensionFilterClause;
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
  RouteComponentProps<{ organisationId: string }> &
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
        filter_clause: {
          operator: 'OR',
          filters: []
        }
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
      .getDimensions(datamartId, true).then((response) => {
        this.setState({
          isLoading: false,
          dimensionsList: {
            dimensions: response.data.dimensions.sort()
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

  getInputField(dimensionName: string,
    dimensionIndex: number,
    expressions: string[],
    stepId?: string) {
    const { datamartId,
      match: {
        params: { organisationId },
      }
    } = this.props;
    const Option = Select.Option;
    const anchorId = "mcs-funnel_expression_select_anchor"
    switch (dimensionName) {
      case 'EVENT_TYPE':
        return <Select
          showSearch={true}
          showArrow={false}
          placeholder="Dimension value"
          className={"mcs-funnelQueryBuilder_select mcs-funnelQueryBuilder_select--dimensions"}
          onChange={this.handleDimensionExpressionForSelectorChange.bind(this, dimensionIndex, stepId, (x: string) => x)}>
          {eventTypesDimension.map(et => {
            return (
              <Option key={this._cuid()} value={et}>
                {et}
              </Option>)
          })}
        </Select>
      case 'SEGMENT_ID':
        return (<div id={anchorId}>
          <SegmentByNameSelector
            anchorId={anchorId}
            datamartId={datamartId}
            organisationId={organisationId}
            onchange={this.handleDimensionExpressionForSelectorChange.bind(this, dimensionIndex, stepId, (x: LabeledValue) => x.key)}
          />
        </div>)
      case 'ORIGIN_CAMPAIGN_ID':
        return (<div id={anchorId}>
          <CampaignByKeywordSelector
            anchorId={anchorId}
            datamartId={datamartId}
            organisationId={organisationId}
            onchange={this.handleDimensionExpressionForSelectorChange.bind(this, dimensionIndex, stepId, (x: LabeledValue) => x.key)}
          />
        </div>)
      case 'GOAL_ID':
        return (<div id={anchorId}>
          <GoalByKeywordSelector
            anchorId={anchorId}
            datamartId={datamartId}
            organisationId={organisationId}
            onchange={this.handleDimensionExpressionForSelectorChange.bind(this, dimensionIndex, stepId, (x: LabeledValue) => x.key)}
          />
        </div>)
      case 'CHANNEL_ID':
        return (<div id={anchorId}>
          <ChannelByKeywordSelector
            anchorId={anchorId}
            datamartId={datamartId}
            organisationId={organisationId}
            onchange={this.handleDimensionExpressionForSelectorChange.bind(this, dimensionIndex, stepId, (x: LabeledValue) => x.key)}
          />
        </div>)
      case 'ORIGIN_CREATIVE_ID':
        return (<div id={anchorId}>
          <CreativeByKeywordSelector
            anchorId={anchorId}
            datamartId={datamartId}
            organisationId={organisationId}
            onchange={this.handleDimensionExpressionForSelectorChange.bind(this, dimensionIndex, stepId, (x: LabeledValue) => x.key)}
          />
        </div>)
      default:
        return <Select
          placeholder="Dimension value"
          mode="tags"
          tokenSeparators={[',']}
          showSearch={true}
          labelInValue={true}
          autoFocus={true}
          className="mcs-funnelQueryBuilder_dimensionValue"
          onChange={this.handleDimensionExpressionForSelectorChange.bind(this, dimensionIndex, stepId, (x: LabeledValue) => x.key)}/>
    }
  }

  addStep = () => {
    const { steps } = this.state;
    const newSteps = steps.slice();

    newSteps.push({
      id: this._cuid(),
      name: "",
      filter_clause: {
        operator: 'OR',
        filters: []
      }
    });

    this.setState({ steps: newSteps });
  }

  addDimensionToStep = (stepId: string) => {
    const { steps } = this.state;
    const newSteps = steps.slice();
    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.filter_clause.operator = 'OR';
        step.filter_clause.filters.push(
          {
            'dimension_name': 'DATE_TIME',
            'not': false,
            'operator': 'EXACT' as DimensionFilterOperator,
            'expressions': [
            ],
            'case_sensitive': false
          }
        );
      }
    });

    this.setState({ steps: newSteps });
  }


  handleDimensionNameChange(dimensionIndex: number, stepId: string, value: string) {
    const { steps } = this.state;
    steps.forEach(step => {
      if (step.id === stepId) {
        step.filter_clause.filters.forEach((filter, index) => {
          if (dimensionIndex === index) {
            filter.dimension_name = value
            filter.expressions = []
          }
        });
      }
    });
    this.setState({
      steps
    });
  }

  handleDimensionOperatorChange(dimensionIndex: number, stepId: string, value: DimensionFilterOperator) {
    const { steps } = this.state;
    steps.forEach(step => {
      if (step.id === stepId) {
        step.filter_clause.filters.forEach((filter, index) => {
          if (dimensionIndex === index) {
            filter.operator = value;
          }
        });
      }
    });
    this.setState({
      steps
    });
  };

  handleFilterOperatorChange(stepId: string, value: BooleanOperator) {
    const { steps } = this.state;
    steps.forEach(step => {
      if (step.id === stepId) step.filter_clause.operator = value;
    });
    this.setState({
      steps
    });
  };

  handleDimensionExpressionForSelectorChange<T>(dimensionIndex: number, stepId: string, valueExtract: (elem: T) => string, value: T) {
    const { steps } = this.state;
    steps.forEach(step => {
      if (step.id === stepId) {
        step.filter_clause.filters.forEach((filter, index) => {
          if (dimensionIndex === index) {
            if(value && (Array.isArray(value) && value.length > 0 || !Array.isArray(value))) {
              filter.expressions = Array.isArray(value) ? value.map(valueExtract) : [valueExtract(value)]
            } else {
              filter.expressions = []
            }
          }
        });
      }
    });
    this.setState({ steps });
  }
  checkExpressionsNotEmpty = () => {
    let result = true;
    const { steps } = this.state;
    steps.forEach(step => {
      step.filter_clause.filters.forEach(filter => {
        if(filter.expressions.length === 0)
          result = false;
        else
          filter.expressions.forEach(exp => {
            if(!exp || exp.length === 0 || !exp.trim())
              result = false
          })
      })
    });

    return result
  }

  handleExecuteQueryButtonClick = () => {
    if(this.checkExpressionsNotEmpty())
      this.updateFilterQueryStringParams();
  }


  handleStepNameChange(stepId: string, event: React.ChangeEvent<HTMLInputElement>) {
    const { steps } = this.state;
    steps.forEach(step => {
      if (step.id === stepId) {
        step.name = event.target.value;
      }
    });
    this.setState({
      steps
    });
  }

  updateFilterQueryStringParams() {
    const { steps } = this.state;
    
    const {
      history,
      location: { search: currentSearch, pathname }
    } = this.props;

    // deep copy
    const stepsCopy = JSON.parse(JSON.stringify(steps));
    stepsCopy.forEach((step: Step) => step.id = undefined);
    const stepsFormated = stepsCopy.filter((s: Step) => s.filter_clause.filters.length > 0)
    const queryParms = {
      filter: [JSON.stringify(stepsFormated)],
    };

    const nextLocation = {
      pathname: pathname,
      search: updateSearch(currentSearch, queryParms, FUNNEL_SEARCH_SETTING),
    };

    history.replace(nextLocation);
  }

  removeDimensionFromStep = (stepId: string, dimensionIndex: number) => {
    const { steps } = this.state;
    const newSteps = steps.slice();

    newSteps.forEach(step => {
      if (step.id === stepId) {
        const filterStepDimensions = step.filter_clause.filters.filter((filter, index) => dimensionIndex !== index)
        step.filter_clause.filters = filterStepDimensions;
      }
    });

    this.setState({ steps: newSteps });
  }

  removeStep = (stepId: string) => {
    const { steps } = this.state;
    const newSteps = steps.filter(step => step.id !== stepId);

    this.setState({ steps: newSteps });
  }

  render() {
    const Option = Select.Option;
    const { steps, dimensionsList } = this.state;
    return (<Card title="Steps" className={"mcs-funnelQueryBuilder_steps"} >
      {
        steps.map((step, index) => {
          return (
            <div key={step.id}>
              <div className={"mcs-funnelQueryBuilder_step"}>
                <Row>
                  <Col span={24}>
                    <span>{`${index + 1}.`}</span>
                    <Input
                      size="small"
                      placeholder="Step name"
                      className={"mcs-funnelQueryBuilder_stepName"}
                      value={step.name}
                      onChange={this.handleStepNameChange.bind(this, step.id)}
                    />
                    <Button
                      type="primary"
                      shape="circle"
                      icon="cross"
                      className={"mcs-funnelQueryBuilder_removeStepBtn"}
                      onClick={this.removeStep.bind(this, step.id)} />
                  </Col>
                </Row>
                {step.filter_clause.filters.map((filter, filterIndex) => {
                  return (
                    <div key={filterIndex}>
                      {filterIndex > 0 && <Select
                        showArrow={false}
                        defaultValue={"OR"}
                        className={"mcs-funnelQueryBuilder_select mcs-funnelQueryBuilder_select--booleanOperators"}
                        onChange={this.handleFilterOperatorChange.bind(this, step.id)}
                        value={step.filter_clause.operator}>
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
                          onChange={this.handleDimensionNameChange.bind(this, filterIndex, step.id)}>
                          {dimensionsList.dimensions.sort().map(d => {
                            return (
                              <Option key={this._cuid()} value={d}>
                                {d}
                              </Option>)
                          })}
                        </Select>
                        <Select
                          showArrow={false}
                          className={"mcs-funnelQueryBuilder_select mcs-funnelQueryBuilder_select--dimensionsFilter"}
                          defaultValue={filter.operator}
                          value={filter.operator}
                          onChange={this.handleDimensionOperatorChange.bind(this, filterIndex, step.id)}
                        >
                          {dimensionFilterOperator.map(operator => {
                            return (
                              <Option key={this._cuid()} value={operator}>
                                {operator}
                              </Option>)
                          })}
                        </Select>
                        {this.getInputField(filter.dimension_name, filterIndex, filter.expressions, step.id)}
                        <Button
                          type="primary"
                          shape="circle"
                          icon="cross"
                          className={"mcs-funnelQueryBuilder_removeStepBtn"}
                          onClick={this.removeDimensionFromStep.bind(this, step.id, filterIndex)} />
                      </div>
                    </div>)
                })}

                {<Button className={"mcs-funnelQueryBuilder_addDimensionBtn"} onClick={this.addDimensionToStep.bind(this, step.id)}>Add dimension</Button>}
              </div>
            </div>
          )
        })
      }
      < div className={"mcs-funnelQueryBuilder_step"} >
        <Row>
          <Col span={24}>
            <span>{`${steps.length + 1}.`}</span> <Button className={"mcs-funnelQueryBuilder_addDimensionBtn"} onClick={this.addStep}>Add step</Button>
          </Col>
        </Row>
      </div>
      <div className={"mcs-funnelQueryBuilder_step"}>
        <Button className="mcs-primary" type="primary" onClick={this.handleExecuteQueryButtonClick}>Execute Query</Button>
      </div>
    </Card >)
  }
}

export default compose<FunnelQueryBuilderProps, FunnelQueryBuilderProps>(
  injectNotifications,
  withRouter
)(FunnelQueryBuilder);
