import * as React from 'react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { FormSection } from '../../../../../../components/Form';
import { PropertyResourceShape } from '../../../../../../models/plugin';
import { PluginFieldGenerator } from '../../../../../Plugin';
import PluginSectionGenerator from '../../../../../Plugin/PluginSectionGenerator';
import { ExtendedPluginInformation } from './CustomActionAutomationForm';
import messages from './messages';

interface PluginInstanceFormSectionProps {
  pluginId?: string;
  extendedPluginsInformation: ExtendedPluginInformation[];
  organisationId: string;
}

type Props = PluginInstanceFormSectionProps & InjectedIntlProps;

class PluginInstanceFormSection extends React.Component<Props> {
  displayPluginInstanceFormSection = (subElement: JSX.Element) => {
    return (
      <div>
        <FormSection title={messages.sectionPluginSettingsTitle} />
        {subElement}
      </div>
    );
  };

  render() {
    const { pluginId, organisationId, extendedPluginsInformation } = this.props;

    if (pluginId) {
      const extendedPluginInformation = extendedPluginsInformation.find(
        info => {
          return info.plugin.id === pluginId;
        },
      );

      if (extendedPluginInformation) {
        const givenPluginProperties =
          extendedPluginInformation.pluginProperties || [];
        const pluginLayout = extendedPluginInformation.pluginLayout;
        const pluginVersionId =
          extendedPluginInformation.plugin.current_version_id;

        if (pluginVersionId) {
          if (pluginLayout) {
            const subSections = pluginLayout.sections.map((section, index) => {
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
                    organisationId={organisationId}
                    pluginProperties={givenPluginProperties}
                    disableFields={false}
                    pluginVersionId={pluginVersionId}
                  />
                  {hrBooleanCondition ? <hr /> : null}
                </div>
              );
            });
            return this.displayPluginInstanceFormSection(
              <div>{subSections}</div>,
            );
          } else {
            const subElements = givenPluginProperties.map(
              (fieldDef: PropertyResourceShape) => {
                return (
                  <PluginFieldGenerator
                    key={`${fieldDef.technical_name}`}
                    definition={fieldDef}
                    disabled={false}
                    pluginVersionId={pluginVersionId}
                    organisationId={organisationId}
                  />
                );
              },
            );
            return this.displayPluginInstanceFormSection(
              <div>{subElements}</div>,
            );
          }
        }
      }
    }
    return <div><FormattedMessage {...messages.noInformationOnPlugin}/></div>;
  }
}

export default compose<Props, PluginInstanceFormSectionProps>(injectIntl)(
  PluginInstanceFormSection,
);
