import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import PluginEditSelector from './PluginEditSelector';
import PluginEditForm from './PluginEditForm';
import {
  PluginResource,
  PluginProperty,
  PluginType,
  PluginInstance,
  LayoutablePlugin,
} from '../../../models/Plugins';
import PluginService from '../../../services/PluginService';
import PluginInstanceService from '../../../services/PluginInstanceService';
import * as actions from '../../../state/Notifications/actions';
import { EditContentLayout } from '../../../components/Layout';
// import log from '../../../../utils/Logger';
import Loading from '../../../components/Loading';
import messages from './messages';
import { Path } from '../../../components/ActionBar';
import { SideBarItem } from '../../../components/Layout/ScrollspySider';
import { PluginLayout } from '../../../models/plugin/PluginLayout';
import { PropertyResourceShape } from '../../../models/plugin';
import { InjectedNotificationProps } from '../../Notifications/injectNotifications';
import assetFileService from '../../../services/Library/AssetsFilesService';

const formId = 'pluginForm';

interface RouterProps {
  organisationId: string;
}

export interface PluginInstanceForm<T> {
  pluginInstance: T;
  properties?: PropertyResourceShape[];
}

export interface PluginContentOuterProps<T extends PluginInstance> {
  pluginType: PluginType;
  listTitle: FormattedMessage.MessageDescriptor;
  listSubTitle: FormattedMessage.MessageDescriptor;
  breadcrumbPaths: (pluginInstance?: T) => Path[];
  pluginInstanceService: PluginInstanceService<T>;
  pluginInstanceId?: string;
  onClose: () => void;
  onSaveOrCreatePluginInstance: (
    pluginInstance: T,
    properties: PropertyResourceShape[],
  ) => void;
  createPluginInstance: (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: T,
  ) => PluginInstance;

  showGeneralInformation?: boolean;
  showedMessage?: React.ReactNode;
  disableFields?: boolean;
}

interface PluginContentState<T> {
  plugin: PluginResource;
  isLoading: boolean;
  pluginProperties: PropertyResourceShape[];
  pluginLayout?: PluginLayout;
  availablePlugins: LayoutablePlugin[];
  initialValues?: PluginInstanceForm<T>;
}

function initEmptyPluginSelection() {
  return {
    id: '',
    organisation_id: '',
    group_id: '',
    artifact_id: '',
    current_version_id: '',
  };
}

type JoinedProps<T extends PluginInstance> = PluginContentOuterProps<T> &
  RouteComponentProps<RouterProps> & InjectedNotificationProps;

class PluginContent<T extends PluginInstance> extends React.Component<JoinedProps<T>, PluginContentState<T>> {
  constructor(props: JoinedProps<T>) {
    super(props);

    this.state = {
      plugin: initEmptyPluginSelection(),
      isLoading: true,
      pluginProperties: [],
      availablePlugins: [],
    };
  }

  componentDidMount() {
    const { pluginInstanceId } = this.props;
    if (pluginInstanceId) {
      this.fetchInitialValues(pluginInstanceId);
      return;
    }
    this.getPluginsList();
  }

  componentWillReceiveProps(nextProps: JoinedProps<T>) {
    const {
      match: { params: { organisationId } },
      pluginInstanceId
    } = this.props;
    const {
      match: {
        params: {
          organisationId: nextOrganisationId,

        },
      },
      pluginInstanceId: nextPluginInstanceId,
    } = nextProps;

    if (
      (organisationId !== nextOrganisationId ||
        pluginInstanceId !== nextPluginInstanceId) &&
      nextPluginInstanceId
    ) {
      this.fetchInitialValues(nextPluginInstanceId);
    }
  }

  getPluginsList = () => {
    const { notifyError } = this.props;
    this.setState(
      {
        isLoading: true,
      },
      () => {
        PluginService.getPlugins({
          plugin_type: this.props.pluginType,
        })
          .then(res => res.data)
          .then((response: PluginResource[]) => {
            const pluginsWithLayouts = response.map(pResourceWoutLayout => {
              return PluginService.getLocalizedPluginLayout(
                pResourceWoutLayout.id,
                pResourceWoutLayout.current_version_id
              ).then(resultPluginLayout => {
                if (resultPluginLayout !== null && resultPluginLayout.metadata && resultPluginLayout.metadata.small_icon_asset_id) {
                  return assetFileService.getAssetFile(resultPluginLayout.metadata.small_icon_asset_id)
                    .then(resultAssetFile => {
                      return {
                        ...pResourceWoutLayout,
                        plugin_layout: resultPluginLayout,
                        layout_icon_path: (resultAssetFile !== null) ? `${(window as any).MCS_CONSTANTS.ASSETS_URL}${resultAssetFile.file_path}` : undefined
                      };
                    });
                }
                return Promise.resolve({
                  ...pResourceWoutLayout,
                  plugin_layout: (resultPluginLayout !== null) ? resultPluginLayout : undefined
                });
              });
            });

            Promise.all(pluginsWithLayouts).then(availablePluginsResponse => {
              this.setState({
                availablePlugins: availablePluginsResponse,
                isLoading: false,
              });
            })

          })
          .catch(err => {
            notifyError(err);
            this.setState({ isLoading: false });
          });
      },
    );
  };


