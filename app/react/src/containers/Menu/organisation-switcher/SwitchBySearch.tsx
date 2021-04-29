import * as React from 'react';
import { compose } from 'recompose';
import { Input, Menu } from 'antd';
import { UserWorkspaceResource } from '../../../models/directory/UserProfileResource';
import { withRouter, RouteComponentProps } from 'react-router';
import { partition, debounce, uniq } from 'lodash';
import messages from '../messages';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import LocalStorage from '../../../services/LocalStorage';
import cuid from 'cuid';
import { isCommunity, switchWorkspace } from './OrganisationSwitcherHelpers';

export interface SwitchBySearchState {
  searchKeyword: string;
  foundOrgs: UserWorkspaceResource[];
  organisations: UserWorkspaceResource[];
  foundCommunities: UserWorkspaceResource[];
  communities: UserWorkspaceResource[];
}

export interface SwitchBySearchProps {
  workspaces: UserWorkspaceResource[];
  isVisible?: boolean;
  maxOrgOrCommunity: number;
  shouldDropdownBeVisible: (trigger: boolean) => void;
}

const Search = Input.Search;

const { SubMenu } = Menu;

const savedCommunitiesKey = 'SAVED_COMMUNITY_SEARCHES';
const savedOrganisationsKey = 'SAVED_ORGANISATIONS_SEARCHES';

type Props = SwitchBySearchProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class SwitchBySearch extends React.Component<Props, SwitchBySearchState> {
  private debouncedSearch: (value: string) => void;

  private inputRef: React.RefObject<Input>;

  constructor(props: Props) {
    super(props);

    const [communities, orgs] = partition(props.workspaces, (w) =>
      isCommunity(w),
    );

    this.inputRef = React.createRef<Input>();

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

  componentDidMount() {
    // Crazy, right ?
    // https://stackoverflow.com/questions/35522220/react-ref-with-focus-doesnt-work-without-settimeout-my-example
    setTimeout(() => {
      this.inputRef.current?.focus();
    }, 1);
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

  setWorkspaceItem = (storageKey: string, orgIds: string[]) => {
    LocalStorage.setItem({ [storageKey]: JSON.stringify(orgIds) });
  };

  localStorageOrgs = (storageKey: string): string[] => {
    const history = LocalStorage.getItem(storageKey);
    if (!history) {
      return [];
    } else {
      const parsedHistory = JSON.parse(history);
      const areAllWorkspaces = parsedHistory.every(
        (item: any) => typeof item === 'string',
      );
      if (areAllWorkspaces) {
        return parsedHistory as string[];
      } else {
        return [];
      }
    }
  };

  upsertClickedWorkspace = (storageKey: string, orgId: string) => {
    const { maxOrgOrCommunity } = this.props;
    const history = this.localStorageOrgs(storageKey);
    if (!history) {
      this.setWorkspaceItem(storageKey, [orgId]);
    } else {
      history.unshift(orgId);
      this.setWorkspaceItem(
        storageKey,
        uniq(history).slice(0, maxOrgOrCommunity),
      );
    }
  };

  saveClickToLocalStorage = (
    org: UserWorkspaceResource,
    hasChildren: boolean,
  ) => {
    if (hasChildren) {
      this.upsertClickedWorkspace(savedCommunitiesKey, org.organisation_id);
    } else {
      this.upsertClickedWorkspace(savedOrganisationsKey, org.organisation_id);
    }
  };

  handleOrgClick = (org: UserWorkspaceResource, hasChildren: boolean) => () => {
    const { history, match } = this.props;
    this.saveClickToLocalStorage(org, hasChildren);
    switchWorkspace(org.organisation_id, history, match);
    this.props.shouldDropdownBeVisible(false);
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
      maxOrgOrCommunity,
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
    const { maxOrgOrCommunity } = this.props;
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
      return (
        <div className="mcs-organisationListSwitcher_fallback">
          {fallbackMessage}
        </div>
      );
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

  buildWorkspacesFromIds = (
    ids: string[],
    allWorkspaces: UserWorkspaceResource[],
  ): UserWorkspaceResource[] => {
    return ids
      .map((id) => allWorkspaces.find((w) => w.organisation_id === id))
      .filter((x): x is UserWorkspaceResource => x !== undefined);
  };

  render() {
    const { foundOrgs, foundCommunities, searchKeyword } = this.state;
    const {
      workspaces,
      intl: { formatMessage },
    } = this.props;
    const savedCommunitiesIds = this.localStorageOrgs(savedCommunitiesKey);
    const savedOrgsIds = this.localStorageOrgs(savedOrganisationsKey);

    const savedOrgs = this.buildWorkspacesFromIds(savedOrgsIds, workspaces);
    const savedCommunities = this.buildWorkspacesFromIds(
      savedCommunitiesIds,
      workspaces,
    );

    return (
      <Menu mode="vertical" className="mcs-organisationListSwitcher_menu">
        <div className="mcs-organisationListSwitcher_search">
          <Search
            ref={this.inputRef}
            size="small"
            placeholder={formatMessage(messages.searchPlaceholder)}
            className="mcs-organisationListSwitcher_searchInput"
            onSearch={this.handleSearch}
            onChange={this.handleChange}
          />
        </div>
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
  }
}

export default compose<Props, SwitchBySearchProps>(
  withRouter,
  injectIntl,
)(SwitchBySearch);
