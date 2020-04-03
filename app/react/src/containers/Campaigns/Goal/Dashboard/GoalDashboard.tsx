import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Layout } from 'antd';
import { compose } from 'recompose';
import GoalHeader from './GoalHeader';
import Card from '../../../../components/Card/Card';
import {
  GoalResource,
  AttributionSelectionResource,
} from '../../../../models/goal';
import GoalActionbar from './GoalActionbar';
import {
  DATE_SEARCH_SETTINGS,
  buildDefaultSearch,
  compareSearches,
  isSearchValid,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import messages from './messages';
import McsDateRangePicker, {
  McsDateRangeValue,
} from '../../../../components/McsDateRangePicker';
import McsTabs from '../../../../components/McsTabs';
import McsMoment from '../../../../utils/McsMoment';
import GoalStackedAreaChart from './GoalChart';
import GoalAttribution from './GoalAttribution';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IGoalService } from '../../../../services/GoalService';

const { Content } = Layout;

export interface Filters {
  from?: McsMoment;
  to?: McsMoment;
}

interface GoalItem {
  item: GoalResource | undefined;
  isLoading: boolean;
}

interface AttributionModels {
  items: AttributionSelectionResource[];
  isLoading: boolean;
}

interface GoalDashboardProps {}

interface GoalDashboardState {
  goalObject: GoalItem;
  attributionModels: AttributionModels;
}

interface GoalRouteParams {
  organisationId: string;
  goalId: string;
}

type JoinedProps = GoalDashboardProps &
  RouteComponentProps<GoalRouteParams> &
  InjectedIntlProps;

class GoalDashboard extends React.Component<JoinedProps, GoalDashboardState> {

  @lazyInject(TYPES.IGoalService)
  private _goalService: IGoalService;
  
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      goalObject: {
        item: undefined,
        isLoading: true,
      },
      attributionModels: {
        items: [],
        isLoading: true,
      },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { goalId },
      },
      location: { search, pathname },
      history,
    } = this.props;

    if (!isSearchValid(search, DATE_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, DATE_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      this.fetchGoal(goalId);
    }
  }

  componentDidUpdate(previousProps: JoinedProps) {
    const {
      history,
      location: { pathname, search },
      match: {
        params: { organisationId, goalId },
      },
    } = this.props;

    const {
      location: { search: previousSearch },
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    if (
      !compareSearches(search, previousSearch) ||
      organisationId !== previousOrganisationId
    ) {
      if (!isSearchValid(search, DATE_SEARCH_SETTINGS)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, DATE_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== organisationId },
        });
      } else {
        this.fetchGoal(goalId);
      }
    }
  }

  fetchGoal = (goalId: string) => {
    return this._goalService.getGoal(goalId)
      .then(res => res.data)
      .then(res => {
        this.setState({ goalObject: { isLoading: false, item: res } });
        return this._goalService.getAttributionModels(res.id);
      })
      .then(res => res.data)
      .then(res =>
        this.setState({ attributionModels: { isLoading: false, items: res } }),
      );
  };

  updateLocationSearch = (params: Filters) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DATE_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  };

  renderDatePicker() {
    const {
      history: {
        location: { search },
      },
    } = this.props;

    const filter = parseSearch(search, DATE_SEARCH_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue) =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });

    return (
      <div style={{ marginBottom: 5 }}>
        <McsDateRangePicker values={values} onChange={onChange} />
      </div>
    );
  }

  renderItems = () => {
    return this.state.attributionModels.items
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(am => {
        const title =
          am.attribution_type === 'DIRECT'
            ? 'Direct'
            : am.attribution_model_name;
        return {
          title: title,
          display: <GoalAttribution attributionModelId={am.id} />,
        };
      });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    return (
      <div className="ant-layout">
        <GoalActionbar
          goal={this.state.goalObject.item}
          fetchGoal={this.fetchGoal}
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <GoalHeader goal={this.state.goalObject.item} />
            <Card
              title={formatMessage(messages.conversions)}
              buttons={this.renderDatePicker()}
            >
              <GoalStackedAreaChart />
            </Card>
            {this.state.attributionModels.items.length ? (
              <Card>
                <McsTabs items={this.renderItems()} />
              </Card>
            ) : (
              undefined
            )}
          </Content>
        </div>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
)(GoalDashboard);
