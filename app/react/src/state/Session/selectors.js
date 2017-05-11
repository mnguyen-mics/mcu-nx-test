const buildWorkspace = (workspace, datamart = {}) => {

  const {
    organisation_name: organisationName,
    organisation_id: organisationId,
    administrator,
    role
  } = workspace;

  const {
    id: datamartId,
    name: datamartName
  } = datamart;

  const workspaceId = `o${organisationId}d${datamartId}`;

  return {
    organisationName,
    organisationId,
    administrator,
    role,
    datamartId,
    datamartName,
    workspaceId
  };

};

const buildWorkspaces = workspaces => {

  const builtWorkspaces = [];

  const uniqueWorkspaces = workspaces.filter((workspace, index, self) => self.findIndex(w => w.organisation_id === workspace.organisation_id) === index);

  uniqueWorkspaces.forEach(workspace => {

    if (workspace.datamarts.length) {
      workspace.datamarts.forEach(datamart => {
        builtWorkspaces.push(buildWorkspace(workspace, datamart));
      });
    } else {
      builtWorkspaces.push(buildWorkspace(workspace));
    }

  });

  return builtWorkspaces;

};

const setActiveWorkspace = (workspace, workspaces, defaultWorkspace, init = false) => {

  let activeWorkspace = {};

  const getDefaultOrFirstWorkspace = () => {

    let defaultOrFirstWorkspace = {};

    if (defaultWorkspace) {
      defaultOrFirstWorkspace = workspaces.find(userWorkspace => userWorkspace.organisationId === defaultWorkspace.toString());
    }

    if (!defaultOrFirstWorkspace || !defaultOrFirstWorkspace.organisationId) {
      defaultOrFirstWorkspace = workspaces[0];
    }

    return defaultOrFirstWorkspace;
  };

  if (init) {
    if (workspace.datamartId) {
      activeWorkspace = workspaces.find(userWorkspace => (userWorkspace.organisationId === workspace.organisationId) && (userWorkspace.datamartId === workspace.datamartId));
    } else {
      activeWorkspace = workspaces.find(userWorkspace => userWorkspace.organisationId === workspace.organisationId);
    }
  } else {
    activeWorkspace = workspace;
  }

  if (!activeWorkspace || !activeWorkspace.organisationId) {
    activeWorkspace = getDefaultOrFirstWorkspace();
  }

  return activeWorkspace;
};

const isReactUrl = url => {
  const regex = new RegExp(PUBLIC_URL); // eslint-disable-line no-undef
  return url.search(regex) >= 0;
};

export {
  buildWorkspaces,
  setActiveWorkspace,
  isReactUrl
};
