import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect, DispatchProp } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { ConfigProps, getFormValues, InjectedFormProps, reduxForm, change } from 'redux-form';
import { FormSection } from '../../../../../../components/Form';
import { MicsReduxState } from '../../../../../../utils/ReduxHelper';
import { FORM_ID, CustomActionAutomationFormData } from '../domain';
import { StorylineNodeModel } from '../../../domain';
import { Layout, Spin } from 'antd';
import { Form } from '@ant-design/compatible';
import { FormLayoutActionbar } from '../../../../../../components/Layout';
import { FormLayoutActionbarProps } from '../../../../../../components/Layout/FormLayoutActionbar';
import messages from './messages';
import { McsFormSection } from '../../../../../../utils/FormHelper';
import GeneralInformationFormSection from './GeneralInformationFormSection';
import CustomActionInstanceFormSection from './CustomActionInstanceFormSection';
import { CustomActionResource } from '../../../../../../models/Plugins';
import { PluginLayout } from '../../../../../../models/plugin/PluginLayout';
import { lazyInject } from '../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../constants/types';
import { PropertyResourceShape } from '../../../../../../models/plugin';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import { ICustomActionService } from '../../../../../../services/CustomActionService';

const { Content } = Layout;

export interface ExtendedCustomActionInformation {
  customAction: CustomActionResource;
  pluginLayout?: PluginLayout;
  customActionProperties?: PropertyResourceShape[];
}

export interface CustomActionAutomationFormProps
  extends Omit<ConfigProps<CustomActionAutomationFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  storylineNodeModel: StorylineNodeModel;
  disabled?: boolean;
}

interface MapStateToProps {
  formValues: CustomActionAutomationFormData;
}

type Props = InjectedFormProps<CustomActionAutomationFormData, CustomActionAutomationFormProps> &
  DispatchProp<any> &
  CustomActionAutomationFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  MapStateToProps &
  InjectedNotificationProps;

interface State {
  extendedCustomActionsInformation: ExtendedCustomActionInformation[];
  fetchingCustomActions: boolean;
}

class CustomActionAutomationForm extends React.Component<Props, State> {
  @lazyInject(TYPES.ICustomActionService)
  private _customActionService: ICustomActionService;

  constructor(props: Props) {
    super(props);

    this.state = {
      extendedCustomActionsInformation: [],
      fetchingCustomActions: true,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      initialValues,
      dispatch,
    } = this.props;

    if (initialValues.extendedCustomActionsInformation) {
      if (initialValues.customActionId) {
        this.dispatchPropertiesToBeDisplayed(
          initialValues.customActionId,
          initialValues.extendedCustomActionsInformation,
        );
      }
      this.setState({
        extendedCustomActionsInformation: initialValues.extendedCustomActionsInformation,
        fetchingCustomActions: false,
      });
    } else {
      this.setState({ fetchingCustomActions: true }, () => {
        this.getExtendedCustomActionsInformation(organisationId, initialValues.customActionId).then(
          (extendedCustomActionsInformation: ExtendedCustomActionInformation[]) => {
            if (initialValues.customActionId) {
              this.dispatchPropertiesToBeDisplayed(
                initialValues.customActionId,
                extendedCustomActionsInformation,
              );
            }

            if (dispatch)
              dispatch(
                change(
                  FORM_ID,
                  'extendedCustomActionsInformation',
                  extendedCustomActionsInformation,
                ),
              );
            this.setState({
              extendedCustomActionsInformation,
              fetchingCustomActions: false,
            });
          },
        );
      });
    }
  }

  componentDidUpdate(previousProps: Props) {
    const { formValues: previousFormValues } = previousProps;
    const { formValues } = this.props;

    const { extendedCustomActionsInformation } = this.state;

    if (formValues && previousFormValues) {
      const { customActionId: previousCustomActionId } = previousFormValues;
      const { customActionId } = formValues;
      if (customActionId !== previousCustomActionId && customActionId) {
        this.dispatchPropertiesToBeDisplayed(customActionId, extendedCustomActionsInformation);
      }
    }
  }

