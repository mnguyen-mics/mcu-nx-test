import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import {
  AudienceExternalFeedTyped,
  AudienceTagFeedTyped,
} from '../../Segments/Edit/domain';
import PluginCardModal from '../../../Plugin/Edit/PluginCard/PluginCardModal';
import PluginService from '../../../../services/PluginService';
import { LayoutablePlugin } from '../../../../models/Plugins';
import AudienceSegmentFeedService from '../../../../services/AudienceSegmentFeedService';
import { PropertyResourceShape } from '../../../../models/plugin';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { PluginCardModalTab } from '../../../Plugin/Edit/PluginCard/PluginCardModalContent';

export interface EditPluginModalProps {
  feed: AudienceExternalFeedTyped | AudienceTagFeedTyped;
  modalTab: PluginCardModalTab;
  onClose: () => void;
}

type Props = EditPluginModalProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps;

interface State {
  layoutablePlugin: LayoutablePlugin;
  pluginProperties: PropertyResourceShape[];
  initialValues?: { plugin: any; properties: any };
  isLoading: boolean;
}

class EditPluginModal extends React.Component<Props, State> {
  private feedService: AudienceSegmentFeedService;

  constructor(props: Props) {
    super(props);

    this.state = {
      layoutablePlugin: {
        id: '',
        organisation_id: '',
        group_id: '',
        artifact_id: '',
        current_version_id: '',
      },
      pluginProperties: [],
      isLoading: true,
    };

    this.feedService =
      props.feed.type === 'EXTERNAL_FEED'
        ? new AudienceSegmentFeedService(
            props.feed.audience_segment_id,
            'EXTERNAL_FEED',
          )
        : new AudienceSegmentFeedService(
            props.feed.audience_segment_id,
            'TAG_FEED',
          );
  }

  componentDidMount() {
    this.setState(
      {
        isLoading: true,
      },
      () => {
        Promise.all([
          this.getPluginLayout(),
          this.getProperties(),
          this.getInitialValues(),
        ]).then(() =>
          this.setState({
            isLoading: false,
          }),
        );
      },
    );
  }

  getPluginLayout() {
    const { feed, notifyError, onClose } = this.props;
    return PluginService.getLocalizedPluginLayoutFromVersionId(feed.version_id)
      .then(pluginInfo => {
        this.setState({
          layoutablePlugin: {
            ...pluginInfo.plugin,
            plugin_layout: pluginInfo.layout,
          },
        });
      })
      .catch(err => {
        notifyError(err);
        onClose();
      });
  }

  getProperties() {
    const { feed, notifyError, onClose } = this.props;
    return this.feedService
      .getInstanceProperties(feed.id)
      .then(instanceProperties => {
        this.setState({
          pluginProperties: instanceProperties.data,
        });
      })
      .catch(err => {
        notifyError(err);
        onClose();
      });
  }

  getInitialValues = () => {
    const { feed, notifyError, onClose } = this.props;

    return this.feedService
      .getAudienceFeedProperty(feed.id)
      .then(res =>
        this.setState({
          initialValues: {
            plugin: feed,
            properties: res.data.reduce(
              (acc, val) => ({
                ...acc,
                [val.technical_name]: { value: val.value },
              }),
              {},
            ),
          },
        }),
      )
      .catch(err => {
        notifyError(err);
        onClose();
      });
  };

  savePluginInstance = (
    pluginInstance: AudienceTagFeedTyped | AudienceExternalFeedTyped,
    properties: PropertyResourceShape[],
  ) => {
    const { notifyError, feed, onClose } = this.props;

    this.setState({ isLoading: true });
    const {
      type,
      version_value,
      version_id,
      status,
      ...newPluginInstance
    } = pluginInstance;

    return this.feedService
      .updatePluginInstance(pluginInstance.id!, newPluginInstance)
      .then(() =>
        this.updatePropertiesValue(
          properties,
          feed.organisation_id,
          pluginInstance.id!,
        ),
      )
      .then(() => {
        onClose();
      })
      .catch((err: any) => {
        notifyError(err);
        onClose();
      });
  };

  updatePropertiesValue = (
    properties: PropertyResourceShape[],
    organisationId: string,
    pluginInstanceId: string,
  ) => {
    const updatePromise = this.feedService.updatePluginInstanceProperty;

    const propertiesPromises: Array<Promise<any>> = [];
    properties.forEach(item => {
      propertiesPromises.push(
        updatePromise(
          organisationId,
          pluginInstanceId,
          item.technical_name,
          item,
        ),
      );
    });
    return Promise.all(propertiesPromises);
  };

  render() {
    const { feed, modalTab, onClose } = this.props;
    const {
      isLoading,
      layoutablePlugin,
      pluginProperties,
      initialValues,
    } = this.state;

    return (
      <PluginCardModal
        onClose={onClose}
        organisationId={feed.organisation_id}
        opened={true}
        plugin={layoutablePlugin}
        save={this.savePluginInstance}
        pluginProperties={pluginProperties}
        disableFields={feed.status === 'ACTIVE' || feed.status === 'PUBLISHED'}
        initialValues={initialValues}
        pluginLayout={layoutablePlugin.plugin_layout}
        isLoading={isLoading}
        pluginVersionId={feed.version_id}
        editionMode={true}
        selectedTab={modalTab}
      />
    );
  }
}

export default compose<Props, EditPluginModalProps>(
  withRouter,
  injectNotifications,
)(EditPluginModal);
