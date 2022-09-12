import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { AudienceFeedTyped } from '../../Segments/Edit/domain';
import { IPluginService } from '../../../../services/PluginService';
import {
  AudienceFeedType,
  IAudienceSegmentFeedService,
} from '../../../../services/AudienceSegmentFeedService';
import { PropertyResourceShape } from '../../../../models/plugin';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { PluginCardModalTab, PluginCardModal } from '@mediarithmics-private/advanced-components';
import { PluginLayout } from '../../../../models/plugin/PluginLayout';
import { injectIntl, defineMessages, InjectedIntlProps } from 'react-intl';
import { withValidators } from '../../../../components/Form';
import { ValidatorProps } from '../../../../components/Form/withValidators';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { getFeedStatsUnit } from '../../../../utils/FeedsStatsReportHelper';
import FeedChart from '../../Segments/Dashboard/Feeds/Charts/FeedChart';
import McsMoment from '../../../../utils/McsMoment';

export interface EditPluginModalProps {
  feed: AudienceFeedTyped;
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
  initialValues?: {
    plugin: AudienceFeedTyped;
    properties: any;
  };
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
  feedModalNameFieldTitleWarning: {
    id: 'audience.segment.feed.list.create.nameField.title.warning',
    defaultMessage:
      "Warning: This name is only used in the platform, it won't be visible on the external system.",
  },

  feedModalNameFieldPlaceholder: {
    id: 'audience.segment.feed.list.create.nameField.placeholder',
    defaultMessage: 'Name',
  },
});

class EditPluginModal extends React.Component<Props, State> {
  private feedService: IAudienceSegmentFeedService;

  @lazyInject(TYPES.IAudienceSegmentFeedServiceFactory)
  private _audienceSegmentFeedServiceFactory: (
    feedType: AudienceFeedType,
  ) => (segmentId: string) => IAudienceSegmentFeedService;

  private _audienceExternalFeedServiceFactory: (segmentId: string) => IAudienceSegmentFeedService;
  private _audienceTagFeedServiceFactory: (segmentId: string) => IAudienceSegmentFeedService;

  @lazyInject(TYPES.IPluginService)
  private _pluginService: IPluginService;

  constructor(props: Props) {
    super(props);

    this.state = {
      pluginProperties: [],
      isLoading: true,
    };

    this._audienceExternalFeedServiceFactory =
      this._audienceSegmentFeedServiceFactory('EXTERNAL_FEED');
    this._audienceTagFeedServiceFactory = this._audienceSegmentFeedServiceFactory('TAG_FEED');

    this.feedService =
      props.feed.type === 'EXTERNAL_FEED'
        ? this._audienceExternalFeedServiceFactory(props.feed.audience_segment_id)
        : this._audienceTagFeedServiceFactory(props.feed.audience_segment_id);
  }

  componentDidMount() {
    this.setState(
      {
        isLoading: true,
      },
      () => {
        Promise.all([this.getPluginLayout(), this.getProperties(), this.getInitialValues()]).then(
          () =>
            this.setState({
              isLoading: false,
            }),
        );
      },
    );
  }

  getPluginLayout() {
    const { feed, notifyError, onClose } = this.props;
    return this._pluginService
      .getLocalizedPluginLayoutFromVersionId(feed.version_id)
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
      .getAudienceFeedProperties(feed.id)
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
    pluginInstance: AudienceFeedTyped,
    properties: PropertyResourceShape[],
    name?: string,
    description?: string,
    activate?: boolean,
  ) => {
    const { notifyError, feed, onClose, onChange } = this.props;

    this.setState({ isLoading: true });
    const { type, version_value, version_id, status, ...newPluginInstance } = pluginInstance;

    return this.feedService
      .updatePluginInstance(
        pluginInstance.id,
        name ? { ...newPluginInstance, name: name } : newPluginInstance,
      )
      .then(() => this.updatePropertiesValue(properties, feed.organisation_id, pluginInstance.id))
      .then(() => {
        if (!activate) return Promise.resolve(undefined);
        return this.feedService.updateAudienceFeed(pluginInstance.id, {
          ...pluginInstance,
          status: 'ACTIVE',
        });
      })
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
        updatePromise(organisationId, pluginInstanceId, item.technical_name, item),
      );
    });
    return Promise.all(propertiesPromises);
  };

  render() {
    const {
      feed,
      modalTab,
      match: {
        params: { organisationId },
      },
      onClose,
      intl: { formatMessage },
      fieldValidators: { isRequired },
    } = this.props;
    const { isLoading, layout, pluginProperties, initialValues } = this.state;

    const feedStatsUnit = getFeedStatsUnit(feed);

    return (
      <PluginCardModal
        onClose={onClose}
        organisationId={feed.organisation_id}
        opened={true}
        plugin={{
          id: feed.id,
          organisation_id: feed.organisation_id,
          type: feed.type,
          group_id: feed.group_id,
          artifact_id: feed.artifact_id,
          current_version_id: feed.version_id,
          plugin_layout: layout,
          plugin_type:
            feed.type === 'EXTERNAL_FEED'
              ? 'AUDIENCE_SEGMENT_EXTERNAL_FEED'
              : 'AUDIENCE_SEGMENT_TAG_FEED',
        }}
        pluginChart={
          <FeedChart
            organisationId={organisationId}
            feedId={feed.id}
            feedStatsUnit={feedStatsUnit}
            dateRange={{
              from: new McsMoment('now-7d'),
              to: new McsMoment('now'),
            }}
          />
        }
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
          title: (
            <div>
              {formatMessage(messages.feedModalNameFieldTitle)}
              <br />
              <b>{formatMessage(messages.feedModalNameFieldTitleWarning)}</b>
            </div>
          ),
          placeholder: formatMessage(messages.feedModalNameFieldPlaceholder),
          display: true,
          disabled: feed.status === 'ACTIVE' || feed.status === 'PUBLISHED',
          value: feed.name,
          validator: [isRequired],
        }}
      />
    );
  }
}

export default compose<Props, EditPluginModalProps>(
  withRouter,
  injectNotifications,
  injectIntl,
  withValidators,
)(EditPluginModal);
