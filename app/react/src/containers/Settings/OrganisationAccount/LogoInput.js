import React, {Component} from 'react'
import PropTypes from 'prop-types';
import { Upload, Row, Col } from 'antd';
import { compose } from 'recompose';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
const Dragger = Upload.Dragger;

import { EditableLogo } from '../../Logo'

class LogoInput extends Component {
    render () {
        const {
            fieldGridConfig,
            intl: { formatMessage }
        } = this.props;

        return (<Row>
            <Col span={fieldGridConfig.labelCol.span}>
                <label className="ant-form-item-label"><FormattedMessage id="LOGO" defaultMessage="Logo" /> :</label>
            </Col>
            <Col span={fieldGridConfig.wrapperCol.span} offset={fieldGridConfig.wrapperCol.offset}>
                <EditableLogo mode="inline" />
            </Col>
        </Row>);
    } 
} 

LogoInput.propTypes = {
  fieldGridConfig: PropTypes.object.isRequired
};

LogoInput = compose(
  injectIntl
)(LogoInput);

export default LogoInput;