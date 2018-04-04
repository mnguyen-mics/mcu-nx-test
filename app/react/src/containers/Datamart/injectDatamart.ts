import { DatamartResource } from './../../models/datamart/DatamartResource';
import { compose, mapProps } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import log from '../../utils/Logger';
import * as SessionHelper from '../../state/Session/selectors';
import { Datamart } from '../../models/organisation/organisation';

export interface InjectedDatamartProps {
  datamart: Datamart;
}

const mapStateToProps = (state: any) => {
  return {
    getDefaultDatamart: SessionHelper.getDefaultDatamart(state),
    selectedDatamart: SessionHelper.getSelectedDatamart(state),
  };
};

export default compose<any, InjectedDatamartProps>(
  withRouter,
  connect(mapStateToProps),
  mapProps(
    (
      props: RouteComponentProps<{ organisationId: string }> & {
        getDefaultDatamart: (orgId: string) => InjectedDatamartProps;
        selectedDatamart?: DatamartResource;
      } & { [key: string]: any },
    ) => {
      const { getDefaultDatamart, selectedDatamart, ...rest } = props;
      const defaultDatamart = getDefaultDatamart(
        rest.match.params.organisationId,
      );
      if (selectedDatamart) {
        return {
          ...rest,
          datamart: selectedDatamart,
        };
      } else {
        if (!defaultDatamart)
          log.error(
            'No datamart found for organisationId ',
            rest.match.params.organisationId,
          );
        return {
          datamart: defaultDatamart,
          ...rest,
        };
      }
    },
  ),
);
