import { compose, mapProps } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import log from '../../utils/Logger';
import * as SessionHelper from '../../redux/Session/selectors';
import { UserWorkspaceResource } from '../../models/directory/UserProfileResource';
import { MicsReduxState } from '../../utils/ReduxHelper';

export interface InjectedWorkspaceProps {
  workspace: UserWorkspaceResource;
}

const mapStateToProps = (state: MicsReduxState) => {
  return {
    getWorkspace: SessionHelper.getWorkspace(state),
  };
};

export default compose<any, InjectedWorkspaceProps>(
  withRouter,
  connect(mapStateToProps),
  mapProps(
    (
      props: RouteComponentProps<{ organisationId: string }> & {
        getWorkspace: (orgId: string) => InjectedWorkspaceProps;
      } & { [key: string]: any },
    ) => {
      const { getWorkspace, ...rest } = props;
      const workspace = getWorkspace(rest.match.params.organisationId);
      if (!workspace) {
        log.error('No datamart found for organisationId ', rest.match.params.organisationId);
      }
      return {
        workspace,
        ...rest,
      };
    },
  ),
);
