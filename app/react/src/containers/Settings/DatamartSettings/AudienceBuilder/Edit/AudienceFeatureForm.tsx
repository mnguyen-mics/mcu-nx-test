import * as React from 'react';
import { Layout, Row, Col } from 'antd';
import { FormLayoutActionbar } from '../../../../../components/Layout';
import { FORM_ID, AudienceFeatureFormData } from './domain';
import {
  ConfigProps,
  Form,
  InjectedFormProps,
  reduxForm,
  getFormValues,
} from 'redux-form';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import { McsFormSection } from '../../../../../utils/FormHelper';
import GeneralFormSection from './Sections/GeneralFormSection';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { messages } from '../messages';
import { compose } from 'recompose';
import AudienceFeaturePreview from './Sections/AudienceFeaturePreview';
import QueryFormSection from './Sections/QueryFormSection';
import { SchemaItem } from '../../../../QueryTool/JSONOTQL/domain';
import { connect } from 'react-redux';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';

const Content = Layout.Content;

export interface AudienceFeatureFormProps
  extends Omit<ConfigProps<AudienceFeatureFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
  schema?: SchemaItem;
}

interface MapStateToProps {
  formValues: AudienceFeatureFormData;
}

type Props = InjectedFormProps<
  AudienceFeatureFormData,
  AudienceFeatureFormProps
> &
  AudienceFeatureFormProps &
  MapStateToProps &
  InjectedIntlProps;

class AudienceFeatureForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      handleSubmit,
      breadCrumbPaths,
      close,
      change,
      schema,
      formValues,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.save,
      onClose: close,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'general',
      title: messages.sectionGeneralTitle,
      component: <GeneralFormSection />,
    });

    sections.push({
      id: 'query',
      title: messages.associatedQuery,
      component: (
        <QueryFormSection
          formChange={change}
          associatedQuery={formValues.object_tree_expression}
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
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit as any}
          >
            {/* this button enables submit on enter */}
            <button type="submit" style={{ display: 'none' }} />
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <Row>
                <Col className="mcs-audienceFeature_formColumn" span={12}>{renderedSections}</Col>
                <Col className="mcs-audienceFeature_formColumn" span={12}>
                  <AudienceFeaturePreview
                    schema={schema}
                    associatedQuery={formValues.object_tree_expression}
                  />
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
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, AudienceFeatureFormProps>(
  injectIntl,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
)(AudienceFeatureForm);
