import { OrganisationResource } from '@mediarithmics-private/advanced-components/lib/models/organisation/organisation';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { Loading, TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import UserRoleResource from '../../../../../models/directory/UserRoleResource';
import { ICommunityService } from '../../../../../services/CommunityServices';
import { IUserRolesService } from '../../../../../services/UserRolesService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import FoldableCardHierarchy, { FoldableCardHierarchyResource } from './FoldableCardHierarchy';
import { RouterProps, UserDisplay } from './UserListPage';
import { messages } from './messages';
import UserResource from '../../../../../models/directory/UserResource';
import _ from 'lodash';
import { Empty, Tooltip } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { IOrganisationService } from '../../../../../services/OrganisationService';

export interface UserContainerProps {
  communityId: string;
  currentOrganisationId: string;
  userDisplay: UserDisplay;
  user?: UserResourceWithRole;
  editUser: (user: UserResourceWithRole) => void;
  editUserRole: (user: UserResourceWithRole, organisationId?: string) => void;
  deleteUser: (user: UserResourceWithRole) => void;
  deleteUserRole: (user: UserResourceWithRole) => void;
  filterValue: string;
  displayInheritedRole: boolean;
}

interface UserResourceWithRole extends UserResource {
  role?: UserRoleResource;
}

type Props = UserContainerProps &
  InjectedNotificationProps &
  RouteComponentProps<RouterProps> &
  InjectedIntlProps;

interface State {
  organisations?: OrganisationResource[];
  users?: UserResourceWithRole[];
  userHierarchy?: FoldableCardHierarchyResource;
  loading?: boolean;
}

class UserContainer extends React.Component<Props, State> {
  @lazyInject(TYPES.ICommunityService)
  private _communityService: ICommunityService;
  @lazyInject(TYPES.IUserRolesService)
  private _userRolesService: IUserRolesService;
  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    const { communityId } = this.props;
    this.initializeUserHierarchy(communityId);
  }

  componentDidUpdate(prevProps: Props) {
    const { userDisplay, communityId, filterValue, displayInheritedRole } = this.props;
    const {
      userDisplay: prevUserDisplay,
      filterValue: prevFilterValue,
      displayInheritedRole: prevDisplayInheritedRole,
    } = prevProps;
    if (
      userDisplay !== prevUserDisplay ||
      displayInheritedRole !== prevDisplayInheritedRole ||
      (filterValue !== prevFilterValue && (filterValue.length >= 3 || filterValue.length === 0))
    ) {
      this.initializeUserHierarchy(communityId, filterValue);
    }
  }

  initializeUserHierarchy(communityId: string, filterValue?: string) {
    const {
      userDisplay,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const promises: Array<Promise<DataListResponse<any>>> = [
      this._organisationService.getOrganisations(communityId),
      this._communityService.getCommunityUsers(communityId, { max_results: 500 }),
    ];

    this.setState({
      loading: true,
    });

    Promise.all(promises)
      .then(res => {
        const users = (res[1] as DataListResponse<UserResourceWithRole>).data;
        const filteredUsers = filterValue
          ? users.filter(
              u =>
                u.first_name.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase()) ||
                u.last_name.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase()) ||
                u.email.toLocaleLowerCase().includes(filterValue.toLocaleLowerCase()),
            )
          : users;
        const nextPromises: Array<Promise<any>> =
          userDisplay === 'user_roles'
            ? filteredUsers.map(async user => {
                const rolesRes = await this._userRolesService.getUserRoles(user.id, {
                  max_results: 500,
                });
                if (rolesRes.data.length >= 1) {
                  return rolesRes.data.map(role => {
                    // The reason why we put role's org id instead of user's org id here is because :
                    // when the "Role" screen is selected we want to recursively build tree hierarchy
                    // based on userRole's organisationId
                    return {
                      ...user,
                      organisation_id: role.organisation_id,
                      role: {
                        ...role,
                        // The reason we use the org Id here is because we want to know during the tree build
                        // which role is belonging to a user belonging to the current organisation (see is_home_user usage)
                        organisation_id: user.organisation_id,
                      },
                    };
                  });
                } else {
                  return Promise.resolve(user);
                }
              })
            : filteredUsers.map(u => {
                return Promise.resolve(u);
              });
        Promise.all(nextPromises)
          .then(usersResponse => {
            const flattenUsers = _.flattenDeep(usersResponse);
            this.setState(
              {
                organisations: (res[0] as DataListResponse<OrganisationResource>).data,
                users:
                  userDisplay === 'user_roles'
                    ? flattenUsers.filter(u => u.role?.role)
                    : usersResponse,
              },
              () => {
                this.setState({
                  userHierarchy: this.buildHierarchy(),
                  loading: false,
                });
              },
            );
          })
          .then(() => {
            const element = document.getElementById(`mcs-foldable-card-${organisationId}`);
            element?.scrollIntoView();
          })
          .catch(err => {
            this.props.notifyError(err);
            this.setState({
              loading: false,
            });
          });
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({
          loading: false,
        });
      });
  }

  buildHierarchy(): FoldableCardHierarchyResource | undefined {
    const { organisations, users } = this.state;
    const { currentOrganisationId, displayInheritedRole, userDisplay, user } = this.props;

    const recursiveBuildHierarchy = (
      organisation?: OrganisationResource,
    ): FoldableCardHierarchyResource => {
      const orgUsers = users
        ?.filter(u => u.organisation_id === organisation?.id)
        .map(u => {
          if (u.role?.organisation_id === organisation?.id) {
            return {
              ...u,
              role: {
                ...u.role,
                organisation_id: u.organisation_id,
                role: u.role ? u.role.role : '',
                is_home_user: true,
              },
            };
          } else return u;
        });
      // To do : make recursive function for N parental bonds
      const isParentUser = (u: UserResourceWithRole) => {
        const parentOrg = organisations?.find(o => o.id === organisation?.administrator_id);
        const grandParentOrg = organisations?.find(o => o.id === parentOrg?.administrator_id);
        const greatGrandParentOrg = organisations?.find(
          o => o.id === grandParentOrg?.administrator_id,
        );

        const userCondition =
          u.organisation_id === organisation?.administrator_id ||
          u.organisation_id === grandParentOrg?.id ||
          u.organisation_id === greatGrandParentOrg?.id;
        return userCondition;
      };

      const parentOrgUsers =
        users?.filter(isParentUser).map(u => {
          const userResourceWithRole: UserResourceWithRole = {
            ...u,
            role: {
              ...u.role,
              organisation_id: u.organisation_id,
              role: u.role ? u.role.role : '',
              is_inherited: true,
            },
          };
          return userResourceWithRole;
        }) || [];
      const childrenOrg = organisations
        ?.filter(org => org.administrator_id === organisation?.id)
        .sort(
          (a: OrganisationResource, b: OrganisationResource) =>
            parseInt(a.id, 10) - parseInt(b.id, 10),
        );
      const children: FoldableCardHierarchyResource[] = [];
      if (childrenOrg) {
        childrenOrg.forEach(org => {
          const foldableCardHierarchyResource = recursiveBuildHierarchy(org);
          if (foldableCardHierarchyResource) children.push(foldableCardHierarchyResource);
        });
      }
      const orgUsersWithParents = orgUsers
        ? userDisplay === 'user_roles' && displayInheritedRole
          ? orgUsers.concat(parentOrgUsers)
          : orgUsers
        : [];
      const sortedUsers = orgUsersWithParents.sort(
        (a: UserResourceWithRole, b: UserResourceWithRole) =>
          a.last_name.localeCompare(b.last_name),
      );
      const nbOrgUsers = sortedUsers.length;
      return {
        foldableCard: {
          isDefaultActive:
            organisation?.id === currentOrganisationId ||
            organisation?.id === user?.organisation_id,
          header: this.buildHeader(organisation?.name || '', nbOrgUsers, parentOrgUsers.length),
          body: this.buildBody(sortedUsers, organisation?.id),
          organisationId: organisation?.id,
          noDataCard: nbOrgUsers === 0,
        },
        children: children,
      };
    };
    const findBaseOrgaRec = (
      orgId: string,
      previousOrg?: OrganisationResource,
    ): OrganisationResource | undefined => {
      const foundOrga = organisations?.find(org => org.id === orgId);

      return foundOrga?.administrator_id && foundOrga?.administrator_id !== orgId
        ? findBaseOrgaRec(foundOrga.administrator_id, foundOrga)
        : foundOrga || previousOrg;
    };
    const orga = findBaseOrgaRec(currentOrganisationId);
    if (orga) {
      return recursiveBuildHierarchy(orga);
    } else return;
  }

  generateEnding = (nb: number): string => {
    return nb <= 1 ? '' : 's';
  };

  buildHeader(
    organisationName: string,
    orgUsersNb: number,
    inheritedUsersNb: number,
  ): React.ReactNode {
    const { userDisplay } = this.props;
    const renderHeaderText = () => {
      if (userDisplay === 'users') {
        return ` (${orgUsersNb} user${this.generateEnding(orgUsersNb)})`;
      } else {
        const inheritedText =
          inheritedUsersNb !== 0
            ? `, ${inheritedUsersNb} role${this.generateEnding(inheritedUsersNb)} inherited`
            : '';
        return ` (${orgUsersNb} role${this.generateEnding(orgUsersNb)} defined${inheritedText})`;
      }
    };
    return (
      <React.Fragment>
        <span>{organisationName}</span>
        <span className='mcs-userRoleList_inherited mcs-userRoleList_cardSubtitle'>
          {renderHeaderText()}
        </span>
      </React.Fragment>
    );
  }

  onClickEdit = (user: UserResourceWithRole) => {
    this.props.editUser(user);
  };

  onClickDelete = (user: UserResourceWithRole) => {
    this.props.deleteUser(user);
  };

  onClickEditUserRole = (user: UserResourceWithRole, organisationId?: string) => {
    this.props.editUserRole(user, organisationId);
  };

  onClickDeleteUserRole = (user: UserResourceWithRole) => {
    this.props.deleteUserRole(user);
  };

  buildBody(orgUsers: UserResourceWithRole[], organisationId?: string): React.ReactNode {
    const { userDisplay, intl } = this.props;
    if (orgUsers.length === 0)
      return <Empty className='mcs-foldable-card-empty' image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    const idSorter = (a: UserResourceWithRole, b: UserResourceWithRole) => a.id.localeCompare(b.id);
    const firstNameSorter = (a: UserResourceWithRole, b: UserResourceWithRole) =>
      a.first_name.localeCompare(b.first_name);
    const lastNameSorter = (a: UserResourceWithRole, b: UserResourceWithRole) =>
      a.last_name.localeCompare(b.last_name);
    const emailSorter = (a: UserResourceWithRole, b: UserResourceWithRole) =>
      a.email.localeCompare(b.email);
    const roleSorter = (a: UserResourceWithRole, b: UserResourceWithRole) =>
      b.role && a.role ? a.role.role.localeCompare(b.role.role) : a.id.localeCompare(b.id);

    let dataColumns: Array<DataColumnDefinition<UserResourceWithRole>> = [
      {
        title: 'Id',
        key: 'id',
        isHideable: false,
        render: (text: string) => text,
        sorter: idSorter,
      },
      {
        title: 'First name',
        key: 'first_name',
        isHideable: false,
        render: (text: string) => text,
        sorter: firstNameSorter,
      },
      {
        title: 'Last name',
        key: 'last_name',
        isHideable: false,
        render: (text: string) => text,
        sorter: lastNameSorter,
      },
      {
        title: 'Email',
        key: 'email',
        isHideable: false,
        render: (text: string) => text,
        sorter: emailSorter,
      },
    ];

    if (userDisplay === 'user_roles') {
      dataColumns = dataColumns
        .concat({
          title: 'Role',
          key: 'role',
          isHideable: false,
          render: (userWithRole: any) => (
            <span>
              {userWithRole?.role}
              {userWithRole?.is_inherited ? (
                <i className='mcs-userRoleList_inherited'>
                  {' '}
                  ({intl.formatMessage(messages.inherited)})
                </i>
              ) : (
                ''
              )}
            </span>
          ),
          sorter: roleSorter,
        })
        .filter(c => c.key !== 'id');
      dataColumns.unshift({
        title: '',
        key: '',
        isHideable: false,
        className: 'mcs-userRoleList_homeUserCell',
        render: (userWithRole: any) => {
          return (
            !!userWithRole.role?.is_home_user && (
              <Tooltip title={intl.formatMessage(messages.homeUser)}>
                <HomeOutlined />
              </Tooltip>
            )
          );
        },
      });
    }

    const userActionsColumns: Array<ActionsColumnDefinition<UserResourceWithRole>> = [
      {
        className: 'mcs-userRoleList_dropDownMenu',
        key: 'action',
        actions: () => [
          {
            className: 'mcs-userRoleList_dropDownMenu--edit',
            message: 'Edit user',
            callback: this.onClickEdit,
          },
          {
            className: 'mcs-userRoleList_dropDownMenu--delete',
            message: 'Delete user',
            callback: this.onClickDelete,
          },
        ],
      },
    ];

    const userRoleActionsColumns: Array<ActionsColumnDefinition<UserResourceWithRole>> = [
      {
        className: 'mcs-userRoleList_dropDownMenu',
        key: 'action',
        actions: (user: UserResourceWithRole) => [
          {
            className: 'mcs-userRoleList_dropDownMenu--edit',
            message: 'Edit role',
            callback: (u: UserResourceWithRole) => {
              this.onClickEditUserRole(u, organisationId);
            },
          },
          {
            className: 'mcs-userRoleList_dropDownMenu--delete',
            message: 'Delete role',
            callback: this.onClickDeleteUserRole,
            disabled: !!user.role?.is_inherited,
          },
        ],
      },
    ];

    return (
      <TableViewFilters
        pagination={false}
        columns={dataColumns}
        actionsColumnsDefinition={
          userDisplay === 'users' ? userActionsColumns : userRoleActionsColumns
        }
        dataSource={orgUsers}
      />
    );
  }

  render() {
    const { userHierarchy, loading } = this.state;

    return loading ? (
      <Loading isFullScreen={true} />
    ) : (
      <FoldableCardHierarchy hierachy={userHierarchy} />
    );
  }
}

export default compose<Props, UserContainerProps>(
  injectNotifications,
  withRouter,
  injectIntl,
)(UserContainer);
