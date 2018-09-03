import * as React from 'react';
import { compose, Omit } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import * as actions from '../../../../../state/Notifications/actions';
import { PluginProperty, PluginType, AudienceExternalFeed, AudienceTagFeed, PluginResource, PluginInstance } from '../../../../../models/Plugins';

import messages from '../messages';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { AudienceFeedFormModel, PluginAudienceFeedInterface, FeedRouteParams } from './domain';
import { Path } from '../../../../../components/ActionBar';
import GenericPluginContent, { PluginContentOuterProps } from '../../../../Plugin/Edit/GenericPluginContent';
import AudienceTagFeedService from '../../../../../services/AudienceTagFeedServices';
import AudienceExternalFeedServices from '../../../../../services/AudienceExternalFeedService';


const AudienceExternalFeedPluginContent = GenericPluginContent as React.ComponentClass<PluginContentOuterProps<AudienceExternalFeed>>
const AudienceTagFeedPluginContent = GenericPluginContent as React.ComponentClass<PluginContentOuterProps<AudienceTagFeed>>


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
  constructor(props: JoinedProps<T>) {
    super(props);
  }



  onSelect = (model: PluginAudienceFeedInterface) => {
    this.setState({
      initialValues: { plugin: model },
    });
  };

  onSave = (audienceFeed: any, properties: PluginProperty[]) => {
    const { onSave } = this.props;

    const returnValue = {
      plugin: audienceFeed,
      properties: properties
    }

    return onSave(returnValue as any)
  }

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
      current_version_id: pluginInstance.version_value,
      artifact_id: plugin.artifact_id,
      group_id: plugin.group_id,
      organisation_id: organisationId,
      plugin_type: "AUDIENCE_SEGMENT_TAG_FEED"
    }
    return result
  }

  createExternalFeedPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: AudienceExternalFeed,
  ): PluginInstance => {
 
    const { match: { params: { segmentId } } } = this.props;
    
    const result: Omit<AudienceExternalFeed, "id"> = {
      // ...pluginInstance,
      version_id: plugin.current_version_id,
      version_value: pluginInstance.version_value,
      artifact_id: plugin.artifact_id,
      group_id: plugin.group_id,
      organisation_id: organisationId,
      audience_segment_id: segmentId,
      status: "INITIAL"
    }
    return result
  }

  render() {
    const { breadcrumbPaths, type, onClose, initialValues, match: { params: { segmentId, feedId,  } } } = this.props;

    const paths = () => breadcrumbPaths

    

    if (type === 'AUDIENCE_SEGMENT_TAG_FEED') {

      const audienceTagFeedService = new AudienceTagFeedService(segmentId);

      return (
        <AudienceTagFeedPluginContent
          pluginType={'AUDIENCE_SEGMENT_TAG_FEED'}
          listTitle={messages.listTagTitle}
          listSubTitle={messages.listTagSubTitle}
          breadcrumbPaths={paths}
          pluginInstanceService={audienceTagFeedService}
          pluginInstanceId={feedId}
          createPluginInstance={this.createTagFeedPluginInstance}
          onSaveOrCreatePluginInstance={this.onSave}
          onClose={onClose}
          showGeneralInformation={false}
          disableFields={initialValues && (initialValues.plugin.status === 'ACTIVE' || initialValues.plugin.status === 'PUBLISHED')}
        />
      ) 
    }

    if (type === "AUDIENCE_SEGMENT_EXTERNAL_FEED") {
      const audienceExternalFeedService = new AudienceExternalFeedServices(segmentId);
      return (
        <AudienceExternalFeedPluginContent
          pluginType={'AUDIENCE_SEGMENT_EXTERNAL_FEED'}
          listTitle={messages.listExternalTitle}
          listSubTitle={messages.listExternalSubTitle}
          breadcrumbPaths={paths}
          pluginInstanceService={audienceExternalFeedService}
          pluginInstanceId={feedId}
          createPluginInstance={this.createExternalFeedPluginInstance}
          onSaveOrCreatePluginInstance={this.onSave}
          onClose={onClose}
          showGeneralInformation={false}
          disableFields={initialValues && (initialValues.plugin.status === 'ACTIVE' || initialValues.plugin.status === 'PUBLISHED')}
        />
      )
    }

    return null
  }
}

export default compose<JoinedProps, CreateAudienceFeedProps>(
  injectIntl,
  injectNotifications,
  withRouter,
  connect(undefined, { notifyError: actions.notifyError }),
)(CreateAudienceFeed);
