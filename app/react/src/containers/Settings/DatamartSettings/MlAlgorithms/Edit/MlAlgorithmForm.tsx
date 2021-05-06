import * as React from 'react';
import { ConfigProps, reduxForm, InjectedFormProps, Form } from 'redux-form';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import messages from '../messages';
import { McsFormSection } from '../../../../../utils/FormHelper';
import GeneralFormSection from './Section/GeneralFormSection';
import { Omit } from '../../../../../utils/Types';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import { Layout } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';
import { MlAlgorithmFormData } from '../domain';

export const FORM_ID = 'mlAlgorithmForm';

const Content = (Layout.Content as unknown) as React.ComponentClass<BasicProps & { id: string }>;

interface MlAlgorithmFormProps extends Omit<ConfigProps<MlAlgorithmFormData>, 'form'> {
  onClose: () => void;
  onSave: (formData: MlAlgorithmFormData) => void;
  breadCrumbPaths: React.ReactNode[];
}

type Props = InjectedFormProps<MlAlgorithmFormData, MlAlgorithmFormProps> &
  MlAlgorithmFormProps &
  RouteComponentProps<{
    organisationId: string;
    mlAlgorithmId: string;
  }> &
  InjectedIntlProps;

class MlAlgorithmForm extends React.Component<Props> {
  buildFormSections = () => {
    const sections: McsFormSection[] = [];
    const general = {
      id: 'general',
      title: messages.sectionTitleGeneral,
      component: <GeneralFormSection />,
    };

    sections.push(general);
    return sections;
  };

  render() {
    const { handleSubmit, onSave } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: this.props.breadCrumbPaths,
      message: messages.saveMlAlgorithm,
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
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit(onSave as any) as any}>
            <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
              <div className='placement-list-form'>{renderedSections}</div>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, MlAlgorithmFormProps>(
  withRouter,
  injectIntl,
  reduxForm<MlAlgorithmFormData, MlAlgorithmFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(MlAlgorithmForm);
