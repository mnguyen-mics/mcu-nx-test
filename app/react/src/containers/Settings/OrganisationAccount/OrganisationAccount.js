import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Field, reduxForm } from 'redux-form';
import { Form, Row, Col, Button, Icon } from 'antd';
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl';

import {
  FormInput
} from '../../../components/Form';
import * as SessionActions from '../../../state/Session/actions';
import LogoInput from './LogoInput';

const required = value => (value ? undefined : 'Required');

function getDefaultOrganisation(user) {
    return user.workspaces[user.default_workspace];
}

class OrganisationAccount extends Component {

render() {
  const {
      organisation,
      intl: { formatMessage }
  } = this.props;

  const formMessages = defineMessages({ organisationName: { id: 'OrganisationName', defaultMessage: 'Organisation Name' },
    organisationNameInputPlaceholder: { id: 'FirstNamePlaceHolder', defaultMessage: 'First name' },
    logo: { id: 'Logo', defaultMessage: 'Logo' }
  });

  const fieldGridConfig = {
    labelCol: { span: 4 },
    wrapperCol: { span: 10, offset: 1 }
  };
    
  return (<Form>
    <div className="mcs-card-header mcs-card-title">
      <span className="mcs-card-title"><FormattedMessage id="OrganisationProfile" defaultMessage="Organisation Profile" /></span>
    </div>
    <hr className="mcs-separator" />
    <Row>
        <Col span={fieldGridConfig.labelCol.span}>
            <label className="ant-form-item-label"><FormattedMessage id="OrganisationProfile" defaultMessage="Organisation Profile" /> :</label>
        </Col>
        <Col span={fieldGridConfig.wrapperCol.span} offset={fieldGridConfig.wrapperCol.offset}>
            <label className="ant-form-item-label"> {organisation.organisation_name} </label>
        </Col>
    </Row>
    <LogoInput fieldGridConfig={fieldGridConfig}/>
  </Form>);
  }
}

OrganisationAccount.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

const mapStateToProps = state => ({
  organisation: getDefaultOrganisation(state.session.connectedUser)
});

const mapDispatchToProps = {
  updateLogo: SessionActions.updateLogo.request
};

OrganisationAccount = compose(
  reduxForm({
    form: 'userAccountEdit'
  }),
  injectIntl
)(OrganisationAccount);

OrganisationAccount = connect(
  mapStateToProps,
  mapDispatchToProps
)(OrganisationAccount);

export default OrganisationAccount;
