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

export interface FormMultiInputProps {
  formItemProps?: FormItemProps;
  inputProps?: InputProps;
  helpToolTipProps?: TooltipProps;
  values: string[];
  handleClickOnRemove: (key: string) => void;
  handleClickOnItem: (key: string) => void;
  small?: boolean;
}

class FormMultiInput extends React.Component<
  FormMultiInputProps & FormFieldWrapperProps
> {
  static defaultProps = {
    formItemProps: {},
    inputProps: {},
    helpToolTipProps: {},
  };

  inputField: any = null;

  saveInputRef = (e: any) => {
    this.inputField = e;
  };

  onPressEnter = (stringValue: string) => {
    if (event) event.stopImmediatePropagation();
    if (stringValue) {
      this.inputField.input.input.value = ''; // use state local
      return this.props.handleClickOnItem(stringValue);
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

  render() {
    const cancelEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.which === 13 /* Enter */) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      return;
    };

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
          enterButton={'Add'}
          ref={this.saveInputRef}
          onKeyDown={cancelEvent}
        />
      </FormFieldWrapper>
    );
  }
}

export default FormMultiInput;
