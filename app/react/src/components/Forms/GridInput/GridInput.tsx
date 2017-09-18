import * as React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import classNames from 'classnames';
import { Row, Col, Icon, Tooltip } from 'antd';

import InternalGridInput from './InternalGridInput';

interface GridInputProps {
  label: string;
  labelSpan?: number;
  inputSpan?: number;
  toolboxSpan?:number;
  gutter?: number;
  isRequired?: boolean;
  tooltip: string;
  defaultInputClassNames: Array<string>;
  inputClassNames: Array<string>;
  other: any;
}

const GridInput: React.SFC<GridInputProps> = props => {

  const inputClass = classNames(props.defaultInputClassNames, props.inputClassNames);
  const completeLabel = props.isRequired ? `${props.label} *` : props.label;
  const required = fieldValue => (fieldValue ? undefined : 'Required');
  const alwaysValid = () => undefined;

  return (
    <Row gutter={props.gutter} className="mics-gridinput-row" >
      <Col span={props.labelSpan} className="mics-gridinput-label-col" >{completeLabel}</Col>
      <Col span={props.inputSpan} >
        <Field
          component={InternalGridInput}
          validate={props.isRequired ? required : alwaysValid}
          className={inputClass} {...props.other}
        />
      </Col>
      <Col span={props.toolboxSpan} >
        <Tooltip placement="right" title={props.tooltip} overlayClassName="mics-gridinput-tooltip">
          <Icon type="info-circle" />
        </Tooltip>
      </Col>
    </Row>
  );
}

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
