import * as React from 'react';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { Spin } from 'antd';
import { PropertyResourceShape } from '../../../../../../models/plugin';
import { PluginFieldGenerator } from '../../../../../Plugin';
import PluginSectionGenerator from '../../../../../Plugin/PluginSectionGenerator';
import { ExtendedCustomActionInformation } from './CustomActionAutomationForm';
import messages from './messages';

interface CustomActionInstanceFormSectionProps {
  customActionId: string;
  extendedCustomActionsInformation: ExtendedCustomActionInformation[];
  isFetchingCustomActionProperties: boolean;
  organisationId: string;
  disabled?: boolean;
}

type Props = CustomActionInstanceFormSectionProps & InjectedIntlProps;

class CustomActionInstanceFormSection extends React.Component<Props> {
  displayPluginInstanceFormSection = (subElement: JSX.Element) => {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div className="mcs-customActionInstanceFormSection_pluginSettings">
        <div className="mcs-customActionInstanceFormSection_pluginSettings_title">
          {formatMessage(messages.sectionPluginSettingsSubtitleFirstPart)}
          &nbsp;
          <a href="https://developer.mediarithmics.com/" target="_blank">
            {formatMessage(messages.developerDocumentation)}
          </a>
          &nbsp;
          {formatMessage(messages.sectionPluginSettingsSubtitleSecondPart)}
        </div>
        {subElement}
      </div>
    );
  };

  render() {
    const {
      customActionId,
      organisationId,
      extendedCustomActionsInformation,
      isFetchingCustomActionProperties,
      disabled,
    } = this.props;

    if (isFetchingCustomActionProperties) {
      return <Spin />;
    }

    if (customActionId) {
      const extendedCustomActionInformation = extendedCustomActionsInformation.find(
        (info) => {
          return info.customAction.id === customActionId;
        },
      );

      if (extendedCustomActionInformation) {
        const customActionProperties =
          extendedCustomActionInformation.layoutInformation
            ?.customActionProperties || [];
        const pluginLayout =
          extendedCustomActionInformation.layoutInformation?.pluginLayout;
        const pluginVersionId =
          extendedCustomActionInformation.customAction.version_id;

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
                    pluginProperties={customActionProperties}
                    disableFields={disabled}
                    pluginVersionId={pluginVersionId}
                    small={true}
                  />
                  {hrBooleanCondition ? <hr /> : null}
                </div>
              );
            });
            return this.displayPluginInstanceFormSection(
              <div>{subSections}</div>,
            );
          } else {
            const subElements = customActionProperties.map(
              (fieldDef: PropertyResourceShape) => {
                return (
                  <PluginFieldGenerator
                    key={`${fieldDef.technical_name}`}
                    definition={fieldDef}
                    disabled={disabled}
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
    return (
      <div>
        <FormattedMessage {...messages.noInformationOnPlugin} />
      </div>
    );
  }
}

export default compose<Props, CustomActionInstanceFormSectionProps>(injectIntl)(
  CustomActionInstanceFormSection,
);
