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
import RuntimeSchemaService from '../../../../../services/RuntimeSchemaService';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { Loading } from '../../../../../components';

const StoredProcedurePluginContent = GenericPluginContent as React.ComponentClass<PluginContentOuterProps<StoredProcedureResource>>

interface StoredProcedureRouteParam {
  organisationId: string;
  storedProcedureId?: string;
}

interface IState {
  objects: string[];
  loading: boolean;
}

type JoinedProps = RouteComponentProps<StoredProcedureRouteParam> &
  InjectedIntlProps & WithDatamartSelectorProps & InjectedNotificationProps;

class EditStoredProcedurePage extends React.Component<JoinedProps, IState> {

  private _storedProcedureService: IStoredProcedureService = new StoredProcedureService();

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      objects: [],
      loading: true
    }
  }

  componentDidMount() {
    this.fetchObjectTypes(this.props.selectedDatamartId)
  }
  
  componentDidUpdate(prevProps: JoinedProps, prevState: IState) {
    if (this.props.selectedDatamartId !== prevProps.selectedDatamartId) {
      this.fetchObjectTypes(this.props.selectedDatamartId)
    }
  }

  fetchObjectTypes = (
    datamartId: string,
  ) => {
    this.setState({ loading: true })
    return RuntimeSchemaService.getRuntimeSchemas(datamartId).then(schemaRes => {
        const liveSchema = schemaRes.data.find(s => s.status === 'LIVE');
        if (!liveSchema) return [];
        return RuntimeSchemaService.getObjectTypeInfoResources(
          datamartId,
          liveSchema.id,
        )
      },
    )
    .then(r =>  this.setState({ objects: r.map(a => a.name), loading: false }))
    .catch((err) => {
      this.setState({ loading: false })
      this.props.notifyError(err)
    });
  };
  
  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/datamart/stored_procedures`;
    history.push(attributionModelUrl);
  };

  renderSpecificFields: SpecificFieldsFunction = (disabled: boolean, fieldNamePrefix: string) => {
    const { objects } = this.state;
    return <GeneralInformation disabled={disabled} fieldNamePrefix={fieldNamePrefix} objects={objects} />
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
      expiration_period: "P1D",
      status: "INITIAL",
    }
    return result
  }

  render() {
    const {
      intl: { formatMessage },
      match: { params: { storedProcedureId } },
    } = this.props;

    const {
      loading,
    } = this.state;

    const breadcrumbPaths = (visitAnalyzer?: StoredProcedureResource) => [
      {
        name: visitAnalyzer
          ? formatMessage(messages.editBreadcrumb, { name: visitAnalyzer.name })
          : formatMessage(messages.createBreadcrumb),
      },
    ];

    if (loading) {
      return <Loading />
    }

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
  injectNotifications,
  injectIntl,
)(EditStoredProcedurePage);
