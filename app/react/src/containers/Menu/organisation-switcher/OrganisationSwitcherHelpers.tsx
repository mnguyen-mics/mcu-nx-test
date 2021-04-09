import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';
import pathToRegexp from 'path-to-regexp';
import { History } from 'history';

export const isCommunity = (org: UserWorkspaceResource): boolean => {
  return org.organisation_id === org.community_id;
};

export const isAChild = (
  org: UserWorkspaceResource,
  workspaces: UserWorkspaceResource[],
): boolean => {
  return (
    workspaces.find((w) => w.organisation_id === org.administrator_id) !==
    undefined
  );
};

export const switchWorkspace = (
  organisationId: string,
  history: History<any>,
  match: any,
) => {
  const toPath = pathToRegexp.compile(match.path);
  const fullUrl = toPath({
    ...match.params,
    organisationId: organisationId,
  });
  history.push(fullUrl);
};
