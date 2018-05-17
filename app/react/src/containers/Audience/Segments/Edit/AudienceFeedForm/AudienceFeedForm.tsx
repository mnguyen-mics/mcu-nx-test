import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import PluginContent from '../../../../Plugin/Edit/PluginContent';
import * as actions from '../../../../../state/Notifications/actions';
import { PluginProperty, PluginType } from '../../../../../models/Plugins';

import messages from '../messages';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { EditAudienceSegmentParam } from '../domain';
import { AudienceFeedFormModel, PluginAudienceFeedInterface } from './domain';
import { Path } from '../../../../../components/ActionBar';


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
  identifier: string | null;
  breadcrumbPaths: Path[];
}

type JoinedProps<T = any> = CreateAudienceFeedProps<T> &
  RouteComponentProps<EditAudienceSegmentParam> &
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

    const returnValue = {
      plugin: audienceFeed,
      properties: properties
    }

    return onSave(returnValue as any)
  }

  render() {
    const { breadcrumbPaths } = this.props;
    const { isLoading } = this.state;

    return (
      <PluginContent
        pluginType={this.props.type}
        listTitle={this.props.type === 'AUDIENCE_SEGMENT_TAG_FEED' ? messages.listTagTitle : messages.listExternalTitle}
        listSubTitle={this.props.type === 'AUDIENCE_SEGMENT_TAG_FEED' ? messages.listTagSubTitle : messages.listExternalSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        saveOrCreatePluginInstance={this.onSave}
        onClose={this.props.onClose}
        onSelect={this.onSelect}
        editionMode={this.props.edition}
        initialValue={this.state.initialValues}
        loading={isLoading}
        showGeneralInformation={false}
        disableFields={this.state.initialValues && (this.state.initialValues.plugin.status === 'ACTIVE' || this.state.initialValues.plugin.status === 'PUBLISHED')}
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
