import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import pathToRegexp from 'path-to-regexp';
import { MicsReduxState } from '../../utils/ReduxHelper';
import { getWorkspace } from '../../redux/Session/selectors';
import { Dropdown, Input, Menu } from 'antd';
import { UserWorkspaceResource } from '../../models/directory/UserProfileResource';
import { withRouter, RouteComponentProps } from 'react-router';
import { partition } from 'lodash';
import { HomeOutlined } from '@ant-design/icons';
import messages from './messages';
import { InjectedIntlProps, injectIntl } from 'react-intl';
// import { McsIcon } from '@mediarithmics-private/mcs-components-library';

export interface OrganizationListSwitcherState {
  foundOrgs: UserWorkspaceResource[];
  organisations: UserWorkspaceResource[];
  foundCommunities: UserWorkspaceResource[];
  communities: UserWorkspaceResource[];
}

export interface StoreProps {
  workspaces: UserWorkspaceResource[];
  workspace: (organisationId: string) => UserWorkspaceResource;
}

const Search = Input.Search;
const { SubMenu } = Menu;

const maximumOrgDisplay = 6;
const maximumCommunityDisplay = 6;

type Props = StoreProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class OrganizationListSwitcher extends React.Component<
  Props,
  OrganizationListSwitcherState
> {
  constructor(props: Props) {
    super(props);

    const [communities, orgs] = partition(
      props.workspaces,
      (w) => this.getChildren(w).length > 0,
    );

    this.state = {
      communities: communities,
      organisations: orgs,
      foundOrgs: orgs.slice(0, maximumOrgDisplay),
      foundCommunities: communities.slice(0, maximumCommunityDisplay),
    };
  }

  handleOrgClick = (organisationId: string) =>
    this.switchWorkspace(organisationId);

  switchWorkspace = (organisationId: string) => {
    const {
      history,
      match: { path, params },
    } = this.props;

    const toPath = pathToRegexp.compile(path);
    const fullUrl = toPath({
      ...params,
      organisationId: organisationId,
    });
    history.push(fullUrl);
  };

  renderOrg = (org: UserWorkspaceResource, hasChildren: boolean) => {
    const handleClick = () => this.handleOrgClick(org.organisation_id);
    return (
      <a onClick={handleClick}>
        <span
          className={hasChildren ? 'mcs-organisationListSwitcher_parent' : ''}
        >
          {org.organisation_name}
        </span>{' '}
        <span className="mcs-organisationListSwitcher_orgId">
          {org.organisation_id}
        </span>
      </a>
    );
  };

  renderChildrenMenu = (children: UserWorkspaceResource[]) => {
    return children.map((child) => this.renderNodeMenu(child));
  };

  renderNodeMenu = (node: UserWorkspaceResource) => {
    const children = this.getChildren(node);
    if (children.length > 0) {
      return (
        <SubMenu
          key={node.organisation_id}
          icon={<HomeOutlined />}
          title={this.renderOrg(node, false)}
          popupClassName="mcs-organisationListSwitcher_popOverMenu"
        >
          {this.renderChildrenMenu(children)}
        </SubMenu>
      );
    } else {
      return (
        <Menu.Item key={node.organisation_id}>
          {this.renderOrg(node, false)}
        </Menu.Item>
      );
    }
  };

  renderNodeFlat = (nodes: UserWorkspaceResource[], isChild: boolean) => {
    return nodes.map((node, index) => {
      const children = this.getChildren(node);
      const hasChildren = children.length > 0;
      return (
        <React.Fragment key={index}>
          <Menu.Item key={node.organisation_id}>
            <div
              className={isChild ? 'mcs-organisationListSwitcher_indent' : ''}
            >
              {this.renderOrg(node, hasChildren)}
            </div>
          </Menu.Item>
          {hasChildren && this.renderNodeFlat(children, true)}
        </React.Fragment>
      );
    });
  };

  getChildren = (workspace: UserWorkspaceResource): UserWorkspaceResource[] => {
    const { workspaces } = this.props;
    const c = workspaces.filter(
      (w) =>
        w.community_id === workspace.organisation_id &&
        w.organisation_id !== w.community_id,
    );
    return c;
  };

  searchCaseInsensitive = (
    value: string,
    nodes: UserWorkspaceResource[],
    max: number,
  ) => {
    const regex = new RegExp(value, 'i');
    return nodes.filter((w) => regex.test(w.organisation_name)).slice(0, max);
  };

  handleSearch = (value: string) => {
    const { organisations, communities } = this.state;
    const foundOrgs = this.searchCaseInsensitive(
      value,
      organisations,
      maximumOrgDisplay,
    );
    const foundCommunities = this.searchCaseInsensitive(
      value,
      communities,
      maximumCommunityDisplay,
    );
    this.setState({
      foundOrgs: foundOrgs,
      foundCommunities: foundCommunities,
    });
  };

  SwitchBySearch = () => {
    const { foundOrgs, foundCommunities } = this.state;
    const {
      intl: { formatMessage },
    } = this.props;
    return (
      <Menu className="mcs-organisationListSwitcher_menu" mode="vertical">
        <Menu.Item disabled={true}>
          <Search
            className="mcs-organisationListSwitcher_searchInput"
            onSearch={this.handleSearch}
          />
        </Menu.Item>
        <Menu.ItemGroup
          title={formatMessage(messages.communitiesTitle)}
          className="mcs-organisationListSwitcher_subtitle"
        >
          {foundCommunities.map((org) => {
            return this.renderNodeMenu(org);
          })}
        </Menu.ItemGroup>
        <Menu.ItemGroup
          title={formatMessage(messages.organisationsTitle)}
          className="mcs-organisationListSwitcher_subtitle"
        >
          {foundOrgs.map((org) => {
            return this.renderNodeMenu(org);
          })}
        </Menu.ItemGroup>
      </Menu>
    );
  };

  SwitchByList = () => {
    const { workspaces } = this.props;
    const [adminOrgs] = partition(
      workspaces,
      (w) => w.administrator_id === null,
    );
    return (
      <Menu className="mcs-organisationListSwitcher_orgList" mode="vertical">
        {this.renderNodeFlat(adminOrgs, false)}
      </Menu>
    );
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      workspace,
      workspaces,
    } = this.props;

    const currentWorkspace = workspace(organisationId);

    const workspaceNb = workspaces.length;

    return (
      <Dropdown
        overlay={
          workspaceNb > maximumOrgDisplay + maximumCommunityDisplay
            ? this.SwitchBySearch
            : this.SwitchByList
        }
        trigger={['click']}
        placement="bottomRight"
      >
        <div className="mcs-organisationListSwitcher_component">
          <hr />
          <div className="mcs-organisationListSwitcher_currentOrg_box">
            <div className="mcs-organisationListSwitcher_currentOrg">
              <p className="mcs-organisationListSwitcher_orgName">
                {currentWorkspace.organisation_name}
              </p>
              <p className="mcs-organisationListSwitcher_orgId">
                {currentWorkspace.organisation_id}
              </p>
            </div>
            <div className="mcs-organisationListSwitcher_downlogo">
              <i className="ant-menu-submenu-arrow" />
            </div>
          </div>
          <hr />
        </div>
      </Dropdown>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspaces: state.session.connectedUser.workspaces,
  workspace: getWorkspace(state),
});

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  connect(mapStateToProps),
)(OrganizationListSwitcher);
