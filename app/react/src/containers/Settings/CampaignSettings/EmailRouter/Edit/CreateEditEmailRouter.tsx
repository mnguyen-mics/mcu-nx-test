import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import EmailRouterService from '../../../../../services/Library/EmailRoutersService';
import * as actions from '../../../../../state/Notifications/actions';
import {
  PluginProperty,
  EmailRouter,
  PluginResource,
  PluginInstance,
} from '../../../../../models/Plugins';

import messages from './messages';
import GenericPluginContent, { PluginContentOuterProps } from '../../../../Plugin/Edit/GenericPluginContent';
import { Omit } from 'antd/lib/form/Form';

const EmailRouterPluginContent = GenericPluginContent as React.ComponentClass<PluginContentOuterProps<EmailRouter>>

interface EmailRouterRouteParam {
  organisationId: string;
  emailRouterId?: string;
}

interface EmailRouterForm {
  plugin: any;
  properties?: PluginProperty[];
}

interface CreateEmailRouterState {
  edition: boolean;
  initialValues?: EmailRouterForm;
  selectedEmailRouter?: PluginResource;
}

interface CreateEmailRouterProps {
  notifyError: (err?: any) => void;
}

type JoinedProps = CreateEmailRouterProps &
  RouteComponentProps<EmailRouterRouteParam> &
  InjectedIntlProps;

class CreateEditEmailRouter extends React.Component<
  JoinedProps,
  CreateEmailRouterState
  > {
  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      edition: props.match.params.emailRouterId ? true : false,
    };
  }

  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/campaigns/email_routers`;
    history.push(attributionModelUrl);
  };
  onSaveOrCreatePluginInstance = (
    plugin: EmailRouter,
    properties: PluginProperty[],
  ) => {

    const {
      match: { params: { organisationId } },
      history,
    } = this.props;
    history.push(
      `/v2/o/${organisationId}/settings/campaigns/email_routers`,
    );
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: EmailRouter,
  ): PluginInstance => {
    const result: Omit<EmailRouter, "id"> = {
      // ...pluginInstance,
      version_id: plugin.current_version_id,
      version_value: pluginInstance.version_value,
      artifact_id: plugin.artifact_id,
      group_id: plugin.group_id,
      organisation_id: organisationId,
      name: pluginInstance.name
    }
    return result
  }

  render() {
    const { intl: { formatMessage }, match: { params: { emailRouterId } }, notifyError } = this.props;



    const breadcrumbPaths = [
      {
        name: emailRouterId
          ? formatMessage(messages.emailRouterEditBreadcrumb, {
            name:
              this.state.initialValues &&
              this.state.initialValues.plugin.name,
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
        pluginInstanceService={EmailRouterService}
        pluginInstanceId={emailRouterId}
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
)(CreateEditEmailRouter);
