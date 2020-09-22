import { Path } from '@mediarithmics-private/mcs-components-library/lib/components/action-bar/Actionbar';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import {
  ConfigProps,
  getFormValues,
  InjectedFormProps,
  reduxForm,
} from 'redux-form';
import { MicsReduxState } from '../../../../../../utils/ReduxHelper';
import { FORM_ID, CustomActionAutomationFormData } from '../domain';
import { StorylineNodeModel } from '../../../domain';
import { Form, Layout, Spin } from 'antd';
import { FormLayoutActionbar } from '../../../../../../components/Layout';
import { FormLayoutActionbarProps } from '../../../../../../components/Layout/FormLayoutActionbar';
import messages from './messages';
import { McsFormSection } from '../../../../../../utils/FormHelper';
import GeneralInformationFormSection from './GeneralInformationFormSection';
import PluginInstanceFormSection from './PluginInstanceFormSection';
import { PluginResource } from '../../../../../../models/Plugins';
import { PluginLayout } from '../../../../../../models/plugin/PluginLayout';
import { lazyInject } from '../../../../../../config/inversify.config';
import { TYPES } from '../../../../../../constants/types';
import { IPluginService } from '../../../../../../services/PluginService';
import { PropertyResourceShape } from '../../../../../../models/plugin';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';

const { Content } = Layout;

export interface ExtendedPluginInformation {
  plugin: PluginResource;
  pluginLayout?: PluginLayout;
  pluginProperties?: PropertyResourceShape[];
}

export interface CustomActionAutomationFormProps
  extends Omit<ConfigProps<CustomActionAutomationFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
  storylineNodeModel: StorylineNodeModel;
  disabled?: boolean;
}

interface MapStateToProps {
  formValues: CustomActionAutomationFormData;
}

type Props = InjectedFormProps<
  CustomActionAutomationFormData,
  CustomActionAutomationFormProps
> &
  CustomActionAutomationFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  MapStateToProps &
  InjectedNotificationProps;

interface State {
  extendedPluginsInformation: ExtendedPluginInformation[];
  fetchingPluginVersions: boolean;
}

class CustomActionAutomationForm extends React.Component<Props, State> {
  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor(props: Props) {
    super(props);

    this.state = {
      extendedPluginsInformation: [],
      fetchingPluginVersions: true,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    this.setState({ fetchingPluginVersions: true }, () => {
      this.getExtendedPluginVersionsWithLayouts(organisationId).then(
        (extendedPluginsInformation: ExtendedPluginInformation[]) => {
          this.setState({
            extendedPluginsInformation,
            fetchingPluginVersions: false,
          });
        },
      );
    });
  }

  getExtendedPluginVersionsWithLayouts = (
    organisationId: string,
  ): Promise<ExtendedPluginInformation[]> => {
    const { notifyError } = this.props;
    return this._pluginService
      .getPlugins({
        organisation_id: +organisationId,
        plugin_type: 'SCENARIO_CUSTOM_ACTION',
      })
      .then(resPlugins => {
        const pluginsPromises = resPlugins.data.map(plugin => {
          const pluginId = plugin.id;
          const currentPluginVersionId = plugin.current_version_id;
          const pluginLayoutPromise = currentPluginVersionId
            ? this._pluginService.getLocalizedPluginLayout(
                pluginId,
                currentPluginVersionId,
              )
            : Promise.resolve(null);
          const pluginVersionPropertiesPromise = currentPluginVersionId
            ? this._pluginService
                .getPluginVersionProperties(pluginId, currentPluginVersionId)
                .then(resProperties => {
                  return resProperties.data;
                })
                .catch(err => {
                  notifyError(err);
                  return null;
                })
            : Promise.resolve(null);

          return Promise.all([
            pluginLayoutPromise,
            pluginVersionPropertiesPromise,
          ]).then(resPromises => {
            const pluginLayoutOrNull = resPromises[0];
            const pluginPropertiesOrNull = resPromises[1];

            const extendedPluginInformation: ExtendedPluginInformation = {
              plugin,
              pluginLayout:
                pluginLayoutOrNull !== null ? pluginLayoutOrNull : undefined,
              pluginProperties:
                pluginPropertiesOrNull !== null
                  ? pluginPropertiesOrNull
                  : undefined,
            };
            return extendedPluginInformation;
          });
        });

        return Promise.all(pluginsPromises).then(resPromises => {
          // We need to remove the plugins that don't have a versionId.
          return resPromises.filter(pluginInfo => {
            return pluginInfo.plugin.current_version_id;
          });
        });
      })
      .catch(err => {
        notifyError(err);
        return [];
      });
  };

  buildFormSections = () => {
    const {
      disabled,
      // change
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { extendedPluginsInformation } = this.state;

    const sections: McsFormSection[] = [];

    const generalSection = {
      id: 'generalSection',
      title: messages.sectionGeneralTitle,
      component: (
        <GeneralInformationFormSection
          initialValues={this.props.initialValues}
          organisationId={organisationId}
          disabled={disabled}
          extendedPluginsInformation={extendedPluginsInformation}
        />
      ),
    };

    sections.push(generalSection);

    const pluginId =
      (this.props.formValues && this.props.formValues.pluginId) || undefined;

    const pluginInstanceSection = {
      id: 'pluginInstance',
      title: messages.sectionPluginSettingsTitle,
      component: (
        <PluginInstanceFormSection
          pluginId={pluginId}
          extendedPluginsInformation={extendedPluginsInformation}
          organisationId={organisationId}
        />
      ),
    };

    if (pluginId) sections.push(pluginInstanceSection);

    return sections;
  };

  render() {
    const { breadCrumbPaths, handleSubmit, close, disabled } = this.props;

    const { fetchingPluginVersions } = this.state;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.save,
      onClose: close,
      disabled: disabled,
    };

    const sections = this.buildFormSections();

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

    const sectionsOrSpin = fetchingPluginVersions ? <Spin /> : renderedSections;

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit}
            layout="vertical"
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container automation-form"
            >
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
