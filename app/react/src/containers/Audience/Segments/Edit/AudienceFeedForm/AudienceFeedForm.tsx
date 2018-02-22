import * as React from 'react';
import cuid from 'cuid';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import PluginContent from '../../../../Plugin/Edit/PluginContent';
import * as actions from '../../../../../state/Notifications/actions';
import { PluginProperty, PluginType } from '../../../../../models/Plugins';

import messages from '../messages';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { AudienceExternalFeedResource, AudienceTagFeedResource } from '../domain';


interface AudienceFeedRouteParam {
  organisationId: string;
  audienceSegmentid?: string;
}

type PluginAudienceFeedInterface = AudienceExternalFeedResource | AudienceTagFeedResource;

export interface AudienceFeedFormModel {
  plugin: PluginAudienceFeedInterface;
  properties?: PluginProperty[];
}

interface CreateAudienceFeedState {
  edition: boolean;
  isLoading: boolean;
  initialValues?: AudienceFeedFormModel;
}

export interface CreateAudienceFeedProps<T = any> {
  initialValues?: AudienceFeedFormModel;
  onClose: () => void;
  onSave: (a: T) => void;
  edition: boolean;
  type: PluginType;
}

type JoinedProps<T = any> = CreateAudienceFeedProps<T> &
  RouteComponentProps<AudienceFeedRouteParam> &
  InjectedIntlProps & InjectedNotificationProps;

class CreateAudienceFeed<T> extends React.Component<
  JoinedProps<T>,
  CreateAudienceFeedState
> {
  constructor(props: JoinedProps<T>) {
    super(props);

    this.state = {
      edition: props.edition,
      isLoading: false,
      initialValues: props.initialValues
    };
  }

 

  onSelect = (model: PluginAudienceFeedInterface) => {
    this.setState({
      initialValues: { plugin: model },
    });
  };

  onSave = (audienceFeed: any, properties: PluginProperty[]) => {
    const {
      onSave,
    } = this.props;

    const {
      edition
    } = this.state;

    let returnValue;

    if (edition) {
      const generatedAf = {
        ...audienceFeed,
        status: audienceFeed.status ? audienceFeed.status : 'PAUSED',
        properties: properties
      }
      returnValue = {
        key: audienceFeed.id,
        model: generatedAf
      }
    } else {
      const generatedAf = {
        artifact_id: audienceFeed.artifact_id,
        group_id: audienceFeed.group_id,
        status: "PAUSED",
        properties: properties
      }
      returnValue = {
        key: cuid(),
        model: generatedAf
      }
    }
    return onSave(returnValue as any)
  }

  render() {

    const { isLoading } = this.state;

    const breadcrumbPaths = [
      { name: this.state.initialValues && this.state.initialValues.plugin.artifact_id ? this.state.initialValues.plugin.artifact_id : 'Add a new Audience Feed' },
    ];
    

    return (
      <PluginContent
        pluginType={this.props.type}
        listTitle={this.props.type === 'AUDIENCE_SEGMENT_TAG_FEED' ?  messages.listTagTitle : messages.listExternalTitle}
        listSubTitle={this.props.type === 'AUDIENCE_SEGMENT_TAG_FEED' ?  messages.listTagSubTitle : messages.listExternalSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        saveOrCreatePluginInstance={this.onSave}
        onClose={this.props.onClose}
        onSelect={this.onSelect}
        editionMode={this.props.edition}
        initialValue={this.state.initialValues}
        loading={isLoading}
        showGeneralInformation={false}
      />
    );
  }
}

export default compose<JoinedProps, CreateAudienceFeedProps>(
  injectIntl,
  injectNotifications,
  withRouter,
  connect(undefined, { notifyError: actions.notifyError }),
)(CreateAudienceFeed);
