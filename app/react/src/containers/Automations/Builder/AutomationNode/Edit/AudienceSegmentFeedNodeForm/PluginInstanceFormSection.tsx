import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { FormSection } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import { StrictlyLayoutablePlugin } from '../../../../../../models/Plugins';
import {
  PluginSectionGenerator,
  PluginExtraField,
} from '@mediarithmics-private/advanced-components';
import messages from './messages';

interface PluginInstanceFormSectionProps {
  strictlyLayoutablePlugin: StrictlyLayoutablePlugin;
  pluginVersionId: string;
  disabled?: boolean;
}

type Props = PluginInstanceFormSectionProps & InjectedIntlProps & ValidatorProps;

class PluginInstanceFormSection extends React.Component<Props> {
  render() {
    const {
      strictlyLayoutablePlugin,
      pluginVersionId,
      disabled,
      intl: { formatMessage },
    } = this.props;

    const pluginLayout = strictlyLayoutablePlugin.plugin_layout;
    const preset = strictlyLayoutablePlugin.plugin_preset;
    const presetProperties = preset ? preset.properties : [];
    const pluginProperties = strictlyLayoutablePlugin.plugin_version_properties;

    const nameValue = strictlyLayoutablePlugin.name ? strictlyLayoutablePlugin.name : preset?.name;

    const nameField: PluginExtraField | undefined = nameValue
      ? {
          label: formatMessage(messages.nameFieldLabel),
          title: disabled ? (
            formatMessage(messages.nameFieldDisabledTitle)
          ) : (
            <div>
              {formatMessage(messages.nameFieldTitle)}
              <br />
              <b>{formatMessage(messages.nameFieldTitleWarning)}</b>
            </div>
          ),
          placeholder: formatMessage(messages.nameFieldPlaceholder),
          display: true,
          disabled: true,
          value: nameValue,
        }
      : undefined;

    const descriptionField: PluginExtraField | undefined = preset
      ? {
          label: formatMessage(messages.descriptionFieldLabel),
          title: formatMessage(messages.descriptionFieldTitle),
          placeholder: formatMessage(messages.descriptionFieldPlaceholder),
          display: true,
          disabled: true,
          value: preset.description,
        }
      : undefined;

    const layoutSections = pluginLayout.sections.map((section, index) => {
      const indexCondition = index !== pluginLayout.sections.length - 1;
      const fieldsCondition = section.fields !== null && section.fields.length !== 0;
      const advancedFieldsCondition =
        section.advanced_fields !== null && section.advanced_fields.length !== 0;
      const hrBooleanCondition = indexCondition && (fieldsCondition || advancedFieldsCondition);
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
            pluginVersionId={pluginVersionId}
            small={true}
          />
          {hrBooleanCondition ? <hr /> : null}
        </div>
      );
    });

    return (
      <div>
        <FormSection
          title={messages.descriptionFormSectionTitle}
          subtitle={messages.descriptionFormSectionSubtitle}
        />
        {layoutSections}
      </div>
    );
  }
}

export default compose<Props, PluginInstanceFormSectionProps>(
  injectIntl,
  withValidators,
)(PluginInstanceFormSection);
