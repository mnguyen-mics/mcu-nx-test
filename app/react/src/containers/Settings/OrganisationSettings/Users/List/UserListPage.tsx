import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import { Button, Layout, Select, Drawer, Modal, Switch, Input, Tooltip } from 'antd';
import { messages } from './messages';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { Loading, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { lazyInject } from '../../../../../config/inversify.config';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import { OrganisationResource } from '../../../../../models/organisation/organisation';
import { TYPES } from '../../../../../constants/types';
import UserContainer from './UserContainer';
import { ExclamationCircleOutlined, FilterOutlined, SafetyOutlined } from '@ant-design/icons';
import UserForm from '../Edit/UserForm';
import { IUsersService } from '../../../../../services/UsersService';
import UserRoleForm from '../Edit/UserRoleForm';
import { UserCreationWithRoleResource as UserResource } from '../../../../../models/directory/UserResource';
import { IUserRolesService } from '../../../../../services/UserRolesService';
import _ from 'lodash';
import { injectWorkspace, InjectedWorkspaceProps } from '../../../../Datamart';

const { Content } = Layout;

export type DisplayMode = 'users' | 'user_roles';
interface State {
  isLoadingOrganisations: boolean;
  organisation?: OrganisationResource;
  displayMode: DisplayMode;
  isUserDrawerVisible: boolean;
  isUserRoleDrawerVisible: boolean;
  isUserCreation: boolean;
  user?: UserResource;
  filterValue: string;
  nextFilterValue: string;
  lastFilterChangeTime?: number;
  displayInheritedRole: boolean;
  organisations: OrganisationResource[];
}

export interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> &
  WrappedComponentProps &
  InjectedNotificationProps &
  InjectedWorkspaceProps;

class UserListPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  @lazyInject(TYPES.IUsersService)
  private _usersService: IUsersService;

  @lazyInject(TYPES.IUserRolesService)
  private _userRolesService: IUserRolesService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingOrganisations: true,
      displayMode: 'users',
      isUserDrawerVisible: false,
      isUserRoleDrawerVisible: false,
      isUserCreation: false,
      filterValue: '',
      nextFilterValue: '',
      displayInheritedRole: true,
      organisations: [],
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    this.fetchOrganisations(organisationId);
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    const {
      match: {
        params: { organisationId: prevOrganisationId },
      },
    } = prevProps;
    if (organisationId !== prevOrganisationId) {
      this.fetchOrganisations(organisationId);
    }
  }

  fetchOrganisations = (organisationId: string, user?: UserResource) => {
    const { notifyError } = this.props;
    this.setState({
      isLoadingOrganisations: true,
    });
    return this._organisationService
      .getOrganisation(organisationId)
      .then(res => {
        this.setState({
          organisation: res.data,
          filterValue: '',
          nextFilterValue: '',
          user: user ? user : this.state.user,
        });

        this._organisationService
          .getOrganisations(res.data.community_id)
          .then(res => {
            this.setState({
              isLoadingOrganisations: false,
              organisations: res.data.filter(org => org.archived === false),
            });
          })
          .catch(err => {
            notifyError(err);
            this.setState({
              isLoadingOrganisations: false,
            });
          });
      })
      .catch(err => {
        notifyError(err);
        this.setState({
          isLoadingOrganisations: false,
        });
      });
  };

  getUserDrawerTitle = (existingUser: boolean) => {
    return (
      <FormattedMessage
        id='settings.organisation.users.userFormTitle'
        defaultMessage={`Organisation > User > {modifType} user`}
        values={{
          modifType: existingUser ? 'Edit' : 'Add',
        }}
      />
    );
  };

  getUserRoleDrawerTitle = () => {
    const { intl } = this.props;
    const { user, isUserCreation } = this.state;

    const title = user
      ? isUserCreation
        ? intl.formatMessage(messages.addAUserRole)
        : intl.formatMessage(messages.editAUserRole)
      : intl.formatMessage(messages.addAUserRole);

    return (
      <FormattedMessage
        id='settings.organisation.users.userRoleFormTitle'
        defaultMessage='Organisation > Roles > {title}'
        values={{
          title: title,
        }}
      />
    );
  };

  editUser = (user: UserResource) => {
    this.setState({
      user: user,
      isUserDrawerVisible: true,
    });
  };

  editUserRole = (user: UserResource, organisationId?: string, isUserRoleCreation?: boolean) => {
    const userFormData = user;
    if (organisationId) {
      userFormData.organisation_id = organisationId;
    }
    this.setState({
      user: userFormData,
      isUserRoleDrawerVisible: true,
      isUserCreation: !!isUserRoleCreation,
    });
  };

  deleteUser = (user: UserResource) => {
    const {
      intl: { formatMessage },
      notifyError,
    } = this.props;
    const deleteUser = () => {
      this._usersService
        .deleteUser(user.id, user.organisation_id)
        .then(() => {
          this.refreshAndScrollToElement(user);
        })
        .catch(err => notifyError(err));
    };
    Modal.confirm({
      title: formatMessage(messages.modalUserDeleteTitle),
      content: (
        <FormattedMessage
          id='settings.organisation.users.modalUserDeleteDescription'
          defaultMessage='You are about to definitively delete the user {userName}. Are you sure you want to continue ?'
          values={{
            userName: <b>{`${user.first_name} ${user.last_name}`}</b>,
          }}
        />
      ),
      icon: <ExclamationCircleOutlined />,
      okText: 'OK',
      cancelText: formatMessage(messages.modalCancel),
      onOk() {
        deleteUser();
      },
    });
  };

  deleteUserRole = (user: UserResource) => {
    const {
      intl: { formatMessage },
      notifyError,
    } = this.props;
    const deleteUserRole = () => {
      if (user.role?.id)
        this._userRolesService
          .deleteUserRole(user.id, user.role?.id)
          .then(() => {
            this.refreshAndScrollToElement(user);
          })
          .catch(err => {
            notifyError(err);
            this.setState({
              displayMode: 'user_roles',
            });
          });
    };

    this._organisationService.getOrganisation(user.organisation_id).then(org => {
      Modal.confirm({
        title: formatMessage(messages.modalUserRoleDeleteTitle),
        content: (
          <FormattedMessage
            id='settings.organisation.users.modalUserRoleDeleteDescription'
            defaultMessage='You are about to definitively delete the {role} role for {userName} on organisation {orgName}. All inherited roles will also be deleted. Are you sure you want to continue ?'
            values={{
              userName: <b>{`${user.first_name} ${user.last_name}`}</b>,
              orgName: <b>{org.data.name}</b>,
              role: <b>{user.role?.role}</b>,
            }}
          />
        ),
        icon: <ExclamationCircleOutlined />,
        okText: 'OK',
        cancelText: formatMessage(messages.modalCancel),
        onOk() {
          deleteUserRole();
        },
      });
    });
  };

  saveUserRole = (
    userId: string,
    organisationId: string,
    newRole: string,
    userRoleId?: string,
    isInherited?: boolean,
  ) => {
    const { notifyError } = this.props;
    let promise: Promise<any>;
    if (userRoleId && !isInherited) {
      promise = this._userRolesService.deleteUserRole(userId, userRoleId);
    } else {
      promise = Promise.resolve();
    }
    return promise
      .then(() => {
        this._userRolesService
          .createUserRole(userId, {
            role: newRole,
            organisation_id: organisationId,
          })
          .then(() => {
            this.setState({
              isUserRoleDrawerVisible: false,
              isUserCreation: false,
            });
            this.refreshAndScrollToElement();
          })
          .catch(err => {
            notifyError(err);
            this.setState({
              displayMode: 'user_roles',
            });
          });
      })
      .catch(err => {
        notifyError(err);
        this.setState({
          displayMode: 'user_roles',
        });
      });
  };

  saveUser = (user: UserResource) => {
    const {
      notifyError,
      notifySuccess,
      intl: { formatMessage },
    } = this.props;
    const { displayMode: userDisplay } = this.state;
    const previousUser = !!user.id;
    (previousUser
      ? this._usersService.updateUser(user.id, user.organisation_id, user)
      : this._usersService.createUser(user.organisation_id, user)
    )
      .then(res => {
        this.setState(
          {
            isUserDrawerVisible: false,
            displayMode: previousUser ? userDisplay : 'user_roles',
          },
          () => {
            this.refreshAndScrollToElement(res.data);
            if (!previousUser) {
              notifySuccess({
                message: formatMessage(messages.successCreationNewUser),
                description: '',
              });
              this.editUserRole(res.data, res.data.organisation_id, true);
            }
          },
        );
      })
      .catch(err => {
        notifyError(err);
      });
  };

  refreshAndScrollToElement = (user?: UserResource) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    const { displayMode: userDisplay } = this.state;
    this.fetchOrganisations(organisationId, user).then(() => {
      // wait for DOM to be populated
      const orgId = userDisplay === 'users' ? user?.organisation_id : user?.role?.organisation_id;
      const elementId = `mcs-foldable-card-${
        user ? orgId : this.state.user?.role?.organisation_id
      }`;
      setTimeout(() => {
        const element = document.getElementById(elementId);
        element?.scrollIntoView();
      }, 2000);
    });
  };

  hasRightsToAccessRoles = () => {
    const {
      workspace: { role },
    } = this.props;
    if (role === 'READER' || role === 'EDITOR') return false;
    else return true;
  };

  getUsersOptions = () => {
    const userOptions = [
      {
        value: 'users',
        label: 'Users',
      },
    ];

    if (this.hasRightsToAccessRoles())
      userOptions.push({
        value: 'user_roles',
        label: 'Roles',
      });

    return userOptions;
  };

  handleDisplayMode = (value: DisplayMode) => {
    this.setState({
      displayMode: value,
      user: undefined,
    });
  };

  handleDrawer = (isVisible: boolean) => () => {
    const { displayMode: userDisplay } = this.state;
    if (userDisplay === 'users') {
      this.setState({
        isUserDrawerVisible: isVisible,
        user: undefined,
        isUserCreation: false,
      });
    } else {
      this.setState({
        isUserRoleDrawerVisible: isVisible,
        user: undefined,
        isUserCreation: false,
      });
    }
  };

  handleFilter = (e: any) => {
    const refreshDelay = 1000;
    this.setState({
      nextFilterValue: e.target.value,
      lastFilterChangeTime: new Date().getTime(),
    });

    setInterval(() => {
      const { lastFilterChangeTime, nextFilterValue } = this.state;
      const now = new Date().getTime();
      if (lastFilterChangeTime && now - lastFilterChangeTime >= refreshDelay) {
        this.setState({
          filterValue: nextFilterValue,
        });
      }
    }, refreshDelay);
  };

  onSwitchChange = (checked: boolean) => {
    this.setState({
      displayInheritedRole: checked,
    });
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const {
      organisation,
      isLoadingOrganisations,
      displayMode: userDisplay,
      isUserDrawerVisible,
      isUserRoleDrawerVisible,
      isUserCreation,
      user,
      filterValue,
      nextFilterValue,
      displayInheritedRole,
      organisations,
    } = this.state;

    const suffixIcon = (
      <span className='mcs-userSettings_userSelectIcon'>
        {userDisplay === 'users' ? <McsIcon type='users' /> : <SafetyOutlined />}
      </span>
    );

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container mcs-userSettings_container'>
          {isLoadingOrganisations ? (
            <Loading isFullScreen={true} />
          ) : (
            <React.Fragment>
              <Select
                className='mcs-primary mcs-userSettings_userSelect'
                suffixIcon={suffixIcon}
                onChange={this.handleDisplayMode}
                options={this.getUsersOptions()}
                value={userDisplay}
                placeholder={this.getUsersOptions()[0].value}
              />
              <Tooltip
                trigger={['focus']}
                title={intl.formatMessage(messages.filterOnUserTooltip)}
                placement='top'
              >
                <Input
                  className='mcs-primary mcs-userSettings_userSelect mcs-userSettings_userFilter'
                  onChange={this.handleFilter}
                  placeholder={intl.formatMessage(messages.filterOnUser)}
                  value={nextFilterValue}
                  suffix={<FilterOutlined />}
                  size='small'
                />
              </Tooltip>
              {userDisplay === 'user_roles' && (
                <React.Fragment>
                  {intl.formatMessage(messages.displayInheritedRole)}
                  <Switch
                    className='mcs-userSettings_switch'
                    checked={displayInheritedRole}
                    onChange={this.onSwitchChange}
                  />
                </React.Fragment>
              )}
              <Button
                type='primary'
                className='mcs-primary mcs-userSettings_addAUser'
                onClick={this.handleDrawer(true)}
              >
                {userDisplay === 'users'
                  ? intl.formatMessage(messages.addAUser)
                  : intl.formatMessage(messages.addAUserRole)}
              </Button>
              {organisation && (
                <UserContainer
                  currentOrganisationId={organisationId}
                  communityId={organisation.community_id}
                  displayMode={userDisplay}
                  user={user}
                  editUser={this.editUser}
                  editUserRole={this.editUserRole}
                  deleteUser={this.deleteUser}
                  deleteUserRole={this.deleteUserRole}
                  filterValue={filterValue}
                  displayInheritedRole={displayInheritedRole}
                  organisations={organisations}
                />
              )}
              <Drawer
                className='mcs-userEdit_drawer'
                width='800'
                bodyStyle={{ padding: '0' }}
                title={this.getUserDrawerTitle(!!user)}
                placement={'right'}
                closable={true}
                onClose={this.handleDrawer(false)}
                visible={isUserDrawerVisible}
                destroyOnClose={true}
              >
                <UserForm user={user} save={this.saveUser} organisations={organisations} />
              </Drawer>
              <Drawer
                className='mcs-userEdit_drawer'
                width='800'
                bodyStyle={{ padding: '0' }}
                title={this.getUserRoleDrawerTitle()}
                placement={'right'}
                closable={true}
                onClose={this.handleDrawer(false)}
                visible={isUserRoleDrawerVisible}
                destroyOnClose={true}
              >
                <UserRoleForm
                  user={user}
                  organisations={organisations}
                  save={this.saveUserRole}
                  isUserCreation={isUserCreation}
                />
              </Drawer>
            </React.Fragment>
          )}
        </Content>
      </div>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications,
  injectWorkspace,
)(UserListPage);
