import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Button, Layout, Select, Drawer, Modal, Switch } from 'antd';
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
import { ExclamationCircleOutlined, FilterOutlined } from '@ant-design/icons';
import UserForm from '../Edit/UserForm';
import { IUsersService } from '../../../../../services/UsersService';
import UserRoleForm from '../Edit/UserRoleForm';
import { UserCreationWithRoleResource as UserResource } from '../../../../../models/directory/UserResource';
import { IUserRolesService } from '../../../../../services/UserRolesService';
import _ from 'lodash';

const { Content } = Layout;

interface State {
  isLoadingOrganisation: boolean;
  organisation?: OrganisationResource;
  userDisplay: string;
  isUserDrawerVisible: boolean;
  isUserRoleDrawerVisible: boolean;
  user?: UserResource;
}

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> & InjectedIntlProps & InjectedNotificationProps;

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
      isLoadingOrganisation: true,
      userDisplay: 'users',
      isUserDrawerVisible: false,
      isUserRoleDrawerVisible: false,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    this.fetchOrganisation(organisationId);
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
      this.fetchOrganisation(organisationId);
    }
  }

  fetchOrganisation = (organisationId: string) => {
    const { notifyError } = this.props;
    this.setState({
      isLoadingOrganisation: true,
    });
    this._organisationService
      .getOrganisation(organisationId)
      .then(res => {
        this.setState({
          isLoadingOrganisation: false,
          organisation: res.data,
        });
      })
      .catch(err => {
        notifyError(err);
        this.setState({
          isLoadingOrganisation: false,
        });
      });
  };

  getUserDrawerTitle = (user?: UserResource) => {
    const { intl } = this.props;
    return (
      <FormattedMessage
        id='settings.organisation.users.userFormTitle'
        defaultMessage='Organisation > User > {title}'
        values={{
          title: user
            ? `${user.first_name} ${user.last_name}`
            : intl.formatMessage(messages.addAUser),
        }}
      />
    );
  };

  getUserRoleDrawerTitle = (user?: UserResource) => {
    const { intl } = this.props;
    return (
      <FormattedMessage
        id='settings.organisation.users.userRoleFormTitle'
        defaultMessage='Organisation > User Roles > {title}'
        values={{
          title: user
            ? intl.formatMessage(messages.editAUserRole)
            : intl.formatMessage(messages.addAUserRole),
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

  editUserRole = (user: UserResource) => {
    this.setState({
      user: user,
      isUserRoleDrawerVisible: true,
    });
  };

  deleteUser = (user: UserResource) => {
    const {
      intl: { formatMessage },
      match: {
        params: { organisationId },
      },
      notifyError,
    } = this.props;
    const deleteUser = () => {
      this._usersService.deleteUser(user.id, organisationId).catch(err => notifyError(err));
    };
    Modal.confirm({
      title: formatMessage(messages.modalUserDeleteTitle),
      content: (
        <FormattedMessage
          id='settings.organisation.users.modalUserDeleteDescription'
          defaultMessage='You are about to definitively delete the user {userName}. Are you sure you want to continue ?'
          values={{
            userName: `${user.first_name} ${user.last_name}`,
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
          .catch(err => notifyError(err));
    };
    Modal.confirm({
      title: formatMessage(messages.modalUserRoleDeleteTitle),
      content: (
        <FormattedMessage
          id='settings.organisation.users.modalUserRoleDeleteDescription'
          defaultMessage='You are about to definitively delete the {role} role for {userName} on organisation {orgName}. All inherited roles will also be deleted. Are you sure you want to continue ?'
          values={{
            userName: `${user.first_name} ${user.last_name}`,
            orgName: user.organisation_id,
            role: user.role?.role,
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
  };

  saveUserRole = (userId: string, organisationId: string, role: string) => {
    const { notifyError } = this.props;
    this._userRolesService
      .createUserRole(userId, {
        role: role,
        organisation_id: organisationId,
      })
      .then(() => {
        this.setState({
          isUserRoleDrawerVisible: false,
        });
      })
      .catch(err => {
        notifyError(err);
      });
  };

  saveUser = (user: UserResource) => {
    const { notifyError } = this.props;
    let promise;
    if (user.id) {
      promise = this._usersService.updateUser(user.id, user.organisation_id, user);
    } else {
      promise = this._usersService.createUser(user.organisation_id, user);
    }
    promise
      .then(() => {
        this.setState({
          isUserDrawerVisible: false,
        });
      })
      .catch(err => {
        notifyError(err);
      });
  };

  getUsersOptions = () => {
    return [
      {
        value: 'users',
        label: 'Users',
      },
      {
        value: 'user_roles',
        label: 'User Roles',
      },
    ];
  };

  handleChange = (value: string) => {
    this.setState({
      userDisplay: value,
      user: undefined,
    });
  };

  handleDrawer = (isVisible: boolean) => () => {
    const { userDisplay } = this.state;
    if (userDisplay === 'users') {
      this.setState({
        isUserDrawerVisible: isVisible,
      });
    } else {
      this.setState({
        isUserRoleDrawerVisible: isVisible,
      });
    }
  };

  renderPlaceholder() {
    const { intl } = this.props;
    return (
      <React.Fragment>
        <span>{intl.formatMessage(messages.filterOnUser)}</span>
        <FilterOutlined className='mcs-userSettings_iconFilter' />
      </React.Fragment>
    );
  }

  handleFilter = () => {
    //
  };

  onSwitchChange = (checked: boolean) => {
    //
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
      isLoadingOrganisation,
      userDisplay,
      isUserDrawerVisible,
      isUserRoleDrawerVisible,
      user,
    } = this.state;

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container mcs-userSettings_container'>
          {isLoadingOrganisation ? (
            <Loading isFullScreen={true} />
          ) : (
            <React.Fragment>
              <Select
                className='mcs-primary mcs-userSettings_userSelect'
                suffixIcon={<McsIcon type='users' />}
                onChange={this.handleChange}
                options={this.getUsersOptions()}
                value={userDisplay}
                placeholder={this.getUsersOptions()[0].value}
              />
              <Select
                className='mcs-primary mcs-userSettings_userSelect'
                onChange={this.handleFilter}
                options={this.getUsersOptions()}
                placeholder={this.renderPlaceholder()}
                showSearch={true}
                allowClear={true}
                showArrow={false}
              />
              {userDisplay === 'user_roles' && (
                <React.Fragment>
                  {intl.formatMessage(messages.displayInheritedRole)}
                  <Switch
                    className='mcs-userSettings_switch'
                    defaultChecked={true}
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
                  userDisplay={userDisplay}
                  editUser={this.editUser}
                  editUserRole={this.editUserRole}
                  deleteUser={this.deleteUser}
                  deleteUserRole={this.deleteUserRole}
                />
              )}
              <Drawer
                className='mcs-userEdit_drawer'
                width='800'
                bodyStyle={{ padding: '0' }}
                title={this.getUserDrawerTitle()}
                placement={'right'}
                closable={true}
                onClose={this.handleDrawer(false)}
                visible={isUserDrawerVisible}
                destroyOnClose={true}
              >
                <UserForm user={user} save={this.saveUser} />
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
                  communityId={organisation?.community_id}
                  save={this.saveUserRole}
                />
              </Drawer>
            </React.Fragment>
          )}
        </Content>
      </div>
    );
  }
}

export default compose<Props, {}>(withRouter, injectIntl, injectNotifications)(UserListPage);
