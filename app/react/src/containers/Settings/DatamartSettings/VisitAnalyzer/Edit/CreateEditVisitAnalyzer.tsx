import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import GenericPluginContent, { PluginInstanceForm, PluginContentOuterProps } from '../../../../Plugin/Edit/GenericPluginContent';
import VisitAnalyzerService from '../../../../../services/Library/VisitAnalyzerService';
import * as actions from '../../../../../state/Notifications/actions';
import {
  PluginProperty,
  VisitAnalyzer,
  PluginResource,
  PluginInstance,
} from '../../../../../models/Plugins';

import messages from './messages';
import { Omit } from '../../../../../utils/Types';
import { PropertyResourceShape } from '../../../../../models/plugin';

const VisitAnalyzerPluginContent = GenericPluginContent as React.ComponentClass<PluginContentOuterProps<VisitAnalyzer>>


interface CreateVisitAnalyzerProps {
  notifyError: (err?: any) => void;
}
interface VisitAnalyzerRouteParam {
  organisationId: string;
  visitAnalyzerId?: string;
}

interface VisitAnalyzerForm extends PluginInstanceForm<VisitAnalyzer>{
  pluginInstance: VisitAnalyzer;
  properties?: PropertyResourceShape[];
}

interface CreateVisitAnalyzerState  {
  isLoading: boolean;
  initialValues?: VisitAnalyzerForm;
  selectedVisitAnalyzer?: PluginResource;
}


type JoinedProps =  CreateVisitAnalyzerProps & RouteComponentProps<VisitAnalyzerRouteParam> &
  InjectedIntlProps;

class CreateEditVisitAnalyzer extends React.Component<
  JoinedProps,
  CreateVisitAnalyzerState
> {
  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      isLoading: false,
    };
  }





  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/datamart/visit_analyzers`;
    history.push(attributionModelUrl);
  };

  onSaveOrCreatePluginInstance = (
    plugin: VisitAnalyzer,
    properties: PluginProperty[],
  ) => {

    const {
      match: { params: { organisationId } },
      history,
    } = this.props;
      this.setState({ isLoading: false }, () => {
        history.push(
          `/v2/o/${organisationId}/settings/datamart/visit_analyzers`,
        );
      });
  };

  createPluginInstance = (
    organisationId: string,
    plugin: PluginResource, 
    pluginInstance: VisitAnalyzer,
  ): PluginInstance => {
    const result : Omit<VisitAnalyzer, "id"> = {
      // ...pluginInstance,
      version_id: plugin.current_version_id,
      version_value: pluginInstance.version_value,
      visit_analyzer_plugin_id: plugin.id,
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
      match: { params: { visitAnalyzerId } },
      notifyError,
    } = this.props;

    const breadcrumbPaths = [
      {
        name: visitAnalyzerId
          ? formatMessage(messages.visitAnalyzerEditBreadcrumb, {
              name:
                this.state.initialValues &&
                this.state.initialValues.pluginInstance.name,
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
        pluginInstanceService={VisitAnalyzerService}
        pluginInstanceId={visitAnalyzerId}
        createPluginInstance={this.createPluginInstance}
        onSaveOrCreatePluginInstance={this.onSaveOrCreatePluginInstance}
        onClose={this.redirect}
        notifyError={notifyError}
      />
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  // withDrawer,
  connect(undefined, { notifyError: actions.notifyError }),
)(CreateEditVisitAnalyzer);
