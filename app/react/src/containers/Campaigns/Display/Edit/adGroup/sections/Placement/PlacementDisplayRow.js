import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Avatar, Col, Row } from 'antd';

import { Form } from '../../../../../../../components';

const { FormCheckbox } = Form;

function PlacementDisplayRow({ icon, id, text, type }) {

  return (
    <li>
      <Row>
        <Col span={22} className="align-vertically row-name">
          <Avatar shape="square" size="small" src={icon} />
          <p className="margin-from-icon">{text}</p>
        </Col>

        <Col span={1} className="checkbox-wrapper">
          <Field
            component={FormCheckbox}
            name={`placements.${type}.${id}.checked`}
            type="checkbox"
          />
        </Col>
      </Row>
    </li>
  );
}

PlacementDisplayRow.propTypes = {
  icon: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default PlacementDisplayRow;
