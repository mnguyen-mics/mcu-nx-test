import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { Avatar, Col, Row } from 'antd';

import { Form } from '../../../../../../../components';

const { FormCheckbox } = Form;

function PlacementDisplayRow({ icon, index, text, type }) {

  return (
    <li>
      <Row className="align-vertically">
        <Col span={22} className="align-vertically row-name">
          <Avatar shape="square" size="small" src={icon} />
          <p className="margin-from-icon">{text}</p>
        </Col>

        <Col span={1}>
          <Field
            component={FormCheckbox}
            name={`placements.${type}.${index}.checked`}
            type="checkbox"
          />
        </Col>
      </Row>
    </li>
  );
}

PlacementDisplayRow.propTypes = {
  icon: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  text: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default PlacementDisplayRow;
