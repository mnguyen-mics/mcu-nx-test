import * as React from 'react';
import { compose } from 'recompose';
import Funnel from './Funnel';
import FunnelQueryBuilder from './FunnelQueryBuilder';
import { RouteComponentProps, withRouter } from 'react-router';
import { buildDefaultSearch, parseSearch, isSearchValid } from '../../utils/LocationSearchHelper';
import { FUNNEL_SEARCH_SETTING } from './Constants';

interface FunnelWrapperProps {
  datamartId: string;
}

type JoinedProp = RouteComponentProps &
  FunnelWrapperProps;

class FunnelWrapper extends React.Component<JoinedProp> {
  state = { 
    isLoading: false,
    launchExecutionAskedTime: 0
  }
  
  funnelCallbackFunction = (loading: boolean) => {
    this.setState({
      isLoading: loading
    })
  }

  funnelQueryBuilderCallbackFunction = (timestampInSec: number) => {
    this.setState({launchExecutionAskedTime: timestampInSec})
  }
  
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
     const { isLoading, launchExecutionAskedTime } = this.state
    return (
      <div>
        <FunnelQueryBuilder datamartId={datamartId} isLoading={isLoading} parentCallback={this.funnelQueryBuilderCallbackFunction}/>
        <Funnel datamartId={datamartId} title={"Funnel demo"} filter={funnelFilter} parentCallback={this.funnelCallbackFunction} launchExecutionAskedTime={launchExecutionAskedTime}/>
      </div>
    )
  }
}

export default compose<
  FunnelWrapperProps,
  FunnelWrapperProps
>(withRouter)(FunnelWrapper);
