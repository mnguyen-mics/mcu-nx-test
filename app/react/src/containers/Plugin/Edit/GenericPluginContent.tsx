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

const formId = 'pluginForm';

interface RouterProps {
  organisationId: string;
}

interface PluginContentInnerProps {
  notifyError: (err: any) => void;
}


export interface PluginInstanceForm<T> {
  pluginInstance: T;
  properties?: PluginProperty[];
}

export interface PluginContentOuterProps<T extends PluginInstance> {
  pluginType: PluginType;
  listTitle: FormattedMessage.MessageDescriptor;
  listSubTitle: FormattedMessage.MessageDescriptor;
  breadcrumbPaths: Path[];
  pluginInstanceService: PluginInstanceService<T>;
  pluginInstanceId?: string;
  notifyError: (err?: any) => void;
  onClose: () => void;
  onSaveOrCreatePluginInstance: (
    pluginInstance: T,
    properties: PluginProperty[],
  )=> void ;
  createPluginInstance: (
    organisationId: string, 
    plugin: PluginResource,
    pluginInstance: T,
    ) => PluginInstance;

  showGeneralInformation?: boolean;
  disableFields?: boolean;
}

interface PluginContentState<T> {
  plugin: PluginResource;
  isLoading: boolean;
  pluginProperties: PluginProperty[];
  pluginLayout?: PluginLayout;
  availablePlugins: PluginResource[];
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
  PluginContentInnerProps &
  RouteComponentProps<RouterProps>;

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
            this.setState({
              availablePlugins: response,
              isLoading: false,
            });
          });
      },
    );
  };


  fetchInitialValues = (visitAnalyzerId: string) => {
    const {pluginInstanceService, notifyError} = this.props
    const fetchPluginInstance = pluginInstanceService.getInstanceById(
      visitAnalyzerId,
    ).then(res => res.data);
    const fetchPluginInstanceProperties = pluginInstanceService.getInstanceProperties(
      visitAnalyzerId,
    ).then(res => res.data);
    this.setState(
      {
        isLoading: true,
      },
      () => {
        Promise.all([fetchPluginInstance, fetchPluginInstanceProperties]).then(
          res => {
            const initialValues : PluginInstanceForm<T> = {
              pluginInstance: res[0],
              properties: res[1],
            }
            this.setState({
              isLoading: false,
              initialValues: initialValues,
              pluginProperties: res[1],
            });
          },
        ).catch(err => {
          notifyError(err);
          this.setState({isLoading: false});
        });
      },
    );
  };

  saveOrCreatePluginInstance = (
    pluginInstance: T,
    properties: PluginProperty[],
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
          .catch(err => notifyError(err));
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
        .catch(err => notifyError(err));
    });
  };

  updatePropertiesValue = (
    properties: PluginProperty[],
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
            const promise1 = PluginService.getPluginVersionProperty(
              plugin.id,
              plugin.current_version_id
                ? plugin.current_version_id
                : lastVersion.id,
            );
            const promise2 = PluginService.getLocalizedPluginLayout(
              plugin.id,
              lastVersion.id
            );
            return Promise.all([promise1, promise2]);
          })
          .then(([res1, res2]) => {
            if (res2 !== null && res2.status !== "error") {
              this.setState({
                pluginProperties: res1.data,
                pluginLayout: res2.data,
                isLoading: false,
              });
            }
            else {
              this.setState({
                pluginProperties: res1.data,
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
          message: messages.save,
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
        paths={breadcrumbPaths}
        items={sidebarItems}
        scrollId={formId}
        {...actionbarProps}
      >
        <PluginEditForm
          editionMode={pluginInstanceId ? true:false}
          organisationId={organisationId}
          save={this.saveOrCreatePluginInstance}
          pluginProperties={pluginProperties}
          disableFields={(isLoading || disableFields) ? true : false}
          pluginLayout={this.state.pluginLayout !== undefined ? this.state.pluginLayout : undefined}
          isLoading={isLoading}
          pluginVersionId={plugin.id}
          formId={formId}
          initialValues={this.formatInitialValues(initialValues)}
          showGeneralInformation={
            showGeneralInformation !== undefined ? showGeneralInformation : true
          }
        />
      </EditContentLayout>
    ) : (
          <EditContentLayout paths={breadcrumbPaths} {...actionbarProps}>
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

