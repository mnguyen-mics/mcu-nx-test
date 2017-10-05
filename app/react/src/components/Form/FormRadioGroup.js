import React from 'react';
import PropTypes from 'prop-types';
import { Radio } from 'antd';

import FormRadio from './FormRadio';

const RadioGroup = Radio.Group;

function FormRadioGroup({ elementClassName, groupClassName, elements, input }) {

  const elementsToMap = elements.map(element => (
    <FormRadio
      className={elementClassName}
      key={element.id}
      name={element.value}
      title={element.title}
      value={element.value}
    />
  ));

  return (
    <RadioGroup
      {...input}
      className={groupClassName}
      onChange={(e) => input.onChange(e.target.value)}
      value={input.value}
    >{elementsToMap}
    </RadioGroup>
  );
}

FormRadioGroup.defaultProps = {
  elementClassName: '',
  groupClassName: '',
};


FormRadioGroup.propTypes = {
  elementClassName: PropTypes.string,

  elements: PropTypes.arrayOf(
    PropTypes.shape({
      placementType: PropTypes.string,
    }).isRequired
  ).isRequired,

  groupClassName: PropTypes.string,

  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }).isRequired,
};


export default FormRadioGroup;
