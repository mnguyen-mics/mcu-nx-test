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

export interface CustomActionLayoutInformation {
  pluginLayout?: PluginLayout;
  customActionProperties?: PropertyResourceShape[];
}

export interface ExtendedCustomActionInformation {
  customAction: CustomActionResource;
  layoutInformation?: CustomActionLayoutInformation;
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
  isFetchingCustomActions: boolean;
  isFetchingCustomActionProperties: boolean;
}

class CustomActionAutomationForm extends React.Component<Props, State> {
  @lazyInject(TYPES.ICustomActionService)
  private _customActionService: ICustomActionService;

  constructor(props: Props) {
    super(props);

    this.state = {
      extendedCustomActionsInformation: [],
      isFetchingCustomActions: false,
      isFetchingCustomActionProperties: false,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
      initialValues,
    } = this.props;

    if (initialValues.extendedCustomActionsInformation) {
      if (initialValues.customActionId) {
        this.onCustomActionChange(
          initialValues.customActionId,
          initialValues.extendedCustomActionsInformation,
        );
      } else {
        this.setState({
          extendedCustomActionsInformation: initialValues.extendedCustomActionsInformation,
          isFetchingCustomActions: false,
          isFetchingCustomActionProperties: false,
        });
      }
    } else {
      const customActionId = initialValues.editExistingNode
        ? initialValues.customActionId
        : undefined;
      this.fetchCustomActions(organisationId, customActionId);
    }
  }

  componentDidUpdate(previousProps: Props) {
    const { formValues: previousFormValues } = previousProps;
    const { formValues } = this.props;

    if (formValues && previousFormValues) {
      const { customActionId: previousCustomActionId } = previousFormValues;
      const { customActionId } = formValues;
      if (customActionId !== previousCustomActionId && customActionId) {
        this.onCustomActionChange(customActionId);
      }
    }
  }

  onCustomActionChange = (
    customActionId: string,
    extendedCustomActionsInformation?: ExtendedCustomActionInformation[],
  ) => {
    const { extendedCustomActionsInformation: customActionsFromState } = this.state;
    const customActionsInfo = extendedCustomActionsInformation
      ? extendedCustomActionsInformation
      : customActionsFromState;

    const foundCustomActionInfo = customActionsInfo.find(
      customActionInfo => customActionInfo.customAction.id === customActionId,
    );

    if (foundCustomActionInfo) {
      if (foundCustomActionInfo.layoutInformation) {
        this.dispatchProperties(foundCustomActionInfo.layoutInformation.customActionProperties);
      } else {
        this.fetchCustomActionLayoutInformation(foundCustomActionInfo.customAction);
      }
    }
    if (extendedCustomActionsInformation) {
      this.setState({
        extendedCustomActionsInformation: extendedCustomActionsInformation,
        isFetchingCustomActions: false,
        isFetchingCustomActionProperties: false,
      });
    }
  };

  dispatchProperties = (customActionProperties: PropertyResourceShape[] | undefined) => {
    const { dispatch } = this.props;
    if (customActionProperties) {
      const modifiedProps: { [index: string]: any } = {};
      customActionProperties.forEach(prop => {
        modifiedProps[prop.technical_name] = prop;
      });
      if (dispatch) dispatch(change(FORM_ID, 'properties', modifiedProps));
    }
  };

  dispatchExtendedCustomActionsInformation = (
    extendedCustomActionsInformation: ExtendedCustomActionInformation[],
  ) => {
    const { dispatch } = this.props;
    if (dispatch)
      dispatch(
        change(FORM_ID, 'extendedCustomActionsInformation', extendedCustomActionsInformation),
      );
  };

  fetchCustomActionLayoutInformation = (customActionResource: CustomActionResource) => {
    const { notifyError } = this.props;
    const { extendedCustomActionsInformation } = this.state;

    this.setState({ isFetchingCustomActionProperties: true }, () => {
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

      Promise.all([pluginLayoutP, propertiesP])
        .then(resPromises => {
          const customActionInformation: ExtendedCustomActionInformation = {
            customAction: customActionResource,
            layoutInformation: {
              pluginLayout: resPromises[0] !== null ? resPromises[0] : undefined,
              customActionProperties: resPromises[1],
            },
          };

          const returnedExtendedCustomActionsInformation: ExtendedCustomActionInformation[] =
            extendedCustomActionsInformation.map(extendedCustomActionInformation => {
              if (extendedCustomActionInformation.customAction.id !== customActionResource.id) {
                return extendedCustomActionInformation;
              } else return customActionInformation;
            });
          this.dispatchProperties(
            customActionInformation.layoutInformation?.customActionProperties,
          );
          this.dispatchExtendedCustomActionsInformation(returnedExtendedCustomActionsInformation);

          this.setState({
            isFetchingCustomActionProperties: false,
            extendedCustomActionsInformation: returnedExtendedCustomActionsInformation,
          });
        })
        .catch(err => {
          notifyError(err);
          this.setState({ isFetchingCustomActionProperties: false });
        });
    });
  };

  fetchCustomActions = (organisationId: string, customActionId?: string) => {
    // The case when customActionId is defined is when we have to fetch only
    // one customAction, for example in the view mode when the form is
    // disabled.
    // Otherwise, we have to fetch multiple custom actions.
    const { notifyError } = this.props;

    this.setState({ isFetchingCustomActions: true }, () => {
      const customActionsP: Promise<CustomActionResource[]> = customActionId
        ? this._customActionService
            .getInstanceById(customActionId)
            .then(resCustomAction => [resCustomAction.data])
        : this._customActionService
            .getInstances({ organisation_id: +organisationId })
            .then(resCustomActions => resCustomActions.data);

      customActionsP
        .then(customActions => {
          const extendedCustomActionsInformation: ExtendedCustomActionInformation[] =
            customActions.map((customActionResource: CustomActionResource) => {
              return {
                customAction: customActionResource,
              };
            });
          this.dispatchExtendedCustomActionsInformation(extendedCustomActionsInformation);
          this.setState(
            {
              isFetchingCustomActions: false,
              extendedCustomActionsInformation: extendedCustomActionsInformation,
            },
            () => {
              if (customActionId) {
                const associatedCustomAction = customActions.find(
                  customAction => customAction.id === customActionId,
                );
                if (associatedCustomAction)
                  this.fetchCustomActionLayoutInformation(associatedCustomAction);
              }
            },
          );
        })
        .catch(err => {
          notifyError(err);
          this.setState({
            isFetchingCustomActions: false,
            extendedCustomActionsInformation: [],
          });
        });
    });
  };

  buildFormSections = (disabled: boolean) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { extendedCustomActionsInformation, isFetchingCustomActionProperties } = this.state;

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
            isFetchingCustomActionProperties={isFetchingCustomActionProperties}
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

    const { isFetchingCustomActions } = this.state;

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

    const sectionsOrSpin = isFetchingCustomActions ? <Spin /> : renderedSections;

    return (
      <Layout className='edit-layout mcs-legacy_form_container'>
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
