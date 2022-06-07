import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { AutoComplete, Button, Col, Form, Input, message, Row } from 'antd';
import { FormSection } from '../../../../../components/Form';
import { messages } from '../List/messages';
import { UserCreationWithRoleResource as UserResource } from '../../../../../models/directory/UserResource';
import { connect } from 'react-redux';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { UserProfileResource } from '../../../../../models/directory/UserProfileResource';

interface State {
  user: Partial<UserResource>;
  orgInput: {
    value?: string;
    id?: string;
  };
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

interface UserFormProps {
  user?: UserResource;
  save: (user: Partial<UserResource>) => void;
}

type Props = UserFormProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string; userId: string }> &
  InjectedIntlProps;

class UserForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: {
        first_name: '',
        last_name: '',
        email: '',
        organisation_id: '',
      },
      orgInput: {},
    };
  }
  componentDidMount() {
    const { user } = this.props;
    if (user) {
      this.setState({
        user: user,
        orgInput: {
          id: user.organisation_id,
          value: this.getOrganisations().find(o => o.key === user?.organisation_id)?.label,
        },
      });
    }
  }

  onChange = (value: string) => (e: any) => {
    const { user } = this.state;
    const newValue: any = {};
    newValue[`${value}`] = e.target.value;
    this.setState({
      user: {
        ...user,
        ...newValue,
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
      };
    });
  };

  save = () => {
    const { intl } = this.props;
    const { user, orgInput } = this.state;
    if (user.first_name && user.last_name && user.email && orgInput.id) {
      const userResource: Partial<UserResource> = {
        ...user,
        organisation_id: orgInput.id,
      };
      this.props.save(userResource);
    } else {
      message.error(intl.formatMessage(messages.formNotComplete), 3);
    }
  };

  onOrgSelect = (value: string, optionData: any) => {
    this.setState({
      orgInput: {
        value: value,
        id: optionData.key,
      },
    });
  };

  render() {
    const { intl } = this.props;
    const { user, orgInput } = this.state;
    const filterOption = (inputValue: string, option: { label: string; value: string }) => {
      return option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1;
    };
    return (
      <Form layout='vertical'>
        <FormSection
          title={messages.userInformation}
          subtitle={messages.userInformationDescription}
        />
        <Row>
          <Col span='11'>
            <Form.Item label={intl.formatMessage(messages.usersFirstName)}>
              <Input
                className='mcs-userForm_input'
                placeholder={intl.formatMessage(messages.usersFirstName)}
                value={user.first_name}
                onChange={this.onChange('first_name')}
              />
            </Form.Item>
          </Col>
          <Col span='2' />
          <Col span='11'>
            <Form.Item label={intl.formatMessage(messages.usersLastName)}>
              <Input
                className='mcs-userForm_input'
                placeholder={intl.formatMessage(messages.usersLastName)}
                value={user.last_name}
                onChange={this.onChange('last_name')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label={intl.formatMessage(messages.usersEmail)}>
          <Input
            className='mcs-userForm_input'
            placeholder={intl.formatMessage(messages.usersEmail)}
            value={user.email}
            onChange={this.onChange('email')}
          />
        </Form.Item>
        <FormSection
          title={messages.organisation}
          subtitle={messages.organisationDescription}
          className='mcs-userForm_section'
        />
        <AutoComplete
          className='mcs-userForm_select'
          options={this.getOrganisations()}
          searchValue={this.getOrganisations().find(o => o.key === user?.organisation_id)?.label}
          onSelect={this.onOrgSelect}
          filterOption={filterOption}
          placeholder={intl.formatMessage(messages.selectOrganisation)}
        >
          <Input.Search value={orgInput.value || user.organisation_id} />
        </AutoComplete>
        <Button type='primary' className='mcs-primary mcs-saveButton' onClick={this.save}>
          {intl.formatMessage(messages.save)}
        </Button>
      </Form>
    );
  }
}

export default compose<Props, UserFormProps>(
  withRouter,
  injectIntl,
  connect((state: MicsReduxState) => ({
    connectedUser: state.session.connectedUser,
  })),
)(UserForm);
