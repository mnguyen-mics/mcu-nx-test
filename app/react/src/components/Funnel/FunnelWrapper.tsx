import * as React from 'react';
import { compose } from 'recompose';
import Funnel from './Funnel';
import FunnelQueryBuilder from './FunnelQueryBuilder';
import { RouteComponentProps, withRouter } from 'react-router';
import { parseSearch, updateSearch } from '../../utils/LocationSearchHelper';
import { FUNNEL_SEARCH_SETTING } from './constants';
import { BooleanOperator, DimensionFilterOperator } from '../../models/ReportRequestBody';

interface FunnelWrapperProps {
  datamartId: string;
}

type JoinedProp = RouteComponentProps &
  FunnelWrapperProps;

class FunnelWrapper extends React.Component<JoinedProp> {

  componentDidMount() {
    this.setInitialParams();
  }

  setInitialParams = () => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const queryParms = {
      filter: [JSON.stringify({
        name: 'user_activities',
        filterClause: {
          'operator': 'OR' as BooleanOperator,
          'filters': [
            {
              'dimension_name': 'type',
              'not': false,
              'operator': 'IN_LIST' as DimensionFilterOperator,
              'expressions': [
                'SITE_VISIT',
                'APP_VISIT'
              ],
              'case_sensitive': false
            }
          ]
        }
      })],
    };

    const nextLocation = {
      pathname: pathname,
      search: updateSearch(currentSearch, queryParms, FUNNEL_SEARCH_SETTING),
    };

    history.push(nextLocation);
  };

  render() {
    const { datamartId } = this.props;
    const { 
      location: { search }
     } = this.props;

     const routeParams = parseSearch(search, FUNNEL_SEARCH_SETTING);
     
    return (
      <div>
        <FunnelQueryBuilder datamartId={datamartId} />
        <Funnel datamartId={datamartId} title={"Funnel demo"} filter={routeParams.filter} />
      </div>
    )
  }
}

export default compose<
  FunnelWrapperProps,
  FunnelWrapperProps
>(withRouter)(FunnelWrapper);
