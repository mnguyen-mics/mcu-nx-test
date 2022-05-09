import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import { FormSection } from '../../../../../components/Form';
import { messages } from '../List/messages';
import { UserCreationWithRoleResource as UserResource } from '../../../../../models/directory/UserResource';
import { connect } from 'react-redux';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { UserProfileResource } from '../../../../../models/directory/UserProfileResource';

interface State {
  user: Partial<UserResource>;
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
    };
  }
  componentDidMount() {
    const { user } = this.props;
    if (user) {
      this.setState({
        user: user,
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
        value: ws.organisation_id,
      };
    });
  };

  save = () => {
    const { user } = this.state;
    this.props.save(user);
  };

  onOrgChange = (value: string) => {
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        organisation_id: value,
      },
    });
  };

  render() {
    const { intl } = this.props;
    const { user } = this.state;
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
        <FormSection title={messages.organisation} subtitle={messages.organisationDescription} />
        <Select
          className='mcs-userForm_select'
          options={this.getOrganisations()}
          value={user.organisation_id}
          onChange={this.onOrgChange}
          placeholder={intl.formatMessage(messages.selectOrganisation)}
        />
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
