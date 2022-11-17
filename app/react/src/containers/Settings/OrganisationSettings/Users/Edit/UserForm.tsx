import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { AutoComplete, Button, Col, Form, Input, message, Row } from 'antd';
import { FormSection } from '../../../../../components/Form';
import { messages } from '../List/messages';
import { UserCreationWithRoleResource as UserResource } from '../../../../../models/directory/UserResource';
import { connect } from 'react-redux';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { UserProfileResource } from '../../../../../models/directory/UserProfileResource';
import { OrganisationResource } from '../../../../../models/organisation/organisation';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';

interface State {
  user: Partial<UserResource>;
  orgInput: {
    value?: string;
    id?: string;
  };
  prevOrgInput: {
    value?: string;
    id?: string;
  };
  submittedWithoutOrg: boolean;
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

interface UserFormProps {
  user?: UserResource;
  organisations: OrganisationResource[];
  save: (user: Partial<UserResource>) => void;
}

type Props = UserFormProps &
  MapStateToProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string; userId: string }> &
  WrappedComponentProps;

class UserForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      user: props.user
        ? props.user
        : {
            first_name: '',
            last_name: '',
            email: '',
            organisation_id: '',
          },
      orgInput: props.user
        ? {
            id: props.user.organisation_id,
            value: props.organisations.find(org => org.id === props.user!.organisation_id)?.name!,
          }
        : {},
      prevOrgInput: {},
      submittedWithoutOrg: false,
    };
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

  save = () => {
    const { intl } = this.props;
    const { user, orgInput, submittedWithoutOrg } = this.state;
    if (user.first_name && user.last_name && user.email && orgInput.id) {
      const userResource: Partial<UserResource> = {
        ...user,
        organisation_id: orgInput.id,
      };
      this.props.save(userResource);
    } else {
      message.error(intl.formatMessage(messages.formNotComplete), 3);
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

  onOrgSelect = (value: string, optionData: any) => {
    this.setState({
      orgInput: {
        value: value,
        id: optionData.key,
      },
      submittedWithoutOrg: false,
    });
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
    const { intl, organisations } = this.props;
    const { user, orgInput, submittedWithoutOrg } = this.state;
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
          className={
            submittedWithoutOrg
              ? 'mcs-userForm_select mcs-userForm_selectWrong'
              : 'mcs-userForm_select'
          }
          options={organisations?.map(org => {
            return { key: org.id, label: org.name, value: org.name };
          })}
          searchValue={organisations?.find(o => o.id === user?.organisation_id)?.name}
          onSelect={this.onOrgSelect}
          onChange={this.onOrgChange}
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
  injectNotifications,
  connect((state: MicsReduxState) => ({
    connectedUser: state.session.connectedUser,
  })),
)(UserForm);
