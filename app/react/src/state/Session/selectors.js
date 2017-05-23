import { createSelector } from 'reselect';

import { normalizeArrayOfObject } from '../../utils/Normalizer';

const getAdditionnalWorkspace = state => state.session.workspace;
const getConnectedUserWorkspaces = state => state.session.connectedUser.workspaces;

const getDefaultWorkspace = createSelector(
  state => state.session.connectedUser.workspaces,
  state => state.session.connectedUser.default_workspace,
  (userWorkspaces, defaultWorkspaceIndex) => userWorkspaces[defaultWorkspaceIndex]
);

const getWorkspaces = createSelector(
  getConnectedUserWorkspaces,
  getAdditionnalWorkspace,
  (userWorkspaces, additionnalWorkspace) => {
    const allWorspaces = [
      ...userWorkspaces,
      additionnalWorkspace
    ];
    return normalizeArrayOfObject(allWorspaces, 'organisation_id');
  }
);

const getWorkspace = state => organisationId => {
  const workspaces = getWorkspaces(state);
  return workspaces[organisationId];
};

const getDefaultWorspaceOrganisationId = createSelector(
  getDefaultWorkspace,
  (defaultWorkspace) => {
    if (defaultWorkspace) return defaultWorkspace.organisation_id;
    return 'none';
  }
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
  getDefaultWorspaceOrganisationId,
  hasDatamarts,
  hasAccessToOrganisation,
  hasWorkspace,
  getWorkspace,
  getWorkspaces,
  getDefaultDatamart
};
