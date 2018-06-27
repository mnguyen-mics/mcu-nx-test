import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import RecommenderService from '../../../../../services/Library/RecommenderService';
import * as actions from '../../../../../state/Notifications/actions';
import {
  PluginProperty,
  Recommender,
  PluginResource,
  PluginInstance,
} from '../../../../../models/Plugins';

import messages from './messages';
import GenericPluginContent, { PluginContentOuterProps } from '../../../../Plugin/Edit/GenericPluginContent';
import { Omit } from 'antd/lib/form/Form';

const RecommenderPluginContent = GenericPluginContent as React.ComponentClass<PluginContentOuterProps<Recommender>>
interface RecommenderRouteParam {
  organisationId: string;
  recommenderId?: string;
}

interface RecommenderForm {
  plugin: any;
  properties?: PluginProperty[];
}

interface CreateRecommenderState {
  edition: boolean;
  isLoading: boolean;
  initialValues?: RecommenderForm;
  selectedRecommender?: PluginResource;
}

interface CreateRecommenderProps {
  notifyError: (err?: any) => void;
}

type JoinedProps = CreateRecommenderProps &
  RouteComponentProps<RecommenderRouteParam> &
  InjectedIntlProps;

class CreateEditRecommender extends React.Component<
  JoinedProps,
  CreateRecommenderState
> {
  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      edition: props.match.params.recommenderId ? true : false,
      isLoading: true,
    };
  }

  
  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/campaigns/recommenders`;
    history.push(attributionModelUrl);
  };
  onSaveOrCreatePluginInstance = (
    plugin: Recommender,
    properties: PluginProperty[],
  ) => {

    const {
      match: { params: { organisationId } },
      history,
    } = this.props;
            this.setState({ isLoading: false }, () => {
              history.push(
                `/v2/o/${organisationId}/settings/campaigns/recommenders`,
              );
            });
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource, 
    pluginInstance: Recommender,
  ): PluginInstance => {
    const result : Omit<Recommender, "id"> = {
      // ...pluginInstance,
      version_id: plugin.current_version_id,
      version_value: pluginInstance.version_value,
      artifact_id: plugin.artifact_id,
      group_id: plugin.group_id,
      organisation_id: organisationId,
      recommenders_plugin_id: plugin.id,
      name: pluginInstance.name
    }
    return result
  };


  render() {
    const { intl: { formatMessage }, match: { params: { recommenderId } },notifyError } = this.props;


    const breadcrumbPaths = [
      { name: recommenderId
        ? formatMessage(messages.recommenderEditBreadcrumb, {
            name:
              this.state.initialValues &&
              this.state.initialValues.plugin.name,
          })
        : formatMessage(messages.recommenderNewBreadcrumb), },
    ];

    return (
      <RecommenderPluginContent
        pluginType={'RECOMMENDER'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        pluginInstanceService={RecommenderService}
        pluginInstanceId={recommenderId}
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
  // withDrawer,
  connect(undefined, { notifyError: actions.notifyError }),
)(CreateEditRecommender);
