import * as React from 'react';
import { Layout, Alert } from 'antd';
import { compose } from 'recompose';
import {
  Form,
  reduxForm,
  InjectedFormProps,
  ConfigProps,
  Field,
  GenericField,
} from 'redux-form';
import { BasicProps } from 'antd/lib/layout/layout';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';

import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';
import { McsFormSection } from '../../../../utils/FormHelper';
import { Path } from '../../../../components/ActionBar';
import GeneralFormSection from './Sections/GeneralFormSection';
import OTQLInputEditor, {
  OTQLInputEditorProps,
} from '../../../Audience/Segments/Edit/Sections/query/OTQL';
import { Omit } from '../../../../utils/Types';
import { ExportFormData } from './domain';
import { injectDatamart } from '../../../Datamart';
import { FieldCtor, FormSection } from '../../../../components/Form';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';

const FORM_ID = 'exportForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const messages = defineMessages({
  sectionTitleGeneral: {
    id: 'exports.form.general',
    defaultMessage: 'General Informations',
  },
  sectionTitleQuery: {
    id: 'exports.form.query',
    defaultMessage: 'Query',
  },
  sectionSubTitleQuery: {
    id: 'exports.form.query.subtitle',
    defaultMessage:
      'Create the query of objects your want to export from your Datamart',
  },
  saveExport: {
    id: 'save.export',
    defaultMessage: 'Save',
  },
  editExport: {
    id: 'exports.form.edit.title',
    defaultMessage: 'Edit {name}',
  },
  noMoreSupported: {
    id: 'exports.form.legacyComponent.noMoreSupported',
    defaultMessage:
      'The query language related to this datamart is no more supported. Please select another datamart or create a new resource based on another datamart.',
  },
});

interface ExportEditFormProps
  extends Omit<ConfigProps<ExportFormData>, 'form'> {
  onClose: () => void;
  onSave: (formData: ExportFormData) => void;
  breadCrumbPaths: Path[];
  datamart?: DatamartResource;
}

const FormOTQL: FieldCtor<OTQLInputEditorProps> = Field as new () => GenericField<
  OTQLInputEditorProps
>;

type Props = InjectedFormProps<ExportFormData, ExportEditFormProps> &
  ExportEditFormProps &
  InjectedIntlProps;

class ExportEditForm extends React.Component<Props> {
  generateUserQueryTemplate = (renderedSection: JSX.Element) => {
    return (
      <div>
        <FormSection
          title={messages.sectionTitleQuery}
          subtitle={messages.sectionSubTitleQuery}
        />
        {renderedSection}
      </div>
    );
  };

  buildQueryComponent = () => {
    const { datamart, intl } = this.props;

    if (datamart!.storage_model_version === 'v201506') {
      return this.props.initialValues.query ? (
        <Alert
          message={intl.formatMessage(messages.noMoreSupported)}
          type="warning"
        />
      ) : null;
    } else {
      return this.generateUserQueryTemplate(
        <FormOTQL
          name={'query.query_text'}
          component={OTQLInputEditor}
          datamartId={datamart!.id}
          formItemProps={{
            label: intl.formatMessage(messages.saveExport),
            required: true,
          }}
          helpToolTipProps={{
            title: intl.formatMessage(messages.saveExport),
          }}
        />,
      );
    }
  };

  buildFormSections = () => {
    const sections: McsFormSection[] = [];
    const general = {
      id: 'general',
      title: messages.sectionTitleGeneral,
      component: <GeneralFormSection />,
    };

    const query = {
      id: 'query',
      title: messages.sectionTitleQuery,
      component: this.buildQueryComponent(),
    };
    sections.push(general);
    sections.push(query);
    return sections;
  };

  render() {
    const { handleSubmit, onSave } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: this.props.breadCrumbPaths,
      message: messages.saveExport,
      onClose: this.props.onClose,
    };
    const sections = this.buildFormSections();
    const sideBarProps: SidebarWrapperProps = {
      items: sections.map(s => ({ sectionId: s.id, title: s.title })),
      scrollId: FORM_ID,
    };

    const renderedSections = sections.map((section, index) => {
      return (
        <div key={section.id}>
          <div key={section.id} id={section.id}>
            {section.component}
          </div>
          {index !== sections.length - 1 && <hr />}
        </div>
      );
    });
    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit(onSave as any) as any}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <div className="placement-list-form">{renderedSections}</div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, ExportEditFormProps>(
  injectIntl,
  injectDatamart,
  reduxForm<ExportFormData, ExportEditFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(ExportEditForm);
