import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import classNames from 'classnames';
import { Row, Col, Icon, Tooltip } from 'antd';

import InternalGridInput from './InternalGridInput';

function GridInput({
  defaultInputClassNames,
  inputClassNames,
  label,
  isRequired,
  tooltip,
  labelSpan,
  inputSpan,
  toolboxSpan,
  gutter,
  ...other
}) {

  const inputClass = classNames(defaultInputClassNames, inputClassNames);
  const completeLabel = isRequired ? `${label} *` : label;
  const required = fieldValue => (fieldValue ? undefined : 'Required');
  const alwaysValid = () => undefined;

  return (
    <Row gutter={gutter} className="mics-gridinput-row" >
      <Col span={labelSpan} className="mics-gridinput-label-col" >{completeLabel}</Col>
      <Col span={inputSpan} >
        <Field
          component={InternalGridInput}
          validate={isRequired ? required : alwaysValid}
          className={inputClass} {...other}
        />
      </Col>
      <Col span={toolboxSpan} >
        <Tooltip placement="right" title={tooltip} overlayClassName="mics-gridinput-tooltip">
          <Icon type="info-circle" />
        </Tooltip>
      </Col>
    </Row>
  );
}

GridInput.propTypes = {
  label: PropTypes.string.isRequired,
  labelSpan: PropTypes.number,
  inputSpan: PropTypes.number,
  toolboxSpan: PropTypes.number,
  gutter: PropTypes.number,
  isRequired: PropTypes.bool,
  tooltip: PropTypes.string.isRequired,
  defaultInputClassNames: PropTypes.arrayOf(PropTypes.string),
  inputClassNames: PropTypes.arrayOf(PropTypes.string),
};

GridInput.defaultProps = {
  isRequired: false,
  defaultInputClassNames: ['mics-gridinput-input'],
  inputClassNames: [],
  gutter: 16,
  labelSpan: 6,
  inputSpan: 12,
  toolboxSpan: 6,
};


export default GridInput;
