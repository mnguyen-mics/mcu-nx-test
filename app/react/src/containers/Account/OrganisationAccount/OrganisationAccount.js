import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { FormattedMessage } from 'react-intl';

import LogoInput from './LogoInput';

class OrganisationAccount extends Component {

  render() {
    const {
      organisationName,
    } = this.props;

    const fieldGridConfig = {
      labelCol: { span: 4 },
      wrapperCol: { span: 10, offset: 1 },
    };

    return (<div>
      <div className="mcs-card-header mcs-card-title">
        <span className="mcs-card-title"><FormattedMessage id="OrganisationProfile" defaultMessage="Organisation Profile" /></span>
      </div>
      <hr className="mcs-separator" />
      <Row>
        <Col span={fieldGridConfig.labelCol.span}>
          <label htmlFor="organisation_name" className="ant-form-item-label">
            <FormattedMessage id="OrganisationProfile" defaultMessage="Organisation Profile" /> :
          </label>
        </Col>
        <Col span={fieldGridConfig.wrapperCol.span} offset={fieldGridConfig.wrapperCol.offset}>
          <label id="organisation_name" htmlFor="organisation_name" className="ant-form-item-label"> {organisationName} </label>
        </Col>
      </Row>
      <LogoInput fieldGridConfig={fieldGridConfig} />
    </div>);
  }
}

OrganisationAccount.propTypes = {
  organisationName: PropTypes.string.isRequired,
};

export default OrganisationAccount;
