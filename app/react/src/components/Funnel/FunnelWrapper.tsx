import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import FunnelQueryBuilder from './FunnelQueryBuilder';
import { RouteComponentProps, withRouter } from 'react-router';
import { buildDefaultSearch, parseSearch, isSearchValid } from '../../utils/LocationSearchHelper';
import { funnelMessages, FUNNEL_SEARCH_SETTING } from './Constants';
import { FunnelFilter, GroupedByFunnel, Steps } from '../../models/datamart/UserActivitiesFunnel';
import { extractFilters, getDefaultStep } from './Utils';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import FunnelDataFetcher from './FunnelDataFetcher';

interface FunnelWrapperProps {
  datamartId: string;
  parentCallback: (
    executeQueryFunction: () => void,
    cancelQueryFunction: () => void,
    isLoading: boolean,
  ) => void;
  dateRange: McsDateRangeValue;
}

export interface ComplementaryInfo {
  index?: number;
  funnelData: GroupedByFunnel;
}

interface State {
  isLoading: boolean;
  launchExecutionAskedTime: number;
  cancelQueryAskedTime: number;
  executeQueryFunction?: () => void;
  complementaryInfo?: ComplementaryInfo;
  isComplementaryFunnelOpen: boolean;
}

type JoinedProp = RouteComponentProps & FunnelWrapperProps & InjectedIntlProps;

const deepCopy = (value: any) => {
  return JSON.parse(JSON.stringify(value));
};

class FunnelWrapper extends React.Component<JoinedProp, State> {
  constructor(props: JoinedProp) {
    super(props);

    this.state = {
      isLoading: false,
      launchExecutionAskedTime: 0,
      cancelQueryAskedTime: 0,
      complementaryInfo: undefined,
      isComplementaryFunnelOpen: false,
    };
  }

  funnelCallbackFunction = (loading: boolean) => {
    this.setState({
      isLoading: loading,
    });
    const { executeQueryFunction } = this.state;
    if (executeQueryFunction) {
      this.props.parentCallback(executeQueryFunction, this.cancelQueryFunction, loading);
    }
  };

  storeAndLiftFunctions = (executeQueryFunction: () => void) => {
    const { isLoading } = this.state;
    this.props.parentCallback(executeQueryFunction, this.cancelQueryFunction, isLoading);
    this.setState({
      executeQueryFunction: executeQueryFunction,
    });
  };

  funnelQueryBuilderCallbackFunction = (timestampInSec: number) => {
    this.setState({ launchExecutionAskedTime: timestampInSec });
  };

  cancelQueryFunction = () =>
    this.setState({
      cancelQueryAskedTime: new Date().getTime(),
      isLoading: false,
    });

