import { UserWorkspaceResource } from './../../models/directory/UserProfileResource';
import { createSelector } from 'reselect';
import { normalizeArrayOfObject } from '../../utils/Normalizer';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

const getConnectedUserWorkspaces = (state: MicsReduxState) =>
  state.session.connectedUser.workspaces;

const getStoredConnectedUser = (state: MicsReduxState) => {
  return state && state.session && state.session.connectedUser;
};

const getDefaultWorkspaceIndex = (state: MicsReduxState) => {
  if (
    state.session &&
    state.session.connectedUser &&
    state.session.connectedUser.default_workspace &&
    state.session.connectedUser.default_workspace !== -1
  ) {
    return state.session.connectedUser.default_workspace;
  }
  return 0;
};

const getDefaultWorkspace = createSelector(
  state => state.session.connectedUser.workspaces,
  getDefaultWorkspaceIndex,
  (userWorkspaces, defaultWorkspaceIndex) =>
    userWorkspaces && userWorkspaces.length && userWorkspaces[defaultWorkspaceIndex],
);

// Improve typing here
const getWorkspaces: any = createSelector(
  getConnectedUserWorkspaces,
  // remove typing here when state will be typed
  (userWorkspaces: UserWorkspaceResource[]) => {
    return (
      userWorkspaces &&
      userWorkspaces.length &&
      normalizeArrayOfObject(userWorkspaces, 'organisation_id')
    );
  },
);

const getWorkspace = (state: MicsReduxState) => (organisationId: string) => {
  const workspaces = getWorkspaces(state);
  return workspaces[organisationId];
};

const getDefaultWorkspaceOrganisationId = createSelector(getDefaultWorkspace, defaultWorkspace => {
  if (defaultWorkspace) return defaultWorkspace.organisation_id;
  return 'none';
});

const getDefaultWorkspaceOrganisationName = createSelector(
  getDefaultWorkspace,
  defaultWorkspace => {
    if (defaultWorkspace) return defaultWorkspace.organisation_id;
    return 'none';
  },
);

const getDefaultDatamart = (state: MicsReduxState) => (organisationId: string) => {
  const workspaces = getWorkspaces(state);
  return (
    workspaces &&
    workspaces[organisationId] &&
    workspaces[organisationId].datamarts &&
    workspaces[organisationId].datamarts[0]
  );
};

const hasDatamarts = (state: MicsReduxState) => (organisationId: string) => {
  const workspaces = getWorkspaces(state);
  return (
    workspaces && workspaces[organisationId] && workspaces[organisationId].datamarts.length > 0
  );
};

const hasWorkspace = (state: MicsReduxState) => (organisationId: string) => {
  const workspaces = getWorkspaces(state);
  return !!workspaces[organisationId];
};

const hasAccessToOrganisation = (state: MicsReduxState) => (organisationId: string) => {
  const workspaces = getWorkspaces(state);
  return !!workspaces[organisationId];
};

export {
  getDefaultWorkspaceOrganisationId,
  getDefaultWorkspaceOrganisationName,
  hasDatamarts,
  hasAccessToOrganisation,
  hasWorkspace,
  getWorkspace,
  getWorkspaces,
  getDefaultDatamart,
  getStoredConnectedUser,
};
