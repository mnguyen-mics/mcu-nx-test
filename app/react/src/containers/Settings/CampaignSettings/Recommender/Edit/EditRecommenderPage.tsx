import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {
  PluginProperty,
  Recommender,
  PluginResource,
  PluginInstance,
} from '../../../../../models/Plugins';

import messages from './messages';
import {
  GenericPluginContent,
  PluginContentOuterProps,
} from '@mediarithmics-private/advanced-components';
import { Omit } from '../../../../../utils/Types';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IRecommenderService } from '../../../../../services/Library/RecommenderService';

const RecommenderPluginContent = GenericPluginContent as React.ComponentClass<
  PluginContentOuterProps<Recommender>
>;
interface RecommenderRouteParam {
  organisationId: string;
  recommenderId?: string;
}

type JoinedProps = RouteComponentProps<RecommenderRouteParam> & WrappedComponentProps;

class EditRecommenderPage extends React.Component<JoinedProps> {
  @lazyInject(TYPES.IRecommenderService)
  private _recommenderService: IRecommenderService;

  redirect = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/campaigns/recommenders`;
    history.push(attributionModelUrl);
  };

  onSaveOrCreatePluginInstance = (plugin: Recommender, properties: PluginProperty[]) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;
    history.push(`/v2/o/${organisationId}/settings/campaigns/recommenders`);
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: Recommender,
  ): PluginInstance => {
    const result: Omit<Recommender, 'id'> = {
      // ...pluginInstance,
      version_id: pluginInstance.version_id,
      version_value: pluginInstance.version_value,
      artifact_id: plugin.artifact_id,
      group_id: plugin.group_id,
      organisation_id: organisationId,
      recommenders_plugin_id: plugin.id,
      name: pluginInstance.name,
    };
    return result;
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { recommenderId, organisationId },
      },
    } = this.props;

    const breadcrumbPaths = (recommender?: Recommender) => [
      <Link key='1' to={`/v2/o/${organisationId}/settings/campaigns/recommenders`}>
        {formatMessage(messages.listTitle)}
      </Link>,
      recommender
        ? formatMessage(messages.recommenderEditBreadcrumb, {
            name: recommender.name,
          })
        : formatMessage(messages.recommenderNewBreadcrumb),
    ];

    return (
      <RecommenderPluginContent
        pluginType={'RECOMMENDER'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        pluginInstanceService={this._recommenderService}
        pluginInstanceId={recommenderId}
        createPluginInstance={this.createPluginInstance}
        onSaveOrCreatePluginInstance={this.onSaveOrCreatePluginInstance}
        onClose={this.redirect}
      />
    );
  }
}

export default compose<JoinedProps, {}>(injectIntl, withRouter)(EditRecommenderPage);
