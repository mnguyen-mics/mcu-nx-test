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
import { Layout } from 'antd';
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

import * as SessionSelectors from '../../../state/Session/selectors';
import AutomationPreviewFormSection from './sections/AutomationPreviewFormSection';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import AngularWidget from './sections/AutomationFormSection';
import DatamartService from '../../../services/DatamartService';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IScenarioService } from '../../../services/ScenarioService';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
>;

export interface AutomationEditFormProps
  extends Omit<ConfigProps<AutomationFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
  scenarioContainer: any;
  datamart?: DatamartResource;
}

interface MapStateToProps {
  hasDatamarts: (organisationId: string) => boolean;
  formValues: AutomationFormData;
}

interface State {
  datamartResource?: DatamartResource;
}

type Props = InjectedFormProps<AutomationFormData, AutomationEditFormProps> &
  AutomationEditFormProps &
  MapStateToProps &
  InjectedIntlProps &
  RouteComponentProps<EditAutomationParam>;

const FORM_ID = 'automationForm';

class AutomationEditForm extends React.Component<Props, State> {
  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  constructor(props: Props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    const {
      match: {
        params: { automationId },
      },
    } = this.props;
    if (automationId) {
      this._scenarioService.getScenario(automationId).then(res => {
        DatamartService.getDatamart(res.data.datamart_id).then(resp => {
          this.setState({
            datamartResource: resp.data,
          });
        });
      });
    }
  }
  render() {
    const {
      handleSubmit,
      breadCrumbPaths,
      close,
      datamart,
      change,
      formValues,
    } = this.props;

    const { datamartResource } = this.state;

    const datamartToUse = datamart ? datamart : datamartResource;

    const datamartStorageModelVersion = datamartToUse
      ? datamartToUse.storage_model_version
      : '';

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
      component: datamartToUse ? (
        datamartStorageModelVersion === 'v201709' ? (
          <AutomationPreviewFormSection
            datamartId={datamartToUse.id}
            automationFormData={formValues}
            formChange={change}
          />
        ) : (
          <AngularWidget
            scenarioContainer={this.props.scenarioContainer}
            organisationId={this.props.match.params.organisationId}
            datamartId={datamartToUse.id}
          />
        )
      ) : (
        <div />
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

const mapStateToProps = (state: any) => ({
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
