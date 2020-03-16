import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import GenericPluginContent, {
  PluginContentOuterProps,
} from '../../../../Plugin/Edit/GenericPluginContent';
import {
  PluginProperty,
  VisitAnalyzer,
  PluginResource,
  PluginInstance,
} from '../../../../../models/Plugins';

import messages from './messages';
import { Omit } from '../../../../../utils/Types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IVisitAnalyzerService } from '../../../../../services/Library/VisitAnalyzerService';
import { TYPES } from '../../../../../constants/types';

const VisitAnalyzerPluginContent = GenericPluginContent as React.ComponentClass<
  PluginContentOuterProps<VisitAnalyzer>
>;

interface VisitAnalyzerRouteParam {
  organisationId: string;
  visitAnalyzerId?: string;
}

type JoinedProps = RouteComponentProps<VisitAnalyzerRouteParam> &
  InjectedIntlProps;

class EditVisitAnalyzerPage extends React.Component<JoinedProps> {
  @lazyInject(TYPES.IVisitAnalyzerService)
  private _visitAnalyzerService: IVisitAnalyzerService;

  redirect = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/datamart/visit_analyzers`;
    history.push(attributionModelUrl);
  };

  onSaveOrCreatePluginInstance = (
    plugin: VisitAnalyzer,
    properties: PluginProperty[],
  ) => {
    const {
      match: {
        params: { organisationId },
      },
      history,
    } = this.props;
    history.push(`/v2/o/${organisationId}/settings/datamart/visit_analyzers`);
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource,
    pluginInstance: VisitAnalyzer,
  ): PluginInstance => {
    const result: Omit<VisitAnalyzer, 'id'> = {
      // ...pluginInstance,
      version_id: pluginInstance.version_id,
      version_value: pluginInstance.version_value,
      visit_analyzer_plugin_id: plugin.id,
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
        params: { visitAnalyzerId, organisationId },
      },
    } = this.props;

    const breadcrumbPaths = (visitAnalyzer?: VisitAnalyzer) => [
      {
        name: formatMessage(messages.listTitle),
        path: `/v2/o/${organisationId}/settings/datamart/visit_analyzers`,
      },
      {
        name: visitAnalyzer
          ? formatMessage(messages.visitAnalyzerEditBreadcrumb, {
              name: visitAnalyzer.name,
            })
          : formatMessage(messages.visitAnalyzerBreadcrumb),
      },
    ];

    return (
      <VisitAnalyzerPluginContent
        pluginType={'ACTIVITY_ANALYZER'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        pluginInstanceService={this._visitAnalyzerService}
        pluginInstanceId={visitAnalyzerId}
        createPluginInstance={this.createPluginInstance}
        onSaveOrCreatePluginInstance={this.onSaveOrCreatePluginInstance}
        onClose={this.redirect}
      />
    );
  }
}

export default compose(withRouter, injectIntl)(EditVisitAnalyzerPage);
