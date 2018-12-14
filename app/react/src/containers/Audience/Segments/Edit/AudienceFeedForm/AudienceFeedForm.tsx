import * as React from 'react';
import { compose, Omit } from 'recompose';
import { connect } from 'react-redux';
import { Alert } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import * as actions from '../../../../../state/Notifications/actions';
import {
  PluginProperty,
  PluginType,
  AudienceExternalFeed,
  AudienceTagFeed,
  PluginResource,
  PluginInstance,
} from '../../../../../models/Plugins';

import messages from '../messages';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { AudienceFeedFormModel, FeedRouteParams } from './domain';
import { Path } from '../../../../../components/ActionBar';
import GenericPluginContent from '../../../../Plugin/Edit/GenericPluginContent';
import AudienceSegmentFeedService from '../../../../../services/AudienceSegmentFeedService';


export interface CreateAudienceFeedProps<T = any> {
  initialValues?: AudienceFeedFormModel;
  onClose: () => void;
  onSave: (a: T) => void;
  type: PluginType;
  breadcrumbPaths: Path[];
}

type JoinedProps<T = any> = CreateAudienceFeedProps<T> &
  RouteComponentProps<FeedRouteParams> &
  InjectedIntlProps &
  InjectedNotificationProps;

class CreateAudienceFeed<T> extends React.Component<
  JoinedProps<T>
  > {

  feedService: AudienceSegmentFeedService;
  constructor(props: JoinedProps<T>) {
    super(props);
    const type = props.type === 'AUDIENCE_SEGMENT_EXTERNAL_FEED' ? 'EXTERNAL_FEED' : 'TAG_FEED';
    this.feedService = new AudienceSegmentFeedService(props.match.params.segmentId, type)
  }

  onSave = (audienceFeed: any, properties: PluginProperty[]) => {
    const { onSave } = this.props;

    const returnValue = {
      plugin: audienceFeed,
      properties: properties,
    };

    return onSave(returnValue as any);
  };

  createTagFeedPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: AudienceTagFeed,
  ): PluginInstance => {
    //
    // Change any here to the approriate value when AudienceTag returns the version_id
    //
    const result: any = {
      // ...pluginInstance,
      version_id: pluginInstance.version_id,
      current_version_id: pluginInstance.version_value,
      artifact_id: plugin.artifact_id,
      group_id: plugin.group_id,
      organisation_id: organisationId,
      plugin_type: 'AUDIENCE_SEGMENT_TAG_FEED',
    };
    return result;
  };

  createExternalFeedPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: AudienceExternalFeed,
  ): PluginInstance => {
    const {
      match: {
        params: { segmentId },
      },
    } = this.props;

    const result: Omit<AudienceExternalFeed, 'id'> = {
      // ...pluginInstance,
      version_id: pluginInstance.version_id,
      version_value: pluginInstance.version_value,
      artifact_id: plugin.artifact_id,
      group_id: plugin.group_id,
      organisation_id: organisationId,
      audience_segment_id: segmentId,
      status: 'INITIAL',
    };
    return result;
  };

  render() {
    const {
      breadcrumbPaths,
      type,
      onClose,
      initialValues,
      match: { 
        params: { 
          feedId,  
        } 
      },
      intl: { formatMessage },
    } = this.props;

    const paths = () => breadcrumbPaths;

    const showedMessage =
      initialValues && initialValues.plugin.status === 'ACTIVE' ? (
        <Alert
          message={formatMessage(messages.audienceFeedWarningMessage)}
          type="warning"
        />
      ) : (
        undefined
      );

    return (
      <GenericPluginContent
          pluginType={type}
          listTitle={messages.listTagTitle}
          listSubTitle={messages.listTagSubTitle}
          breadcrumbPaths={paths}
          pluginInstanceService={this.feedService}
          pluginInstanceId={feedId}
          createPluginInstance={this.createTagFeedPluginInstance}
          onSaveOrCreatePluginInstance={this.onSave}
          onClose={onClose}
          showGeneralInformation={false}
          showedMessage={showedMessage}
          disableFields={initialValues && (initialValues.plugin.status === 'ACTIVE' || initialValues.plugin.status === 'PUBLISHED')}
          isCardLayout={true}
      />
    )
  }
}

export default compose<JoinedProps, CreateAudienceFeedProps>(
  injectIntl,
  injectNotifications,
  withRouter,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(CreateAudienceFeed);