  fetchInitialValues = (pInstanceId: string) => {
    const { pluginInstanceService, notifyError } = this.props
    const promisePluginInstance = pluginInstanceService.getInstanceById(
      pInstanceId,
    ).then(res => res.data);
    const promiseInstanceProperties = pluginInstanceService.getInstanceProperties(
      pInstanceId,
    ).then(res => res.data);
    const promisePluginLayout = pluginInstanceService.getLocalizedPluginLayout(
      pInstanceId,
    );
    this.setState(
      {
        isLoading: true,
      },
      () => {
        Promise.all([promisePluginInstance, promiseInstanceProperties, promisePluginLayout]).then(
          result => {
            const [resultPluginInstance, resultInstanceProperties, resultPluginLayout] = result;
            const initialValues: PluginInstanceForm<T> = {
              pluginInstance: resultPluginInstance,
              properties: resultInstanceProperties,
            }
            if (resultPluginLayout !== null) {
              this.setState({
                isLoading: false,
                initialValues: initialValues,
                pluginProperties: resultInstanceProperties,
                pluginLayout: resultPluginLayout,
              });
            }
            else {
              this.setState({
                isLoading: false,
                initialValues: initialValues,
                pluginProperties: resultInstanceProperties,
              });
            }
          },
        ).catch(err => {
          notifyError(err);
          this.setState({ isLoading: false });
        });
      },
    );
  };

  saveOrCreatePluginInstance = (
    pluginInstance: T,
    properties: PropertyResourceShape[],
  ) => {


    const {
      match: { params: { organisationId } },
      pluginInstanceService,
      notifyError,
      createPluginInstance,
      onSaveOrCreatePluginInstance,

    } = this.props;

    const {
      plugin,
    } = this.state;

    // if edition update and redirect
    if (pluginInstance.id) {
      return this.setState({ isLoading: true }, () => {
        const updateInstancePromise = pluginInstanceService.updatePluginInstance(pluginInstance.id!, pluginInstance)

        const updatePropertiesPromise = updateInstancePromise.then(() => {
          return this.updatePropertiesValue(
            properties,
            organisationId,
            pluginInstance.id!,
          );
        })
        Promise.all([updateInstancePromise, updatePropertiesPromise]).then(res => {
          onSaveOrCreatePluginInstance(res[0].data, properties)
        })
          .catch(err => {
            notifyError(err);
            this.setState({ isLoading: false });
          });
      });
    }
    // if creation save and redirect
    const formattedFormValues: PluginInstance = createPluginInstance(organisationId, plugin, pluginInstance)

    return this.setState({ isLoading: true }, () => {
      const createInstancePromise = pluginInstanceService.createPluginInstance(
        organisationId,
        formattedFormValues,
      )
        .then(res => res.data)
      const updatePropertiesPromise = createInstancePromise.then(res => {
        return this.updatePropertiesValue(properties, organisationId, res.id!);
      })

      Promise.all([createInstancePromise, updatePropertiesPromise]).then(res => {
        onSaveOrCreatePluginInstance(res[0], properties)
      })
        .catch(err => {
          notifyError(err);
          this.setState({ isLoading: false });
        });
    });
  };

  updatePropertiesValue = (
    properties: PropertyResourceShape[],
    organisationId: string,
    pluginInstanceId: string,
  ) => {
    const {
      pluginInstanceService,
    } = this.props;
    const propertiesPromises: Array<Promise<any>> = [];
    properties.forEach(item => {
      propertiesPromises.push(
        pluginInstanceService.updatePluginInstanceProperty(
          organisationId,
          pluginInstanceId,
          item.technical_name,
          item,
        ),
      );
    });
    return Promise.all(propertiesPromises);
  };


