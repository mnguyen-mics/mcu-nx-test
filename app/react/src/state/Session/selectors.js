import { createSelector } from 'reselect';

import { normalizeArrayOfObject } from '../../utils/Normalizer.ts';

const getAdditionnalWorkspace = state => state.session.workspace;
const getConnectedUserWorkspaces = state =>
  state.session.connectedUser.workspaces;

const getDefaultWorkspaceIndex = state => {
  if (
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
    userWorkspaces[defaultWorkspaceIndex],
);

const getWorkspaces = createSelector(
  getConnectedUserWorkspaces,
  getAdditionnalWorkspace,
  (userWorkspaces, additionnalWorkspace) => {
    if (additionnalWorkspace && additionnalWorkspace.organisation_id) {
      return normalizeArrayOfObject(
        [...userWorkspaces, additionnalWorkspace],
        'organisation_id',
      );
    }

    return normalizeArrayOfObject(userWorkspaces, 'organisation_id');
  },
);

const getWorkspace = state => organisationId => {
  const workspaces = getWorkspaces(state);
  return workspaces[organisationId];
};

const getDefaultWorkspaceOrganisationId = createSelector(
  getDefaultWorkspace,
  defaultWorkspace => {
    if (defaultWorkspace) return defaultWorkspace.organisation_id;
    return 'none';
  },
);

const getDefaultWorkspaceOrganisationName = createSelector(
  getDefaultWorkspace,
  defaultWorkspace => {
    if (defaultWorkspace) return defaultWorkspace.organisation_id;
    return 'none';
  },
);

const getDefaultDatamart = state => organisationId => {
  const workspaces = getWorkspaces(state);
  return workspaces[organisationId].datamarts[0];
};

const hasDatamarts = state => organisationId => {
  const workspaces = getWorkspaces(state);
  return workspaces[organisationId].datamarts.length > 0;
};

const hasWorkspace = state => organisationId => {
  const workspaces = getWorkspaces(state);
  return !!workspaces[organisationId];
};

const hasAccessToOrganisation = state => organisationId => {
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
};