  componentDidUpdate(prevProps: JoinedProp) {
    const {
      location: { search, pathname },
      history,
    } = this.props;

    if (prevProps.location.search !== search) {
      this.setState({
        isComplementaryFunnelOpen: false,
      });

      if (!isSearchValid(search, FUNNEL_SEARCH_SETTING)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, FUNNEL_SEARCH_SETTING),
        });
      }
    }
  }

  prepareComplementaryFunnel(funnelFilter: FunnelFilter[]): FunnelFilter[] {
    const { complementaryInfo } = this.state;
    const funnelFilterCopy = deepCopy(funnelFilter);

    // Splice modifies the original array
    if (complementaryInfo && complementaryInfo.index && complementaryInfo.index > 0)
      funnelFilterCopy.splice(complementaryInfo.index - 1, 1);
    return funnelFilterCopy;
  }

  addPhantomStep(funnelData: GroupedByFunnel, previousFunnelData: GroupedByFunnel, index: number) {
    const referenceCount =
      index === 1
        ? previousFunnelData.global.total
        : previousFunnelData.global.steps[index - 2].count;
    const step: Steps = {
      count: referenceCount,
      interaction_duration: 0,
      name: `Step ${index}`,
    };
    const newSteps = funnelData.global.steps
      .slice(0, index - 1)
      .concat(step, funnelData.global.steps.slice(index - 1));
    funnelData.global.steps = newSteps.map((newStep, i) => {
      if (i >= index - 1) {
        const newConversion =
          newStep.conversion && previousFunnelData.global.steps[i]?.conversion
            ? newStep.conversion - (previousFunnelData.global.steps[i].conversion || 0)
            : undefined;
        const newAmount =
          newStep.amount && previousFunnelData.global.steps[i]?.amount
            ? newStep.amount - (previousFunnelData.global.steps[i].amount || 0)
            : undefined;
        return {
          ...newStep,
          count: newStep.count - previousFunnelData.global.steps[i].count,
          conversion: newConversion,
          amount: newAmount,
        };
      } else return newStep;
    });
    return funnelData;
  }

  transformFunnel(b: GroupedByFunnel) {
    const { complementaryInfo } = this.state;
    if (complementaryInfo) {
      const { funnelData, index } = complementaryInfo;
      return this.addPhantomStep(b, funnelData, index || 0);
    } else return b;
  }

  extractStepsFromFilters(funnelFilters: FunnelFilter[]) {
    const filters: FunnelFilter[] = deepCopy(funnelFilters);
    return filters.map(funnelFilter => {
      return {
        id: funnelFilter.id,
        name: funnelFilter.name,
        properties: {
          filter_clause: funnelFilter.filter_clause,
          max_days_after_previous_step: funnelFilter.max_days_after_previous_step,
        },
      };
    });
  }

  render() {
    const { datamartId, dateRange, intl } = this.props;
    const {
      location: { search },
    } = this.props;
    const { complementaryInfo, isComplementaryFunnelOpen } = this.state;

    const routeParams = parseSearch(search, FUNNEL_SEARCH_SETTING);
    const funnelFilter: FunnelFilter[] =
      routeParams.filter.length > 0 ? JSON.parse(routeParams.filter) : extractFilters([getDefaultStep()]);
    const filterWithoutGroupBy: FunnelFilter[] = deepCopy(funnelFilter);
    filterWithoutGroupBy.forEach(x => delete x.group_by_dimension);

    // Make copies for display in Funnel
    const funnelFilterCopy = deepCopy(funnelFilter);
    const filterWithoutGroupByCopy = deepCopy(filterWithoutGroupBy);
    const steps = this.extractStepsFromFilters(filterWithoutGroupBy);

    const { launchExecutionAskedTime, cancelQueryAskedTime } = this.state;

    const openComplementaryFunnel = !isComplementaryFunnelOpen
      ? (newComplementaryInfo: ComplementaryInfo) =>
        this.setState({
          isComplementaryFunnelOpen: true,
          complementaryInfo: newComplementaryInfo,
        })
      : undefined;

    const transformFunnel = this.transformFunnel.bind(this);
    const prepareComplementaryFunnel = this.prepareComplementaryFunnel.bind(this);

    const closeFunnel = () => {
      this.setState({
        complementaryInfo: undefined,
        isComplementaryFunnelOpen: false,
      });
    };

    return (
      <div>
        <FunnelQueryBuilder
          datamartId={datamartId}
          steps={steps}
          liftFunctionsCallback={this.storeAndLiftFunctions}
          dateRange={dateRange}
        />
        <FunnelDataFetcher
          datamartId={datamartId}
          funnelId={'1'}
          filter={funnelFilterCopy}
          parentCallback={this.funnelCallbackFunction}
          launchExecutionAskedTime={launchExecutionAskedTime}
          cancelQueryAskedTime={cancelQueryAskedTime}
          openComplementaryFunnel={openComplementaryFunnel}
          fullHeight={true}
          withInitializationHelper={true}
          shouldRenderHeader={true}
          enableSplitBy={true}
        />
        {isComplementaryFunnelOpen && complementaryInfo ? (
          <FunnelDataFetcher
            datamartId={datamartId}
            funnelId={'2'}
            title={`${intl.formatMessage(funnelMessages.funnelForDropoutTitle)} ${
              complementaryInfo.index
            }`}
            filter={prepareComplementaryFunnel(filterWithoutGroupByCopy)}
            parentCallback={this.funnelCallbackFunction}
            launchExecutionAskedTime={launchExecutionAskedTime}
            cancelQueryAskedTime={cancelQueryAskedTime}
            transformFunnel={transformFunnel}
            startIndex={complementaryInfo.index}
            stepsNumber={complementaryInfo.funnelData.global.steps.length}
            fullHeight={false}
            withInitializationHelper={false}
            shouldRenderHeader={true}
            enableSplitBy={false}
            closeFunnel={closeFunnel}
          />
        ) : undefined}
      </div>
    );
  }
}

export default compose<FunnelWrapperProps, FunnelWrapperProps>(
  injectIntl,
  withRouter,
)(FunnelWrapper);
