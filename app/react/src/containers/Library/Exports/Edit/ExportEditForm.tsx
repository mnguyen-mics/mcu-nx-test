import * as React from 'react';
import { Layout } from 'antd';
import { compose } from 'recompose';
import {
  Form,
  reduxForm,
  InjectedFormProps,
  ConfigProps,
  Field,
} from 'redux-form';
import { BasicProps } from 'antd/lib/layout/layout';
import { withRouter, RouteComponentProps } from 'react-router';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';

import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';
import {
  McsFormSection,
} from '../../../../utils/FormHelper';
import { Path } from '../../../../components/ActionBar';
import GeneralFormSection from './Sections/GeneralFormSection';
import OTQLInputEditor, { OTQLInputEditorProps } from '../../../Audience/Segments/Edit/Sections/query/OTQL'
import SelectorQL from '../../../Audience/Segments/Edit/Sections/query/SelectorQL'
import { Omit } from 'antd/lib/form/Form';
import { ExportFormData } from './domain';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart';
import { FieldCtor, FormSection } from '../../../../components/Form';

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
    defaultMessage: 'Create the query of objects your want to export from your Datamart',
  },
  saveExport: {
    id: 'save.placement.list',
    defaultMessage: 'Save',
  },
  editExport: {
    id: 'exports.form.edit.title',
    defaultMessage: 'Edit {name}',
  },
  newExoport: {
    id: 'exports.form.new.title',
    defaultMessage: 'New Export',
  },
});

interface ExportEditFormProps
  extends Omit<ConfigProps<ExportFormData>, 'form'> {
  onClose: () => void;
  onSave: (formData: ExportFormData) => void;
  breadCrumbPaths: Path[];
}

const FormOTQL: FieldCtor<OTQLInputEditorProps> = Field;

interface ExportEditFormState {}

type Props = InjectedFormProps<ExportFormData, ExportEditFormProps> &
  ExportEditFormProps &
  RouteComponentProps<{ organisationId: string; exportId: string }> &
  InjectedIntlProps &
  InjectedDatamartProps;

class PlacementListForm extends React.Component<Props, ExportEditFormState> {

  generateUserQueryTemplate = (renderedSection: JSX.Element) => {
    return (
      <div>
        <FormSection
          title={messages.sectionTitleQuery}
          subtitle={messages.sectionSubTitleQuery}
        />
        {renderedSection}
      </div>
    )
  }

  buildQueryComponent = () => {
    const {
      datamart,
      match: {
        params: {
          organisationId
        }
      },
      intl
    } = this.props;

    if (datamart.storage_model_version === 'v201506') {
      return this.props.initialValues.query ? this.generateUserQueryTemplate(<SelectorQL datamartId={datamart.id} organisationId={organisationId} queryContainer={this.props.initialValues.query} />) : null
    } else {
      return this.generateUserQueryTemplate(<FormOTQL
      name={'query.query_text'}
      component={OTQLInputEditor}
      formItemProps={{
        label: intl.formatMessage(messages.saveExport),
        required: true,
      }}
      helpToolTipProps={{
        title: intl.formatMessage(messages.saveExport),
      }}
    />)
      
    }
  }

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
      component: this.buildQueryComponent()
    }
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
  withRouter,
  injectIntl,
  injectDatamart,
  reduxForm<ExportFormData, ExportEditFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(PlacementListForm);
