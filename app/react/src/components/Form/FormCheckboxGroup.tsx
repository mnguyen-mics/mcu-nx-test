import * as React from 'react';
import { Checkbox } from 'antd';
import { WrappedFieldProps } from 'redux-form';

interface OptionProps {
    label: string;
    value: string;
}

export interface FormCheckboxGroupProps {
    options: OptionProps[];
    valueAsString?: boolean;
}

const CheckboxGroup = Checkbox.Group;

const FormCheckboxGroup: React.SFC<FormCheckboxGroupProps & WrappedFieldProps> = props => {

    const { options, input } = props;

    const defaultValue = 
    input.value === ''
      ? [] 
      : (props.valueAsString && !Array.isArray(input.value)) ? input.value.split(',') : input.value;

    const onChange = (valueOnChange: any) => {
        if (props.valueAsString && Array.isArray(valueOnChange)) {
            return input.onChange(valueOnChange.join(','));
        }
        return input.onChange(valueOnChange);
    };

    // const onChange = (e: any) => input.onChange(e.target.value);

    return (
        <CheckboxGroup
            options={options}
            defaultValue={defaultValue}
            onChange={onChange}
        />
    );

};

export default FormCheckboxGroup;


