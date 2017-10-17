import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { FieldArray } from 'redux-form';
import { Checkbox, Col, Row, Tooltip } from 'antd';

import { Form, McsIcons } from '../../../../../../components/index.ts';
import messages from '../../messages';

const { FormSection } = Form;

class Device extends Component {

  state = { displayOptions: false }

  render() {
    console.log('props = ', this.props);
    const { formatMessage } = this.props;

    return (
      <div id="device">
        <FormSection
          subtitle={messages.sectionSubtitleDevice}
          title={messages.sectionTitleDevice}
        />

        <Row className="ad-group-placement">
          <Col offset={2} className="bold font-size radio" />

          {this.state.displayOptions
          && (
            <Col className="custom-content font-size" offset={2}>
              <Row>
                <Col span={3} className="bold">
                  {formatMessage(messages.contentSectionPlacementProperties)}
                </Col>

                <Col span={14} className="content-wrapper" />

                <Col span={1} className="field-tooltip">
                  <Tooltip title="Test">
                    <McsIcons type="info" />
                  </Tooltip>
                </Col>
              </Row>
            </Col>
          )
        }
        </Row>
      </div>
    );
  }
}


Device.propTypes = {
  formatMessage: PropTypes.func.isRequired,
};

export default Device;
