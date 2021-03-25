import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import pathToRegexp from 'path-to-regexp';
import { MicsReduxState } from '../../utils/ReduxHelper';
import { getWorkspace } from '../../redux/Session/selectors';
import { Dropdown, Input, Menu } from 'antd';
import { UserWorkspaceResource } from '../../models/directory/UserProfileResource';
import { withRouter, RouteComponentProps } from 'react-router';
import { partition, debounce, uniqBy } from 'lodash';
import { HomeOutlined } from '@ant-design/icons';
import messages from './messages';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import LocalStorage from '../../services/LocalStorage';
import cuid from 'cuid';

export interface OrganizationListSwitcherState {
  searchKeyword: string;
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

const maxOrgOrCommunity = 6;

const savedCommunitiesKey = 'SAVED_COMMUNITY_SEARCHES';
const savedOrganisationsKey = 'SAVED_ORGANISATIONS_SEARCHES';

type Props = StoreProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class OrganizationListSwitcher extends React.Component<
  Props,
  OrganizationListSwitcherState
> {
  private debouncedSearch: (value: string) => void;
  constructor(props: Props) {
    super(props);

    const [communities, orgs] = partition(props.workspaces, (w) =>
      this.isCommunity(w),
    );

    this.state = {
      searchKeyword: '',
      communities: communities,
      organisations: orgs,
      foundOrgs: [],
      foundCommunities: [],
    };

    this.debouncedSearch = debounce((value: string) => {
      this.setState({
        searchKeyword: value,
      });
      this.searchOrgAndCommunities(value);
    }, 200);
  }

  searchOrgAndCommunities = (value: string) => {
    const { organisations, communities } = this.state;
    const foundOrgs = this.searchByNameOrId(value, organisations);
    const foundCommu = this.searchByNameOrId(value, communities);
    this.setState({
      foundOrgs: foundOrgs,
      foundCommunities: foundCommu,
    });
  };

  isCommunity(org: UserWorkspaceResource) {
    return org.organisation_id === org.community_id;
  }

  isObjectWorkspace(obj: any): obj is UserWorkspaceResource {
    return (
      typeof obj.organisation_id === 'string' &&
      typeof obj.organisation_name === 'string' &&
      typeof obj.administrator === 'boolean'
    );
  }

  setWorkspaceItem = (storageKey: string, orgs: UserWorkspaceResource[]) => {
    LocalStorage.setItem({ [storageKey]: JSON.stringify(orgs) });
  };

  localStorageOrgs = (storageKey: string): UserWorkspaceResource[] => {
    const history = LocalStorage.getItem(storageKey);
    if (!history) {
      return [];
    } else {
      const parsedHistory = JSON.parse(history);
      const areAllWorkspaces = parsedHistory.every((item: any) =>
        this.isObjectWorkspace(item),
      );
      if (areAllWorkspaces) {
        return parsedHistory as UserWorkspaceResource[];
      } else {
        return [];
      }
    }
  };

  upsertClickedWorkspace = (storageKey: string, org: UserWorkspaceResource) => {
    const history = this.localStorageOrgs(storageKey);
    if (!history) {
      this.setWorkspaceItem(storageKey, [org]);
    } else {
      history.unshift(org);
      this.setWorkspaceItem(
        storageKey,
        uniqBy(history, 'organisation_id').slice(0, maxOrgOrCommunity),
      );
    }
  };

  saveClickToLocalStorage = (
    org: UserWorkspaceResource,
    hasChildren: boolean,
  ) => {
    if (hasChildren) {
      this.upsertClickedWorkspace(savedCommunitiesKey, org);
    } else {
      this.upsertClickedWorkspace(savedOrganisationsKey, org);
    }
  };

  handleOrgClick = (org: UserWorkspaceResource, hasChildren: boolean) => () => {
    this.saveClickToLocalStorage(org, hasChildren);
    this.switchWorkspace(org.organisation_id);
  };

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
    return (
      <a onClick={this.handleOrgClick(org, hasChildren)}>
        {org.organisation_name}
        <span className="mcs-organisationListSwitcher_orgId_searchView">
          {org.organisation_id}
        </span>
      </a>
    );
  };

