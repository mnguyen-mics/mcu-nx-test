import * as React from 'react';
import { Card, Select, Row, Col, Button, Divider, Icon, Switch } from "antd";
import messages from '../../containers/Campaigns/Display/Edit/messages';
import cuid from 'cuid';
import { TYPES } from '../../constants/types';
import { lazyInject } from '../../config/inversify.config';
import { IUsersAnalyticsService } from '../../services/UsersAnalyticsService';
import { DimensionsList } from '../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { compose } from 'recompose';
import injectNotifications, { InjectedNotificationProps } from '../../containers/Notifications/injectNotifications';
import { booleanOperator, FUNNEL_SEARCH_SETTING, FilterOperatorLabel } from './Constants';
import { BooleanOperator, DimensionFilterClause, DimensionFilterOperator } from '../../models/ReportRequestBody';
import { RouteComponentProps, withRouter } from 'react-router';
import { updateSearch, isSearchValid, parseSearch } from '../../utils/LocationSearchHelper';
import { McsDateRangePicker, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { FILTERS } from '../../containers/Audience/DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import McsMoment from '../../utils/McsMoment';
import {
  FormattedMessage,
} from 'react-intl';
import FunnelExpressionInput from './FunnelExpressionInput';

const Option = Select.Option;

export interface Step {
  id?: string;
  name: string;
  filter_clause: DimensionFilterClause;
}

interface State {
  steps: Step[];
  isLoading: boolean;
  dimensionsList: DimensionsList;
  dateRange: McsDateRangeValue;
}

interface FunnelQueryBuilderProps {
  datamartId: string;
  isLoading: boolean;
  parentCallback: (timestampInSec: number) => void
  cancelQueryCallback: (timestampInSec: number) => void
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
        name: "Step 1",
        filter_clause: {
          operator: 'OR',
          filters: [
            {
              'dimension_name': 'DATE_TIME',
              'not': false,
              'operator': 'EXACT' as DimensionFilterOperator,
              'expressions': [
              ],
              'case_sensitive': false
            }
          ]
        }
      }],
      dimensionsList: {
        dimensions: []
      },
      isLoading: false,
      dateRange: {
        from: new McsMoment(
          `now-7d`,
        ),
        to: new McsMoment('now'),
      }
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;
    this.setInitialParams()
    this.fetchDimensions(datamartId);
  }

  setInitialParams = () => {
    const {
      location: { search, pathname },
      history,
    } = this.props;

    const { dateRange } = this.state;

    const parsedSearch = parseSearch(search, FUNNEL_SEARCH_SETTING);
    try {
      const steps = JSON.parse(parsedSearch.filter)
      const identifiedSteps = steps.map((step: Step) => {
        return {
          ...step,
          id: this._cuid()
        }
      })

      this.setState({
        steps: identifiedSteps
      })
    } catch(error) {
      this.setState({
        steps: []
      })
    }

    const queryParams = {
      from: dateRange.from,
      to: dateRange.to,
    };

    const nextLocation = {
      pathname: pathname,
      search: updateSearch(search, queryParams),
    };

    if (!isSearchValid(search, FUNNEL_SEARCH_SETTING)) {
      history.replace(nextLocation);
    }
  };

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

  addStep = () => {
    const { steps } = this.state;
    const newSteps = steps.slice();

    newSteps.push({
      id: this._cuid(),
      name: "",
      filter_clause: {
        operator: 'AND',
        filters: [
          {
            'dimension_name': 'DATE_TIME',
            'not': false,
            'operator': 'EXACT' as DimensionFilterOperator,
            'expressions': [
            ],
            'case_sensitive': false
          }
        ]
      }
    });

    newSteps.forEach((step, index) => {
      step.name = `Step ${index + 1}`
    })

    this.setState({ steps: newSteps });
  }

  addDimensionToStep = (stepId: string) => {
    const { steps } = this.state;
    const newSteps = steps.slice();
    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.filter_clause.operator = 'AND';
        step.filter_clause.filters.push(
          {
            id: this._cuid(),
            dimension_name: 'DATE_TIME',
            not: false,
            operator: 'EXACT' as DimensionFilterOperator,
            expressions: [
            ],
            case_sensitive: false
          }
        );
      }
    });

    this.setState({ steps: newSteps });
  }

  handleNotSwitcherChange(dimensionIndex: number, stepId: string, value: boolean) {
    const { steps } = this.state;
    steps.forEach(step => {
      if (step.id === stepId) {
        step.filter_clause.filters.forEach((filter, index) => {
          if (dimensionIndex === index) {
            filter.not = !value
          }
        });
      }
    });
    this.setState({
      steps
    });
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

  handleFilterOperatorChange(stepId: string, value: BooleanOperator) {
    const { steps } = this.state;
    steps.forEach(step => {
      if (step.id === stepId) step.filter_clause.operator = value;
    });
    this.setState({
      steps
    });
  };

  handleDimensionExpressionForSelectorChange(dimensionIndex: number, stepId: string, value: string[]) {
    const { steps } = this.state;
    steps.forEach(step => {
      if (step.id === stepId) {
        step.filter_clause.filters.forEach((filter, index) => {
          if (dimensionIndex === index) {
            filter.expressions = value
            if (filter.expressions.length > 1)
              filter.operator = 'IN_LIST' as DimensionFilterOperator
            else
              filter.operator = 'EXACT' as DimensionFilterOperator
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
        if (filter.expressions.length === 0)
          result = false;
        else
          filter.expressions.forEach(exp => {
            if (!exp || exp.length === 0 || !exp.trim())
              result = false
          })
      })
    });

    return result
  }

  checkDimensionsNotEmpty = () => {
    let result = true;
    const { steps } = this.state;
    steps.forEach(step => {
      step.filter_clause.filters.forEach(filter => {
        if (!filter.dimension_name || filter.dimension_name.length === 0)
          result = false;
      })
    });

    return result
  }

  handleExecuteQueryButtonClick = () => {
    if (this.checkExpressionsNotEmpty() && this.checkDimensionsNotEmpty()) {
      this.updateFilterQueryStringParams();
      this.props.parentCallback(new Date().getTime())
    } else {
      this.props.notifyWarning({
        message: messages.errorFormMessage.defaultMessage,
        description: "",
      });
    }
  }

  handleCancelCallback = () => this.props.cancelQueryCallback(new Date().getTime());


  showFilterSymbol(filterIndex: number, stepId?: string): FilterOperatorLabel {
    const { steps } = this.state;
    let result = "equals" as FilterOperatorLabel;
    steps.forEach(step => {
      if (step.id === stepId) {
        step.filter_clause.filters.forEach((filter, index) => {
          if (filterIndex === index) {
            if (filter.operator === 'EXACT')
              result = "equals" as FilterOperatorLabel;
            else if (filter.operator === 'IN_LIST')
              result = "in" as FilterOperatorLabel
          }
        });
      }
    });
    return result;
  }

  updateFilterQueryStringParams() {
    const { steps } = this.state;
    const {
      history
    } = this.props;

    const {
      location: { search: currentSearch, pathname }
    } = history;

    // deep copy
    const stepsCopy = JSON.parse(JSON.stringify(steps));
    stepsCopy.forEach((step: Step) => {
      step.id = undefined;
      step.filter_clause.filters.forEach(filter => filter.id = undefined);
    });
    const stepsFormated = stepsCopy.filter((s: Step) => s.filter_clause.filters.length > 0)
    const queryParams = {
      filter: [JSON.stringify(stepsFormated)],
    };

    const nextLocation = {
      pathname: pathname,
      search: updateSearch(currentSearch, queryParams, FUNNEL_SEARCH_SETTING),
    };

    history.push(nextLocation);
  }

  removeDimensionFromStep = (stepId: string, filterId: string) => {
    const { steps } = this.state;
    const newSteps = steps.slice();

    newSteps.forEach(step => {
      if (step.id === stepId) {
        const filterStepDimensions = step.filter_clause.filters.filter((filter) => filter.id !== filterId)
        step.filter_clause.filters = filterStepDimensions;
      }
    });

    this.setState({ steps: newSteps });
  }

  removeStep = (stepId: string) => {
    const { steps } = this.state;
    const newSteps = steps.filter(step => step.id !== stepId);
    newSteps.forEach((step, index) => {
      step.name = `Step ${index + 1}`
    })

    this.setState({ steps: newSteps });
  }

  updateLocationSearch = (params: FILTERS) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;
    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        FUNNEL_SEARCH_SETTING,
      ),
    };

    history.push(nextLocation);
  };

  getDimensionNameSelect = () => {
    const { dimensionsList } = this.state;
    return dimensionsList.dimensions.map(d => <Option key={this._cuid()} value={d.value}>{d.label}</Option>)
  }

  sortStep = (index: number, direction: 'up' | 'down') => {
    const { steps } = this.state;

    const temp = steps[index];

    if (direction === 'up' && index > 0) {
      steps[index] = steps[index - 1];
      steps[index].name = `Step ${index + 1}`;
      steps[index - 1] = temp;
      steps[index - 1].name = `Step ${index}`;
      this.setState({ steps });
    }

    if (direction === 'down' && (index + 1 < steps.length)) {
      steps[index] = steps[index + 1];
      steps[index].name = `Step ${index + 1}`;
      steps[index + 1] = temp;
      steps[index + 1].name = `Step ${index + 2}`;
      this.setState({ steps });
    }
  }

  render() {
    const { steps, dateRange } = this.state;
    const { from, to } = dateRange
    const { isLoading, datamartId } = this.props;
    const onChange = (newValues: McsDateRangeValue): void => {
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });
      this.setState({
        dateRange: {
          from: newValues.from,
          to: newValues.to
        }
      });
    }

    return (<Card className={"mcs-funnelQueryBuilder"} >
      <div className="mcs-funnelQueryBuilder_header">
        <h1 className="mcs-funnelQueryBuilder_header_title">Steps</h1>
        <McsDateRangePicker
          values={dateRange}
          onChange={onChange}
        />
      </div>
      <div className={"mcs-funnelQueryBuilder_steps"}>
        {
          steps.map((step, index) => {
            return (
              <div key={step.id} className={"mcs-funnelQueryBuilder_step"}>
                <Row type="flex" style={{ alignItems: 'center' }}>
                  <Col span={1} >
                    {index > 0 && <Icon className={"mcs-funnelQueryBuilder_sortBtn mcs-funnelQueryBuilder_sortBtn--up"} type="arrow-up" onClick={this.sortStep.bind(this, index, "up")} />}
                    {index + 1 < steps.length && <Icon className={"mcs-funnelQueryBuilder_sortBtn"} onClick={this.sortStep.bind(this, index, "down")} type="arrow-down" />}
                  </Col>
                  <Col span={23}>
                    <span className="mcs-funnelQueryBuilder_stepName_title">{step.name}</span>
                    <Button
                      type="primary"
                      shape="circle"
                      icon="cross"
                      className={"mcs-funnelQueryBuilder_removeStepBtn"}
                      onClick={this.removeStep.bind(this, step.id)} />

                    {step.filter_clause.filters.map((filter, filterIndex) => {
                      return (
                        <div key={filter.id}>
                          {filterIndex > 0 && <Select
                            showArrow={false}
                            defaultValue={"AND"}
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
                              value={filter.dimension_name}
                              showSearch={true}
                              showArrow={false}
                              placeholder="Dimension name"
                              className={"mcs-funnelQueryBuilder_select mcs-funnelQueryBuilder_select--dimensions"}
                              onChange={this.handleDimensionNameChange.bind(this, filterIndex, step.id)}>
                              {this.getDimensionNameSelect()}
                            </Select>
                            <div className="mcs-funnelQueryBuilder_switch">
                              <Switch
                                defaultChecked={!filter.not}
                                unCheckedChildren="NOT"
                                className={"mcs-funnelQueryBuilder_switch_btn"}
                                onChange={this.handleNotSwitcherChange.bind(this, filterIndex, step.id)}
                              />
                              {filter.not && <McsIcon
                                type="info"
                                className="mcs-funnelQueryBuilder_notInfo_notSwitcherIcon"
                                title={"This will filter only activities that have the selected criteria filled with another value than the one(s) selected"} />}
                            </div>
                            <div className="mcs-funnelQueryBuilder_step_dimensionFilter_operator">
                              <span className="mcs-funnelQueryBuilder_step_dimensionFilter_operator_text">{this.showFilterSymbol(filterIndex, step.id)}
                              </span>
                            </div>
                            <FunnelExpressionInput 
                              initialValue={filter.expressions}
                              datamartId={datamartId}
                              dimensionName={filter.dimension_name}
                              dimensionIndex={filterIndex}
                              from={from}
                              to={to}
                              stepId={step.id}
                              handleDimensionExpressionForSelectorChange={this.handleDimensionExpressionForSelectorChange.bind(this, filterIndex, step.id)}
                            />
                            <Button
                              type="primary"
                              shape="circle"
                              icon="cross"
                              className={"mcs-funnelQueryBuilder_removeFilterBtn"}
                              onClick={this.removeDimensionFromStep.bind(this, step.id, filter.id)} />
                          </div>
                        </div>)
                    })}
                    {<Button className="mcs-funnelQueryBuilder_addDimensionBtn" onClick={this.addDimensionToStep.bind(this, step.id)}>
                      <McsIcon type="plus" className="mcs-funnelQueryBuilder_addDimensionBtn_Icon" />
                      <FormattedMessage
                        id="audience.funnel.querybuilder.newFilter"
                        defaultMessage="Add Filter"
                      />
                    </Button>}
                    <Row>
                      <Col span={8}>
                        <Divider />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            )
          })
        }
        <Row>
          <Col span={23} offset={1}>
            <Button className={"mcs-funnelQueryBuilder_addStepBtn"} onClick={this.addStep}>
              <McsIcon type="plus" className="mcs-funnelQueryBuilder_addStepBtn_Icon" />
              <FormattedMessage
                id="audience.funnel.querybuilder.newStep"
                defaultMessage="Add Step"
              />
            </Button>
            <div className={"mcs-funnelQueryBuilder_executeQueryBtn"}>
              <Button className="mcs-primary" type="primary" onClick={this.handleExecuteQueryButtonClick} loading={isLoading}>
                {!isLoading && <McsIcon type="play" />}
            Execute Query
          </Button>
              <Button className="mcs-funnelQueryBuilder_cancelBtn" type="default" onClick={this.handleCancelCallback}>
                Cancel
          </Button>
            </div>
          </Col>
        </Row>

      </div>
    </Card >)
  }
}

export default compose<FunnelQueryBuilderProps, FunnelQueryBuilderProps>(
  injectNotifications,
  withRouter
)(FunnelQueryBuilder);
