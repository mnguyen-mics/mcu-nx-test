import * as React from 'react';
import { LabeledValue } from 'antd/lib/select';
import { WrappedFieldProps } from 'redux-form';
import FormSearchObject, { FormSearchObjectProps } from './FormSearchObject';

export interface FormSearchMatchProps extends FormSearchObjectProps {
  separator: string;
  handleMatchValue: (value: any) => void;
}

type Props = FormSearchMatchProps & WrappedFieldProps;

class FormSearchMatch extends React.Component<Props, FormSearchMatchProps> {
  handleValue = (value: LabeledValue[]) => {
    const { separator, handleMatchValue } = this.props;
    handleMatchValue(value.map(v => v.value).join(separator));
    return value;
  };

  render() {
    return <FormSearchObject handleValue={this.handleValue} {...this.props} />;
  }
}

export default FormSearchMatch;
