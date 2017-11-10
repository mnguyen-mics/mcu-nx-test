import * as React from 'react';
import { Input as AntInput } from 'antd';

// TS Interfaces
import { WrappedFieldProps } from 'redux-form';

import { FormFieldWrapperProps } from '../../../components/Form/FormFieldWrapper';

const Input = (props: any) => {
  const onChange = (e: any) => props.onChange(e.target.value);

  return <AntInput {...props} onChange={onChange} />;
};

const CreativeCustomFormat: React.SFC<FormFieldWrapperProps & WrappedFieldProps> = ({
  input: {
    onChange,
    value,
  },
}) => {

  const dimensions = value.split('x');
  const width = dimensions[0];
  const height = dimensions[1];

  const onWidthChange = (newWidth: string) => onChange(`${newWidth || 0}x${height || 0}`);
  const onHeightChange = (newHeight: string) => onChange(`${width || 0}x${newHeight || 0}`);

  return (
    <div className="custom">
      <div className="input">
        <Input
          placeholder={'Width'}
          value={width}
          onChange={onWidthChange}
        />
      </div>
      <div className="separator">x</div>
      <div className="input">
        <Input
          placeholder={'Height'}
          value={height}
          onChange={onHeightChange}
        />
      </div>
    </div>
  );
};

export default CreativeCustomFormat;
