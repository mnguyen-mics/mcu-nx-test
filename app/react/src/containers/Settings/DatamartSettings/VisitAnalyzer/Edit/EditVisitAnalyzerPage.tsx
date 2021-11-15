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
import { Link } from 'react-router-dom';
import { FormInputProps } from '../../../../../components/Form/FormInput';
import { DefaultSelect, FormSelectField, withValidators } from '../../../../../components/Form';
import { ValidatorProps } from '../../../../../components/Form/withValidators';

const VisitAnalyzerPluginContent = GenericPluginContent as React.ComponentClass<
  PluginContentOuterProps<VisitAnalyzer>
>;

interface VisitAnalyzerRouteParam {
  organisationId: string;
  visitAnalyzerId?: string;
}

type JoinedProps = RouteComponentProps<VisitAnalyzerRouteParam> &
  InjectedIntlProps &
  ValidatorProps;

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

  onSaveOrCreatePluginInstance = (plugin: VisitAnalyzer, properties: PluginProperty[]) => {
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
      error_recovery_strategy: pluginInstance.error_recovery_strategy,
    };
    return result;
  };

  render() {
    const {
      intl: { formatMessage },
      fieldValidators: { isRequired },
      match: {
        params: { visitAnalyzerId, organisationId },
      },
    } = this.props;

    const breadcrumbPaths = (visitAnalyzer?: VisitAnalyzer) => [
      <Link key='1' to={`/v2/o/${organisationId}/settings/datamart/visit_analyzers`}>
        {formatMessage(messages.listTitle)}
      </Link>,
      visitAnalyzer
        ? formatMessage(messages.visitAnalyzerEditBreadcrumb, {
            name: visitAnalyzer.name,
          })
        : formatMessage(messages.visitAnalyzerBreadcrumb),
    ];

    const fieldPropsErrorStrategy: FormInputProps = {
      formItemProps: {
        label: formatMessage(messages.sectionGeneralErrorRecoveryStrategy),
        required: true,
      },
      inputProps: {
        placeholder: formatMessage(messages.sectionGeneralErrorRecoveryStrategy),
      },
    };

    const errorOptions = [
      { title: 'Store With Error Id', value: 'STORE_WITH_ERROR_ID' },
      {
        title: 'Store With Error Id And Skip Upcoming Analyzers',
        value: 'STORE_WITH_ERROR_ID_AND_SKIP_UPCOMING_ANALYZERS',
      },
      { title: 'Drop', value: 'DROP' },
    ];

    const renderSpecificFields = (disabled: boolean, prefix: string) => {
      return (
        <FormSelectField
          name='plugin.error_recovery_strategy'
          component={DefaultSelect}
          selectProps={{ className: 'mcs-VisitAnalyzerPage_error_recovery_strategy' }}
          validate={[isRequired]}
          options={errorOptions}
          disabled={disabled}
          {...fieldPropsErrorStrategy}
        />
      );
    };

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
        renderSpecificFields={renderSpecificFields}
      />
    );
  }
}

export default compose(withRouter, injectIntl, withValidators)(EditVisitAnalyzerPage);