  dispatchPropertiesToBeDisplayed = (
    customActionId: string,
    extendedCustomActionsInformation: ExtendedCustomActionInformation[],
  ) => {
    const { dispatch } = this.props;

    const customActionInfoOpt = extendedCustomActionsInformation.find(
      extendedCustomActionInformation => {
        return extendedCustomActionInformation.customAction.id === customActionId;
      },
    );

    if (dispatch && customActionInfoOpt && customActionInfoOpt.customActionProperties) {
      const modifiedProps: { [index: string]: any } = {};
      customActionInfoOpt.customActionProperties.forEach(prop => {
        modifiedProps[prop.technical_name] = prop;
      });
      if (dispatch) dispatch(change(FORM_ID, 'properties', modifiedProps));
    }
  };

  getExtendedCustomActionsInformation = (
    organisationId: string,
    customActionId?: string,
  ): Promise<ExtendedCustomActionInformation[]> => {
    const { notifyError } = this.props;

    const customActionsP: Promise<CustomActionResource[]> = customActionId
      ? this._customActionService
          .getInstanceById(customActionId)
          .then(resCustomAction => [resCustomAction.data])
      : this._customActionService
          .getInstances({ organisation_id: +organisationId })
          .then(resCustomActions => resCustomActions.data);

    return customActionsP
      .then(customActions => {
        return Promise.all(
          customActions.map((customActionResource: CustomActionResource) => {
            const pluginLayoutP = this._customActionService.getLocalizedPluginLayout(
              customActionResource.id,
            );

            const propertiesP = this._customActionService
              .getInstanceProperties(customActionResource.id)
              .then(resProperties => resProperties.data)
              .catch(err => {
                notifyError(err);
                return [];
              });

            return Promise.all([pluginLayoutP, propertiesP]).then(resPromises => {
              const extendedCustomActionInformation: ExtendedCustomActionInformation = {
                customAction: customActionResource,
                pluginLayout: resPromises[0] !== null ? resPromises[0] : undefined,
                customActionProperties: resPromises[1],
              };

              return extendedCustomActionInformation;
            });
          }),
        );
      })
      .catch(err => {
        notifyError(err);
        return [];
      });
  };

  buildFormSections = (disabled: boolean) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { extendedCustomActionsInformation } = this.state;

    const sections: McsFormSection[] = [];

    const generalSection = {
      id: 'generalSection',
      title: messages.sectionGeneralTitle,
      component: (
        <GeneralInformationFormSection
          initialValues={this.props.initialValues}
          organisationId={organisationId}
          disabled={disabled}
          extendedCustomActionsInformation={extendedCustomActionsInformation}
        />
      ),
    };

    sections.push(generalSection);

    const customActionId = this.props.formValues?.customActionId;

    if (customActionId) {
      const pluginInstanceSection = {
        id: 'pluginInstance',
        title: messages.sectionPluginSettingsTitle,
        component: (
          <CustomActionInstanceFormSection
            customActionId={customActionId}
            extendedCustomActionsInformation={extendedCustomActionsInformation}
            organisationId={organisationId}
            disabled={true}
          />
        ),
      };

      sections.push(pluginInstanceSection);
    }

    return sections;
  };

  render() {
    const {
      breadCrumbPaths,
      handleSubmit,
      close,
      disabled,
      initialValues: { editExistingNode },
    } = this.props;

    const { fetchingCustomActions } = this.state;

    const calculatedDisabled = disabled || !!editExistingNode;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.save,
      onClose: close,
      disabled: calculatedDisabled,
    };

    const sections = this.buildFormSections(calculatedDisabled);

    const renderedSections = sections.map((section, index) => {
      return (
        <div key={section.id}>
          <div key={section.id} id={section.id}>
            {section.component}
          </div>
        </div>
      );
    });

    const sectionsOrSpin = fetchingCustomActions ? <Spin /> : renderedSections;

    return (
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit} layout='vertical'>
            <Content
              id={FORM_ID}
              className='mcs-content-container mcs-form-container automation-form'
            >
              <FormSection
                title={messages.sectionGeneralTitle}
                subtitle={messages.sectionGeneralSubtitle}
              />
              {sectionsOrSpin}
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

export default compose<Props, CustomActionAutomationFormProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  connect(mapStateToProps),
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(CustomActionAutomationForm);
