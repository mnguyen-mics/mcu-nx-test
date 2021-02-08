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
import { DealListFormData } from './domain';
import {
  McsFormSection,
  ReduxFormChangeProps,
} from '../../../../utils/FormHelper';
import GeneralFormSection from './Sections/GeneralFormSection';
import DealFormSection from './Sections/DealFormSection';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../components/Layout/ScrollspySider';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

const DealsFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  ReduxFormChangeProps
>;

const FORM_ID = 'dealListForm';

const messages = defineMessages({
  saveDealList: {
    id: 'dealList.form.save.button',
    defaultMessage: 'Save',
  },
  sectionTitleGeneral: {
    id: 'dealList.form.sectionTitleGeneral',
    defaultMessage: 'General Information',
  },
  sectionTitleKeywords: {
    id: 'dealList.form.sectionTitleDeals',
    defaultMessage: 'Deals',
  },
});

interface DealListFormProps
  extends Omit<ConfigProps<DealListFormData>, 'form'> {
  save: (formData: DealListFormData) => void;
  close: () => void;
  breadCrumbPaths: Path[];
}
interface DealListFormState {}

type JoinedProps = DealListFormProps &
  InjectedFormProps<DealListFormData, DealListFormProps>;

class DealListForm extends React.Component<
  JoinedProps,
  DealListFormState
> {
  constructor(props: JoinedProps) {
    super(props);
  }

  buildFormSections = () => {

    const sections: McsFormSection[] = [];

    const general = {
      id: 'general',
      title: messages.sectionTitleGeneral,
      component: <GeneralFormSection />,
    };

    const deals = {
      id: 'deals',
      title: messages.sectionTitleKeywords,
      component: (
        <DealsFieldArray
          name="deals"
          component={DealFormSection}
          formChange={this.props.change}
          rerenderOnEveryChange={true}
        />
      ),
    };

    sections.push(general);
    sections.push(deals);

    return sections;
  };

  render() {
    const { breadCrumbPaths, handleSubmit, save, close } = this.props;
    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.saveDealList,
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

export default compose<JoinedProps, DealListFormProps>(
  reduxForm<DealListFormData, DealListFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(DealListForm);
