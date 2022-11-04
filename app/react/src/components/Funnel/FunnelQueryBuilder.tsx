import * as React from 'react';
import { Select, Button, Switch, Input } from 'antd';
import messages from '../../containers/Campaigns/Display/Edit/messages';
import { CalendarOutlined, CloseOutlined, FlagOutlined } from '@ant-design/icons';
import cuid from 'cuid';
import { TYPES } from '../../constants/types';
import { lazyInject } from '../../config/inversify.config';
import { IUsersAnalyticsService } from '../../services/UsersAnalyticsService';
import { DimensionsList } from '../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { compose } from 'recompose';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../containers/Notifications/injectNotifications';
import { booleanOperator, FUNNEL_SEARCH_SETTING, FilterOperatorLabel } from './Constants';
import {
  BooleanOperator,
  DimensionFilterClause,
  DimensionFilterOperator,
} from '../../models/ReportRequestBody';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { updateSearch, isSearchValid } from '../../utils/LocationSearchHelper';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import FunnelExpressionInput from './FunnelExpressionInput';
import { FunnelFilter } from '../../models/datamart/UserActivitiesFunnel';
import { IDatamartUsersAnalyticsService } from '../../services/DatamartUsersAnalyticsService';
import { ReportViewResponse } from '../../services/ReportService';
import {
  shouldUpdateFunnelQueryBuilder,
  getDefaultStep,
  checkExpressionsNotEmpty,
  extractFilters,
} from './Utils';
import _ from 'lodash';
import TimelineStepBuilder, { Step } from '../TimelineStepBuilder/TimelineStepBuilder';

const Option = Select.Option;

export interface StepProperties {
  filter_clause: DimensionFilterClause;
  max_days_after_previous_step?: number;
  displayEventTypeWarning?: boolean;
}

interface State {
  steps: Array<Step<StepProperties>>;
  isLoading: boolean;
  dimensionsList: DimensionsList;
  lastFilter?: string;
}

