
import * as React from 'react';
import { defineMessages } from 'react-intl';
import { Layout, Row } from 'antd';
import { FieldCtor, FormSection } from '../../../../../components/Form';
import FormInput, { FormInputProps } from '../../../../../components/Form/FormInput';
import { reduxForm, InjectedFormProps, Field, Form } from 'redux-form';
import { generateFakeId } from '../../../../../utils/FakeIdHelper';
import FormTextArea, { FormTextAreaProps } from '../../../../../components/Form/FormTextArea';
import { EditContentLayout } from '../../../../../components/Layout'
import QuickAssetUpload, { QuickAssetUploadProps } from './QuickAssetUpload'
import { DrawableContentProps } from '../../../../../components/Drawer'

const { Content } = Layout;

export type ContentType = 'title' | 'text' | 'image';

export interface Content {
  type: ContentType;
  name: string;
  content: string;
}

export interface ContentAreaProps extends DrawableContentProps {
  content: Content[];
}

const FormInputField: FieldCtor<FormInputProps> = Field;
const FormTextAreaField: FieldCtor<FormTextAreaProps> = Field;
const FormQuickUploadField: FieldCtor<QuickAssetUploadProps> = Field;

const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 19, offset: 1 },
};

type Props = InjectedFormProps<{}, ContentAreaProps> & ContentAreaProps;

const messages = defineMessages({
  quickEdit: {
    id: 'htmlEditor.breadcrumb.title',
    defaultMessage: 'Quick Edit'
  },
  save: {
    id: 'htmlEditor.breadcrumb.save',
    defaultMessage: 'Save',
  },
  formTitle: {
    id: 'htmlEditor.form.title',
    defaultMessage: 'Quick Edit',
  }
})

class ContentArea extends React.Component<Props, any> {

  buildItems = (content: Content) => {
    switch (content.type) {
      case 'title':
        return (
          <Row key={content.name}>
            <FormInputField
              name={content.name}
              component={FormInput}
              props={{
                formItemProps: {
                  label: content.name,
                  ...fieldGridConfig,
                },
                inputProps: {
                  placeholder: content.name,
                  defaultValue: content.content,
                },
              }}
            />
          </Row>);
      case 'text':
        return (
          <Row key={content.name}>
            <FormTextAreaField
              name={content.name}
              component={FormTextArea}
              props={{
                formItemProps: {
                  label: content.name,
                  ...fieldGridConfig,
                },
                inputProps: {
                  defaultValue: content.content,
                  rows: 5,
                },
              }}
            />
          </Row>);
      case 'image':
        return (
          <Row key={content.name}>
            <FormQuickUploadField
              name={content.name}
              component={QuickAssetUpload}
              formItemProps={{
                label: content.name,
                ...fieldGridConfig,
              }}
              openNextDrawer={this.props.openNextDrawer}
              closeNextDrawer={this.props.closeNextDrawer}
            />
          </Row>
        );
      default:
        return <div key={generateFakeId()}>not supported</div>;
    }
  }
  render() {
    const { content, handleSubmit } = this.props;

    const breadcrumbPaths = [
      { name: 'Quick Edit' },
    ];

    const sidebarItems = {};

    const buttonMetadata = {
      formId: 'contentAreaForm',
      message: messages.save,
      onClose: this.props.closeNextDrawer,
    }

    return (
      <EditContentLayout
        breadcrumbPaths={breadcrumbPaths}
        sidebarItems={sidebarItems}
        buttonMetadata={buttonMetadata}
        url={''}
      >
        <Layout>
          <Form
            onSubmit={handleSubmit}
            className={'edit-layout ant-layout'}
          >
            <Content
              className="mcs-content-container mcs-form-container ad-group-form"
            >
            <FormSection
              title={messages.formTitle}
            />
            {content.map(item => {
              return this.buildItems(item);
            })}
            </Content>
          </Form>
        </Layout>
      </EditContentLayout>
    );
  }
}

export default reduxForm<{}, ContentAreaProps>({})(ContentArea);
