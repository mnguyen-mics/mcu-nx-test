import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps, Omit } from 'react-router';
import BidOptimizerService from '../../../../../services/Library/BidOptimizerService';
import {
  PluginProperty,
  BidOptimizer,
  PluginResource,
  PluginInstance,
} from '../../../../../models/Plugins';

import messages from './messages';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import GenericPluginContent, { PluginContentOuterProps } from '../../../../Plugin/Edit/GenericPluginContent';

const BidOptimizerPluginContent = GenericPluginContent as React.ComponentClass<PluginContentOuterProps<BidOptimizer>>

interface BidOptimizerRouteParam {
  organisationId: string;
  bidOptimizerId?: string;
}

interface BidOptimizerForm {
  plugin: any;
  properties?: PluginProperty[];
}

interface CreateBidOptimizerState {
  edition: boolean;
  isLoading: boolean;
  initialValues?: BidOptimizerForm;
  selectedBidOptimizer?: PluginResource;
}

type JoinedProps = InjectedNotificationProps &
  RouteComponentProps<BidOptimizerRouteParam> &
  InjectedIntlProps;

class CreateEditBidOptimizer extends React.Component<
  JoinedProps,
  CreateBidOptimizerState
> {
  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      edition: props.match.params.bidOptimizerId ? true : false,
      isLoading: true,
    };
  }

  
  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/campaigns/bid_optimizer`;
    history.push(attributionModelUrl);
  };


  onSaveOrCreatePluginInstance = (
    plugin: BidOptimizer,
    properties: PluginProperty[],
  ) => {

    const {
      match: { params: { organisationId } },
      history,
    } = this.props;
      this.setState({ isLoading: false }, () => {
        history.push(
          `/v2/o/${organisationId}/settings/campaigns/bid_optimizer`
        );
      });
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource, 
    pluginInstance: BidOptimizer,
  ): PluginInstance => {
    const result : Omit<BidOptimizer, "id"> = {
      // ...pluginInstance,
      version_id: plugin.current_version_id,
      engine_version_id: plugin.current_version_id,
      version_value: pluginInstance.version_value,
      engine_artifact_id: plugin.artifact_id,
      artifact_id: plugin.artifact_id,
      group_id: plugin.group_id,
      engine_group_id: plugin.group_id,
      organisation_id: organisationId,
       name: pluginInstance.name
    }
    return result
  }


  render() {
    const { intl: { formatMessage }, match: { params: { bidOptimizerId } }, notifyError } = this.props;

    

    const breadcrumbPaths = [
      { name: bidOptimizerId
        ? formatMessage(messages.bidOptimizerEditBreadcrumb, {
            name:
              this.state.initialValues &&
              this.state.initialValues.plugin.name,
          })
        : formatMessage(messages.bidOptimizerNewBreadcrumb), },
    ];

    return (
      <BidOptimizerPluginContent
        pluginType={'BID_OPTIMIZATION_ENGINE'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        pluginInstanceService={BidOptimizerService}
        pluginInstanceId={bidOptimizerId}
        createPluginInstance={this.createPluginInstance}
        onSaveOrCreatePluginInstance={this.onSaveOrCreatePluginInstance}
        onClose={this.redirect}
        notifyError={notifyError}
      />
    );
  }
}

export default compose<JoinedProps, {}>(
  injectIntl,
  withRouter,
  injectNotifications,
)(CreateEditBidOptimizer);
