import * as React from 'react';
import { Layout, Row, Col } from 'antd';
import { FormLayoutActionbar } from '../../../../../components/Layout';
import { AUDIENCE_BUILDER_FORM_ID, AudienceBuilderFormData } from './domain';
import {
  ConfigProps,
  Form,
  InjectedFormProps,
  reduxForm,
  getFormValues,
} from 'redux-form';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import { McsFormSection } from '../../../../../utils/FormHelper';
import AudienceBuilderGeneralSection from './Sections/AudienceBuilderGeneralSection';
import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { messages } from '../messages';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';

const Content = Layout.Content;

export interface AudienceBuilderFormProps
  extends Omit<ConfigProps<AudienceBuilderFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
}

interface MapStateToProps {
  formValues?: AudienceBuilderFormData;
}

type Props = InjectedFormProps<
  AudienceBuilderFormData,
  AudienceBuilderFormProps
> &
  AudienceBuilderFormProps &
  MapStateToProps &
  InjectedIntlProps;

class AudienceBuilderForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      handleSubmit,
      breadCrumbPaths,
      close,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: AUDIENCE_BUILDER_FORM_ID,
      paths: breadCrumbPaths,
      message: messages.audienceBuilderSave,
      onClose: close,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'general',
      title: messages.audienceBuilderSectionGeneralTitle,
      component: <AudienceBuilderGeneralSection />,
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
              id={AUDIENCE_BUILDER_FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <Row>
                <Col className="mcs-audienceBuilder_formColumn" span={12}>{renderedSections}</Col>
              </Row>
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(AUDIENCE_BUILDER_FORM_ID)(state),
});

export default compose<Props, AudienceBuilderFormProps>(
  injectIntl,
  reduxForm({
    form: AUDIENCE_BUILDER_FORM_ID,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
)(AudienceBuilderForm);
