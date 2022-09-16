import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Button, Form, Input, AutoComplete, Radio, Space, message } from 'antd';
import { messages } from '../List/messages';
import { UserCreationWithRoleResource } from '../../../../../models/directory/UserResource';
import { connect } from 'react-redux';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { UserProfileResource } from '../../../../../models/directory/UserProfileResource';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { OrganisationResource } from '../../../../../models/organisation/organisation';
import { IUsersService } from '../../../../../services/UsersService';
import { Loading } from '@mediarithmics-private/mcs-components-library';
import { isNull } from 'lodash';

interface State {
  user?: Partial<UserCreationWithRoleResource>;
  users?: UserCreationWithRoleResource[];
  userInput: {
    value?: string;
    id?: string;
  };
  orgInput: {
    value?: string;
    id?: string;
    isCommunity?: boolean;
  };
  prevOrgInput: {
    value?: string;
    id?: string;
    isCommunity?: boolean;
  };
  roleInput: string;
  userOrganisation?: OrganisationResource;
  submittedWithoutOrg: boolean;
  isLoadingUser: boolean;
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

interface UserRoleFormProps {
  user?: UserCreationWithRoleResource;
  isUserCreation?: boolean;
  organisations: OrganisationResource[];
  save: (
    userId: string,
    organisationId: string,
    role: string,
    userRoleId?: string,
    isInherited?: boolean,
  ) => void;
}

type Props = UserRoleFormProps &
  MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; userId: string }> &
  InjectedIntlProps;

class UserRoleForm extends React.Component<Props, State> {
  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;
  @lazyInject(TYPES.IUsersService)
  private _usersService: IUsersService;

  constructor(props: Props) {
    super(props);
    this.state = {
      userInput: {},
      orgInput: {},
      prevOrgInput: {},
      roleInput: 'READER',
      submittedWithoutOrg: false,
      isLoadingUser: true,
    };
  }

  componentDidMount() {
    const { user, notifyError, isUserCreation } = this.props;

    if (user) {
      this._organisationService
        .getOrganisation(user.organisation_id)
        .then(({ data: org }) => {
          this.setState({
            user: user,
            roleInput: user.role?.role || 'READER',
            userOrganisation: org,
            isLoadingUser: false,
            orgInput: {
              value: org.name,
              id: org.id,
              isCommunity: isNull(org.administrator_id),
            },
          });
        })
        .catch(err => {
          notifyError(err);
          this.setState({ isLoadingUser: false });
        });
    } else if (!isUserCreation) {
      this.fetchUsers();
    }
  }

  fetchUsers = () => {
    const { connectedUser, notifyError } = this.props;
    const promises = connectedUser?.workspaces.map(ws => {
      return this._usersService
        .getUsers(ws.organisation_id, { max_results: 500 })
        .then(response => {
          return response.data;
        });
    });

    Promise.all(promises)
      .then(res => {
        this.setState({
          users: res.flatMap(x => x),
          isLoadingUser: false,
        });
      })
      .catch(err => {
        notifyError(err);
        this.setState({ isLoadingUser: false });
      });
  };

  onOrgSelect = (value: string, optionData: any) => {
    this.setState({
      orgInput: {
        value: value,
        id: optionData.key,
        isCommunity: optionData.isCommunity,
      },
    });
  };

  save = () => {
    const { user, userInput, orgInput, roleInput } = this.state;
    // edition
    if (user) {
      const userId = userInput?.id || user.id;
      const userRoleId = user.role?.id;
      const orgId = orgInput.id;
      if (userId) {
        if (orgId) {
          if (userRoleId)
            this.props.save(userId, orgId, roleInput, userRoleId, user.role?.is_inherited);
          else this.props.save(userId, orgId, roleInput);
        } else {
          this.manageSubmittedWithoutOrg();
        }
      }
    } else if (userInput.id && orgInput.id && roleInput) {
      // creation
      this.props.save(userInput.id, orgInput.id, roleInput);
    } else {
      this.manageSubmittedWithoutOrg();
    }
  };

  manageSubmittedWithoutOrg = () => {
    const { intl } = this.props;
    const { orgInput, submittedWithoutOrg } = this.state;

    message.error(intl.formatMessage(messages.selectAvailableValue), 3);
    if (orgInput.id === undefined) {
      this.setState({
        submittedWithoutOrg: true,
      });
    } else if (submittedWithoutOrg) {
      this.setState({
        submittedWithoutOrg: false,
      });
    }
  };

  getUserOptions = () => {
    const { users } = this.state;
    return users?.map(u => {
      return {
        label: `${u.first_name} ${u.last_name} (${u.email})`,
        value: `${u.first_name} ${u.last_name} (${u.email})`,
        key: u.id,
      };
    });
  };

