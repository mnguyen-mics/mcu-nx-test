import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import CreativeService from '../../../../services/CreativeService';
import PluginService from '../../../../services/PluginService';
import PluginEditForm from '../../../Plugin/Edit/PluginEditForm';
import { EditContentLayout } from '../../../../components/Layout';
import * as actions from '../../../../state/Notifications/actions';
import { PluginProperty, PluginInterface } from '../../../../models/Plugins';
import { Loading } from '../../../../components';
import { EmailTemplateResource } from '../../../../models/creative/CreativeResource';
import withDrawer, { DrawableContentProps } from '../../../../components/Drawer';
import { DataResponse } from '../../../../services/ApiService';

import messages from './messages';

const CreativeRendererId = '1034';

interface EmailTemplateRouteParam {
  organisationId: string;
  creativeId?: string;
}

interface EmailTemplateForm {
  plugin?: EmailTemplateResource;
  properties?: PluginProperty[];
}

interface CreateEmailTemplateState {
  edition: boolean;
  isLoading: boolean;
  initialValues?: EmailTemplateForm;
  emailTemplateRenderer?: PluginInterface;
}

interface CreateEmailTemplateProps extends DrawableContentProps {
  notifyError: (err?: any) => void;
}

type JoinedProps = CreateEmailTemplateProps & RouteComponentProps<EmailTemplateRouteParam> & InjectedIntlProps;

class CreateEmailTemplate extends React.Component<
  JoinedProps,
  CreateEmailTemplateState
