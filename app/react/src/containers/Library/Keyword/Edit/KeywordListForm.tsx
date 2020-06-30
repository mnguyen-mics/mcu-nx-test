import * as React from 'react';
import { Layout } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';
import { Omit, compose } from 'recompose';
import {
  ConfigProps,
  InjectedFormProps,
  Form,
  reduxForm,
  GenericFieldArray,
  FieldArray,
  Field,
} from 'redux-form';
import { defineMessages } from 'react-intl';

import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import { KeywordListFormData } from './domain';
import {
  McsFormSection,
  ReduxFormChangeProps,
} from '../../../../utils/FormHelper';
import GeneralFormSection from './Sections/GeneralFormSection';
import KeywordsFormSection from './Sections/KeywordsFormSection';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const KeywordsFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  ReduxFormChangeProps
>;

const FORM_ID = 'keywordListForm';

const messages = defineMessages({
  saveKeywordList: {
    id: 'keywordList.form.save.button',
    defaultMessage: 'Save',
  },
  sectionTitleGeneral: {
    id: 'keywordList.form.sectionTitleGeneral',
    defaultMessage: 'General Informations',
  },
  sectionTitleKeywords: {
    id: 'keywordList.form.sectionTitleKeywords',
    defaultMessage: 'Keywords',
  },
});

export interface KeywordListFormProps
  extends Omit<ConfigProps<KeywordListFormData>, 'form'> {
  save: (formData: KeywordListFormData) => void;
  close: () => void;
  breadCrumbPaths: Path[];
}
interface KeywordListFormState {}

export type JoinedProps = KeywordListFormProps &
  InjectedFormProps<KeywordListFormData, KeywordListFormProps>;

class KeywordListForm extends React.Component<
  JoinedProps,
  KeywordListFormState
> {
  constructor(props: JoinedProps) {
    super(props);
  }

  buildFormSections = () => {
    const {} = this.props;

    const sections: McsFormSection[] = [];

    const general = {
      id: 'general',
      title: messages.sectionTitleGeneral,
      component: <GeneralFormSection />,
    };

    const keywords = {
      id: 'keywords',
      title: messages.sectionTitleKeywords,
      component: (
        <KeywordsFieldArray
          name="keywords"
          component={KeywordsFormSection}
          formChange={this.props.change}
          rerenderOnEveryChange={true}
        />
      ),
    };

    sections.push(general);
    sections.push(keywords);

    return sections;
  };

  render() {
    const { breadCrumbPaths, handleSubmit, save, close } = this.props;
    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.saveKeywordList,
      onClose: close,
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
            onSubmit={handleSubmit(save) as any}
          >
            {/* this button enables submit on enter */}
            <button type="submit" style={{ display: 'none' }} />
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <div className="ad-group-form">{renderedSections}</div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<JoinedProps, KeywordListFormProps>(
  reduxForm<KeywordListFormData, KeywordListFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(KeywordListForm);
