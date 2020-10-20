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
    return (
      <div>
        <FunnelQueryBuilder datamartId={datamartId} />
        <Funnel datamartId={datamartId} title={"Funnel demo"} filter={funnelFilter} />
      </div>
    )
  }
}

export default compose<
  FunnelWrapperProps,
  FunnelWrapperProps
>(withRouter)(FunnelWrapper);
