import * as React from 'react';
import { Layout, Row, Col } from 'antd';
import { FormLayoutActionbar } from '../../../../../components/Layout';
import { AUDIENCE_FEATURE_FORM_ID, AudienceFeatureFormData } from './domain';
import { ConfigProps, Form, InjectedFormProps, reduxForm, getFormValues } from 'redux-form';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import { McsFormSection } from '../../../../../utils/FormHelper';
import AudienceFeatureGeneralSection from './Sections/AudienceFeatureGeneralSection';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { messages } from '../messages';
import { compose } from 'recompose';
import AudienceFeaturePreview from './Sections/AudienceFeaturePreview';
import QueryFormSection from './Sections/AudienceFeatureQueryFormSection';
import { SchemaItem } from '../../../../Audience/AdvancedSegmentBuilder/domain';
import { connect } from 'react-redux';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

const Content = Layout.Content;

export interface AudienceFeatureFormProps
  extends Omit<ConfigProps<AudienceFeatureFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  schema?: SchemaItem;
}

interface MapStateToProps {
  formValues?: AudienceFeatureFormData;
}

type Props = InjectedFormProps<AudienceFeatureFormData, AudienceFeatureFormProps> &
  AudienceFeatureFormProps &
  MapStateToProps &
  InjectedIntlProps;

class AudienceFeatureForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const { handleSubmit, breadCrumbPaths, close, change, schema, formValues } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: AUDIENCE_FEATURE_FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.audienceFeatureSave,
      onClose: close,
      buttonHTMLType: 'button',
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'general',
      title: messages.audienceFeatureSectionGeneralTitle,
      component: (
        <AudienceFeatureGeneralSection displayAdvancedSection={false} audienceFeatureFolders={[]} />
      ),
    });

    sections.push({
      id: 'query',
      title: messages.audienceFeatureAssociatedQuery,
      component: (
        <QueryFormSection
          formChange={change}
          associatedQuery={formValues?.object_tree_expression}
        />
      ),
    });

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
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit as any}>
            <Content
              id={AUDIENCE_FEATURE_FORM_ID}
              className='mcs-content-container mcs-form-container'
            >
              <Row>
                <Col className='mcs-audienceFeature_formColumn' span={12}>
                  {renderedSections}
                </Col>
                <Col className='mcs-audienceFeature_formColumn' span={12}>
                  <AudienceFeaturePreview schema={schema} formValues={formValues} />
                </Col>
              </Row>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(AUDIENCE_FEATURE_FORM_ID)(state),
});

export default compose<Props, AudienceFeatureFormProps>(
  injectIntl,
  reduxForm({
    form: AUDIENCE_FEATURE_FORM_ID,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
)(AudienceFeatureForm);
