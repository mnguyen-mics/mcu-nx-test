import * as React from 'react';

// TS Interfaces
import { Input } from 'antd';
import { InputProps } from 'antd/lib/input/Input';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { TooltipProps } from 'antd/lib/tooltip';
import { ButtonStyleless, McsIcon } from '../';

import FormFieldWrapper, { FormFieldWrapperProps } from '../../components/Form/FormFieldWrapper';

export interface FormMultiInputProps {
  formItemProps?: FormItemProps;
  inputProps?: InputProps;
  helpToolTipProps?: TooltipProps;
  values: string[];
  handleClickOnRemove: (key: string) => void;
  handleClickOnItem: (key: string) => void;
}

class FormMultiInput extends React.Component<FormMultiInputProps & FormFieldWrapperProps> {

  static defaultProps = {
    formItemProps: {},
    inputProps: {},
    helpToolTipProps: {},
  };

  inputField: any = null;

  saveInputRef = (e: any) => {
    this.inputField = e;
  }

  onPressEnter = (e: string) => {
    if (e) {
      this.inputField.input.input.value = '';
      return this.props.handleClickOnItem(e)
    }
  }

  render() {

    const selectedItemsView = (
      this.props.values.map(key => {
        const handleClick = () => {
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
      })
    );

    return (
      <FormFieldWrapper
        helpToolTipProps={this.props.helpToolTipProps}
        {...this.props.formItemProps}
      >
        <div
          className="selected-audience-services-container"
        >
          {selectedItemsView}
        </div>
        <Input.Search
          {...this.props.inputProps}
          onSearch={this.onPressEnter}
          enterButton={'Add'}
          ref={this.saveInputRef}
        />
      </FormFieldWrapper>
    );
  }
  
};

export default FormMultiInput;

