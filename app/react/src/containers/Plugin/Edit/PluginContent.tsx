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
} from '../../../models/Plugins';
import PluginService from '../../../services/PluginService';
import * as actions from '../../../state/Notifications/actions';
import { EditContentLayout } from '../../../components/Layout';
// import log from '../../../../utils/Logger';
import Loading from '../../../components/Loading';
import messages from './messages';
import { Path } from '../../../components/ActionBar';

const formId = 'pluginForm';

interface RouterProps {
  organisationId: string;
}

interface PluginContentInnerProps {
  notifyError: (err: any) => void;
}

interface PluginContentOuterProps {
  pluginType: PluginType;
  listTitle: FormattedMessage.MessageDescriptor;
  listSubTitle: FormattedMessage.MessageDescriptor;
  breadcrumbPaths: Path[];
  saveOrCreatePluginInstance: (
    plugin: any,
    properties: PluginProperty[],
  ) => void;
  onClose: () => void;
  editionMode: boolean;
  onSelect: (t: any) => void;
  initialValue: any;
  loading: boolean;
  showGeneralInformation?: boolean
}

interface PluginContentState {
  plugin: PluginResource;
  isLoading: boolean;
  pluginProperties: PluginProperty[];
  availablePlugins: PluginResource[];
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

type JoinedProps = PluginContentOuterProps &
  PluginContentInnerProps &
  RouteComponentProps<RouterProps>;

class PluginContent extends React.Component<JoinedProps, PluginContentState> {


  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      plugin: initEmptyPluginSelection(),
      isLoading: true,
      pluginProperties: [],
      availablePlugins: [],
    };
  }

  componentDidMount() {
    const { editionMode, initialValue } = this.props;
    if (editionMode) {
      this.setState({
        pluginProperties:
          initialValue && initialValue.properties
            ? initialValue.properties
            : [],
        isLoading: false,
      });
      return;
    }
    this.getPluginsList();
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const { editionMode, initialValue } = nextProps;
    if (editionMode) {
      this.setState({
        pluginProperties:
          initialValue && initialValue.properties
            ? initialValue.properties
            : [],
        isLoading: false,
      });
      return;
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

  createPlugin = (plugin: PluginResource, properties: PluginProperty[]) => {
    this.props.saveOrCreatePluginInstance(plugin, properties);
  };

  onSelectPlugin = (plugin: PluginResource) => {
    this.setState(
      {
        isLoading: true,
        plugin: plugin,
      },
      () => {
        this.props.onSelect(plugin);
        PluginService.getPluginVersions(plugin.id)
          .then(res => {
            const lastVersion = res.data[res.data.length - 1];
            return PluginService.getPluginVersionProperty(
              plugin.id,
              lastVersion.id,
            );
          })
          .then(res => {
            this.setState({
              pluginProperties: res,
              isLoading: false,
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

  formatInitialValues = (initialValues: any) => {
    const formattedProperties: any = {};

    if (initialValues.properties) {
      initialValues.properties.forEach((property: PluginProperty) => {
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
      match: { params: { organisationId } },
      breadcrumbPaths,
      onClose,
      editionMode,
      initialValue,
      loading,
      showGeneralInformation,
    } = this.props;

    const { pluginProperties, isLoading, plugin } = this.state;

    const sidebarItems = showGeneralInformation ? [
      {
        sectionId: 'general',
        title: messages.menuGeneralInformation,
      },
      {
        sectionId: 'properties',
        title: messages.menuProperties,
      },
    ] : [
        {
          sectionId: 'properties',
          title: messages.menuProperties,
        }
      ];

    const actionbarProps =
      pluginProperties.length || editionMode
        ? {
          formId,
          message: messages.save,
          onClose: onClose,
        }
        : {
          formId,
          onClose: onClose,
        };

    return isLoading || loading ? (
      <div style={{ display: 'flex', flex: 1 }}>
        <Loading className="loading-full-screen" />
      </div>
    ) : pluginProperties.length || editionMode ? (
      <EditContentLayout
        paths={breadcrumbPaths}
        items={sidebarItems}
        scrollId={formId}
        {...actionbarProps}
      >
        <PluginEditForm
          editionMode={editionMode}
          organisationId={organisationId}
          save={this.createPlugin}
          pluginProperties={pluginProperties}
          isLoading={isLoading}
          pluginVersionId={plugin.id}
          formId={formId}
          initialValues={this.formatInitialValues(initialValue)}
          showGeneralInformation={showGeneralInformation !== undefined ? showGeneralInformation : true}
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

export default compose<JoinedProps, PluginContentOuterProps>(
  withRouter,
  connect(undefined, { notifyError: actions.notifyError }),
)(PluginContent);