> {

  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      edition: props.match.params.creativeId ? true : false,
      isLoading: true,
    };

  }

  componentDidMount() {
    const {
      edition,
    } = this.state;
    const {
      match: { params: { organisationId, creativeId } },
    } = this.props;
    if (edition && creativeId) {
      this.fetchInitialValues(creativeId);
    } else {
      this.fetchCreationValue(organisationId);
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      match: { params: { organisationId, creativeId } },
    } = this.props;
    const {
      match: { params: { organisationId: nextOrganisationId, creativeId: nextEmailTemplateId } },
    } = nextProps;

    if ((organisationId !== nextOrganisationId || creativeId !== nextEmailTemplateId) && nextEmailTemplateId) {
      this.fetchInitialValues(nextEmailTemplateId);
    }
  }

  fetchCreationValue = (organisationId: string) => {
    const {
      notifyError,
    } = this.props;

    PluginService
      .getPluginVersions(CreativeRendererId)
      .then(res => {
        const lastVersion = res.data[res.data.length - 1];

        const pluginPropertiesPromise = PluginService.getPluginVersionProperty(CreativeRendererId, lastVersion.id);

        pluginPropertiesPromise
          .then(values => {
            this.setState(prevState => {
              const nextState = {
                ...prevState,
              };

              nextState.initialValues = {
                properties:  values.sort((a) => {
                  return a.writable === false ? -1 : 1;
                }).map(prop => {
                  return prop.technical_name === 'template_file' && prop.property_type === 'DATA_FILE' ?
                    { ...prop, value: { ...prop.value, acceptedFile: 'text/html' } } :
                    prop;
                }),
              };

              nextState.emailTemplateRenderer = {
                id: CreativeRendererId,
                ...lastVersion,
              };
              nextState.isLoading = false;

              return nextState;
            });
          })
          .catch(err => {
            notifyError(err);
            this.setState(() => {
              return { isLoading: false };
            });
          });
    });
  }

  fetchInitialValues = (emailTemplateId: string) => {
    const fetchEmailTemplate = CreativeService.getEmailTemplate(emailTemplateId).then(res => res.data);
    const fetchEmailTemplateProperties = CreativeService.getEmailTemplateProperties(emailTemplateId)
      .then(res => res.data);
    this.setState({
      isLoading: true,
    }, () => {
      Promise.all([fetchEmailTemplate, fetchEmailTemplateProperties]).then(res => {
        this.setState({
          isLoading: false,
          initialValues: {
            plugin: res[0],
            properties: res[1].map(prop => {
              return prop.technical_name === 'template_file' && prop.property_type === 'DATA_FILE' ?
                { ...prop, value: { ...prop.value, acceptedFile: 'text/html' } } :
                prop;
            }),
          },
        });
      });
    });
  }

  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/creatives/email`;
    history.push(attributionModelUrl);
  }

  saveOrCreatePluginInstance = (plugin: EmailTemplateResource, properties: PluginProperty[]) => {

    const {
      edition,
    } = this.state;

    const {
      match: { params: { organisationId } },
      history,
      notifyError,
    } = this.props;

    // if edition update and redirect
    if (edition) {
      return this.setState({ isLoading: true }, () => {
        CreativeService.updateEmailTemplate(plugin.id, plugin)
        .then(res => {
          return this.updatePropertiesValue(properties, organisationId, plugin.id);
        }).then(res => {
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
      formattedFormValues.renderer_artifact_id =  this.state.emailTemplateRenderer.artifact_id;
      formattedFormValues.renderer_group_id = this.state.emailTemplateRenderer.group_id;
      formattedFormValues.editor_artifact_id = 'default-editor';
      formattedFormValues.editor_group_id = 'com.mediarithmics.template.email';
    }
    return this.setState({ isLoading: true }, () => {
      CreativeService.createEmailTemplate(organisationId, formattedFormValues)
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
  }

  updatePropertiesValue = (properties: PluginProperty[], organisationId: string, id: string) => {
    const propertiesPromises: Array<Promise<DataResponse<PluginProperty>>> = [];
    properties.forEach(item => {
      propertiesPromises.push(CreativeService.updateEmailTemplateProperty(organisationId, id, item.technical_name, item));
    });
    return Promise.all(propertiesPromises);
  }

  formatInitialValues = (initialValues: any) => {
    const formattedProperties: any = {};

    if (initialValues.properties) {
      initialValues.properties.forEach((property: PluginProperty) => {
        formattedProperties[property.technical_name] = { value: property.value };
      });
    }

    return {
      plugin: initialValues.plugin,
      properties: formattedProperties,
    };
  }

  render() {
    const {
      match: {
        url,
        params: {
          organisationId,
        },
      },
      intl: { formatMessage },
    } = this.props;

    const {
      isLoading,
    } = this.state;

    const breadcrumbPaths = [
      { name: formatMessage(messages.emailTemplateBreadCrumb) },
    ];

    const sidebarItems = {
      general: messages.menuGeneralInformation,
      properties: messages.menuProperties,
    };

    const formId = 'pluginForm';

    const buttonMetadata = (this.state.initialValues &&
      this.state.initialValues.properties && this.state.initialValues.properties.length) || this.state.edition ? {
      formId,
      message: messages.save,
      onClose: this.redirect,
    } : {
      formId,
      onClose: this.redirect,
    };

    return (isLoading) ?
    (
      <div style={{ display: 'flex', flex: 1 }}>
        <Loading className="loading-full-screen" />
      </div>
    ) :
    (
      <EditContentLayout
        breadcrumbPaths={breadcrumbPaths}
        sidebarItems={sidebarItems}
        buttonMetadata={buttonMetadata}
        url={url}
      >
        <PluginEditForm
          editionMode={this.state.edition}
          organisationId={organisationId}
          save={this.saveOrCreatePluginInstance}
          pluginProperties={(this.state.initialValues && this.state.initialValues.properties) || []}
          isLoading={isLoading}
          pluginVersionId={(this.state.emailTemplateRenderer && this.state.emailTemplateRenderer.id) || ''}
          formId={formId}
          initialValues={this.formatInitialValues(this.state.initialValues)}
          openNextDrawer={this.props.openNextDrawer}
          closeNextDrawer={this.props.closeNextDrawer}
        />
      </EditContentLayout>
    );
  }
}

export default compose(
  injectIntl,
  withDrawer,
  withRouter,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(CreateEmailTemplate);