interface FunnelQueryBuilderProps {
  datamartId: string;
  steps: Array<Step<StepProperties>>;
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
      steps,
    } = this.props;

    const { lastFilter } = this.state;

    const DEFAULT_FILTER_LENGTH = 1;

    const isSearchChanged = prevProps.location.search !== search;

    const filterCopy = JSON.parse(JSON.stringify(extractFilters(steps)));
    const filterWithoutId = filterCopy.map((f: FunnelFilter) => {
      f.id = undefined;
      return f;
    });

    const actualFilter = JSON.stringify(filterWithoutId);

    const isUrlFilterChanged = lastFilter !== actualFilter;

    const isFilterNotZero = steps.length > 0;

    const isFilterFirstStepEqualToDefaultFirstStep = _.isEqual(
      steps[0].properties.filter_clause,
      getDefaultStep().properties.filter_clause,
    );
    const isStepsNotEqualToFilter = !_.isEqual(this.state.steps, steps);

    /**
     * These next conditions prevent the funnel query builder from updating if the steps change
     * but the query isn't executed yet
     */
    const isQueryExecuted = !(
      (steps.length === DEFAULT_FILTER_LENGTH &&
        steps[0].properties.filter_clause &&
        isFilterFirstStepEqualToDefaultFirstStep) ||
      isStepsNotEqualToFilter
    );

    if (isUrlFilterChanged) {
      this.setState({
        lastFilter: actualFilter,
      });
    }

    if (isSearchChanged && isFilterNotZero && (isQueryExecuted || isUrlFilterChanged)) {
      this.setInitialParams();
    }
  }

  /**
   * This component should not update if the queries are only different in group_by_dimension
   */
  shouldComponentUpdate(nextProps: Props, nextState: State) {
    const { dimensionsList: previousDimensionsList } = this.state;
    const { dimensionsList: nextDimensionsList } = nextState;
    const prevFilter = extractFilters(this.state.steps);
    const nextFilter = extractFilters(nextState.steps);

    const { dateRange } = this.props;
    const nextPropsFilter = extractFilters(this.props.steps);

    const shouldUpdate =
      shouldUpdateFunnelQueryBuilder(prevFilter, nextFilter) ||
      shouldUpdateFunnelQueryBuilder(prevFilter, nextPropsFilter) ||
      nextDimensionsList !== previousDimensionsList ||
      dateRange !== nextProps.dateRange;

    return shouldUpdate;
  }

  setInitialParams = () => {
    const {
      location: { search, pathname },
      history,
      steps,
      dateRange,
    } = this.props;

    try {
      const identifiedSteps = extractFilters(steps).map((filter: FunnelFilter) => {
        filter.filter_clause.filters.forEach(f => {
          const newFilterId = f.id ? f.id : this._cuid();
          f.id = newFilterId;
        });
        const newId = filter.id ? filter.id : this._cuid();
        return {
          id: newId,
          name: filter.name,
          properties: {
            filter_clause: filter.filter_clause,
            max_days_after_previous_step: filter.max_days_after_previous_step,
          },
        };
      });

      this.setState({
        steps: identifiedSteps,
      });
    } catch (error) {
      this.setState({
        steps: [getDefaultStep()],
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

  private cloneSteps() {
    const { steps } = this.state;
    return JSON.parse(JSON.stringify(steps));
  }

  addDimensionToStep = (stepId: string) => {
    const newSteps: Array<Step<StepProperties>> = this.cloneSteps();
    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.properties.filter_clause.operator = 'AND';
        step.properties.filter_clause.filters.push({
          id: this._cuid(),
          dimension_name: 'TYPE',
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
    const newSteps: Array<Step<StepProperties>> = this.cloneSteps();
    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.properties.filter_clause.filters.forEach((filter, index) => {
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
    const newSteps: Array<Step<StepProperties>> = this.cloneSteps();
    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.properties.displayEventTypeWarning = displayEventTypeWarning;
        step.properties.filter_clause.filters.forEach((filter, index) => {
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
    const newSteps: Array<Step<StepProperties>> = this.cloneSteps();
    newSteps.forEach(step => {
      if (step.id === stepId) step.properties.filter_clause.operator = value;
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
    const newSteps: Array<Step<StepProperties>> = this.cloneSteps();
    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.properties.filter_clause.filters.forEach((filter, index) => {
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
    const newSteps: Array<Step<StepProperties>> = this.cloneSteps();
    newSteps.forEach(step => {
      if (step.id === stepId) {
        step.properties.max_days_after_previous_step = parseInt(value.target.value, 10);
      }
    });

    this.setState({ steps: newSteps });
  }

  checkDimensionsNotEmpty = () => {
    let result = true;
    const { steps } = this.state;
    steps.forEach(step => {
      step.properties.filter_clause.filters.forEach(filter => {
        if (!filter.dimension_name || filter.dimension_name.length === 0) result = false;
      });
    });

    return result;
  };

  handleExecuteQueryButtonClick = () => {
    const filters = extractFilters(this.state.steps);
    if (checkExpressionsNotEmpty(filters) && this.checkDimensionsNotEmpty()) {
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
        step.properties.filter_clause.filters.forEach((filter, index) => {
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
    stepsCopy.forEach((step: Step<StepProperties>) => {
      // step.id = undefined;

      if (step.properties.max_days_after_previous_step === 0) {
        step.properties.max_days_after_previous_step = undefined;
      }
      // step.filter_clause.filters.forEach(filter => {
      //   filter.id = undefined
      // });
    });

    const stepsFormated = stepsCopy.filter(
      (s: Step<StepProperties>) => s.properties.filter_clause.filters.length > 0,
    );
    const queryParams = {
      filter: [JSON.stringify(extractFilters(stepsFormated))],
      template: undefined,
    };

    const nextLocation = {
      pathname: pathname,
      search: updateSearch(currentSearch, queryParams, FUNNEL_SEARCH_SETTING),
    };

    history.push(nextLocation);
  }

  removeDimensionFromStep = (stepId: string, filterId: string) => {
    const newSteps: Array<Step<StepProperties>> = this.cloneSteps();

    newSteps.forEach(step => {
      if (step.id === stepId) {
        const filterStepDimensions = step.properties.filter_clause.filters.filter(
          filter => filter.id !== filterId,
        );
        step.properties.filter_clause.filters = filterStepDimensions;
      }
    });

    this.setState({ steps: newSteps });
  };

  onStepChange = (steps: Array<Step<StepProperties>>) => {
    this.setState({ steps });
  };

  getDimensionNameSelect = () => {
    const { dimensionsList } = this.state;
    return dimensionsList.dimensions.map(d => (
      <Option
        key={this._cuid()}
        value={d.value}
        className={`mcs-funnelQueryBuilder_select--dimensions--${d.value}`}
      >
        {d.label}
      </Option>
    ));
  };

  popupContainer() {
    return document.getElementById('mcs-funnelQueryBuilder_step_dimensions') as HTMLElement;
  }

  renderHeaderTimeline = () => {
    const from = this.props.dateRange.from;
    return (
      <span>
        <CalendarOutlined className={'mcs-funnelQueryBuilder_timeline_icon'} />
        {from && (
          <p className={'mcs-funnelQueryBuilder_timeline_date'}>
            {from.toMoment().format('DD/MM/YYYY 00:00')}
          </p>
        )}
      </span>
    );
  };

  renderFooterTimeline = () => {
    const to = this.props.dateRange.to;
    return (
      <span>
        <FlagOutlined className={'mcs-funnelQueryBuilder_timeline_icon'} />
        {to && (
          <p className={'mcs-funnelQueryBuilder_timeline_date'}>
            {to.toMoment().format('DD/MM/YYYY 23:59')}
          </p>
        )}
      </span>
    );
  };

  renderAfterBulletElement = (step: Step<StepProperties>, index: number) => {
    return (
      <span>
        {step.properties.displayEventTypeWarning && (
          <div className={'mcs-funnelQueryBuilder_step_warning'}>
            {/* <CloseOutlined className={'mcs-funnelQueryBuilder_step_warning_icon'} />
                        <Tag className={'mcs-funnelQueryBuilder_step_warning_desc'}>
                          {intl.formatMessage(funnelMessages.eventsWarning)}
                        </Tag> */}
          </div>
        )}
      </span>
    );
  };

  renderStepBody = (step: Step<StepProperties>, index: number) => {
    const { datamartId, dateRange } = this.props;
    const { from, to } = dateRange;

    return (
      <span>
        {index > 0 && (
          <div className={'mcs-funnelQueryBuilder_maximumDaysAfterStep'}>
            <Input
              type='number'
              className={'mcs-funnelQueryBuilder_maximumDaysAfterStep_input'}
              min='0'
              value={step.properties.max_days_after_previous_step}
              onChange={this.handleMaximumDaysAfterStepChange.bind(this, step.id)}
            />
            <p className={'mcs-funnelQueryBuilder_maximumDaysAfterStep_desc'}>
              {step.properties.max_days_after_previous_step &&
              step.properties.max_days_after_previous_step > 1
                ? 'days'
                : 'day'}{' '}
              maximum after previous step
            </p>
          </div>
        )}
        {step.properties.filter_clause.filters.map((filter, filterIndex) => {
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
                  value={step.properties.filter_clause.operator}
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
                  onChange={this.handleDimensionNameChange.bind(this, filterIndex, step.id)}
                >
                  {this.getDimensionNameSelect()}
                </Select>
                <div className='mcs-funnelQueryBuilder_switch'>
                  <Switch
                    defaultChecked={!filter.not}
                    unCheckedChildren='NOT'
                    className={'mcs-funnelQueryBuilder_switch_btn'}
                    onChange={this.handleNotSwitcherChange.bind(this, filterIndex, step.id)}
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
      </span>
    );
  };

  render() {
    const rendering = {
      shouldDisplayNumbersInBullet: false,
      renderHeaderTimeline: this.renderHeaderTimeline,
      renderFooterTimeline: this.renderFooterTimeline,
      renderStepBody: this.renderStepBody,
      renderAfterBulletElement: this.renderAfterBulletElement,
      shouldRenderArrows: true,
    };
    const stepManagement = {
      onStepAdded: this.onStepChange,
      onStepRemoved: this.onStepChange,
      onStepsReordered: this.onStepChange,
      getDefaultStep: getDefaultStep,
    };

    return (
      <div className={'mcs-funnelQueryBuilder'}>
        <TimelineStepBuilder
          steps={this.state.steps}
          rendering={rendering}
          stepManagement={stepManagement}
          maxSteps={4}
        />
      </div>
    );
  }
}

export default compose<FunnelQueryBuilderProps, FunnelQueryBuilderProps>(
  withRouter,
  injectNotifications,
  injectIntl,
)(FunnelQueryBuilder);
