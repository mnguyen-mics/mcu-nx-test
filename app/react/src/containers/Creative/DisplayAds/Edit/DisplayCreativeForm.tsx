import * as React from 'react';
import { reduxForm, InjectedFormProps, ConfigProps, FieldArray, GenericFieldArray, Field } from 'redux-form';
import { compose } from 'recompose';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { Layout, Form, Modal } from 'antd';

import {
  DisplayCreativeFormData,
  isDisplayAdResource,
  DISPLAY_CREATIVE_FORM,
  CustomUploadType,
} from './domain';
import messages from './messages';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import { Path } from '../../../../components/ActionBar';
import CustomMultipleImageLoader, { CustomMultipleImageLoaderProps } from './CustomLoaders/CustomMultipleImageLoader';
import CustomLoaderPlaceholder from './CustomLoaders/CustomLoaderPlaceholder';
import {
  GeneralFormSection,
  AuditFormSection,
  PropertiesFormSection,
  PreviewFormSection,
} from './Sections';
import { BasicProps } from 'antd/lib/layout/layout';
import { Omit } from '../../../../utils/Types';
import { McsFormSection } from '../../../../utils/FormHelper';
import { LayoutType } from './DisplayCreativeCreator';
import { ScrollspySider } from '../../../../components/Layout';
import { SidebarWrapperProps } from '../../../../components/Layout/ScrollspySider';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
  >;

const ImageLoaderFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  CustomMultipleImageLoaderProps
>;



export interface DisplayCreativeFormProps
  extends Omit<ConfigProps<DisplayCreativeFormData>, 'form'> {
  actionBarButtonText: FormattedMessage.MessageDescriptor;
  close: () => void;
  breadCrumbPaths: Path[];
  goToCreativeTypeSelection?: () => void;
  allowMultipleUpload?: boolean;
  customLoader?: CustomUploadType;
  avoidCloseAlert?: boolean;
  layout: LayoutType;
}

type Props = DisplayCreativeFormProps &
  InjectedFormProps<DisplayCreativeFormData, DisplayCreativeFormProps> & InjectedIntlProps;

class DisplayCreativeForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  isExistingCreative = () => {
    const {
      initialValues
    } = this.props;

