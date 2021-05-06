import * as React from 'react';
import { Card, Select, Button, Switch, Input, Tag } from 'antd';
import messages from '../../containers/Campaigns/Display/Edit/messages';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  CloseOutlined,
  CalendarOutlined,
  FlagOutlined,
} from '@ant-design/icons';
import cuid from 'cuid';
import { TYPES } from '../../constants/types';
import { lazyInject } from '../../config/inversify.config';
import { IUsersAnalyticsService } from '../../services/UsersAnalyticsService';
import { DimensionsList } from '../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../containers/Notifications/injectNotifications';
import {
  booleanOperator,
  FUNNEL_SEARCH_SETTING,
  FilterOperatorLabel,
  funnelMessages,
} from './Constants';
import {
  BooleanOperator,
  DimensionFilterClause,
  DimensionFilterOperator,
} from '../../models/ReportRequestBody';
import { RouteComponentProps, withRouter } from 'react-router';
import { updateSearch, isSearchValid } from '../../utils/LocationSearchHelper';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import FunnelExpressionInput from './FunnelExpressionInput';
import { FunnelFilter } from '../../models/datamart/UserActivitiesFunnel';
import { IDatamartUsersAnalyticsService } from '../../services/DatamartUsersAnalyticsService';
import { ReportViewResponse } from '../../services/ReportService';
import { shouldUpdateFunnelQueryBuilder, getDefaultStep, checkExpressionsNotEmpty } from './Utils';

const Option = Select.Option;

export interface Step {
  id?: string;
  name: string;
  filter_clause: DimensionFilterClause;
  max_days_after_previous_step?: number;
  displayEventTypeWarning?: boolean;
}

interface State {
  steps: Step[];
  isLoading: boolean;
  dimensionsList: DimensionsList;
}

interface FunnelQueryBuilderProps {
  datamartId: string;
  filter: FunnelFilter[];
  parentCallback: (timestampInSec: number) => void;
  liftFunctionsCallback: (executeQueryFunction: () => void) => void;
  dateRange: McsDateRangeValue;
}

type Props = FunnelQueryBuilderProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps;

class FunnelQueryBuilder extends React.Component<Props, State> {
  private _cuid = cuid;
  @lazyInject(TYPES.IUsersAnalyticsService)
  private _usersAnalyticsService: IUsersAnalyticsService;
  @lazyInject(TYPES.IDatamartUsersAnalyticsService)
  private _datamartUsersAnalyticsService: IDatamartUsersAnalyticsService;

  constructor(props: Props) {
    super(props);

    this.state = {
      steps: [],
      dimensionsList: {
        dimensions: [],
      },
      isLoading: false,
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;
    this.setInitialParams();
    this.fetchDimensions(datamartId);
    this.props.liftFunctionsCallback(this.handleExecuteQueryButtonClick);
  }

  componentDidUpdate(prevProps: Props) {
    const {
      location: { search },
      filter,
    } = this.props;

    if (prevProps.location.search !== search && filter.length > 0) {
      this.setInitialParams();
    }
  }

  /**
   * This component should not update if the queries are only different in group_by_dimension
   */
  shouldComponentUpdate(nextProps: Props, nextState: State) {
    const { steps: prevFilter, dimensionsList: previousDimensionsList } = this.state;

    const { steps: nextFilter, dimensionsList: nextDimensionsList } = nextState;

    const { filter: nextPropsFilter } = this.props;

    const shouldUpdate =
      shouldUpdateFunnelQueryBuilder(prevFilter, nextFilter) ||
      shouldUpdateFunnelQueryBuilder(prevFilter, nextPropsFilter) ||
      nextDimensionsList !== previousDimensionsList;

    return shouldUpdate;
  }

  setInitialParams = () => {
    const {
      location: { search, pathname },
      history,
      filter,
      dateRange,
    } = this.props;

    try {
      const identifiedSteps = filter.map((step: Step) => {
        step.filter_clause.filters.forEach(f => {
          const newFilterId = f.id ? f.id : this._cuid();
          f.id = newFilterId;
        });
        const newId = step.id ? step.id : this._cuid();
        return {
          ...step,
          id: newId,
        };
      });

      this.setState({
        steps: identifiedSteps,
      });
    } catch (error) {
      this.setState({
        steps: [
          {
            id: this._cuid(),
            name: 'Step 1',
            filter_clause: {
              operator: 'OR',
              filters: [
                {
                  dimension_name: 'DATE_TIME',
                  not: false,
                  operator: 'EXACT' as DimensionFilterOperator,
                  expressions: [],
                  case_sensitive: false,
                },
              ],
            },
          },
        ],
      });
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
      isLoading: true,
    });
    return this._usersAnalyticsService
      .getDimensions(datamartId, true)
      .then(response => {
        this.setState({
          isLoading: false,
          dimensionsList: {
            dimensions: response.data.dimensions,
          },
        });
      })
      .catch(e => {
        this.props.notifyError(e);
        this.setState({
          isLoading: false,
        });
      });
  };

