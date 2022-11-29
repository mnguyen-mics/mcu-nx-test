import * as React from 'react';
import { LabeledValue } from 'antd/lib/select';
import { WrappedFieldProps } from 'redux-form';
import FormSearchObject, { FormSearchObjectProps } from './FormSearchObject';

export interface FormSearchSingleValueProps extends FormSearchObjectProps {
  handleSingleValue: (value: any) => void;
  handleNoValue: (inputName: any) => void;
}

type Props = FormSearchSingleValueProps & WrappedFieldProps;

class FormSearchSingleValue extends React.Component<Props, FormSearchSingleValueProps> {
  handleValue = (value: LabeledValue[], inputName?: string) => {
    const { handleSingleValue, handleNoValue } = this.props;
    if (!value || value.length === 0) {
      handleNoValue(inputName);
    } else {
      handleSingleValue(value[0].value);
    }
  };

  render() {
    return <FormSearchObject handleValue={this.handleValue} isSingleValue={true} {...this.props} />;
  }
}

export default FormSearchSingleValue;
