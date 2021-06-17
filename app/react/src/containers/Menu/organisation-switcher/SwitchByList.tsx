import * as React from 'react';
import { compose } from 'recompose';
import { Menu } from 'antd';
import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';
import { withRouter, RouteComponentProps } from 'react-router';
import { partition } from 'lodash';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { isAChild, isCommunity, switchWorkspace } from './OrganisationSwitcherHelpers';

export interface SwitchByListState {}

export interface SwitchByListProps {
  workspaces: UserWorkspaceResource[];
}

type Props = SwitchByListProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class SwitchByList extends React.Component<Props, SwitchByListState> {
  constructor(props: Props) {
    super(props);
  }

  handleOrgClick = (org: UserWorkspaceResource) => () => {
    const { match, history } = this.props;
    switchWorkspace(org.organisation_id, history, match);
  };

  renderOrg = (org: UserWorkspaceResource, isACommunity: boolean) => {
    return (
      <a onClick={this.handleOrgClick(org)}>
        <span className={isACommunity ? 'mcs-organisationListSwitcher-community' : ''}>
          {org.organisation_name}
        </span>
        <span className='mcs-organisationListSwitcher_orgId_searchView'>{org.organisation_id}</span>
      </a>
    );
  };

  renderNodeFlat = (nodes: UserWorkspaceResource[], level: number, isACommunity: boolean) => {
    return nodes.map((node, index) => {
      const children = this.getChildren(node);
      const hasChildren = children.length > 0;
      return (
        <React.Fragment key={index}>
          <Menu.Item key={node.organisation_id} className='item'>
            <div className={`mcs-organisationListSwitcher_indent-${level}`}>
              {this.renderOrg(node, isACommunity)}
            </div>
          </Menu.Item>
          {hasChildren && this.renderNodeFlat(children, level + 1, false)}
        </React.Fragment>
      );
    });
  };

  getChildren = (workspace: UserWorkspaceResource): UserWorkspaceResource[] => {
    const { workspaces } = this.props;
    const c = workspaces.filter(
      w => w.administrator_id === workspace.organisation_id && w.organisation_id !== w.community_id,
    );
    return c;
  };

  render() {
    const { workspaces } = this.props;
    const [communities, otherLevels] = partition(workspaces, w => isCommunity(w));
    const [firstLevelOrgs] = partition(otherLevels, w => !isAChild(w, workspaces));
    return (
      <Menu className='mcs-organisationListSwitcher_orgList' mode='vertical'>
        {this.renderNodeFlat(communities, 0, true)}
        {this.renderNodeFlat(firstLevelOrgs, 0, false)}
      </Menu>
    );
  }
}

export default compose<Props, SwitchByListProps>(withRouter, injectIntl)(SwitchByList);
