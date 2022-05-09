import UserResource from '@mediarithmics-private/advanced-components/lib/models/directory/UserResource';
import { OrganisationResource } from '@mediarithmics-private/advanced-components/lib/models/organisation/organisation';
import { DataListResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { IOrganisationService } from '@mediarithmics-private/advanced-components/lib/services/OrganisationService';
import { Loading, TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import * as React from 'react';
import { compose } from 'recompose';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IUsersService } from '../../../../../services/UsersService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import FoldableCardHierarchy, { FoldableCardHierarchyResource } from './FoldableCardHierarchy';

export interface UserContainerProps {
  communityId: string;
  currentOrganisationId: string;
  userDisplay: string;
  editUser: (user: UserResource) => void;
  editUserRole: (user: UserResource) => void;
  deleteUser: (user: UserResource) => void;
  deleteUserRole: (user: UserResource) => void;
}

type Props = UserContainerProps & InjectedNotificationProps;

interface State {
  organisations?: OrganisationResource[];
  users?: UserResource[];
  userHierarchy?: FoldableCardHierarchyResource;
  loading?: boolean;
}

class UserContainer extends React.Component<Props, State> {
  @lazyInject(TYPES.IUsersService)
  private _usersService: IUsersService;
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
    const { userDisplay, communityId } = this.props;
    const { userDisplay: prevUserDisplay } = prevProps;
    if (userDisplay !== prevUserDisplay) {
      this.initializeUserHierarchy(communityId);
    }
  }

  initializeUserHierarchy(communityId: string) {
    const promises: Array<
      Promise<DataListResponse<OrganisationResource> | DataListResponse<UserResource>>
    > = [
      this._organisationService.getOrganisations(communityId),
      this._usersService.getUsersWithUserRole(communityId),
    ];

    Promise.all(promises)
      .then(res => {
        this.setState(
          {
            organisations: (res[0] as DataListResponse<OrganisationResource>).data,
            users: (res[1] as DataListResponse<UserResource>).data,
          },
          () => {
            this.setState({
              userHierarchy: this.buildHierarchy(),
              loading: false,
            });
          },
        );
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
    const { currentOrganisationId } = this.props;

    const recursiveBuildHierarchy = (
      organisation?: OrganisationResource,
    ): FoldableCardHierarchyResource => {
      const orgUsers = users?.filter(user => user.organisation_id === organisation?.id);
      const childrenOrg = organisations?.filter(org => org.administrator_id === organisation?.id);
      const children: FoldableCardHierarchyResource[] = [];
      if (childrenOrg) {
        for (let i = 0; i++; i < childrenOrg.length) {
          const foldableCardHierarchyResource = recursiveBuildHierarchy(childrenOrg[i]);
          if (foldableCardHierarchyResource) children.push(foldableCardHierarchyResource);
        }
      }
      return {
        foldableCard: {
          isDefaultActive: organisation?.id === currentOrganisationId,
          header: this.buildHeader(organisation?.name || '', orgUsers ? orgUsers.length : 0),
          body: this.buildBody(orgUsers ? orgUsers : []),
        },
        children: children,
      };
    };
    let orga = organisations?.find(currentOrg => currentOrg.id === currentOrganisationId);
    while (orga?.administrator_id) {
      orga = organisations?.find(parentOrg => parentOrg.id === orga?.administrator_id);
    }
    if (orga) {
      return recursiveBuildHierarchy(orga);
    } else return;
  }

  buildHeader(organisationName: string, orgUsersNb: number): React.ReactNode {
    const { userDisplay } = this.props;
    return (
      <React.Fragment>
        <span>{organisationName}</span>
        <span>{` (${orgUsersNb} ${userDisplay === 'users' ? 'users' : 'roles defined'})`}</span>
      </React.Fragment>
    );
  }

  onClickEdit = (user: UserResource) => {
    this.props.editUser(user);
  };

  onClickDelete = (user: UserResource) => {
    this.props.deleteUser(user);
  };

  onClickEditUserRole = (user: UserResource) => {
    this.props.editUserRole(user);
  };

  onClickDeleteUserRole = (user: UserResource) => {
    this.props.deleteUserRole(user);
  };

  buildBody(orgUsers: UserResource[]): React.ReactNode {
    const { userDisplay } = this.props;
    let dataColumns: Array<DataColumnDefinition<UserResource>> = [
      {
        title: 'Id',
        key: 'id',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        title: 'First name',
        key: 'first_name',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        title: 'Last name',
        key: 'last_name',
        isHideable: false,
        render: (text: string) => text,
      },
      {
        title: 'Email',
        key: 'email',
        isHideable: false,
        render: (text: string) => text,
      },
    ];

    if (userDisplay === 'user_roles') {
      dataColumns = dataColumns.concat({
        title: 'Role',
        key: 'role',
        isHideable: false,
        render: (role: any) => role.role,
      });
    }

    const userActionsColumns: Array<ActionsColumnDefinition<UserResource>> = [
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

    const userRoleActionsColumns: Array<ActionsColumnDefinition<UserResource>> = [
      {
        className: 'mcs-userRoleList_dropDownMenu',
        key: 'action',
        actions: () => [
          {
            className: 'mcs-userRoleList_dropDownMenu--edit',
            message: 'Edit user role',
            callback: this.onClickEditUserRole,
          },
          {
            className: 'mcs-userRoleList_dropDownMenu--delete',
            message: 'Delete user',
            callback: this.onClickDeleteUserRole,
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

export default compose<Props, UserContainerProps>(injectNotifications)(UserContainer);
