import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import AttributionModelService from '../../../../../services/Library/AttributionModelService';
import * as actions from '../../../../../state/Notifications/actions';
import { AttributionModel, PluginProperty, PluginResource, PluginInstance } from '../../../../../models/Plugins';

import messages from './messages';
import GenericPluginContent, { PluginInstanceForm, PluginContentOuterProps } from '../../../../Plugin/Edit/GenericPluginContent';
import { Omit } from 'antd/lib/form/Form';

const AttributionModelPluginContent = GenericPluginContent as React.ComponentClass<PluginContentOuterProps<AttributionModel>>
interface AttributionModelRouteParam {
  organisationId: string;
  attributionModelId?: string;
}

interface AttributionModelForm  extends PluginInstanceForm<AttributionModel>{
  plugin: AttributionModel;
  properties?: PluginProperty[];
}

interface CreateAttributionModelState {
  edition: boolean;
  isLoading: boolean;
  initialValues?: AttributionModelForm;
}

interface CreateAttributionModelProps {
  notifyError: (err?: any) => void;
}

type JoinedProps = CreateAttributionModelProps &
  RouteComponentProps<AttributionModelRouteParam> &
  InjectedIntlProps;

class CreateAttributionModel extends React.Component<
  JoinedProps,
  CreateAttributionModelState
> {
  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      edition: props.match.params.attributionModelId ? true : false,
      isLoading: true,
    };
  }



  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/campaigns/attribution_models`;
    history.push(attributionModelUrl);
  };

  onSaveOrCreatePluginInstance = (
    plugin: AttributionModel,
    properties: PluginProperty[],
  ) => {

    const {
      match: { params: { organisationId } },
      history,
    } = this.props;
            this.setState({ isLoading: false }, () => {
              history.push(
                `/v2/o/${organisationId}/settings/campaigns/attribution_models`,
              );
            });
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource, 
    pluginInstance: AttributionModel,
  ): PluginInstance => {
    const result : Omit<AttributionModel, "id"> = {
      // ...pluginInstance,
      version_id: plugin.current_version_id,
      version_value: pluginInstance.version_value,
      attribution_processor_id: plugin.id,
      mode: pluginInstance.mode,
      artifact_id: plugin.artifact_id,
      group_id: plugin.group_id,
      organisation_id: organisationId,
       name: pluginInstance.name
    }
    return result
  }

  render() {
    const { 
      intl: { formatMessage },
       match: { params: { attributionModelId } }, 
    notifyError,
    } = this.props;


    const breadcrumbPaths = [
      { name: attributionModelId
        ? formatMessage(messages.attributionModelEditBreadcrumb, {
            name:
              this.state.initialValues &&
              this.state.initialValues.plugin.name,
          })
        : formatMessage(messages.attributionModelNewBreadcrumb), },
    ];

    return (
      <AttributionModelPluginContent
        pluginType={'ATTRIBUTION_PROCESSOR'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        pluginInstanceService={AttributionModelService}
        pluginInstanceId={attributionModelId}
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
  connect(undefined, { notifyError: actions.notifyError }),
)(CreateAttributionModel);
