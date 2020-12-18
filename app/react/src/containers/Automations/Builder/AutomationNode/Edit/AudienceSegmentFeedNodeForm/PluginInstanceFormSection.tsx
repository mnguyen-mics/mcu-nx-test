import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import { StrictlyLayoutablePlugin } from '../../../../../../models/Plugins';
import PluginSectionGenerator, {
  PluginExtraField,
} from '../../../../../Plugin/PluginSectionGenerator';
import messages from './messages';

interface PluginInstanceFormSectionProps {
  strictlyLayoutablePlugin: StrictlyLayoutablePlugin;
  disabled?: boolean;
}

type Props = PluginInstanceFormSectionProps &
  InjectedIntlProps &
  ValidatorProps;

class PluginInstanceFormSection extends React.Component<Props> {
  render() {
    const {
      strictlyLayoutablePlugin,
      disabled,
      intl: { formatMessage },
    } = this.props;

    const pluginLayout = strictlyLayoutablePlugin.plugin_layout;
    const preset = strictlyLayoutablePlugin.plugin_preset;
    const presetProperties = preset.properties;
    const pluginProperties = strictlyLayoutablePlugin.plugin_version_properties;

    const nameField: PluginExtraField = {
      label: formatMessage(messages.nameFieldLabel),
      title: (
        <div>
          {formatMessage(messages.nameFieldTitle)}
          <br />
          <b>{formatMessage(messages.nameFieldTitleWarning)}</b>
        </div>
      ),
      placeholder: formatMessage(messages.nameFieldPlaceholder),
      display: true,
      disabled: true,
      value: preset.name,
    };

    const descriptionField: PluginExtraField = {
      label: formatMessage(messages.descriptionFieldLabel),
      title: formatMessage(messages.descriptionFieldTitle),
      placeholder: formatMessage(messages.descriptionFieldPlaceholder),
      display: true,
      disabled: true,
      value: preset.description,
    };

    const layoutSections = pluginLayout.sections.map((section, index) => {
      const indexCondition = index !== pluginLayout.sections.length - 1;
      const fieldsCondition =
        section.fields !== null && section.fields.length !== 0;
      const advancedFieldsCondition =
        section.advanced_fields !== null &&
        section.advanced_fields.length !== 0;
      const hrBooleanCondition =
        indexCondition && (fieldsCondition || advancedFieldsCondition);
      return (
        <div key={section.title}>
          <PluginSectionGenerator
            pluginLayoutSection={section}
            organisationId={strictlyLayoutablePlugin.organisation_id}
            pluginProperties={pluginProperties}
            pluginPresetProperties={presetProperties}
            disableFields={disabled}
            nameField={index === 0 ? nameField : undefined}
            descriptionField={index === 0 ? descriptionField : undefined}
            pluginVersionId={
              strictlyLayoutablePlugin.plugin_preset.plugin_version_id
            }
            small={true}
          />
          {hrBooleanCondition ? <hr /> : null}
        </div>
      );
    });

    return <div>{layoutSections}</div>;
  }
}

export default compose<Props, PluginInstanceFormSectionProps>(
  injectIntl,
  withValidators,
)(PluginInstanceFormSection);
