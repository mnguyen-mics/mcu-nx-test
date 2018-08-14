import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import GenericPluginContent, { PluginContentOuterProps } from '../../../../Plugin/Edit/GenericPluginContent';
import { AttributionModel, PluginResource, PluginInstance, PluginProperty } from '../../../../../models/Plugins';
import AttributionModelService from '../../../../../services/AttributionModelService';
import { Omit } from '../../../../../utils/Types';

const AttributionModelPluginContent = GenericPluginContent as React.ComponentClass<PluginContentOuterProps<AttributionModel>>

const messages = defineMessages({
  listTitle: {
    id: 'attributionmodel.edit.list.title',
    defaultMessage: 'Attribution Models',
  },
  listSubTitle: {
    id: 'attributionmodel.edit.list.subtitle',
    defaultMessage: 'New Attribution Model',
  },
  attributionModelBreadcrumb: {
    id: 'attributionmodel.edit.list.subtitle',
    defaultMessage: 'New Attribution Model',
  },
});

interface AttributionModelRouteParam {
  organisationId: string;
  attributionModelId?: string;
}

interface State {
  isLoading: boolean;
}

type Props = RouteComponentProps<AttributionModelRouteParam> &
  InjectedNotificationProps &
  InjectedIntlProps;

class EditAttributionModelPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/campaigns/attribution_models`;
    history.push(attributionModelUrl);
  };

  saveOrCreatePluginInstance = (
    plugin: AttributionModel,
    properties: PluginProperty[],
  ) => {
    const {
      match: { params: { organisationId } },
      history,
    } = this.props;

    history.push(`/v2/o/${organisationId}/settings/campaigns/attribution_models`);

    
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: AttributionModel,
  ): PluginInstance => {
    const result: Omit<AttributionModel, "id"> = {
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
      { name: formatMessage(messages.attributionModelBreadcrumb) },
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
        onSaveOrCreatePluginInstance={this.saveOrCreatePluginInstance}
        onClose={this.redirect}
        notifyError={notifyError}
      />
    );
  }
}

export default compose(withRouter, injectNotifications, injectIntl)(
  EditAttributionModelPage,
);
