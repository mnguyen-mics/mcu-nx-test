import * as React from 'react';
import { TreeSelect } from 'antd';
import FormFieldWrapper, { FormFieldWrapperProps } from './FormFieldWrapper';
import cuid from 'cuid';
import { FormItemProps } from 'antd/lib/form/FormItem';
import { WrappedFieldProps } from 'redux-form';
import { LabeledValue, TreeSelectProps } from 'antd/lib/tree-select';
import { defineMessages, FormattedMessage } from 'react-intl';

export type FormTreeSelectDataNode = Required<
  Pick<TreeSelectProps<LabeledValue>, 'treeData'>
>['treeData'][number];
export interface FormTreeSelectProps extends FormFieldWrapperProps {
  treeData: FormTreeSelectDataNode[];
  onSelect?: (value: any, option: FormTreeSelectDataNode) => void;
  small?: boolean;
  disabled?: boolean;
  formItemProps?: FormItemProps;
  treeNodeLabelProp?: string;
  defaultValueTitle?: string;
}

type Props = FormTreeSelectProps & WrappedFieldProps;

type State = {};

class FormTreeSelect extends React.Component<Props, State> {
  id: string = cuid();

  render() {
    const {
      formItemProps,
      small,
      meta,
      treeData,
      input,
      disabled,
      helpToolTipProps,
      defaultValueTitle,
      treeNodeLabelProp,
      onSelect,
    } = this.props;

    const getRef = () => document.getElementById(this.id)!;

    let validateStatus = 'success' as 'success' | 'warning' | 'error' | 'validating';

    if (meta && meta.touched && meta.invalid) validateStatus = 'error';
    if (meta && meta.touched && meta.warning) validateStatus = 'warning';

    const defaultDataNode: FormTreeSelectDataNode = {
      title: defaultValueTitle || <FormattedMessage {...messages.defaultValue} />,
      value: '',
    };

    const treeDataWithDefault = [defaultDataNode].concat(treeData);

    return (
      <FormFieldWrapper
        help={meta && meta.touched && (meta.warning || meta.error)}
        helpToolTipProps={helpToolTipProps}
        validateStatus={validateStatus}
        small={small}
        {...formItemProps}
      >
        <div id={this.id}>
          <TreeSelect
            treeData={treeDataWithDefault}
            value={input.value}
            onChange={input.onChange}
            onFocus={input.onFocus}
            onSelect={onSelect}
            getPopupContainer={getRef}
            disabled={disabled}
            labelInValue={true}
            treeNodeLabelProp={treeNodeLabelProp}
          />
        </div>
      </FormFieldWrapper>
    );
  }
}

export default FormTreeSelect;

const messages = defineMessages({
  defaultValue: {
    id: 'components.form.formTreeSelect.defaultValue',
    defaultMessage: '- Select One -',
  },
});
