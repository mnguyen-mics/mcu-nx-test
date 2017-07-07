import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Row, Col, Button, Icon } from 'antd';
import { FormattedMessage, defineMessages } from 'react-intl';

import {
  FormInput
} from '../../../components/Form';
import { putLogo } from '../../../state/Session/actions';
import LogoInput from './LogoInput';

const required = value => (value ? undefined : 'Required');

class OrganisationAccount extends Component {

render() {
  const {
      organisation_name
  } = this.props;

  const formMessages = defineMessages({ organisationName: { id: 'OrganisationName', defaultMessage: 'Organisation Name' },
    organisationNameInputPlaceholder: { id: 'FirstNamePlaceHolder', defaultMessage: 'First name' },
    logo: { id: 'Logo', defaultMessage: 'Logo' }
  });

  const fieldGridConfig = {
    labelCol: { span: 4 },
    wrapperCol: { span: 10, offset: 1 }
  };
    
  return (<div>
    <div className="mcs-card-header mcs-card-title">
      <span className="mcs-card-title"><FormattedMessage id="OrganisationProfile" defaultMessage="Organisation Profile" /></span>
    </div>
    <hr className="mcs-separator" />
    <Row>
        <Col span={fieldGridConfig.labelCol.span}>
            <label className="ant-form-item-label"><FormattedMessage id="OrganisationProfile" defaultMessage="Organisation Profile" /> :</label>
        </Col>
        <Col span={fieldGridConfig.wrapperCol.span} offset={fieldGridConfig.wrapperCol.offset}>
            <label className="ant-form-item-label"> {organisation_name} </label>
        </Col>
    </Row>
    <LogoInput fieldGridConfig={fieldGridConfig}/>
  </div>);
  }
}

OrganisationAccount.propTypes = {
  organisation_name: PropTypes.string
};

export default OrganisationAccount;
