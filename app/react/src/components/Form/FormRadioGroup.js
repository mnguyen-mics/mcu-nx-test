import React from 'react';
import PropTypes from 'prop-types';
import { Radio } from 'antd';

import FormRadio from './FormRadio';

const RadioGroup = Radio.Group;

function FormRadioGroup({ className, elements, input }) {

  const elementsToMap = elements.map(element => (
    <FormRadio
      key={element.id}
      name={element.value}
      title={element.title}
      value={element.value}
    />
  ));

  return (
    <RadioGroup
      {...input}
      className={className}
      onChange={(e) => input.onChange(e.target.value)}
      value={input.value}
    >{elementsToMap}
    </RadioGroup>
  );
}

FormRadioGroup.defaultProps = {
  className: 'display-flex-column',
};


FormRadioGroup.propTypes = {
  className: PropTypes.string,

  elements: PropTypes.arrayOf(
    PropTypes.shape({
      placementType: PropTypes.string,
    }).isRequired
  ).isRequired,

  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
  }).isRequired,
};


export default FormRadioGroup;