  onUserSelect = (value: string, optionData: any) => {
    this.setState({
      userInput: {
        value: value,
        id: optionData.key,
      },
    });
  };

  onRadioChange = (e: any) => {
    this.setState({
      roleInput: e.target.value,
    });
  };

  displayCommunityAdminOption = () => {
    const { intl } = this.props;
    const { orgInput } = this.state;
    return orgInput?.isCommunity ? (
      <Radio value={'COMMUNITY_ADMIN'}>
        <b>Community Admin</b>
        <br />
        {intl.formatMessage(messages.communityAdminDescription)}
      </Radio>
    ) : null;
  };

  // Here we control the organisation field change after selection.
  // If user modified the name of selected org, we consider the org is not selected
  // If user removed his modifications, we return the previously selected organisation
  onOrgChange = (value: string) => {
    const { orgInput, prevOrgInput } = this.state;
    if (orgInput.value) {
      if (orgInput.value !== value) {
        this.setState({
          orgInput: {},
          prevOrgInput: orgInput,
        });
      }
    } else if (prevOrgInput.value && prevOrgInput.value === value) {
      this.setState({
        orgInput: prevOrgInput,
        prevOrgInput: {},
        submittedWithoutOrg: false,
      });
    }
  };

  render() {
    const { intl, isUserCreation, organisations } = this.props;
    const { user, userInput, orgInput, roleInput, submittedWithoutOrg, isLoadingUser } = this.state;

    const filterOption =
      (hasValue: boolean) => (inputValue: string, option: { label: string; value: string }) => {
        const property = hasValue ? 'value' : 'label';
        return option[property].toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
      };

    const roleOrgId = user && user.role ? user.role.organisation_id : '';
    const disabledInputs = !!user?.id;

    return !isLoadingUser ? (
      <Form layout='vertical'>
        <Form.Item label={intl.formatMessage(messages.user)}>
          <AutoComplete
            options={this.getUserOptions()}
            searchValue={
              disabledInputs && user ? `${user.first_name} ${user.last_name}` : undefined
            }
            disabled={disabledInputs}
            placeholder={
              user?.id
                ? `${user.first_name} ${user.last_name}`
                : intl.formatMessage(messages.userSearchPlaceholder)
            }
            filterOption={filterOption(true)}
            onSelect={this.onUserSelect}
          >
            <Input.Search
              value={user?.id ? `${user.first_name} ${user.last_name}` : userInput.value}
            />
          </AutoComplete>
        </Form.Item>
        <Form.Item label={intl.formatMessage(messages.organisation)}>
          <AutoComplete
            className={
              submittedWithoutOrg
                ? 'mcs-userForm_select mcs-userForm_selectWrong'
                : 'mcs-userForm_select'
            }
            options={organisations.map(org => {
              return {
                key: org.id,
                label: org.name,
                value: org.name,
                isCommunity: isNull(org.administrator_id),
              };
            })}
            searchValue={organisations.find(o => o.id === user?.organisation_id)?.name}
            onSelect={this.onOrgSelect}
            onChange={this.onOrgChange}
            filterOption={filterOption(false)}
            disabled={disabledInputs && !isUserCreation}
            placeholder={intl.formatMessage(messages.selectOrganisation)}
          >
            <Input.Search value={orgInput.value || roleOrgId} />
          </AutoComplete>
        </Form.Item>
        <Form.Item label={intl.formatMessage(messages.role)}>
          <Radio.Group onChange={this.onRadioChange} value={roleInput}>
            <Space direction='vertical'>
              <Radio value={'READER'}>
                <b>Reader</b>
                <br />
                {intl.formatMessage(messages.readerDescription)}
              </Radio>
              <Radio value={'EDITOR'}>
                <b>Editor</b>
                <br />
                {intl.formatMessage(messages.editorDescription)}
              </Radio>
              <Radio value={'ORGANISATION_ADMIN'}>
                <b>Organisation Admin</b>
                <br />
                {intl.formatMessage(messages.orgAdminDescription)}
              </Radio>
              {this.displayCommunityAdminOption()}
            </Space>
          </Radio.Group>
        </Form.Item>
        <Button type='primary' className='mcs-primary mcs-saveButton' onClick={this.save}>
          {intl.formatMessage(messages.save)}
        </Button>
      </Form>
    ) : (
      <Loading isFullScreen={true} />
    );
  }
}

export default compose<Props, UserRoleFormProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  connect((state: MicsReduxState) => ({
    connectedUser: state.session.connectedUser,
  })),
)(UserRoleForm);
