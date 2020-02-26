import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import {
  PluginProperty,
  EmailRouter,
  PluginResource,
  PluginInstance,
} from '../../../../../models/Plugins';
import messages from './messages';
import GenericPluginContent, {
  PluginContentOuterProps,
} from '../../../../Plugin/Edit/GenericPluginContent';
import { Omit } from '../../../../../utils/Types';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import PluginInstanceService from '../../../../../services/PluginInstanceService';

const EmailRouterPluginContent = GenericPluginContent as React.ComponentClass<
  PluginContentOuterProps<EmailRouter>
>;

interface EmailRouterRouteParam {
  organisationId: string;
  emailRouterId?: string;
}

type JoinedProps = RouteComponentProps<EmailRouterRouteParam> &
  InjectedIntlProps;

class CreateEditEmailRouter extends React.Component<JoinedProps> {
  @lazyInject(TYPES.IEmailRouterService)
  private _emailRouterService: PluginInstanceService<EmailRouter>;

  redirect = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/campaigns/email_routers`;
    history.push(attributionModelUrl);
  };

  onSaveOrCreatePluginInstance = (
    plugin: EmailRouter,
    properties: PluginProperty[],
  ) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;
    history.push(`/v2/o/${organisationId}/settings/campaigns/email_routers`);
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: EmailRouter,
  ): PluginInstance => {
    const result: Omit<EmailRouter, 'id'> = {
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
        params: { emailRouterId, organisationId },
      },
    } = this.props;

    const breadcrumbPaths = (emailRouter?: EmailRouter) => [
      {
        name: formatMessage(messages.listTitle),
        path: `/v2/o/${organisationId}/settings/campaigns/email_routers`
      },
      {
        name: emailRouter
          ? formatMessage(messages.emailRouterEditBreadcrumb, {
              name: emailRouter.name,
            })
          : formatMessage(messages.emailRouterNewBreadcrumb),
      },
    ];

    return (
      <EmailRouterPluginContent
        pluginType={'EMAIL_ROUTER'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        pluginInstanceService={this._emailRouterService}
        pluginInstanceId={emailRouterId}
        createPluginInstance={this.createPluginInstance}
        onSaveOrCreatePluginInstance={this.onSaveOrCreatePluginInstance}
        onClose={this.redirect}
      />
    );
  }
}

export default compose<JoinedProps, {}>(
  injectIntl,
  withRouter,
)(CreateEditEmailRouter);
