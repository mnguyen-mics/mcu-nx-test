import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import GenericPluginContent, { PluginContentOuterProps } from '../../../../Plugin/Edit/GenericPluginContent';
import {
  PluginProperty,
  PluginResource,
  PluginInstance,
} from '../../../../../models/Plugins';

import messages from './messages';
import { Omit } from '../../../../../utils/Types';
import { StoredProcedureResource } from '../../../../../models/datamart/StoredProcedure';
import { IStoredProcedureService, StoredProcedureService } from '../../../../../services/StoredProcedureService';
import { SpecificFieldsFunction } from '../../../../Plugin/Edit/PluginEditForm';
import { withDatamartSelector, WithDatamartSelectorProps } from '../../../../Datamart/WithDatamartSelector';
import GeneralInformation from './GeneralInformationSection';

const StoredProcedurePluginContent = GenericPluginContent as React.ComponentClass<PluginContentOuterProps<StoredProcedureResource>>

interface StoredProcedureRouteParam {
  organisationId: string;
  storedProcedureId?: string;
}

type JoinedProps = RouteComponentProps<StoredProcedureRouteParam> &
  InjectedIntlProps & WithDatamartSelectorProps;

class CreateEditStoredProcedure extends React.Component<JoinedProps> {

  private _storedProcedureService: IStoredProcedureService = new StoredProcedureService();
  
  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/datamart/stored_procedures`;
    history.push(attributionModelUrl);
  };

  renderSpecificFields: SpecificFieldsFunction = (disabled: boolean, fieldNamePrefix: string) => {
    return <GeneralInformation />
  }

  onSaveOrCreatePluginInstance = (
    plugin: StoredProcedureResource,
    properties: PluginProperty[],
  ) => {

    const {
      match: { params: { organisationId } },
      history,
    } = this.props;
    history.push(
      `/v2/o/${organisationId}/settings/datamart/stored_procedures`,
    );
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: StoredProcedureResource,
  ): PluginInstance => {
    const { selectedDatamartId } = this.props;

    const result: Omit<StoredProcedureResource, "id"> = {
      // ...pluginInstance,
      version_id: pluginInstance.version_id,
      version_value: pluginInstance.version_value,
      artifact_id: plugin.artifact_id,
      group_id: plugin.group_id,
      organisation_id: organisationId,
      name: pluginInstance.name,
      datamart_id: selectedDatamartId,
      field_name: pluginInstance.field_name,
      field_type_name: pluginInstance.field_type_name,
      hosting_object_type_name: pluginInstance.hosting_object_type_name,
      query: pluginInstance.query,
      status: "INITIAL",
    }
    return result
  }

  render() {
    const {
      intl: { formatMessage },
      match: { params: { storedProcedureId } },
    } = this.props;

    const breadcrumbPaths = (visitAnalyzer?: StoredProcedureResource) => [
      {
        name: visitAnalyzer
          ? formatMessage(messages.editBreadcrumb, { name: visitAnalyzer.name })
          : formatMessage(messages.createBreadcrumb),
      },
    ];

    return (
      <StoredProcedurePluginContent
        pluginType={'STORED_PROCEDURE'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        pluginInstanceService={this._storedProcedureService}
        pluginInstanceId={storedProcedureId}
        createPluginInstance={this.createPluginInstance}
        onSaveOrCreatePluginInstance={this.onSaveOrCreatePluginInstance}
        onClose={this.redirect}
        renderSpecificFields={this.renderSpecificFields}
      />
    );
  }
}

export default compose(
  withDatamartSelector,
  injectIntl,
)(CreateEditStoredProcedure);
