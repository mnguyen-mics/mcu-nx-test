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
import { MlFunctionResource } from '../../../../../models/datamart/MlFunction';
import { IMlFunctionService, MlFunctionService } from '../../../../../services/MlFunctionService';
import { SpecificFieldsFunction } from '../../../../Plugin/Edit/PluginEditForm';
import { withDatamartSelector, WithDatamartSelectorProps } from '../../../../Datamart/WithDatamartSelector';
import GeneralInformation from './GeneralInformationSection';
import RuntimeSchemaService from '../../../../../services/RuntimeSchemaService';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { Loading } from '../../../../../components';

const MlFunctionPluginContent = GenericPluginContent as React.ComponentClass<PluginContentOuterProps<MlFunctionResource>>

interface MlFunctionRouteParam {
  organisationId: string;
  mlFunctionId?: string;
}

interface IState {
  objects: string[];
  loading: boolean;
}

type JoinedProps = RouteComponentProps<MlFunctionRouteParam> &
  InjectedIntlProps & WithDatamartSelectorProps & InjectedNotificationProps;

class EditMlFunctionPage extends React.Component<JoinedProps, IState> {

  private _mlFunctionService: IMlFunctionService = new MlFunctionService();

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
    const attributionModelUrl = `/v2/o/${organisationId}/settings/datamart/ml_functions`;
    history.push(attributionModelUrl);
  };

  renderSpecificFields: SpecificFieldsFunction = (disabled: boolean, fieldNamePrefix: string) => {
    const { objects } = this.state;
    return <GeneralInformation disabled={disabled} fieldNamePrefix={fieldNamePrefix} objects={objects} />
  }

  onSaveOrCreatePluginInstance = (
    plugin: MlFunctionResource,
    properties: PluginProperty[],
  ) => {

    const {
      match: { params: { organisationId } },
      history,
    } = this.props;
    history.push(
      `/v2/o/${organisationId}/settings/datamart/ml_functions`,
    );
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: MlFunctionResource,
  ): PluginInstance => {
    const { selectedDatamartId } = this.props;

    const result: Omit<MlFunctionResource, "id"> = {
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
      match: { params: { mlFunctionId } },
    } = this.props;

    const {
      loading,
    } = this.state;

    const breadcrumbPaths = (visitAnalyzer?: MlFunctionResource) => [
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
      <MlFunctionPluginContent
        pluginType={'ML_FUNCTION'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        pluginInstanceService={this._mlFunctionService}
        pluginInstanceId={mlFunctionId}
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
)(EditMlFunctionPage);
