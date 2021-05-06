import * as React from 'react';
import { LabeledValue } from 'antd/lib/select';
import { WrappedFieldProps } from 'redux-form';
import FormSearchObject, { FormSearchObjectProps } from './FormSearchObject';

export interface FormSearchObjectListProps extends FormSearchObjectProps {
  handleNoValue: (inputName: any) => void;
}

type Props = FormSearchObjectListProps & WrappedFieldProps;

class FormSearchObjectList extends React.Component<Props, FormSearchObjectListProps> {
  handleValue = (value: LabeledValue[], inputName?: string) => {
    const { handleNoValue } = this.props;
    if (value.length === 0) {
      handleNoValue(inputName);
    }
    return value;
  };

  render() {
    return <FormSearchObject handleValue={this.handleValue} {...this.props} />;
  }
}

export default FormSearchObjectList;