    if (
      initialValues &&
      initialValues.creative &&
      isDisplayAdResource(initialValues.creative)
    ) {
      return initialValues.creative
    }
    return undefined
  }

  onClose = () => {
    const {
      close,
      pristine,
      intl,
      avoidCloseAlert
    } = this.props;

    if (avoidCloseAlert || pristine) {
      close()
    } else {
      Modal.confirm({
        title: intl.formatMessage(messages.modalConfirmTitle),
        content: intl.formatMessage(messages.modalConfirmContent),
        okText: intl.formatMessage(messages.modalConfirmOk),
        cancelText: intl.formatMessage(messages.modalConfirmCancel),
        onOk: close
      });
      
    }

  }

  buildFormSections = () => {
    const { allowMultipleUpload, customLoader, change, initialValues } = this.props;

    const leftFormSections: McsFormSection[] = [];
    const rightFormSections: McsFormSection[] = [];

    const existingCreative = this.isExistingCreative();

    const genericFieldArrayProps = {
      formChange: change,
      rerenderOnEveryChange: true,
    };

    rightFormSections.push({
      id: 'general',
      title: messages.creativeSectionGeneralTitle,
      component: <GeneralFormSection allowMultipleUpload={this.props.allowMultipleUpload} small={this.props.layout === 'SPLIT'} />,
    });

    if (existingCreative) {
      leftFormSections.push({
        id: 'audit_status',
        title: messages.creativeSectionAuditTitle,
        component: <AuditFormSection creativeId={existingCreative.id} />,
      });
    }


    if (initialValues.pluginLayout === undefined) {

      rightFormSections.push({
        id: 'properties',
        title: messages.creativeSectionPropertyTitle,
        component: <PropertiesFormSection small={this.props.layout === 'SPLIT'} />,
      });
    }
    else {
      initialValues.pluginLayout.sections.forEach(section => {
        rightFormSections.push({
          id: section.title,
          title: section.title,
          component: <PropertiesFormSection sectionTitle={section.title} small={this.props.layout === 'SPLIT'}/>,
        });
      })
    }

    if (existingCreative) {
      leftFormSections.push({
        id: 'preview',
        title: messages.creativeSectionPreviewTitle,
        component: <PreviewFormSection />,
      });
    }

    if (!existingCreative) {
      switch(customLoader) {
        case 'image':
          leftFormSections.push({
            id: 'loader',
            title: messages.creativeSectionPreviewTitle,
            component: <ImageLoaderFieldArray
              name='repeatFields'
              component={CustomMultipleImageLoader}
              inputProps={{
                multiple: allowMultipleUpload
              }}
              {...genericFieldArrayProps}
            />,
          });
          break;
        default:
          leftFormSections.push({
            id: 'no-loader',
            title: messages.creativeSectionPreviewTitle,
            component: <CustomLoaderPlaceholder />,
          });
          break;
      }
    }

    return {
      leftPanel: leftFormSections,
      rightPanel: rightFormSections
    };
  };

  generateLayout = () => {
    if (this.props.layout === 'SPLIT') {
      const sections = this.buildFormSections();
      const renderedRightSections = sections.rightPanel.map((section, index) => {
        return (
          <div key={section.id}>
            <div key={section.id} id={section.id}>
              {section.component}
            </div>
            {index !== sections.rightPanel.length - 1 && <hr />}
          </div>
        );
      });
  
      const renderedLeftSections = sections.leftPanel.map((section, index) => {
  
        const generateStyle = (id: string): React.CSSProperties => {
          switch(id) {
            case 'preview':
              return  { flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'strech', flexDirection: 'column' };
            case 'loader':
              return { flexGrow: 1, overflowX: 'hidden' }
            case 'no-loader':
              return { flexGrow: 1, overflowX: 'hidden', display: 'flex' }
            default:
              return { flexGrow: 0 }
          }
        }
  
        return (
          <div key={section.id} id={section.id} style={generateStyle(section.id)}>
            {section.component}
          </div>
        );
      });

      return (
        <Layout className="ant-layout-has-sider">
          <div className="ant-layout-sider" style={{ width: "60%", backgroundColor: 'rgba(0, 0, 0, 0.64)' }}>
            <div className="ant-layout-sider-children" style={{  display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
              {renderedLeftSections}
            </div>
          </div>
          <Layout>
            <Content
              id={DISPLAY_CREATIVE_FORM}
              className="mcs-content-container mcs-form-container"
              style={{ borderLeft: '1px rgba(0, 0, 0, 0.64) solid' }}
            >
              {renderedRightSections}
            </Content>
          </Layout>
        </Layout>
      )
    } else {
      const sections = this.buildFormSections();
      const renderedRightSections = sections.rightPanel.map((section, index) => {
        return (
          <div key={section.id}>
            <div key={section.id} id={section.id}>
              {section.component}
            </div>
            {index !== sections.rightPanel.length - 1 && <hr />}
          </div>
        );
      });
      return (
        <Layout className="ant-layout-has-sider">
          
          <Layout>
            <Content
              id={DISPLAY_CREATIVE_FORM}
              className="mcs-content-container mcs-form-container"
            >
              {renderedRightSections}
            </Content>
          </Layout>
        </Layout>
      )
    }
  }

  render() {
    const {
      handleSubmit,
      actionBarButtonText,
      breadCrumbPaths,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: DISPLAY_CREATIVE_FORM,
      paths: breadCrumbPaths,
      message: actionBarButtonText,
      onClose: this.onClose,
    };
    
    const sideBarProps: SidebarWrapperProps = {
      items: this.buildFormSections().rightPanel.map(s => ({ sectionId: s.id, title: s.title })),
      scrollId: DISPLAY_CREATIVE_FORM,
    };

    let layoutProps = {}
    if (this.props.layout === 'SPLIT') {
      layoutProps = { layout: 'vertical' }
    }

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          {this.props.layout === 'STANDARD' ? <ScrollspySider {...sideBarProps} /> : null}
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit as any}
            {...layoutProps}
          >
            {/* this button enables submit on enter */}
            <button type="submit" style={{ display: 'none' }} />
            {this.generateLayout()}
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, DisplayCreativeFormProps>(
  reduxForm({
    form: DISPLAY_CREATIVE_FORM,
    enableReinitialize: true,
  }),
  injectIntl
)(DisplayCreativeForm);
