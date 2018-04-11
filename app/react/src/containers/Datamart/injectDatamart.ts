import { compose, mapProps } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import log from '../../utils/Logger';
import * as SessionHelper from '../../state/Session/selectors';
import { Datamart } from '../../models/organisation/organisation';

let limiter = 0;

export interface InjectedDatamartProps {
  datamart: Datamart;
}

const mapStateToProps = (state: any) => {
  return {
    getDefaultDatamart: SessionHelper.getDefaultDatamart(state),
  };
};

export default compose<any, InjectedDatamartProps>(
  withRouter,
  connect(mapStateToProps),
  mapProps(
    (
      props: RouteComponentProps<{ organisationId: string }> & {
        getDefaultDatamart: (orgId: string) => InjectedDatamartProps;
      } & { [key: string]: any },
    ) => {
      const { getDefaultDatamart, ...rest } = props;
      const defaultDatamart = getDefaultDatamart(
        rest.match.params.organisationId,
      );
      if (!defaultDatamart && limiter === 0) {
        limiter = 1;
        log.error(
          'No datamart found for organisationId ',
          rest.match.params.organisationId,
        );
      } 
      return {
        datamart: defaultDatamart,
        ...rest,
      };
    },
  ),
);