  renderChildrenMenu = (children: UserWorkspaceResource[]) => {
    const {
      intl: { formatMessage },
    } = this.props;
    return (
      <React.Fragment>
        {children
          .slice(0, maxOrgOrCommunity * 3)
          .map((child) => this.renderNodeMenu(child))}
        {children.length > maxOrgOrCommunity * 3 && (
          <SubMenu
            key={cuid()}
            title={formatMessage(messages.more)}
            popupClassName="mcs-organisationListSwitcher_popOverMenu"
          >
            {this.renderChildrenMenu(children.slice(maxOrgOrCommunity * 3))}
          </SubMenu>
        )}
      </React.Fragment>
    );
  };

  renderNodeMenu = (node: UserWorkspaceResource) => {
    const children = this.getChildren(node);
    if (children.length > 0) {
      return (
        <SubMenu
          key={cuid()}
          icon={<HomeOutlined />}
          title={this.renderOrg(node, true)}
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
        w.administrator_id === workspace.organisation_id &&
        w.organisation_id !== w.community_id,
    );
    return c;
  };

  searchByNameOrId = (value: string, nodes: UserWorkspaceResource[]) => {
    const regex = new RegExp(value, 'i');
    return nodes.filter(
      (w) => regex.test(w.organisation_name) || value === w.organisation_id,
    );
  };

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.debouncedSearch(value);
  };

  handleSearch = (value: string) => {
    this.searchOrgAndCommunities(value);
  };

  renderOrgMenuGroup = (title: string, orgs: UserWorkspaceResource[]) => {
    return (
      <React.Fragment>
        <Menu.ItemGroup
          title={title}
          className="mcs-organisationListSwitcher_subtitle"
        >
          {orgs.slice(0, maxOrgOrCommunity).map((org) => {
            return this.renderNodeMenu(org);
          })}
        </Menu.ItemGroup>
        {orgs.length > maxOrgOrCommunity && (
          <SubMenu
            key={cuid()}
            title={'More ...'}
            popupClassName="mcs-organisationListSwitcher_popOverMenu"
          >
            {this.renderChildrenMenu(orgs.slice(maxOrgOrCommunity))}
          </SubMenu>
        )}
      </React.Fragment>
    );
  };

  renderOrgsAndCommunities = (
    savedOrgs: UserWorkspaceResource[],
    savedCommus: UserWorkspaceResource[],
    fallbackMessage: string,
  ) => {
    const {
      intl: { formatMessage },
    } = this.props;
    const orgIsEmpty = !savedOrgs || savedOrgs.length === 0;
    const commuIsEmpty = !savedCommus || savedCommus.length === 0;
    if (orgIsEmpty && commuIsEmpty) {
      return <Menu.Item disabled={true}>{fallbackMessage}</Menu.Item>;
    } else {
      return (
        <React.Fragment>
          {savedCommus &&
            savedCommus.length > 0 &&
            this.renderOrgMenuGroup(
              formatMessage(messages.communitiesTitle),
              savedCommus,
            )}
          {savedOrgs &&
            savedOrgs.length > 0 &&
            this.renderOrgMenuGroup(
              formatMessage(messages.organisationsTitle),
              savedOrgs,
            )}
        </React.Fragment>
      );
    }
  };

  SwitchBySearch = () => {
    const { foundOrgs, foundCommunities, searchKeyword } = this.state;
    const {
      intl: { formatMessage },
    } = this.props;
    const savedCommunities = this.localStorageOrgs(savedCommunitiesKey);
    const savedOrgs = this.localStorageOrgs(savedOrganisationsKey);
    return (
      <Menu className="mcs-organisationListSwitcher_menu" mode="vertical">
        <Menu.Item disabled={true}>
          <Search
            size="small"
            className="mcs-organisationListSwitcher_searchInput"
            onSearch={this.handleSearch}
            onChange={this.handleChange}
          />
        </Menu.Item>
        {searchKeyword === ''
          ? this.renderOrgsAndCommunities(
              savedOrgs,
              savedCommunities,
              formatMessage(messages.searchForOrganisationOrCommunity),
            )
          : this.renderOrgsAndCommunities(
              foundOrgs,
              foundCommunities,
              formatMessage(messages.noOrganisationsFound),
            )}
      </Menu>
    );
  };

  SwitchByList = () => {
    const { workspaces } = this.props;
    const [communities] = partition(workspaces, (w) => this.isCommunity(w));
    return (
      <Menu className="mcs-organisationListSwitcher_orgList" mode="vertical">
        {this.renderNodeFlat(communities, false)}
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
          workspaceNb > maxOrgOrCommunity * 2
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
