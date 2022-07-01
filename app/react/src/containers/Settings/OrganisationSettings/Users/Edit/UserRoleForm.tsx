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
import { isNull } from 'lodash';
import { ICommunityService } from '../../../../../services/CommunityServices';

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
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

interface UserRoleFormProps {
  organisation?: OrganisationResource;
  user?: UserCreationWithRoleResource;
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
  @lazyInject(TYPES.ICommunityService)
  private _communityService: ICommunityService;
  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;
  constructor(props: Props) {
    super(props);
    this.state = {
      userInput: {},
      orgInput: {},
      prevOrgInput: {},
      roleInput: 'READER',
      submittedWithoutOrg: false,
    };
  }
  componentDidMount() {
    const { user, organisation, notifyError } = this.props;
    if (user) {
      this._organisationService
        .getOrganisation(user.organisation_id)
        .then(res => {
          this.setState({
            user: user,
            roleInput: user.role?.role || 'READER',
            userOrganisation: res.data,
          });
        })
        .catch(err => {
          notifyError(err);
        });
    } else if (organisation?.community_id) {
      this._communityService
        .getCommunityUsers(organisation.community_id)
        .then(res => {
          this.setState({
            users: res.data,
          });
        })
        .catch(err => {
          notifyError(err);
        });
    }
  }

  onOrgSelect = (value: string, optionData: any) => {
    this.setState({
      orgInput: {
        value: value,
        id: optionData.key,
        isCommunity: optionData.isCommunity,
      },
    });
  };

  getOrganisations = () => {
    const { connectedUser } = this.props;
    return connectedUser?.workspaces.map(ws => {
      return {
        label: ws.organisation_name,
        value: ws.organisation_name,
        key: ws.organisation_id,
        isCommunity: !ws.administrator_id,
      };
    });
  };

  save = () => {
    const { intl } = this.props;
    const { user, userInput, orgInput, roleInput, submittedWithoutOrg } = this.state;
    // edition
    if (user) {
      const userId = userInput?.id || user.id;
      const userRoleId = user.role?.id;
      const orgId = orgInput.id || user.organisation_id;
      if (userId) {
        if (userRoleId && orgId)
          this.props.save(userId, orgId, roleInput, userRoleId, user.role?.is_inherited);
        else if (user.organisation_id) this.props.save(userId, user.organisation_id, roleInput);
      }
    } else if (userInput.id && orgInput.id && roleInput) {
      // creation
      this.props.save(userInput.id, orgInput.id, roleInput);
    } else {
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
    }
  };

  getUserOptions = () => {
    const { users } = this.state;
    return users?.map(u => {
      return {
        label: `${u.first_name} ${u.last_name}`,
        value: `${u.first_name} ${u.last_name}`,
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
    const { userOrganisation, orgInput } = this.state;
    return (userOrganisation && isNull(userOrganisation.administrator_id)) ||
      orgInput?.isCommunity ? (
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
    const { intl } = this.props;
    const { user, userInput, orgInput, roleInput, submittedWithoutOrg } = this.state;

    const filterOption =
      (hasValue: boolean) => (inputValue: string, option: { label: string; value: string }) => {
        const property = hasValue ? 'value' : 'label';
        return option[property].toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
      };

    const roleOrgId = user && user.role ? user.role.organisation_id : '';
    const disabledInputs = !!user?.id;

    return (
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
            options={this.getOrganisations()}
            searchValue={this.getOrganisations().find(o => o.key === user?.organisation_id)?.label}
            onSelect={this.onOrgSelect}
            onChange={this.onOrgChange}
            filterOption={filterOption(false)}
            disabled={disabledInputs}
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
