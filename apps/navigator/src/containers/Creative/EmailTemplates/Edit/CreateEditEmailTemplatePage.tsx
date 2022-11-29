import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { PluginEditForm } from '@mediarithmics-private/advanced-components';
import { EditContentLayout } from '../../../../components/Layout';
import { PluginVersionResource } from '../../../../models/Plugins';
import { Loading } from '../../../../components';
import { EmailTemplateResource } from '../../../../models/creative/CreativeResource';
import { DataResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import messages from './messages';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { PluginLayout } from '../../../../models/plugin/PluginLayout';
import { PropertyResourceShape } from '../../../../models/plugin';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { ICreativeService } from '../../../../services/CreativeService';
import { IPluginService } from '../../../../services/PluginService';

const CreativeRendererId = '1034';

interface EmailTemplateRouteParam {
  organisationId: string;
  creativeId?: string;
}

interface EmailTemplateForm {
  plugin?: EmailTemplateResource;
  properties?: PropertyResourceShape[];
}

interface CreateEmailTemplateState {
  edition: boolean;
  isLoading: boolean;
  pluginLayout?: PluginLayout;
  initialValues?: EmailTemplateForm;
  emailTemplateRenderer?: PluginVersionResource;
}

type JoinedProps = InjectedNotificationProps &
  RouteComponentProps<EmailTemplateRouteParam> &
  WrappedComponentProps;

class CreateEmailTemplate extends React.Component<JoinedProps, CreateEmailTemplateState> {
  @lazyInject(TYPES.ICreativeService)
  private _creativeService: ICreativeService;

  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;
  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      edition: props.match.params.creativeId ? true : false,
      isLoading: true,
    };
  }

  componentDidMount() {
    const { edition } = this.state;
    const {
      match: {
        params: { organisationId, creativeId },
      },
      notifyError,
    } = this.props;

    this.setState(() => {
      return { isLoading: true };
    });

    const promise =
      edition && creativeId
        ? this.fetchInitialValues(creativeId)
        : this.fetchCreationValue(organisationId);

    promise
      .then(() => {
        this.setState(() => {
          return { isLoading: false };
        });
      })
      .catch(err => {
        notifyError(err);
        this.setState(() => {
          return { isLoading: false };
        });
      });
  }

  componentDidUpdate(previousProps: JoinedProps) {
    const {
      match: {
        params: { organisationId, creativeId },
      },
      notifyError,
    } = this.props;

    const {
      match: {
        params: { organisationId: previousOrganisationId, creativeId: previousCreativeId },
      },
    } = previousProps;

    if (
      (organisationId !== previousOrganisationId || creativeId !== previousCreativeId) &&
      creativeId
    ) {
      this.setState(() => {
        return { isLoading: true };
      });
      this.fetchInitialValues(creativeId)
        .then(() => {
          this.setState(() => {
            return { isLoading: false };
          });
        })
        .catch(err => {
          notifyError(err);
          this.setState(() => {
            return { isLoading: false };
          });
        });
    }
  }

  promisesValues = (
    properties: PropertyResourceShape[],
    pLayoutRes: PluginLayout | null,
    lastVersion?: PluginVersionResource,
  ) => {
    const modifiedProperties = properties
      .sort(a => {
        return a.writable === false ? -1 : 1;
      })
      .map(prop => {
        return prop.technical_name === 'template_file' && prop.property_type === 'DATA_FILE'
          ? {
              ...prop,
              value: { ...prop.value, acceptedFile: 'text/html' },
            }
          : prop;
      });

    this.setState(prevState => {
      const nextState = {
        ...prevState,
        isLoading: false,
        initialValues: {
          properties: modifiedProperties,
        },
        emailTemplateRenderer: lastVersion,
      };

      if (pLayoutRes !== null) {
        nextState.pluginLayout = pLayoutRes;
      }

      return nextState;
    });
  };

  fetchCreationValue = (organisationId: string): Promise<any> => {
    return this._pluginService.getPluginVersions(CreativeRendererId).then(res => {
      const lastVersion = res.data[res.data.length - 1];

      return Promise.all([
        this._pluginService
          .getPluginVersionProperties(CreativeRendererId, lastVersion.id)
          .then(res1 => res1.data),
        this._pluginService.getLocalizedPluginLayout(CreativeRendererId, lastVersion.id),
      ]).then(results => {
        this.promisesValues(results[0], results[1], lastVersion);
        return results;
      });
    });
  };

  fetchInitialValues = (emailTemplateId: string): Promise<any> => {
    return this._pluginService.getPluginVersions(CreativeRendererId).then(res => {
      return this._creativeService
        .getEmailTemplate(emailTemplateId)
        .then(resultGetEmailTemplate => {
          return Promise.all([
            this._creativeService
              .getEmailTemplateProperties(emailTemplateId)
              .then(res1 => res1.data),
            this._pluginService.getLocalizedPluginLayout(
              resultGetEmailTemplate.data.renderer_plugin_id,
              resultGetEmailTemplate.data.renderer_version_id,
            ),
          ]).then(results => {
            this.promisesValues(results[0], results[1]);

            this.setState(prevState => {
              const nextState = {
                ...prevState,
                initialValues: {
                  properties: prevState.initialValues ? prevState.initialValues.properties : [],
                  plugin: resultGetEmailTemplate.data,
                },
              };
              return nextState;
            });
            return results;
          });
        });
    });
  };

  redirect = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/creatives/email`;
    history.push(attributionModelUrl);
  };

  saveOrCreatePluginInstance = (
    plugin: EmailTemplateResource,
    properties: PropertyResourceShape[],
  ) => {
    const {
      match: {
        params: { organisationId, creativeId },
      },
      history,
      notifyError,
    } = this.props;

    // if edition update and redirect
    if (creativeId) {
      return this.setState({ isLoading: true }, () => {
        this._creativeService
          .updateEmailTemplate(plugin.id, plugin)
          .then(res => {
            return this.updatePropertiesValue(properties, organisationId, plugin.id);
          })
          .then(res => {
            this.setState({ isLoading: false }, () => {
              history.push(`/v2/o/${organisationId}/creatives/email`);
            });
          })
          .catch(err => notifyError(err));
      });
    }
    // if creation save and redirect
    const formattedFormValues = {
      ...plugin,
    };
    if (this.state.initialValues && this.state.emailTemplateRenderer) {
      formattedFormValues.renderer_artifact_id = this.state.emailTemplateRenderer.artifact_id;
      formattedFormValues.renderer_group_id = this.state.emailTemplateRenderer.group_id;
      formattedFormValues.editor_artifact_id = 'default-editor';
      formattedFormValues.editor_group_id = 'com.mediarithmics.template.email';
    }

    return this.setState({ isLoading: true }, () => {
      this._creativeService
        .createEmailTemplate(organisationId, formattedFormValues)
        .then(res => res.data)
        .then(res => {
          return this.updatePropertiesValue(properties, organisationId, res.id);
        })
        .then(res => {
          this.setState({ isLoading: false }, () => {
            history.push(`/v2/o/${organisationId}/creatives/email`);
          });
        })
        .catch(err => notifyError(err));
    });
  };

  updatePropertiesValue = (
    properties: PropertyResourceShape[],
    organisationId: string,
    id: string,
  ) => {
    const propertiesPromises: Array<Promise<DataResponse<PropertyResourceShape>>> = [];
    properties.forEach(item => {
      if (item.property_type === 'DATA_FILE' && item.technical_name === 'template_file') {
        const fileValues = item.value as any;
        fileValues.fileName =
          fileValues && fileValues.fileName ? fileValues.fileName.replace(/\s/g, '_') : undefined;
        item.value = fileValues;
      }
      propertiesPromises.push(
        this._creativeService.updateEmailTemplateProperty(
          organisationId,
          id,
          item.technical_name,
          item,
        ),
      );
    });
    return Promise.all(propertiesPromises);
  };

  formatInitialValues = (initialValues: any) => {
    const formattedProperties: any = {};

    if (initialValues.properties) {
      initialValues.properties.forEach((property: PropertyResourceShape) => {
        formattedProperties[property.technical_name] = {
          value: property.value,
        };
      });
    }

    return {
      plugin: initialValues.plugin,
      properties: formattedProperties,
    };
  };

  render() {
    const {
      match: {
        params: { organisationId, creativeId },
      },
      intl: { formatMessage },
    } = this.props;

    const { isLoading } = this.state;

    const sections =
      this.state.pluginLayout === undefined
        ? [
            {
              sectionId: 'properties',
              title: messages.menuProperties,
            },
          ]
        : this.state.pluginLayout.sections.map(section => {
            return {
              sectionId: section.title,
              title: { id: section.title, defaultMessage: section.title },
            };
          });

    const sidebarItems = [
      {
        sectionId: 'general',
        title: messages.menuGeneralInformation,
      },
    ].concat(sections);

    const formId = 'pluginForm';

    const actionbarProps =
      (this.state.initialValues &&
        this.state.initialValues.properties &&
        this.state.initialValues.properties.length) ||
      !!creativeId
        ? {
            formId,
            message: messages.save,
            onClose: this.redirect,
          }
        : {
            formId,
            onClose: this.redirect,
          };

    return isLoading ? (
      <div style={{ display: 'flex', flex: 1 }}>
        <Loading isFullScreen={true} />
      </div>
    ) : (
      <EditContentLayout
        pathItems={[formatMessage(messages.emailTemplateBreadCrumb)]}
        items={sidebarItems}
        scrollId={formId}
        {...actionbarProps}
      >
        <PluginEditForm
          editionMode={!!creativeId}
          organisationId={organisationId}
          save={this.saveOrCreatePluginInstance}
          pluginProperties={(this.state.initialValues && this.state.initialValues.properties) || []}
          disableFields={isLoading}
          pluginLayout={this.state.pluginLayout}
          isLoading={isLoading}
          pluginVersionId={
            (this.state.emailTemplateRenderer && this.state.emailTemplateRenderer.id) || ''
          }
          formId={formId}
          initialValues={this.formatInitialValues(this.state.initialValues)}
          showGeneralInformation={true}
          showTechnicalName={true}
        />
      </EditContentLayout>
    );
  }
}

export default compose(injectIntl, withRouter, injectNotifications)(CreateEmailTemplate);
