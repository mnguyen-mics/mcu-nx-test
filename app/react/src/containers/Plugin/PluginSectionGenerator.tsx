import * as React from 'react';
import {
  PluginLayoutSectionResource,
  PluginLayoutFieldResource,
} from '../../models/plugin/PluginLayout';
import { Row } from 'antd';
import {
  FormTitle,
  FormInputField,
  FormInput,
  FormTextAreaField,
  FormTextArea,
} from '../../components/Form';
import withValidators from '../../components/Form/withValidators';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import injectDrawer from '../../components/Drawer/injectDrawer';
import { withRouter } from 'react-router';
import { PluginFieldGenerator } from '.';
import { compose } from 'recompose';
import messages from './Edit/messages';
import { PropertyResourceShape } from '../../models/plugin';
import { PluginPresetProperty } from '../../models/Plugins';
import { Validator } from 'redux-form';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';

export interface PluginExtraField {
  label: string;
  title: React.ReactNode;
  placeholder: string;
  display: boolean;
  disabled: boolean;
  value?: string;
  validator?: Validator | Validator[];
}

interface PluginSectionGeneratorProps {
  organisationId: string;
  pluginProperties: PropertyResourceShape[];
  pluginPresetProperties?: PluginPresetProperty[];
  pluginLayoutSection: PluginLayoutSectionResource;
  pluginVersionId: string;
  noUploadModal?: () => void;
  disableFields?: boolean;
  small?: boolean;
  nameField?: PluginExtraField;
  descriptionField?: PluginExtraField;
}

type JoinedProps = PluginSectionGeneratorProps & InjectedIntlProps;

interface PluginSectionGeneratorState {
  displayAdvancedFields: boolean;
  descriptionFieldValue?: string;
}

class PluginSectionGenerator extends React.Component<
  JoinedProps,
  PluginSectionGeneratorState
> {
  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      displayAdvancedFields: false,
    };
  }

  generateFormField = (field: PluginLayoutFieldResource) => {
    const {
      organisationId,
      pluginVersionId,
      pluginProperties,
      pluginPresetProperties,
      noUploadModal,
      disableFields,
      small,
    } = this.props;

    const currentPluginProperty = pluginProperties.find(
      prop => prop.technical_name === field.property_technical_name,
    );
    const pluginPresetProperty = pluginPresetProperties
      ? pluginPresetProperties.find(
          prop => prop.technical_name === field.property_technical_name,
        )
      : undefined;

    if (currentPluginProperty !== undefined) {
      return (
        <Row key={field.property_technical_name}>
          <PluginFieldGenerator
            definition={currentPluginProperty}
            pluginLayoutFieldDefinition={field}
            pluginPresetProperty={pluginPresetProperty}
            organisationId={organisationId}
            pluginVersionId={pluginVersionId}
            disabled={disableFields}
            small={small}
            {...noUploadModal}
          />
        </Row>
      );
    } else {
      return null;
    }
  };

  toggleAdvancedFields = () => {
    const booleanAdvancedFields = this.state.displayAdvancedFields;

    this.setState({
      displayAdvancedFields: !booleanAdvancedFields,
    });
  };

  generateNameAndDescriptionFields() {
    const { nameField, descriptionField } = this.props;
    const { descriptionFieldValue } = this.state;
    const inputs: React.ReactNode[] = [];

    if (nameField && nameField.display) {
      inputs.push(
        <div key="nameField">
          <Row>
            <FormInputField
              key="name"
              name={`plugin.name`}
              component={FormInput}
              formItemProps={{ label: nameField.label, required: true }}
              inputProps={
                nameField.disabled
                  ? {
                      placeholder: nameField.placeholder,
                      disabled: nameField.disabled,
                      value: nameField.value,
                    }
                  : {
                      placeholder: nameField.placeholder,
                      disabled: nameField.disabled,
                    }
              }
              small={true}
              helpToolTipProps={{ title: nameField.title }}
              validate={!nameField.disabled ? nameField.validator : []}
            />
          </Row>
        </div>,
      );
    }

    if (descriptionField && descriptionField.display)
      inputs.push(
        <div key="descriptionField">
          <Row>
            <FormTextAreaField
              key="description"
              name="description"
              component={FormTextArea}
              formItemProps={{ label: descriptionField.label, required: true }}
              inputProps={
                descriptionField.disabled
                  ? {
                      placeholder: descriptionField.placeholder,
                      disabled: descriptionField.disabled,
                      value: descriptionField.value,
                    }
                  : {
                      placeholder: descriptionField.placeholder,
                      disabled: descriptionField.disabled,
                      value: descriptionFieldValue,
                      onChange: e =>
                        this.setState({
                          descriptionFieldValue: e.target.value,
                        }),
                    }
              }
              small={true}
              helpToolTipProps={{ title: descriptionField.title }}
              validate={
                !descriptionField.disabled ? descriptionField.validator : []
              }
            />
          </Row>
        </div>,
      );

    return inputs;
  }

  render() {
    const {
      intl: { formatMessage },
      pluginLayoutSection,
      nameField,
      descriptionField,
    } = this.props;

    const nameAndDescriptionFields = this.generateNameAndDescriptionFields();
    const returnedFields = pluginLayoutSection.fields.map(
      this.generateFormField,
    );
    const advancedFields =
      pluginLayoutSection.advanced_fields !== null &&
      pluginLayoutSection.advanced_fields.length !== 0 ? (
        <div>
          <Button
            className="optional-section-title"
            onClick={this.toggleAdvancedFields}
          >
            <McsIcon type="settings" />
            <span className="step-title">
              {formatMessage(messages.advanced)}
            </span>
            <McsIcon type="chevron" />
          </Button>

          <div
            className={
              !this.state.displayAdvancedFields
                ? 'hide-section'
                : 'optional-section-content'
            }
          >
            {pluginLayoutSection.advanced_fields.map(this.generateFormField)}
          </div>
        </div>
      ) : null;

    return returnedFields.length > 0 ||
      advancedFields ||
      nameField ||
      descriptionField ? (
      <div id={pluginLayoutSection.title}>
        <Row
          type="flex"
          align="middle"
          justify="space-between"
          className="section-header"
        >
          <FormTitle
            title={{
              id: `section.${pluginLayoutSection.title}.title`,
              defaultMessage: pluginLayoutSection.title,
            }}
            subtitle={{
              id: `section.${pluginLayoutSection.sub_title}.subTitle`,
              defaultMessage: pluginLayoutSection.sub_title,
            }}
          />
        </Row>
        {nameAndDescriptionFields}
        {returnedFields}
        {advancedFields}
      </div>
    ) : null;
  }
}

export default compose<JoinedProps, PluginSectionGeneratorProps>(
  injectIntl,
  withRouter,
  injectDrawer,
  withValidators,
)(PluginSectionGenerator);
