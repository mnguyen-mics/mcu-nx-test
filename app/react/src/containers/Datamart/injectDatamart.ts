import { compose, mapProps } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import log from '../../utils/Logger';
import * as SessionHelper from '../../state/Session/selectors';

export interface InjectedDatamartProps {
  datamart: { id: string };
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
      const {
        match: { params: { organisationId } },
        getDefaultDatamart,
        ...rest,
      } = props;
      const defaultDatamart = getDefaultDatamart(organisationId);
      if (!defaultDatamart)
        log.error('No datamart found for organisationId ', organisationId);
      return {
        datamart: defaultDatamart,
        ...rest,
      };
    },
  ),
);
