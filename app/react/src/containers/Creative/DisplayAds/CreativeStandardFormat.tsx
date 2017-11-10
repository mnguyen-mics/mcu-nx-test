import * as React from 'react';
import { Select } from 'antd';

// TS Interfaces
import { WrappedFieldProps } from 'redux-form';
// import { SelectProps } from 'antd/lib/select';

import { FormFieldWrapperProps } from '../../../components/Form/FormFieldWrapper';
import FormSelect from '../../../components/Form/FormSelect/FormSelect';

interface StandardFormatProps {
  options?: string[];
  // select?: SelectProps;
}

const Option = Select.Option;

class CreativeStandardFormat extends React.Component<StandardFormatProps & FormFieldWrapperProps & WrappedFieldProps> {

  static defaultProps = {
    options: [],
    // select: {},
  };

  componentDidMount() {
    this.setDefaultValue();
  }

  componentDidUpdate() {
    this.setDefaultValue();
  }

  setDefaultValue = () => {
    const {
      options,
      input: {
        value,
        onChange,
      },
    } = this.props;

    if (options && options.length === 1 && (!value || value === '')) {
      onChange(options[0]);
    }
  }

  render() {
    const {
      options,
      // select,
      input,
    } = this.props;

    const optionsToDisplay = options!.map(option => (
      <Option key={option} value={option}>{option}</Option>
    ));

    return (
      <FormSelect
        // {...select}
        input={input}
      >{optionsToDisplay}
      </FormSelect>
    );
  }
}

export default CreativeStandardFormat;