  addStep = () => {
    const { steps } = this.state;
    const newSteps = steps.slice();

    newSteps.push(getDefaultStep());

    newSteps.forEach((step, index) => {
      step.name = `Step ${index + 1}`;
    });

    this.setState({ steps: newSteps });
  };

  addDimensionToStep = (stepId: string) => {
    const { steps } = this.state;
    const newSteps: Step[] = JSON.parse(JSON.stringify(steps));
    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.filter_clause.operator = 'AND';
        step.filter_clause.filters.push({
          id: this._cuid(),
          dimension_name: 'DATE_TIME',
          not: false,
          operator: 'EXACT' as DimensionFilterOperator,
          expressions: [],
          case_sensitive: false,
        });
      }
    });
    this.setState({ steps: newSteps });
  };

  handleNotSwitcherChange(dimensionIndex: number, stepId: string, value: boolean) {
    const { steps } = this.state;
    const newSteps: Step[] = JSON.parse(JSON.stringify(steps));
    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.filter_clause.filters.forEach((filter, index) => {
          if (dimensionIndex === index) {
            filter.not = !value;
          }
        });
      }
    });
    this.setState({
      steps: newSteps,
    });
  }

  handleDimensionNameChange(dimensionIndex: number, stepId: string, value: string) {
    if (value.toLocaleLowerCase() === 'event_type') {
      const { datamartId, dateRange } = this.props;
      this._datamartUsersAnalyticsService
        .getAnalytics(datamartId, [], dateRange.from, dateRange.to, ['event_type'])
        .then((reportView: ReportViewResponse) => {
          this.updateStepWithDimensionName(
            dimensionIndex,
            stepId,
            value,
            reportView.data.report_view.rows.length === 0,
          );
        });
    } else {
      this.updateStepWithDimensionName(dimensionIndex, stepId, value);
    }
  }

  updateStepWithDimensionName(
    dimensionIndex: number,
    stepId: string,
    value: string,
    displayEventTypeWarning?: boolean,
  ) {
    const { steps } = this.state;
    // make deep copy of data for comparison in shouldComponentUpdate
    const newSteps: Step[] = JSON.parse(JSON.stringify(steps));
    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.displayEventTypeWarning = displayEventTypeWarning;
        step.filter_clause.filters.forEach((filter, index) => {
          if (dimensionIndex === index) {
            filter.dimension_name = value;
            filter.expressions = [];
          }
        });
      }
    });
    this.setState({
      steps: newSteps,
    });
  }

  handleFilterOperatorChange(stepId: string, value: BooleanOperator) {
    const { steps } = this.state;
    const newSteps: Step[] = JSON.parse(JSON.stringify(steps));
    newSteps.forEach(step => {
      if (step.id === stepId) step.filter_clause.operator = value;
    });
    this.setState({
      steps: newSteps,
    });
  }

  handleDimensionExpressionForSelectorChange(
    dimensionIndex: number,
    stepId: string,
    value: string[],
  ) {
    const { steps } = this.state;
    const newSteps: Step[] = JSON.parse(JSON.stringify(steps));
    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.filter_clause.filters.forEach((filter, index) => {
          if (dimensionIndex === index) {
            filter.expressions = value.map(v => v.trim());
            if (filter.expressions.length > 1)
              filter.operator = 'IN_LIST' as DimensionFilterOperator;
            else filter.operator = 'EXACT' as DimensionFilterOperator;
          }
        });
      }
    });
    this.setState({ steps: newSteps });
  }

  handleMaximumDaysAfterStepChange(stepId: string, value: any) {
    const { steps } = this.state;
    const newSteps: Step[] = JSON.parse(JSON.stringify(steps));
    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.max_days_after_previous_step = parseInt(value.target.value, 10);
      }
    });

    this.setState({ steps: newSteps });
  }

  checkDimensionsNotEmpty = () => {
    let result = true;
    const { steps } = this.state;
    steps.forEach(step => {
      step.filter_clause.filters.forEach(filter => {
        if (!filter.dimension_name || filter.dimension_name.length === 0) result = false;
      });
    });

    return result;
  };

  handleExecuteQueryButtonClick = () => {
    const { steps } = this.state;
    if (checkExpressionsNotEmpty(steps) && this.checkDimensionsNotEmpty()) {
      this.updateFilterQueryStringParams();
    } else {
      this.props.notifyWarning({
        message: messages.errorFormMessage.defaultMessage,
        description: '',
      });
    }
  };

  showFilterSymbol(filterIndex: number, stepId?: string): FilterOperatorLabel {
    const { steps } = this.state;
    let result = 'equals' as FilterOperatorLabel;
    steps.forEach(step => {
      if (step.id === stepId) {
        step.filter_clause.filters.forEach((filter, index) => {
          if (filterIndex === index) {
            if (filter.operator === 'EXACT') result = 'equals' as FilterOperatorLabel;
            else if (filter.operator === 'IN_LIST') result = 'in' as FilterOperatorLabel;
          }
        });
      }
    });
    return result;
  }

  updateFilterQueryStringParams() {
    const { steps } = this.state;
    const { history } = this.props;

    const {
      location: { search: currentSearch, pathname },
    } = history;

    // deep copy
    const stepsCopy = JSON.parse(JSON.stringify(steps));
    stepsCopy.forEach((step: Step) => {
      // step.id = undefined;

      if (step.max_days_after_previous_step === 0) {
        step.max_days_after_previous_step = undefined;
      }
      // step.filter_clause.filters.forEach(filter => {
      //   filter.id = undefined
      // });
    });

    const stepsFormated = stepsCopy.filter((s: Step) => s.filter_clause.filters.length > 0);
    const queryParams = {
      filter: [JSON.stringify(stepsFormated)],
      template: undefined,
    };

    const nextLocation = {
      pathname: pathname,
      search: updateSearch(currentSearch, queryParams, FUNNEL_SEARCH_SETTING),
    };

    history.push(nextLocation);
  }

  removeDimensionFromStep = (stepId: string, filterId: string) => {
    const { steps } = this.state;
    const newSteps: Step[] = JSON.parse(JSON.stringify(steps));

    newSteps.forEach(step => {
      if (step.id === stepId) {
        const filterStepDimensions = step.filter_clause.filters.filter(
          filter => filter.id !== filterId,
        );
        step.filter_clause.filters = filterStepDimensions;
      }
    });

    this.setState({ steps: newSteps });
  };

  removeStep = (stepId: string) => {
    const { steps } = this.state;
    const newSteps = steps.filter(step => step.id !== stepId);
    newSteps.forEach((step, index) => {
      step.name = `Step ${index + 1}`;
    });

    this.setState({ steps: newSteps });
  };

  getDimensionNameSelect = () => {
    const { dimensionsList } = this.state;
    return dimensionsList.dimensions.map(d => (
      <Option key={this._cuid()} value={d.value}>
        {d.label}
      </Option>
    ));
  };

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

    if (direction === 'down' && index + 1 < steps.length) {
      steps[index] = steps[index + 1];
      steps[index].name = `Step ${index + 1}`;
      steps[index + 1] = temp;
      steps[index + 1].name = `Step ${index + 2}`;
      this.setState({ steps });
    }
  };

  popupContainer() {
    return document.getElementById('mcs-funnelQueryBuilder_step_dimensions') as HTMLElement;
  }

  render() {
    const { steps } = this.state;
    const { datamartId, intl, dateRange } = this.props;
    const { from, to } = dateRange;

    return (
      <div className={'mcs-funnelQueryBuilder'}>
        <div className={'mcs-funnelQueryBuilder_steps'}>
          <div className={'mcs-funnelQueryBuilder_step_timelineStart'}>
            {from && (
              <p className={'mcs-funnelQueryBuilder_timeline_date'}>
                {from.toMoment().format('DD/MM/YYYY 00:00')}
              </p>
            )}
            <CalendarOutlined className={'mcs-funnelQueryBuilder_timeline_icon'} />
          </div>
          {steps.map((step, index) => {
            return (
              <Card key={step.id} className={'mcs-funnelQueryBuilder_step'} bordered={false}>
                <div className={'mcs-funnelQueryBuilder_step_body'}>
                  {steps.length > 1 && (
                    <div className={'mcs-funnelQueryBuilder_step_reorderBtn'}>
                      {index > 0 && (
                        <ArrowUpOutlined
                          className={
                            'mcs-funnelQueryBuilder_sortBtn mcs-funnelQueryBuilder_sortBtn--up'
                          }
                          onClick={this.sortStep.bind(this, index, 'up')}
                        />
                      )}
                      {index + 1 < steps.length && (
                        <ArrowDownOutlined
                          className={'mcs-funnelQueryBuilder_sortBtn'}
                          onClick={this.sortStep.bind(this, index, 'down')}
                        />
                      )}
                    </div>
                  )}
                  <div className={'mcs-funnelQueryBuilder_step_content'}>
                    <div className={'mcs-funnelQueryBuilder_stepHeader'}>
                      <div className='mcs-funnelQueryBuilder_stepName_title'>{step.name}</div>
                      <Button
                        shape='circle'
                        icon={<CloseOutlined />}
                        className={'mcs-funnelQueryBuilder_removeStepBtn'}
                        onClick={this.removeStep.bind(this, step.id)}
                      />
                    </div>

                    {index > 0 && (
                      <div className={'mcs-funnelQueryBuilder_maximumDaysAfterStep'}>
                        <Input
                          type='number'
                          className={'mcs-funnelQueryBuilder_maximumDaysAfterStep_input'}
                          min='0'
                          value={step.max_days_after_previous_step}
                          onChange={this.handleMaximumDaysAfterStepChange.bind(this, step.id)}
                        />
                        <p className={'mcs-funnelQueryBuilder_maximumDaysAfterStep_desc'}>
                          {step.max_days_after_previous_step &&
                          step.max_days_after_previous_step > 1
                            ? 'days'
                            : 'day'}{' '}
                          maximum after previous step
                        </p>
                      </div>
                    )}
                    {step.filter_clause.filters.map((filter, filterIndex) => {
                      return (
                        <div key={filter.id}>
                          {filterIndex > 0 && (
                            <Select
                              showArrow={false}
                              defaultValue={'AND'}
                              className={
                                'mcs-funnelQueryBuilder_select mcs-funnelQueryBuilder_select--booleanOperators'
                              }
                              onChange={this.handleFilterOperatorChange.bind(this, step.id)}
                              value={step.filter_clause.operator}
                            >
                              {booleanOperator.map(bo => {
                                return (
                                  <Option key={this._cuid()} value={bo}>
                                    {bo}
                                  </Option>
                                );
                              })}
                            </Select>
                          )}
                          <div
                            className={'mcs-funnelQueryBuilder_step_dimensions'}
                            id='mcs-funnelQueryBuilder_step_dimensions'
                          >
                            <Select
                              value={filter.dimension_name}
                              showSearch={true}
                              showArrow={false}
                              placeholder='Dimension name'
                              getPopupContainer={this.popupContainer}
                              className={
                                'mcs-funnelQueryBuilder_select mcs-funnelQueryBuilder_select--dimensions'
                              }
                              onChange={this.handleDimensionNameChange.bind(
                                this,
                                filterIndex,
                                step.id,
                              )}
                            >
                              {this.getDimensionNameSelect()}
                            </Select>
                            <div className='mcs-funnelQueryBuilder_switch'>
                              <Switch
                                defaultChecked={!filter.not}
                                unCheckedChildren='NOT'
                                className={'mcs-funnelQueryBuilder_switch_btn'}
                                onChange={this.handleNotSwitcherChange.bind(
                                  this,
                                  filterIndex,
                                  step.id,
                                )}
                              />
                              {filter.not && (
                                <McsIcon
                                  type='info'
                                  className='mcs-funnelQueryBuilder_notInfo_notSwitcherIcon'
                                  title={
                                    'This will filter only activities that have the selected criteria filled with another value than the one(s) selected'
                                  }
                                />
                              )}
                            </div>
                            <div className='mcs-funnelQueryBuilder_step_dimensionFilter_operator'>
                              <span className='mcs-funnelQueryBuilder_step_dimensionFilter_operator_text'>
                                {this.showFilterSymbol(filterIndex, step.id)}
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
                              handleDimensionExpressionForSelectorChange={this.handleDimensionExpressionForSelectorChange.bind(
                                this,
                                filterIndex,
                                step.id,
                              )}
                            />
                            <Button
                              shape='circle'
                              icon={<CloseOutlined />}
                              className={'mcs-funnelQueryBuilder_removeFilterBtn'}
                              onClick={this.removeDimensionFromStep.bind(this, step.id, filter.id)}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {
                      <Button
                        className='mcs-funnelQueryBuilder_addDimensionBtn'
                        onClick={this.addDimensionToStep.bind(this, step.id)}
                      >
                        <FormattedMessage
                          id='audience.funnel.querybuilder.newFilter'
                          defaultMessage='Add a filter'
                        />
                      </Button>
                    }
                  </div>
                </div>
                <div className={'mcs-funnelQueryBuilder_step_bullet'}>
                  <div className={'mcs-funnelQueryBuilder_step_bullet_icon'} />
                </div>
                {step.displayEventTypeWarning && (
                  <div className={'mcs-funnelQueryBuilder_step_warning'}>
                    <CloseOutlined className={'mcs-funnelQueryBuilder_step_warning_icon'} />
                    <Tag className={'mcs-funnelQueryBuilder_step_warning_desc'}>
                      {intl.formatMessage(funnelMessages.eventsWarning)}
                    </Tag>
                  </div>
                )}
              </Card>
            );
          })}
          <div className={'mcs-funnelQueryBuilder_addStepBlock'}>
            <div className={'mcs-funnelQueryBuilder_step_timelineEnd'}>
              <FlagOutlined className={'mcs-funnelQueryBuilder_timeline_icon'} />
              {to && (
                <p className={'mcs-funnelQueryBuilder_timeline_date'}>
                  {to.toMoment().format('DD/MM/YYYY 23:59')}
                </p>
              )}
            </div>
            {steps.length < 4 && (
              <Button className={'mcs-funnelQueryBuilder_addStepBtn'} onClick={this.addStep}>
                <FormattedMessage
                  id='audience.funnel.querybuilder.newStep'
                  defaultMessage='Add a step'
                />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default compose<FunnelQueryBuilderProps, FunnelQueryBuilderProps>(
  injectNotifications,
  injectIntl,
  withRouter,
)(FunnelQueryBuilder);
