import { debounce } from 'lodash';
import React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../containers/Notifications/injectNotifications';
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
import { ComplementaryInfo } from './FunnelWrapper';

export interface StepDelta {
  dropOff?: string;
  passThroughPercentage?: string;
}

export interface FunnelData {
  groupedFunnel: GroupedByFunnel;
  stepsDelta: StepDelta[];
}

interface FunnelDataFetcherProps {
  datamartId: string;
  funnelId: string;
  title?: string;
  startIndex?: number;
  stepsNumber?: number;
  launchExecutionAskedTime: number;
  cancelQueryAskedTime: number;
  filter: FunnelFilter[];
  fullHeight: boolean;
  shouldRenderHeader: boolean;
  enableSplitBy: boolean;
  withInitializationHelper: boolean;
  parentCallback: (isLoading: boolean) => void;
  transformFunnel?: (funnelData: GroupedByFunnel) => GroupedByFunnel;
  openComplementaryFunnel?: (complementaryInfo: ComplementaryInfo) => void;
  closeFunnel?: () => void;
}

type Props = FunnelDataFetcherProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<void>;

interface State {
  funnelData?: FunnelData;
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
      initialState: !props.withInitializationHelper,
      dimensionsList: {
        dimensions: [],
      },
      isLoading: true,
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

  formatPercentageValue = (value: number) => {
    if (value >= 0.01) {
      return value.toFixed(2);
    } else if (value >= 0.0001) {
      return value.toFixed(4);
    } else if (value === 0) {
      return value.toString();
    } else {
      const exponentialDigits = 2;
      return value.toExponential(exponentialDigits);
    }
  };

  computeStepDelta = (upCountsPerStep: number[]) => {
    const stepsDelta: StepDelta[] = upCountsPerStep.map((step, i) => {
      let dropOff;

      if (i < upCountsPerStep.length - 1) {
        const nextStep = upCountsPerStep[i + 1];
        const passThroughPercentage = nextStep > 0 && step > 0 ? (nextStep / step) * 100 : 0;
        dropOff = 100 - passThroughPercentage;
        return {
          passThroughPercentage: this.formatPercentageValue(passThroughPercentage),
          dropOff: this.formatPercentageValue(dropOff),
        };
      } else {
        return {
          dropOff: this.formatPercentageValue(
            step > 0 && upCountsPerStep[0] > 0 ? (step / upCountsPerStep[0]) * 100 : 0,
          ),
        };
      }
    });

    return stepsDelta;
  };

  fetchData = (datamartId: string, filter: FunnelFilter[], timeRange: FunnelTimeRange) => {
    const { parentCallback, notifyError, transformFunnel } = this.props;
    const { isStepLoading } = this.state;
    const _transformFunnel = transformFunnel ? transformFunnel : (g: GroupedByFunnel) => g;

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
        const funnelResult = _transformFunnel(response.data);
        const upCountsPerStep = funnelResult.global.steps.map(step => step.count);
        upCountsPerStep.unshift(funnelResult.global.total);
        upCountsPerStep.pop();
        const stepsDelta = this.computeStepDelta(upCountsPerStep);
        this.setState(
          {
            isLoading: false,
            funnelData: {
              groupedFunnel: funnelResult,
              stepsDelta: stepsDelta,
            },
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
    const {
      filter,
      datamartId,
      funnelId,
      startIndex,
      stepsNumber,
      fullHeight,
      shouldRenderHeader,
      enableSplitBy,
      title,
      openComplementaryFunnel,
      closeFunnel,
    } = this.props;
    const { funnelData, dimensionsList, isStepLoading, isLoading, initialState } = this.state;
    const _startIndex = startIndex ? startIndex : 0;

    const close = () => {
      filter.forEach((element: FunnelFilter) => {
        element.group_by_dimensions = undefined;
      });
      this.updateLocationSearch({
        filter: [JSON.stringify(filter)],
      });
      if (funnelData) {
        const newFunnelData = {
          groupedFunnel: {
            ...funnelData.groupedFunnel,
            grouped_by: undefined,
          },
        };
        this.setState({
          funnelData: {
            ...funnelData,
            ...newFunnelData,
          },
        });
      }
    };

    const open = (index: number, dimensionName: string) => {
      filter.forEach((element: FunnelFilter) => {
        element.group_by_dimensions = undefined;
      });
      filter[index - 1].group_by_dimensions = [dimensionName.toLocaleLowerCase()];
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
        title={title}
        isStepLoading={isStepLoading}
        isLoading={isLoading}
        startIndex={_startIndex}
        funnelId={funnelId}
        initialState={initialState}
        stepsNumber={stepsNumber}
        fullHeight={fullHeight}
        shouldRenderHeader={shouldRenderHeader}
        enableSplitBy={enableSplitBy}
        openComplementaryFunnel={openComplementaryFunnel}
        closeFunnel={closeFunnel}
      />
    );
  }
}

export default compose<FunnelDataFetcherProps, FunnelDataFetcherProps>(
  withRouter,
  injectNotifications,
)(FunnelDataFetcher);
