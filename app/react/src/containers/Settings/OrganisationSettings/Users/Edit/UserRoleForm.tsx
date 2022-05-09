import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Button, Form, Input, Select, AutoComplete, Radio, Space } from 'antd';
import { messages } from '../List/messages';
import { UserCreationWithRoleResource } from '../../../../../models/directory/UserResource';
import { connect } from 'react-redux';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { UserProfileResource } from '../../../../../models/directory/UserProfileResource';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IUsersService } from '../../../../../services/UsersService';

interface State {
  user?: Partial<UserCreationWithRoleResource>;
  users?: UserCreationWithRoleResource[];
  userInput: {
    value?: string;
    id?: string;
  };
  roleInput: string;
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

interface UserRoleFormProps {
  communityId?: string;
  user?: UserCreationWithRoleResource;
  save: (userId: string, organisationId: string, role: string) => void;
}

type Props = UserRoleFormProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string; userId: string }> &
  InjectedIntlProps;

class UserRoleForm extends React.Component<Props, State> {
  @lazyInject(TYPES.IUsersService)
  private _usersService: IUsersService;
  constructor(props: Props) {
    super(props);
    this.state = {
      userInput: {},
      roleInput: 'READER',
    };
  }
  componentDidMount() {
    const { user, communityId } = this.props;
    if (user) {
      this.setState({
        user: user,
        roleInput: user.role?.role || 'READER',
      });
    } else if (communityId) {
      this._usersService.getUsers(communityId).then(res => {
        this.setState({
          users: res.data,
        });
      });
    }
  }

  onChange = (value: string) => {
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        organisation_id: value,
      },
    });
  };

  getOrganisations = () => {
    const { connectedUser } = this.props;
    return connectedUser?.workspaces.map(ws => {
      return {
        label: ws.organisation_name,
        value: ws.organisation_id,
      };
    });
  };

  save = () => {
    const { user, userInput, roleInput } = this.state;
    if (user && user.organisation_id) {
      const userId = userInput?.id || user.id;
      if (userId) this.props.save(userId, user.organisation_id, roleInput);
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

  onSelect = (value: string, optionData: any) => {
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

  render() {
    const { intl } = this.props;
    const { user, userInput, roleInput } = this.state;

    const filterOption = (inputValue: string, option: { label: string; value: string }) => {
      return option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
    };

    return (
      <Form layout='vertical'>
        <Form.Item label={intl.formatMessage(messages.user)}>
          <AutoComplete
            options={this.getUserOptions()}
            disabled={!!user?.id}
            placeholder={intl.formatMessage(messages.userSearchPlaceholder)}
            filterOption={filterOption}
            onSelect={this.onSelect}
          >
            <Input.Search
              value={user?.id ? `${user.first_name} ${user.last_name}` : userInput.value}
            />
          </AutoComplete>
        </Form.Item>
        <Form.Item label={intl.formatMessage(messages.organisation)}>
          <Select
            className='mcs-userForm_select'
            options={this.getOrganisations()}
            value={user?.organisation_id}
            onChange={this.onChange}
            disabled={!!user?.id}
            placeholder={intl.formatMessage(messages.selectOrganisation)}
          />
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
  connect((state: MicsReduxState) => ({
    connectedUser: state.session.connectedUser,
  })),
)(UserRoleForm);