  onSelectPlugin = (plugin: PluginResource) => {
    this.setState(
      {
        isLoading: true,
        plugin: plugin,
      },
      () => {

        PluginService.getPluginVersions(plugin.id)
          .then(res => {
            const lastVersion = res.data[res.data.length - 1];
            const promiseVersionProperty = PluginService.getPluginVersionProperty(
              plugin.id,
              plugin.current_version_id
                ? plugin.current_version_id
                : lastVersion.id,
            );
            const promisePluginLayout = PluginService.getLocalizedPluginLayout(
              plugin.id,
              plugin.current_version_id
                ? plugin.current_version_id
                : lastVersion.id
            );
            return Promise.all([promiseVersionProperty, promisePluginLayout]);
          })
          .then(([resultVersionProperty, resultPluginLayout]) => {
            if (resultPluginLayout !== null) {
              this.setState({
                pluginProperties: resultVersionProperty.data,
                pluginLayout: resultPluginLayout,
                isLoading: false,
              });
            }
            else {
              this.setState({
                pluginProperties: resultVersionProperty.data,
                isLoading: false,
              });
            }
          })
          .catch(err => {
            actions.notifyError(err);
            this.setState(() => {
              return { isLoading: false };
            });
          });
      },
    );
  };

  onReset = () => {
    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.plugin = initEmptyPluginSelection();
      return nextState;
    });
  };

  formatInitialValues = (initialValues?: PluginInstanceForm<T>) => {
    const formattedProperties: any = {};

    if (initialValues && initialValues.properties) {
      initialValues.properties.forEach((property: PluginProperty) => {
        formattedProperties[property.technical_name] = {
          value: property.value,
        };
      });
    }

    return {
      plugin: initialValues ? initialValues.pluginInstance : undefined,
      properties: formattedProperties,
    };
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      breadcrumbPaths,
      onClose,
      pluginInstanceId,
      showGeneralInformation,
      showedMessage,
      disableFields
    } = this.props;

    const { pluginProperties, isLoading, plugin, initialValues } = this.state;

    const sidebarItems: SideBarItem[] = [];

    if (!pluginInstanceId) {
      sidebarItems.push({
        sectionId: 'type',
        title: messages.menuType,
        onClick: () => this.setState({ pluginProperties: [] }),
        type: 'validated'
      });
    }


    if (showGeneralInformation) {
      sidebarItems.push(
        {
          sectionId: 'general',
          title: messages.menuGeneralInformation,
        }
      )
    }
    if (this.state.pluginLayout === undefined) {
      sidebarItems.push(
        {
          sectionId: 'properties',
          title: messages.menuProperties,
        }
      )
    } else {
      this.state.pluginLayout.sections.forEach(section => {
        sidebarItems.push(
          {
            sectionId: section.title,
            title: { id: section.title, defaultMessage: section.title },
          }
        )
      });
    }

    const actionbarProps =
      pluginProperties.length || pluginInstanceId
        ? {
          formId,
          message: !disableFields ? messages.save : undefined,
          onClose: onClose,
        }
        : {
          formId,
          onClose: onClose,
        };

    return isLoading ? (
      <div style={{ display: 'flex', flex: 1 }}>
        <Loading className="loading-full-screen" />
      </div>
    ) : pluginProperties.length || pluginInstanceId ? (
      <EditContentLayout
        paths={breadcrumbPaths(initialValues && initialValues.pluginInstance)}
        items={sidebarItems}
        scrollId={formId}
        {...actionbarProps}
      >
        <PluginEditForm
          editionMode={pluginInstanceId ? true : false}
          organisationId={organisationId}
          save={this.saveOrCreatePluginInstance}
          pluginProperties={pluginProperties}
          disableFields={(isLoading || disableFields) ? true : false}
          pluginLayout={this.state.pluginLayout}
          isLoading={isLoading}
          pluginVersionId={plugin.id}
          formId={formId}
          initialValues={this.formatInitialValues(initialValues)}
          showedMessage={showedMessage}
          showGeneralInformation={
            showGeneralInformation !== undefined ? showGeneralInformation : true
          }
        />
      </EditContentLayout>
    ) : (
          <EditContentLayout
            paths={breadcrumbPaths(initialValues && initialValues.pluginInstance)}
            {...actionbarProps}
          >
            <PluginEditSelector
              onSelect={this.onSelectPlugin}
              availablePlugins={this.state.availablePlugins}
              listTitle={this.props.listTitle}
              listSubTitle={this.props.listSubTitle}
            />
          </EditContentLayout>
        );
  }
}

export default compose<JoinedProps<PluginInstance>, PluginContentOuterProps<PluginInstance>>(
  withRouter,
  connect(undefined, { notifyError: actions.notifyError }),
)(PluginContent);

