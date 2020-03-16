import * as React from 'react';
import {
  Form,
  reduxForm,
  InjectedFormProps,
  ConfigProps,
  getFormValues,
} from 'redux-form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Layout, Alert } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { BasicProps } from 'antd/lib/layout/layout';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Path } from '../../../components/ActionBar';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../components/Layout/FormLayoutActionbar';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../components/Layout/ScrollspySider';
import messages from './messages';
import { AutomationFormData, EditAutomationParam } from './domain';
import { Omit } from '../../../utils/Types';
import GeneralFormSection from './sections/GeneralFormSection';
import { McsFormSection } from '../../../utils/FormHelper';

import * as SessionSelectors from '../../../redux/Session/selectors';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { MicsReduxState } from '../../../utils/ReduxHelper';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

export interface AutomationEditFormProps
  extends Omit<ConfigProps<AutomationFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
  datamart?: DatamartResource;
}

interface MapStateToProps {
  hasDatamarts: (organisationId: string) => boolean;
  formValues: AutomationFormData;
}

type Props = InjectedFormProps<AutomationFormData, AutomationEditFormProps> &
  AutomationEditFormProps &
  MapStateToProps &
  InjectedIntlProps &
  RouteComponentProps<EditAutomationParam>;

const FORM_ID = 'automationForm';

class AutomationEditForm extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const { handleSubmit, breadCrumbPaths, close, datamart, intl } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.saveAutomation,
      onClose: close,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'general',
      title: messages.sectionGeneralTitle,
      component: <GeneralFormSection />,
    });

    sections.push({
      id: 'automation',
      title: messages.sectionTitle1,
      component:
        datamart && datamart.storage_model_version === 'v201506' ? (
          <Alert
            message={intl.formatMessage(messages.noMoreSupported)}
            type="warning"
          />
        ) : (
          undefined
        ),
    });

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
            onSubmit={handleSubmit as any}
          >
            {/* this button enables submit on enter */}
            <button type="submit" style={{ display: 'none' }} />
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
  hasDatamarts: SessionSelectors.hasDatamarts(state),
});

export default compose<Props, AutomationEditFormProps>(
  injectIntl,
  withRouter,
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
)(AutomationEditForm);
