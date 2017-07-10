import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { compose } from 'recompose';
import { injectIntl, FormattedMessage } from 'react-intl';

import { EditableLogo } from '../../Logo';

class LogoInput extends Component {
  render() {
    const {
        fieldGridConfig
    } = this.props;

    return (<Row>
      <Col span={fieldGridConfig.labelCol.span}>
        <label htmlFor="editable_logo" className="ant-form-item-label">
          <FormattedMessage id="LOGO" defaultMessage="Logo" /> :
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

LogoInput = compose(
  injectIntl
)(LogoInput);

export default LogoInput;
