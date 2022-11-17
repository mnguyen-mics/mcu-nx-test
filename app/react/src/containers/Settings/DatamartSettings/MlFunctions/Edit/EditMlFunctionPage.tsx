import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import {
  GenericPluginContent,
  PluginContentOuterProps,
  SpecificFieldsFunction,
} from '@mediarithmics-private/advanced-components';
import { PluginProperty, PluginResource, PluginInstance } from '../../../../../models/Plugins';
import { DatamartSelector } from '../../../../Datamart';
import messages from './messages';
import { Omit } from '../../../../../utils/Types';
import { MlFunctionResource } from '../../../../../models/datamart/MlFunction';
import { IMlFunctionService } from '../../../../../services/MlFunctionService';
import GeneralInformation from './GeneralInformationSection';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { Loading } from '../../../../../components';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IRuntimeSchemaService } from '../../../../../services/RuntimeSchemaService';

const MlFunctionPluginContent = GenericPluginContent as React.ComponentClass<
  PluginContentOuterProps<MlFunctionResource>
>;

interface MlFunctionRouteParam {
  organisationId: string;
  mlFunctionId?: string;
}

interface IState {
  objects: string[];
  loading: boolean;
  datamartId?: string;
}

type JoinedProps = RouteComponentProps<MlFunctionRouteParam> &
  WrappedComponentProps &
  InjectedNotificationProps;

class EditMlFunctionPage extends React.Component<JoinedProps, IState> {
  @lazyInject(TYPES.IMlFunctionService)
  private _mlFunctionService: IMlFunctionService;

  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      objects: [],
      loading: false,
    };
  }

  componentDidMount() {
    const { datamartId } = this.state;
    if (datamartId) {
      this.fetchObjectTypes(datamartId);
    }
  }

  componentDidUpdate(prevProps: JoinedProps, prevState: IState) {
    const newDatamartId = this.state.datamartId;
    if (newDatamartId && newDatamartId !== prevState.datamartId) {
      this.fetchObjectTypes(newDatamartId);
    }
  }

  isObjectTypeAllowed = (objectType: string) => {
    return ['UserPoint'].includes(objectType);
  };

  fetchObjectTypes = (datamartId: string) => {
    this.setState({ loading: true });
    return this._runtimeSchemaService
      .getRuntimeSchemas(datamartId)
      .then(schemaRes => {
        const liveSchema = schemaRes.data.find(s => s.status === 'LIVE');
        if (!liveSchema) return [];
        return this._runtimeSchemaService.getObjectTypeInfoResources(datamartId, liveSchema.id);
      })
      .then(r =>
        this.setState({
          objects: r.map(a => a.name).filter(this.isObjectTypeAllowed),
          loading: false,
        }),
      )
      .catch(err => {
        this.setState({ loading: false });
        this.props.notifyError(err);
      });
  };

  redirect = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/datamart/ml_functions`;
    history.push(attributionModelUrl);
  };

  renderSpecificFields: SpecificFieldsFunction = (disabled: boolean, fieldNamePrefix: string) => {
    const { objects } = this.state;
    return (
      <GeneralInformation disabled={disabled} fieldNamePrefix={fieldNamePrefix} objects={objects} />
    );
  };

  onSaveOrCreatePluginInstance = (plugin: MlFunctionResource, properties: PluginProperty[]) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;
    history.push(`/v2/o/${organisationId}/settings/datamart/ml_functions`);
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: MlFunctionResource,
  ): PluginInstance => {
    const datamartId = this.state.datamartId ? this.state.datamartId : pluginInstance.datamart_id;

    const result: Omit<MlFunctionResource, 'id'> = {
      version_id: pluginInstance.version_id,
      version_value: pluginInstance.version_value,
      artifact_id: plugin.artifact_id,
      group_id: plugin.group_id,
      organisation_id: organisationId,
      name: pluginInstance.name,
      datamart_id: datamartId,
      field_name: pluginInstance.field_name,
      field_type_name: pluginInstance.field_type_name,
      hosting_object_type_name: pluginInstance.hosting_object_type_name,
      query: pluginInstance.query,
      expiration_period: 'P1D',
      status: 'INITIAL',
    };
    return result;
  };

  onDatamartSelect = (datamart: DatamartResource) => {
    this.setState({
      datamartId: datamart.id,
    });
  };

  render() {
    const {
      intl: { formatMessage },
      match: {
        params: { mlFunctionId },
      },
    } = this.props;

    const { loading, datamartId } = this.state;

    const breadcrumbPaths = (mlFunction?: MlFunctionResource) => [
      mlFunction
        ? formatMessage(messages.editBreadcrumb, { name: mlFunction.name })
        : formatMessage(messages.createBreadcrumb),
    ];

    if (loading) {
      return <Loading isFullScreen={false} />;
    }

    return datamartId || mlFunctionId ? (
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
    ) : (
      <DatamartSelector
        onSelect={this.onDatamartSelect}
        actionbarProps={{
          pathItems: [formatMessage(messages.createBreadcrumb)],
          onClose: this.redirect,
        }}
      />
    );
  }
}

export default compose(withRouter, injectNotifications, injectIntl)(EditMlFunctionPage);
