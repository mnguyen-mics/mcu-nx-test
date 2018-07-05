import * as React from 'react';
import { withRouter, RouteComponentProps, Redirect } from 'react-router';
import { compose } from 'recompose';
import pathToRegexp from 'path-to-regexp';

export interface AngularRedirectProps {
  from: string;
  to: string;
  baseUrl: string;
}

type Props = AngularRedirectProps & RouteComponentProps<{ orgDatamartSettings: string }>;

class AngularRedirect extends React.Component<Props, any> {

  generateOrganisationId = (workspaceString: string) => {
    let organisationId = '';
    let datamartId = '';
    if (workspaceString && workspaceString.match(/^\d+$/)) {
      organisationId = workspaceString;
    } else if (workspaceString && workspaceString.match(/^o\d+d[^\d]+/)) {
      organisationId = workspaceString.match(/o(\d+).*/)![1];
    } else if (workspaceString && workspaceString.match(/o(\d+)d(\d+)/)) {
      organisationId = workspaceString.match(/o(\d+)d(\d+)/)![1];
      datamartId = workspaceString.match(/o(\d+)d(\d+)/)![2];
    }
    return {organisationId: organisationId, datamartId: datamartId};
  }

  public render() {
    const { from, to, match: { params }, baseUrl } = this.props;

    const { orgDatamartSettings, ...rest } = params;
    const toPath = pathToRegexp.compile(`${baseUrl}${to}`);
    const compiledRoute = toPath({
      organisationId: this.generateOrganisationId(orgDatamartSettings).organisationId,
      ...rest
    })
    return (
      <Redirect from={from} to={compiledRoute} />
    );
  }
}

export default compose<Props, AngularRedirectProps>(
  withRouter
)(AngularRedirect)
