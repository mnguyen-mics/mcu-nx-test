import * as React from 'react';
import { Layout } from 'antd';
import { Form } from '@ant-design/compatible';
import { FormattedMessage, injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { FormInput } from '../../../../components/Form/';
import LogoInput from './LogoInput';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Field, reduxForm, InjectedFormProps } from 'redux-form';
import { MicsReduxState } from '../../../../utils/ReduxHelper';

const { Content } = Layout;
export interface OrganisationAccountProps {
  organisationName: string;
}

type Props = OrganisationAccountProps &
  InjectedIntlProps &
  InjectedFormProps<{ organisation_name: string }>;

const messages = defineMessages({
  OrganisationProfile: {
    id: 'settings.organisation.profile',
    defaultMessage: 'Organisation Profile',
  },
  OrganisationName: {
    id: 'settings.organisation.name',
    defaultMessage: 'Organisation Name',
  },
  OrganisationLogo: {
    id: 'settings.organisation.logo',
    defaultMessage: 'Organisation Logo',
  },
});

class OrganisationAccount extends React.Component<Props> {
  render() {
    const { intl } = this.props;
    const fieldGridConfig = {
      labelCol: { span: 4 },
      wrapperCol: { span: 10, offset: 1 },
    };

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <Form className={'edit-top'}>
            <div className='mcs-card-header mcs-card-title'>
              <span className='mcs-card-title'>
                <FormattedMessage
                  id='settings.organisation.organisationAccount.organisationProfile'
                  defaultMessage='Organisation Profile'
                />
              </span>
            </div>
            <hr className='mcs-separator' />
            <Field
              name={'organisation_name'}
              component={FormInput}
              validate={[]}
              // @ts-ignore
              props={{
                formItemProps: {
                  label: intl.formatMessage(messages.OrganisationName),
                  ...fieldGridConfig,
                },
                inputProps: {
                  placeholder: intl.formatMessage(messages.OrganisationName),
                  disabled: true,
                },
              }}
            />
            {/* @ts-ignore */}
            <Field
              name={'organisation_id'}
              component={LogoInput}
              validate={[]}
              props={{
                formItemProps: {
                  label: intl.formatMessage(messages.OrganisationLogo),
                  ...fieldGridConfig,
                },
              }}
            />
          </Form>
        </Content>
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  initialValues: state.session.workspace,
});

export default compose<OrganisationAccountProps, {}>(
  injectIntl,
  connect(mapStateToProps),
  reduxForm({
    form: 'organisationProfileEdit',
  }),
)(OrganisationAccount);
