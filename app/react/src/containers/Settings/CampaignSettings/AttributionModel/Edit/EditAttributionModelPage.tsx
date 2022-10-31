import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {
  GenericPluginContent,
  PluginContentOuterProps,
} from '@mediarithmics-private/advanced-components';
import {
  AttributionModel,
  PluginResource,
  PluginInstance,
  PluginProperty,
} from '../../../../../models/Plugins';
import { Omit } from '../../../../../utils/Types';
import { DefaultSelect, FormSelectField } from '../../../../../components/Form';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IAttributionModelService } from '../../../../../services/AttributionModelService';

const AttributionModelPluginContent = GenericPluginContent as React.ComponentClass<
  PluginContentOuterProps<AttributionModel>
>;

const messages = defineMessages({
  listTitle: {
    id: 'settings.attributionmodel.edit.list.title',
    defaultMessage: 'Attribution Models',
  },
  listSubTitle: {
    id: 'settings.attributionmodel.edit.list.subtitle',
    defaultMessage: 'New Attribution Model',
  },
  attributionModelNewBreadcrumb: {
    id: 'settings.attributionmodel.create.breadcrumb.newtitle',
    defaultMessage: 'New Attribution Model',
  },
  attributionModelEditBreadcrumb: {
    id: 'settings.attributionmodel.create.breadcrumb.edittitle',
    defaultMessage: 'Edit {name}',
  },
  attributionModelModeLabel: {
    id: 'settings.attributionmodel.mode.label',
    defaultMessage: 'Mode',
  },
  attributionModelModeStrict: {
    id: 'settings.attributionmodel.mode.strict',
    defaultMessage: 'Strict',
  },
  attributionModelModeDiscovery: {
    id: 'settings.attributionmodel.mode.discovery',
    defaultMessage: 'Dicovery',
  },
  attributionModelModeTooltip: {
    id: 'settings.attributionmodel.mode.tooltip',
    defaultMessage:
      "'Strict' mode allows you to attribute only the campaigns that are linked to your goal, whereas 'discovery' helps your attribute the latest matching campaigns. By default disovery will be applied",
  },
});

interface AttributionModelRouteParam {
  organisationId: string;
  attributionModelId?: string;
}

type Props = RouteComponentProps<AttributionModelRouteParam> & InjectedIntlProps;

class EditAttributionModelPage extends React.Component<Props> {
  @lazyInject(TYPES.IAttributionModelService)
  private _attributionModelService: IAttributionModelService;

  redirect = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/campaigns/attribution_models`;
    history.push(attributionModelUrl);
  };

  saveOrCreatePluginInstance = (plugin: AttributionModel, properties: PluginProperty[]) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;

    history.push(`/v2/o/${organisationId}/settings/campaigns/attribution_models`);
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: AttributionModel,
  ): PluginInstance => {
    const result: Omit<AttributionModel, 'id'> = {
      // ...pluginInstance,
      version_id: pluginInstance.version_id,
      version_value: pluginInstance.version_value,
      attribution_processor_id: plugin.id,
      mode: pluginInstance.mode,
      artifact_id: plugin.artifact_id,
      group_id: plugin.group_id,
      organisation_id: organisationId,
      name: pluginInstance.name,
    };
    return result;
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { attributionModelId, organisationId },
      },
    } = this.props;

    const breadcrumbPaths = (attributionModel?: AttributionModel) => [
      <Link key='1' to={`/v2/o/${organisationId}/settings/campaigns/attribution_models`}>
        {formatMessage(messages.listTitle)}
      </Link>,
      attributionModel
        ? formatMessage(messages.attributionModelEditBreadcrumb, { name: attributionModel.name })
        : formatMessage(messages.attributionModelNewBreadcrumb),
    ];

    const renderSpecificFields = (disabled: boolean, prefix: string) => {
      return (
        <FormSelectField
          name={`${prefix}.mode`}
          component={DefaultSelect}
          formItemProps={{
            label: formatMessage(messages.attributionModelModeLabel),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.attributionModelModeTooltip),
          }}
          options={[
            {
              title: formatMessage(messages.attributionModelModeStrict),
              value: 'STRICT',
            },
            {
              title: formatMessage(messages.attributionModelModeDiscovery),
              value: 'DISCOVERY',
            },
          ]}
          disabled={disabled}
        />
      );
    };

    return (
      <AttributionModelPluginContent
        pluginType={'ATTRIBUTION_PROCESSOR'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        pluginInstanceService={this._attributionModelService}
        pluginInstanceId={attributionModelId}
        createPluginInstance={this.createPluginInstance}
        onSaveOrCreatePluginInstance={this.saveOrCreatePluginInstance}
        onClose={this.redirect}
        renderSpecificFields={renderSpecificFields}
      />
    );
  }
}

export default compose(withRouter, injectIntl)(EditAttributionModelPage);
