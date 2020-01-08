import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import {
  AudienceExternalFeedTyped,
  AudienceTagFeedTyped,
} from '../../Segments/Edit/domain';
import PluginCardModal from '../../../Plugin/Edit/PluginCard/PluginCardModal';
import PluginService from '../../../../services/PluginService';
import AudienceSegmentFeedService from '../../../../services/AudienceSegmentFeedService';
import { PropertyResourceShape } from '../../../../models/plugin';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { PluginCardModalTab } from '../../../Plugin/Edit/PluginCard/PluginCardModalContent';
import { PluginLayout } from '../../../../models/plugin/PluginLayout';
import { injectIntl, defineMessages, InjectedIntlProps } from 'react-intl';
import { withValidators } from '../../../../components/Form';
import { ValidatorProps } from '../../../../components/Form/withValidators';

export interface EditPluginModalProps {
  feed: AudienceExternalFeedTyped | AudienceTagFeedTyped;
  modalTab: PluginCardModalTab;
  onChange: () => void;
  onClose: () => void;
}

type Props = EditPluginModalProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  ValidatorProps &
  InjectedNotificationProps;

interface State {
  layout?: PluginLayout;
  pluginProperties: PropertyResourceShape[];
  initialValues?: { plugin: AudienceExternalFeedTyped | AudienceTagFeedTyped; properties: any };
  isLoading: boolean;
}

const messages = defineMessages({
  feedModalNameFieldLabel: {
    id: 'audience.segment.feed.list.create.nameField.label',
    defaultMessage: 'Name',
  },
  feedModalNameFieldTitle: {
    id: 'audience.segment.feed.list.create.nameField.title',
    defaultMessage: 'The name used to identify this feed.',
  },
  feedModalNameFieldPlaceholder: {
    id: 'audience.segment.feed.list.create.nameField.placeholder',
    defaultMessage: 'Name',
  },
});

class EditPluginModal extends React.Component<Props, State> {
  private feedService: AudienceSegmentFeedService;

  constructor(props: Props) {
    super(props);

    this.state = {
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
          layout: pluginInfo.layout,
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
    name?: string
  ) => {
    const { notifyError, feed, onClose, onChange } = this.props;

    this.setState({ isLoading: true });
    const {
      type,
      version_value,
      version_id,
      status,
      ...newPluginInstance
    } = pluginInstance;

    return this.feedService
      .updatePluginInstance(pluginInstance.id, name ? {...newPluginInstance, name: name} : newPluginInstance)
      .then(() =>
        this.updatePropertiesValue(
          properties,
          feed.organisation_id,
          pluginInstance.id,
        ),
      )
      .then(() => {
        onChange();
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
    const { 
      feed, 
      modalTab, 
      onClose,
      intl: {
        formatMessage,
      },
      fieldValidators: {
        isRequired,
      }
    } = this.props;
    const { isLoading, layout, pluginProperties, initialValues } = this.state;

    return (
      <PluginCardModal
        onClose={onClose}
        organisationId={feed.organisation_id}
        opened={true}
        plugin={{
          id: feed.id,
          organisation_id: feed.organisation_id,
          group_id: feed.group_id,
          artifact_id: feed.artifact_id,
          current_version_id: feed.version_id,
          plugin_layout: layout,
        }}
        save={this.savePluginInstance}
        pluginProperties={pluginProperties}
        disableFields={feed.status === 'ACTIVE' || feed.status === 'PUBLISHED'}
        initialValues={initialValues}
        pluginLayout={layout}
        isLoading={isLoading}
        pluginVersionId={feed.version_id}
        editionMode={true}
        selectedTab={modalTab}
        nameField={{
          label: formatMessage(messages.feedModalNameFieldLabel),
          title: formatMessage(messages.feedModalNameFieldTitle),
          placeholder: formatMessage(messages.feedModalNameFieldPlaceholder),
          display: true, 
          disabled: feed.status === 'ACTIVE' || feed.status === 'PUBLISHED', 
          value: feed.name,
          validator: [isRequired]
        }}
      />
    );
  }
}

export default compose<Props, EditPluginModalProps>(
  withRouter,
  injectNotifications,
  injectIntl,
  withValidators
)(EditPluginModal);
