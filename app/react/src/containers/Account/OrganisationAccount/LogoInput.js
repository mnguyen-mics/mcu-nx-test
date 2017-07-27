import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { FormattedMessage } from 'react-intl';

import { EditableLogo } from '../../Logo';

class LogoInput extends Component {
  render() {
    const {
        fieldGridConfig
    } = this.props;

    return (<Row>
      <Col span={fieldGridConfig.labelCol.span}>
        <label htmlFor="editable_logo" className="ant-form-item-label">
          <FormattedMessage id="account.organisation_tab.logo" defaultMessage="Logo" /> :
        </label>
      </Col>
      <Col span={fieldGridConfig.wrapperCol.span} offset={fieldGridConfig.wrapperCol.offset}>
        <EditableLogo id="editable_logo" mode="inline" />
      </Col>
    </Row>);
  }
}

LogoInput.propTypes = {
  fieldGridConfig: PropTypes.object.isRequired  // eslint-disable-line react/forbid-prop-types
};

export default LogoInput;
