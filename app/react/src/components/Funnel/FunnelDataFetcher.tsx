import { debounce } from 'lodash';
import React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import { InjectedNotificationProps } from '../../containers/Notifications/injectNotifications';
import {
  FunnelFilter,
  FunnelTimeRange,
  GroupedByFunnel,
} from '../../models/datamart/UserActivitiesFunnel';
import { DimensionsList } from '../../models/datamartUsersAnalytics/datamartUsersAnalytics';
import { IUserActivitiesFunnelService } from '../../services/UserActivitiesFunnelService';
import { IUsersAnalyticsService } from '../../services/UsersAnalyticsService';
import Funnel from './Funnel';

import { shouldRefetchFunnelData, extractDatesFromProps, checkExpressionsNotEmpty } from './Utils';
import { updateSearch, parseSearch } from '../../utils/LocationSearchHelper';
import { FUNNEL_SEARCH_SETTING } from './Constants';

interface FunnelDataFetcherProps {
  datamartId: string;
  funnelId: string;
  startIndex?: number;
  launchExecutionAskedTime: number;
  cancelQueryAskedTime: number;
  filter: FunnelFilter[];
  parentCallback: (isLoading: boolean) => void;
}

type Props = FunnelDataFetcherProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<void>;

interface State {
  funnelData?: GroupedByFunnel;
  dimensionsList: DimensionsList;
  isLoading: boolean;
  isStepLoading: boolean;
  lastExecutedQueryAskedTime: number;
  initialState: boolean;
}

const deepCopy = (value: any) => {
  return JSON.parse(JSON.stringify(value));
};

class FunnelDataFetcher extends React.Component<Props, State> {
  @lazyInject(TYPES.IUsersAnalyticsService)
  private _usersAnalyticsService: IUsersAnalyticsService;
  @lazyInject(TYPES.IUserActivitiesFunnelService)
  private _userActivitiesFunnelService: IUserActivitiesFunnelService;
  private _debounce = debounce;

  constructor(props: Props) {
    super(props);
    this.state = {
      funnelData: undefined,
      isStepLoading: false,
      initialState: true,
      dimensionsList: {
        dimensions: [],
      },
      isLoading: false,
      lastExecutedQueryAskedTime: 0,
    };
    this.fetchData = this._debounce(this.fetchData.bind(this), 800);
  }

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

  componentDidMount() {
    const {
      datamartId,
      filter,
      history: {
        location: { search },
      },
    } = this.props;
    const timeRange = extractDatesFromProps(search);
    if (filter.length > 0 && checkExpressionsNotEmpty(filter)) {
      this.fetchData(datamartId, filter, timeRange);
    }
    this.fetchDimensions(datamartId);
  }

  componentDidUpdate(prevProps: Props) {
    const {
      datamartId,
      location: { search },
      launchExecutionAskedTime,
      cancelQueryAskedTime,
    } = this.props;

    const {
      location: { search: prevSearch },
    } = prevProps;

    const lastExecutedQueryAskedTime = this.state.lastExecutedQueryAskedTime;
    const timeRange = extractDatesFromProps(search);
    const routeParams = parseSearch(search, FUNNEL_SEARCH_SETTING);
    const prevRouteParams = parseSearch(prevSearch, FUNNEL_SEARCH_SETTING);
    const funnelFilter = routeParams.filter.length > 0 ? JSON.parse(routeParams.filter) : [];
    const shouldRefetch = shouldRefetchFunnelData(prevRouteParams, routeParams);
    if (
      (prevProps.location.search !== search ||
        lastExecutedQueryAskedTime !== launchExecutionAskedTime) &&
      funnelFilter.length > 0 &&
      shouldRefetch
    ) {
      this.setState({ lastExecutedQueryAskedTime: launchExecutionAskedTime });
      this.fetchData(datamartId, funnelFilter, timeRange);
    }

    if (prevProps.cancelQueryAskedTime !== cancelQueryAskedTime) {
      this.setState({
        isLoading: false,
      });
    }
  }

  fetchData = (datamartId: string, filter: FunnelFilter[], timeRange: FunnelTimeRange) => {
    const { parentCallback, notifyError } = this.props;
    const { isStepLoading } = this.state;
    this.setState({
      isLoading: !isStepLoading,
      initialState: false,
    });
    return this._userActivitiesFunnelService
      .getUserActivitiesFunnel(datamartId, filter, timeRange, 5)
      .then(response => {
        response.data.global.steps.push(
          deepCopy(response.data.global.steps[response.data.global.steps.length - 1]),
        );
        response.data.grouped_by?.map(dimension =>
          dimension.funnel.steps.push(
            deepCopy(dimension.funnel.steps[dimension.funnel.steps.length - 1]),
          ),
        );
        this.setState(
          {
            isLoading: false,
            funnelData: response.data,
            isStepLoading: false,
          },
          () => {
            parentCallback(this.state.isLoading);
          },
        );
      })
      .catch(e => {
        notifyError(e);
        this.setState(
          {
            isLoading: false,
            isStepLoading: false,
          },
          () => {
            parentCallback(false);
          },
        );
      });
  };

  updateLocationSearch = (params: any) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, FUNNEL_SEARCH_SETTING),
    };
    history.push(nextLocation);
  };

  render() {
    const { filter, datamartId, funnelId, startIndex } = this.props;
    const { funnelData, dimensionsList, isStepLoading, isLoading, initialState } = this.state;

    const _startIndex = startIndex ? startIndex : 0;

    const close = () => {
      filter.forEach((element: FunnelFilter) => {
        element.group_by_dimension = undefined;
      });
      this.updateLocationSearch({
        filter: [JSON.stringify(filter)],
      });
      if (funnelData)
        this.setState({
          funnelData: {
            ...funnelData,
            grouped_by: undefined,
          },
        });
    };

    const open = (index: number, dimensionName: string) => {
      filter.forEach((element: FunnelFilter) => {
        element.group_by_dimension = undefined;
      });
      filter[index - 1].group_by_dimension = dimensionName.toLocaleLowerCase();
      this.setState({
        isStepLoading: true,
      });
      this.updateLocationSearch({
        filter: [JSON.stringify(filter)],
      });
    };

    return (
      <Funnel
        closeGroupBy={close}
        openGroupBy={open}
        datamartId={datamartId}
        funnelData={funnelData}
        dimensionsList={dimensionsList}
        filter={filter}
        isStepLoading={isStepLoading}
        isLoading={isLoading}
        startIndex={_startIndex}
        funnelId={funnelId}
        initialState={initialState}
      />
    );
  }
}

export default compose<FunnelDataFetcherProps, FunnelDataFetcherProps>(withRouter)(
  FunnelDataFetcher,
);
