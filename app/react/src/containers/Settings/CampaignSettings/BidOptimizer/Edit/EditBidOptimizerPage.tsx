import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps, Omit } from 'react-router';
import {
  PluginProperty,
  BidOptimizer,
  PluginResource,
  PluginInstance,
} from '../../../../../models/Plugins';

import messages from './messages';
import GenericPluginContent, { PluginContentOuterProps } from '../../../../Plugin/Edit/GenericPluginContent';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IBidOptimizerService } from '../../../../../services/Library/BidOptimizerService';

const BidOptimizerPluginContent = GenericPluginContent as React.ComponentClass<PluginContentOuterProps<BidOptimizer>>

interface BidOptimizerRouteParam {
  organisationId: string;
  bidOptimizerId?: string;
}

type JoinedProps = RouteComponentProps<BidOptimizerRouteParam> &
  InjectedIntlProps;

class EditBidOptimizerPage extends React.Component<
  JoinedProps
  > {

    @lazyInject(TYPES.IBidOptimizerService)
  private _bidOptimizerService: IBidOptimizerService;

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
    history.push(
      `/v2/o/${organisationId}/settings/campaigns/bid_optimizer`
    );
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: BidOptimizer,
  ): PluginInstance => {
    const result: Omit<BidOptimizer, "id"> = {
      // ...pluginInstance,
      version_id: pluginInstance.version_id,
      engine_version_id: pluginInstance.version_id,
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
    const { intl: { formatMessage }, match: { params: { bidOptimizerId } } } = this.props;



    const breadcrumbPaths = (bidOptimizer?: BidOptimizer) => [
      {
        name: bidOptimizer
          ? formatMessage(messages.bidOptimizerEditBreadcrumb, { name: bidOptimizer.name })
          : formatMessage(messages.bidOptimizerNewBreadcrumb),
      },
    ];

    return (
      <BidOptimizerPluginContent
        pluginType={'BID_OPTIMIZATION_ENGINE'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        pluginInstanceService={this._bidOptimizerService}
        pluginInstanceId={bidOptimizerId}
        createPluginInstance={this.createPluginInstance}
        onSaveOrCreatePluginInstance={this.onSaveOrCreatePluginInstance}
        onClose={this.redirect}
      />
    );
  }
}

export default compose<JoinedProps, {}>(
  injectIntl,
  withRouter,
)(EditBidOptimizerPage);
