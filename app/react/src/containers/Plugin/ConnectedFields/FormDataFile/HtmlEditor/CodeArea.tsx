import * as React from 'react';
import { defineMessages } from 'react-intl';
import { Layout } from 'antd';
import { compose } from 'recompose';
import {
  FieldCtor,
  FormSection,
  FormCodeEdit,
} from '../../../../../components/Form';
import { FormCodeEditProps } from '../../../../../components/Form/FormCodeEdit';
import {
  reduxForm,
  InjectedFormProps,
  Field,
  Form,
  ConfigProps,
  GenericField,
} from 'redux-form';
import { EditContentLayout } from '../../../../../components/Layout';
import { Omit } from '../../../../../utils/Types';
import { injectDrawer } from '../../../../../components/Drawer/index';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
const { Content } = Layout;

const FormCodeField: FieldCtor<FormCodeEditProps> = Field as new () => GenericField<FormCodeEditProps>;

export interface CodeAreaProps extends Omit<ConfigProps<any>, 'form'> {}

type Props = InjectedFormProps<any, CodeAreaProps> &
  CodeAreaProps &
  InjectedDrawerProps;

const messages = defineMessages({
  quickEdit: {
    id: 'htmlEditor.codearea.breadcrumb.title',
    defaultMessage: 'Code Edit',
  },
  save: {
    id: 'htmlEditor.codearea.breadcrumb.save',
    defaultMessage: 'Update',
  },
  formTitle: {
    id: 'htmlEditor.codearea.form.title',
    defaultMessage: 'Code Edit',
  },
});

const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 19, offset: 1 },
};

class CodeArea extends React.Component<Props> {
  render() {
    const { handleSubmit } = this.props;

    const breadcrumbPaths = [ 'Code Edit' ];

    const actionbarProps = {
      formId: 'codeAreaForm',
      message: messages.save,
      onClose: this.props.closeNextDrawer,
    };

    return (
      <EditContentLayout pathItems={breadcrumbPaths} {...actionbarProps}>
        <Layout>
          <Form
            onSubmit={handleSubmit as any}
            className={'edit-layout ant-layout'}
          >
            <Content className="mcs-content-container mcs-form-container ad-group-form">
              <FormSection title={messages.formTitle} />
              <FormCodeField
                name={'code'}
                component={FormCodeEdit}
                props={{
                  formItemProps: {
                    label: 'Code',
                    ...fieldGridConfig,
                  },
                  inputProps: {
                    mode: 'handlebars',
                    theme: 'monokai',
                    name: 'blah2',
                    fontSize: 14,
                    showPrintMargin: true,
                    showGutter: true,
                    highlightActiveLine: true,
                    setOptions: {
                      enableBasicAutocompletion: false,
                      enableLiveAutocompletion: false,
                      enableSnippets: false,
                      showLineNumbers: true,
                      tabSize: 2,
                    },
                    width: '100%',
                    wrapEnabled: true,
                  },
                }}
              />
            </Content>
          </Form>
        </Layout>
      </EditContentLayout>
    );
  }
}

export default compose(reduxForm<{}, CodeAreaProps>({}), injectDrawer)(
  CodeArea,
);
