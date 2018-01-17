import * as React from 'react';
import { defineMessages } from 'react-intl';
import { Layout } from 'antd';
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
} from 'redux-form';
import { EditContentLayout } from '../../../../../components/Layout';
import { DrawableContentProps } from '../../../../../components/Drawer';
import { Omit } from '../../../../../utils/Types';
const { Content } = Layout;

const FormCodeField: FieldCtor<FormCodeEditProps> = Field;

export interface CodeAreaProps
  extends DrawableContentProps,
    Omit<ConfigProps<any>, 'form'> {}

type Props = InjectedFormProps<any, CodeAreaProps> & CodeAreaProps;

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

    const breadcrumbPaths = [{ name: 'Code Edit' }];

    const actionbarProps = {
      formId: 'codeAreaForm',
      message: messages.save,
      onClose: this.props.closeNextDrawer,
    };

    return (
      <EditContentLayout
        paths={breadcrumbPaths}
        {...actionbarProps}
      >
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

export default reduxForm<{}, CodeAreaProps>({})(CodeArea);
