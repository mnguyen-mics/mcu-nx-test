import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import PluginEditSelector from './PluginEditSelector';
import PluginEditForm, { SpecificFieldsFunction } from './PluginEditForm';
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
import Loading from '../../../components/Loading';
import messages from './messages';
import { Path } from '../../../components/ActionBar';
import { SideBarItem } from '../../../components/Layout/ScrollspySider';
import { PluginLayout } from '../../../models/plugin/PluginLayout';
import { PropertyResourceShape } from '../../../models/plugin';
import { InjectedNotificationProps } from '../../Notifications/injectNotifications';
import PluginCardSelector from './PluginCard/PluginCardSelector';
import PluginCardModal from './PluginCard/PluginCardModal';

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
  isCardLayout?: boolean;
  renderSpecificFields?: SpecificFieldsFunction;
}

interface PluginContentState<T> {
  plugin: PluginResource;
  isLoadingList: boolean;
  isLoadingPlugin: boolean;
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
  RouteComponentProps<RouterProps> &
  InjectedNotificationProps;

class PluginContent<T extends PluginInstance> extends React.Component<
  JoinedProps<T>,
  PluginContentState<T>
> {
  constructor(props: JoinedProps<T>) {
    super(props);

    this.state = {
      plugin: initEmptyPluginSelection(),
      isLoadingList: true,
      isLoadingPlugin: false,
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
      match: {
        params: { organisationId },
      },
      pluginInstanceId,
    } = this.props;
    const {
      match: {
        params: { organisationId: nextOrganisationId },
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
        isLoadingList: true,
      },
      () => {
        PluginService.getPlugins({
          plugin_type: this.props.pluginType,
        })
          .then(res => res.data)
          .then((response: PluginResource[]) => {
            const pluginsWithLayouts = response.reduce((filteredPlugins, pResourceWoutLayout) => {
              if (!pResourceWoutLayout.current_version_id) return filteredPlugins;

              return [
                ...filteredPlugins,
                PluginService.getLocalizedPluginLayout(
                  pResourceWoutLayout.id,
                  pResourceWoutLayout.current_version_id,
                ).then(resultPluginLayout => {
                  return Promise.resolve({
                    ...pResourceWoutLayout,
                    plugin_layout:
                      resultPluginLayout !== null
                        ? resultPluginLayout
                        : undefined,
                  });
                }),
              ];
            }, []);

            Promise.all(pluginsWithLayouts).then(availablePluginsResponse => {
              this.setState({
                availablePlugins: availablePluginsResponse,
                isLoadingList: false,
              });
            });
          })
          .catch(err => {
            notifyError(err);
            this.setState({ isLoadingList: false });
          });
      },
    );
  };

  fetchInitialValues = (pInstanceId: string) => {
    const { pluginInstanceService, notifyError } = this.props;
    const promisePluginInstance = pluginInstanceService
      .getInstanceById(pInstanceId)
      .then(res => res.data);
    const promiseInstanceProperties = pluginInstanceService
      .getInstanceProperties(pInstanceId)
      .then(res => res.data);
    const promisePluginLayout = pluginInstanceService.getLocalizedPluginLayout(
      pInstanceId,
    );
    this.setState(
      {
        isLoadingPlugin: true,
        isLoadingList: false
      },
      () => {
        Promise.all([
          promisePluginInstance,
          promiseInstanceProperties,
          promisePluginLayout,
        ])
          .then(result => {
            const [
              resultPluginInstance,
              resultInstanceProperties,
              resultPluginLayout,
            ] = result;
            const initialValues: PluginInstanceForm<T> = {
              pluginInstance: resultPluginInstance,
              properties: resultInstanceProperties,
            };
            if (resultPluginLayout !== null) {
              this.setState({
                isLoadingPlugin: false,
                initialValues: initialValues,
                pluginProperties: resultInstanceProperties,
                pluginLayout: resultPluginLayout,
              });
            } else {
              this.setState({
                isLoadingPlugin: false,
                initialValues: initialValues,
                pluginProperties: resultInstanceProperties,
              });
            }
          },
        ).catch(err => {
          notifyError(err);
          this.setState({ isLoadingPlugin: false });
        });
      },
    );
  };

  saveOrCreatePluginInstance = (
    pluginInstance: T,
    properties: PropertyResourceShape[],
  ) => {
    const {
      match: {
        params: { organisationId },
      },
      pluginInstanceService,
      notifyError,
      createPluginInstance,
      onSaveOrCreatePluginInstance,
    } = this.props;

    const { plugin } = this.state;

    // if edition update and redirect
    if (pluginInstance.id) {
      return this.setState({ isLoadingPlugin: true }, () => {
        const updateInstancePromise = pluginInstanceService.updatePluginInstance(pluginInstance.id!, pluginInstance)

        const updatePropertiesPromise = updateInstancePromise.then(() => {
          return this.updatePropertiesValue(
            properties,
            organisationId,
            pluginInstance.id!,
          );
        });
        Promise.all([updateInstancePromise, updatePropertiesPromise])
          .then(res => {
            onSaveOrCreatePluginInstance(res[0].data, properties);
          })
          .catch(err => {
            notifyError(err);
            this.setState({ isLoadingPlugin: false });
          });
      });
    }
    // if creation save and redirect
    const formattedFormValues: PluginInstance = createPluginInstance(
      organisationId,
      plugin,
      pluginInstance,
    );

    return this.setState({ isLoadingPlugin: true }, () => {
      const createInstancePromise = pluginInstanceService.createPluginInstance(
        organisationId,
        formattedFormValues,
      )
        .then(res => res.data)
      const updatePropertiesPromise = createInstancePromise.then(res => {
        return this.updatePropertiesValue(properties, organisationId, res.id!);
      });

      Promise.all([createInstancePromise, updatePropertiesPromise])
        .then(res => {
          onSaveOrCreatePluginInstance(res[0], properties);
        })
        .catch(err => {
          notifyError(err);
          this.setState({ isLoadingPlugin: false });
        });
    });
  };

  updatePropertiesValue = (
    properties: PropertyResourceShape[],
    organisationId: string,
    pluginInstanceId: string,
  ) => {
    const { pluginInstanceService } = this.props;
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
        isLoadingPlugin: true,
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
                : lastVersion.id,
            );
            return Promise.all([promiseVersionProperty, promisePluginLayout]);
          })
          .then(([resultVersionProperty, resultPluginLayout]) => {
            if (resultPluginLayout !== null) {
              this.setState({
                pluginProperties: resultVersionProperty.data,
                pluginLayout: resultPluginLayout,
                isLoadingPlugin: false,
              });
            } else {
              this.setState({
                pluginProperties: resultVersionProperty.data,
                isLoadingPlugin: false,
              });
            }
          })
          .catch(err => {
            actions.notifyError(err);
            this.setState(() => {
              return { isLoadingPlugin: false };
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
      disableFields,
      isCardLayout,
      renderSpecificFields
    } = this.props;

    const { pluginProperties, isLoadingList, isLoadingPlugin, plugin, initialValues } = this.state;

    const sidebarItems: SideBarItem[] = [];

    if (!pluginInstanceId) {
      sidebarItems.push({
        sectionId: 'type',
        title: messages.menuType,
        onClick: () => this.setState({ pluginProperties: [] }),
        type: 'validated',
      });
    }

    if (showGeneralInformation) {
      sidebarItems.push({
        sectionId: 'general',
        title: messages.menuGeneralInformation,
      });
    }
    if (this.state.pluginLayout === undefined) {
      sidebarItems.push({
        sectionId: 'properties',
        title: messages.menuProperties,
      });
    } else {
      this.state.pluginLayout.sections.forEach(section => {
        sidebarItems.push({
          sectionId: section.title,
          title: { id: section.title, defaultMessage: section.title },
        });
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

    if (isLoadingList || (isLoadingPlugin && !isCardLayout))
        return (<div style={{ display: 'flex', flex: 1 }}>
        <Loading className="loading-full-screen" />
      </div>)

    if (isCardLayout) {
      return (
        <EditContentLayout
          paths={breadcrumbPaths(initialValues && initialValues.pluginInstance)}
          {...actionbarProps}
        >
          <PluginCardSelector
            onSelect={this.onSelectPlugin}
            availablePlugins={this.state.availablePlugins}
            listTitle={this.props.listTitle}
            listSubTitle={this.props.listSubTitle}
          />
          <PluginCardModal
            onClose={this.onReset}
            organisationId={organisationId}
            opened={!!plugin.id}
            plugin={plugin}
            save={this.saveOrCreatePluginInstance}
            initialValues={this.formatInitialValues(initialValues)}
            pluginProperties={pluginProperties}
            disableFields={(isLoadingPlugin || disableFields) ? true : false}
            pluginLayout={this.state.pluginLayout!}
            isLoading={isLoadingPlugin || isLoadingList || !this.state.pluginLayout}
            pluginVersionId={plugin.id}
            editionMode={false}
          />
        </EditContentLayout>
      )
    }

    if (pluginProperties.length || pluginInstanceId) {
      return (
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
            disableFields={(isLoadingPlugin || disableFields) ? true : false}
            pluginLayout={this.state.pluginLayout}
            isLoading={isLoadingPlugin || isLoadingList}
            pluginVersionId={plugin.id}
            formId={formId}
            initialValues={this.formatInitialValues(initialValues)}
            showGeneralInformation={
              showGeneralInformation !== undefined ? showGeneralInformation : true
            }
            renderSpecificFields={renderSpecificFields}
          />
        </EditContentLayout>
      )
    }

    return (
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

export default compose<
  JoinedProps<PluginInstance>,
  PluginContentOuterProps<PluginInstance>
>(
  withRouter,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(PluginContent);
