import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  GenericPluginContent,
  PluginContentOuterProps,
} from '@mediarithmics-private/advanced-components';
import {
  PluginProperty,
  PluginResource,
  PluginInstance,
  CustomAction,
} from '../../../../../models/Plugins';

import messages from './messages';
import { Omit } from '../../../../../utils/Types';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { Link } from 'react-router-dom';
import { withValidators } from '../../../../../components/Form';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import { ICustomActionService } from '../../../../../services/CustomActionService';

const CustomActionPluginContent = GenericPluginContent as React.ComponentClass<
  PluginContentOuterProps<CustomAction>
>;

interface CustomActionRouteParam {
  organisationId: string;
  customActionId?: string;
}

type JoinedProps = RouteComponentProps<CustomActionRouteParam> & InjectedIntlProps & ValidatorProps;

class EditCustomActionPage extends React.Component<JoinedProps> {
  @lazyInject(TYPES.ICustomActionService)
  private _customActionService: ICustomActionService;

  redirect = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/datamart/custom_actions`;
    history.push(attributionModelUrl);
  };

  onSaveOrCreatePluginInstance = (plugin: CustomAction, properties: PluginProperty[]) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;
    history.push(`/v2/o/${organisationId}/settings/datamart/custom_actions`);
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: CustomAction,
  ): PluginInstance => {
    const result: Omit<CustomAction, 'id'> = {
      // ...pluginInstance,
      version_id: pluginInstance.version_id,
      version_value: pluginInstance.version_value,
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
        params: { customActionId, organisationId },
      },
    } = this.props;

    const breadcrumbPaths = (customAction?: CustomAction) => [
      <Link key='1' to={`/v2/o/${organisationId}/settings/datamart/custom_actions`}>
        {formatMessage(messages.listTitle)}
      </Link>,
      customAction
        ? formatMessage(messages.customActionEditBreadcrumb, {
            name: customAction.name,
          })
        : formatMessage(messages.customActionBreadcrumb),
    ];

    return (
      <CustomActionPluginContent
        pluginType={'SCENARIO_CUSTOM_ACTION'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        pluginInstanceService={this._customActionService}
        pluginInstanceId={customActionId}
        createPluginInstance={this.createPluginInstance}
        onSaveOrCreatePluginInstance={this.onSaveOrCreatePluginInstance}
        onClose={this.redirect}
      />
    );
  }
}

export default compose(withRouter, injectIntl, withValidators)(EditCustomActionPage);
