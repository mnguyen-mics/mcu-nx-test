import * as React from 'react';
import { compose } from 'recompose';
import Funnel from './Funnel';
import FunnelQueryBuilder from './FunnelQueryBuilder';
import { RouteComponentProps, withRouter } from 'react-router';
import { buildDefaultSearch, parseSearch, isSearchValid } from '../../utils/LocationSearchHelper';
import { FUNNEL_SEARCH_SETTING } from './Constants';

interface FunnelWrapperProps {
  datamartId: string;
  parentCallback: (executeQuery: () => void, cancelQueryFunction: () => void, isLoading: boolean) => void;
}

interface State {
  isLoading: boolean;
  launchExecutionAskedTime: number;
  cancelQueryAskedTime: number;
  launchQueryFunction?: () => void;
}

type JoinedProp = RouteComponentProps &
  FunnelWrapperProps;

class FunnelWrapper extends React.Component<JoinedProp, State> {
  constructor(props: JoinedProp) {
    super(props);

    this.state = { 
      isLoading: false,
      launchExecutionAskedTime: 0,
      cancelQueryAskedTime: 0
    }
  }

  funnelCallbackFunction = (loading: boolean) => {
    this.setState({
      isLoading: loading
    })
    const { launchQueryFunction } = this.state
    if(launchQueryFunction)
      this.props.parentCallback(launchQueryFunction, this.cancelQueryFunction, loading)
  }

  storeExecuteFunctionInContext = (launchQueryFunction: () => void) => {
    const {isLoading} = this.state
    this.props.parentCallback(launchQueryFunction, this.cancelQueryFunction, isLoading)
    this.setState({
      launchQueryFunction: launchQueryFunction
    })
  }

  funnelQueryBuilderCallbackFunction = (timestampInSec: number) => {
    this.setState({launchExecutionAskedTime: timestampInSec})
  }

  cancelQueryFunction = () =>
    this.setState({
      cancelQueryAskedTime: new Date().getTime(), 
      isLoading: false
    });
  
  componentDidUpdate(prevProps: JoinedProp) {
    const {
      location: { search, pathname },
      history,
    } = this.props;

    if (prevProps.location.search !== search) {
      if (!isSearchValid(search, FUNNEL_SEARCH_SETTING)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, FUNNEL_SEARCH_SETTING),
        });
      }
    }
  }
  render() {
    const { datamartId } = this.props;
    const { 
      location: { search }
     } = this.props;

     const routeParams = parseSearch(search, FUNNEL_SEARCH_SETTING);
     const funnelFilter = routeParams.filter.length > 0 ? JSON.parse(routeParams.filter) : {};
     const { launchExecutionAskedTime, cancelQueryAskedTime } = this.state
    return (
      <div>
        <FunnelQueryBuilder datamartId={datamartId} parentCallback={this.funnelQueryBuilderCallbackFunction} launchQueryFunctionCallback={this.storeExecuteFunctionInContext}/>
        <Funnel datamartId={datamartId} title={"Funnel demo"} filter={funnelFilter} parentCallback={this.funnelCallbackFunction} launchExecutionAskedTime={launchExecutionAskedTime} cancelQueryAskedTime={cancelQueryAskedTime}/>
      </div>
    )
  }
}

export default compose<
  FunnelWrapperProps,
  FunnelWrapperProps
>(withRouter)(FunnelWrapper);
