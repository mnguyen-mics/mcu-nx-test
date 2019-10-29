import * as React from 'react';

// TS Interfaces
import { Input } from 'antd';
import { InputProps } from 'antd/lib/input/Input';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { TooltipProps } from 'antd/lib/tooltip';
import { ButtonStyleless, McsIcon } from '../';

import FormFieldWrapper, {
  FormFieldWrapperProps,
} from '../../components/Form/FormFieldWrapper';
import { Validator } from 'redux-form';

export interface FormMultiInputProps {
  validate?: Validator | Validator[];
  formItemProps?: FormItemProps;
  inputProps?: InputProps;
  helpToolTipProps?: TooltipProps;
  values: string[];
  handleClickOnRemove: (key: string) => void;
  handleClickOnItem: (key: string) => void;
  small?: boolean;
}

export interface FormMultiValueState {
  errors: string[];
  value: string;
}

type Props = FormMultiInputProps & FormFieldWrapperProps;

class FormMultiInput extends React.Component<
  Props, 
  FormMultiValueState
> {
  static defaultProps = {
    formItemProps: {},
    inputProps: {},
    helpToolTipProps: {},
  };

  constructor(props: Props) {
    
    super(props);

    this.state = {
      errors: [],
      value: ''
    }

  }

  onPressEnter = (stringValue: string) => {

    if (stringValue) {

      let errorMsg = [];

      // Check if we need to validate the input
      if (this.props.validate) {

        // If we have an array of validator
        if (Array.isArray(this.props.validate)) {

          const errors = this.props.validate.map((validator) => {
            return validator(stringValue); 
          }).filter(msg => !!msg);

          errorMsg = errors;

          // If we have a single validator
        } else {

          const error = this.props.validate(stringValue);

          if(error) {
            errorMsg.push(error);
          }

        }
      }

      if(errorMsg.length === 0) {

        this.setState({
          value: ''
        });

        return this.props.handleClickOnItem(stringValue);

      } else {

        this.setState({
          errors: errorMsg
        });

      }
    }
  };

  renderFields = () => {
    return this.props.values.map(key => {
      const handleClick = (e: any) => {
        this.props.handleClickOnRemove(key);
      };
      return (
        <div key={key} className="audience-service-item">
          {key}
          <ButtonStyleless className="remove-button" onClick={handleClick}>
            <McsIcon type="close" />
          </ButtonStyleless>
        </div>
      );
    });
  };

  formatErrors(errors: string[]): string{
    return errors.join('\n');
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      this.setState({value: e.target.value})
  }

  render() {

    return (
      <FormFieldWrapper
        helpToolTipProps={this.props.helpToolTipProps}
        small={this.props.small}
        {...this.props.formItemProps}
      >
        <div className="selected-audience-services-container">
          {this.renderFields()}
        </div>
        <Input.Search
          {...this.props.inputProps}
          onSearch={this.onPressEnter}
          onChange={this.onChange}
          enterButton={'Add'}
          value={this.state.value}
        />
       { this.state.errors.length > 0 ? <div className="mics-error-text">{this.formatErrors(this.state.errors)}</div> : null} 
      </FormFieldWrapper>
    );
  }
}

export default FormMultiInput;
