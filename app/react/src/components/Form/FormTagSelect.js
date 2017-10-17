import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

const Option = Select.Option;

function FormTagSelect({ formValues, input, options }) {

  // const displayOptions = options.map((option) => {
  //   return <Option key={option.id}>{option.text}</Option>;
  // });

  const optionss = [
    { id: '1', text: 'hello' },
    { id: '2', text: 'you' },
    { id: '3', text: 'ca' },
    { id: '3', text: 'va' },
  ];

  const displayOptions = optionss.map((option) => {
    return <Option key={option.id}>{option.text}</Option>;
  });

  return (
    <Select
      {...input}
      mode="tags"
      size="default"
      placeholder="Please select"
      defaultValue={[]}
      onChange={(value) => input.onChange()}
      style={{ width: '100%' }}
    >
      {displayOptions}
    </Select>
  );

  // return (
  //   <Select
  //     {...input}
  //     mode="tags"
  //     size="default"
  //     placeholder="Please select"
  //     defaultValue={formValues}
  //     onChange={(e) => console.log('e = ', e)}
  //     style={{ width: '100%' }}
  //   >
  //     {displayOptions}
  //   </Select>
  // );
}

FormTagSelect.defaultProps = {
  formValues: [],
};

FormTagSelect.propTypes = {
  formValues: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  })),

  input: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
  }).isRequired,

  options: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  })).isRequired,
};

export default FormTagSelect;
