import * as React from 'react';
import { Field, getFormInitialValues, Validator } from 'redux-form';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';

import {
  FormSection,
  FieldCtor,
  FormInput,
  FormAlertInput,
  withValidators,
  FormInputField,
  FormAlertInputField,
} from '../../../../../components/Form';
import messages from '../messages';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import {
  DisplayCreativeFormData,
  DISPLAY_CREATIVE_FORM,
  isDisplayAdResource,
  EditDisplayCreativeRouteMatchParams,
} from '../domain';
import DisplayCreativeFormatEditor from '../DisplayCreativeFormatEditor';
import { ButtonStyleless, McsIcon } from '../../../../../components';
import { RouteComponentProps } from 'react-router';

interface MapStateProps {
  initialValue: DisplayCreativeFormData;
}

export interface GeneralFormSectionProps {
  allowMultipleUpload?: boolean;
  small?: boolean;
}

type Props = ValidatorProps &
  GeneralFormSectionProps &
  InjectedIntlProps &
  MapStateProps &
  RouteComponentProps<EditDisplayCreativeRouteMatchParams>;

interface State {
  displayAdvancedSection: boolean;
  displayWarning: boolean;
}
class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false, displayWarning: false };
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  isCreativeFormatValid = (): Validator => (value: string) => {
    const { intl } = this.props;
    if (value) {
      const width = value.split('x')[0];
      const height = value.split('x')[1];
      const isValidFormat =
        width && height && /^\d+$/.test(width) && /^\d+$/.test(height);
      return !isValidFormat
        ? intl.formatMessage(messages.invalidFormat)
        : undefined;
    }
    return undefined;
  };

  render() {
    const {
      intl: { formatMessage },
      fieldValidators: { isRequired },
      initialValue: { creative },
      allowMultipleUpload,
      small
    } = this.props;

    let isDisabled = false;

    if (isDisplayAdResource(creative)) {
      isDisabled =
        creative.audit_status === 'AUDIT_PASSED' ||
        creative.audit_status === 'AUDIT_PENDING';
    }

    const CreativeFormatEditorField: FieldCtor<{ disabled?: boolean, small?: boolean }> = Field;

    return (
      <div>
        <FormSection
          title={messages.creativeSectionGeneralTitle}
          subtitle={messages.creativeSectionGeneralSubTitle}
        />
        {!allowMultipleUpload && <FormInputField
          name="creative.name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(
              messages.creativeCreationGeneralNameFieldTitle,
            ),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.creativeCreationGeneralNameFieldPlaceHolder,
            ),
            disabled: isDisabled,
          }}
          helpToolTipProps={{
            title: formatMessage(
              messages.creativeCreationGeneralNameFieldHelper,
            ),
          }}
          small={small}
        />}
        {!allowMultipleUpload && <CreativeFormatEditorField
          name="creative.format"
          component={DisplayCreativeFormatEditor}
          validate={[this.isCreativeFormatValid()]}
          disabled={isDisabled}
          small={small}
        />}
        <FormInputField
          name="creative.destination_domain"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(
              messages.creativeCreationGeneralDomainFieldTitle,
            ),
            required: small,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.creativeCreationGeneralDomainFieldPlaceHolder,
            ),
            disabled: isDisabled,
          }}
          helpToolTipProps={{
            title: formatMessage(
              messages.creativeCreationGeneralDomainFieldHelper,
            ),
          }}
          small={small}
        />
        {!allowMultipleUpload && <div>
          <ButtonStyleless
            className="optional-section-title"
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type="settings" />
            <span className="step-title">
              {formatMessage(messages.advanced)}
            </span>
            <McsIcon type="chevron" />
          </ButtonStyleless>

          <div
            className={
              !this.state.displayAdvancedSection
                ? 'hide-section'
                : 'optional-section-content'
            }
          >
            <FormAlertInputField
              name="creative.technical_name"
              component={FormAlertInput}
              formItemProps={{
                label: formatMessage(
                  messages.creativeCreationAdvancedTechnicalFieldTitle,
                ),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.creativeCreationAdvancedTechnicalFieldPlaceholder,
                ),
                disabled: isDisabled,
              }}
              helpToolTipProps={{
                title: formatMessage(
                  messages.creativeCreationAdvancedTechnicalFieldTooltip,
                ),
              }}
              iconType="warning"
              type="warning"
              message={formatMessage(messages.warningOnTokenEdition)}
              small={small}
            />
          </div>
        </div>}
      </div>
    );
  }
}

export default compose<Props, GeneralFormSectionProps>(
  injectIntl,
  withValidators,
  connect((state: any, ownProps: Props) => ({
    initialValue: getFormInitialValues(DISPLAY_CREATIVE_FORM)(
      state,
    ) as DisplayCreativeFormData,
  })),
)(GeneralFormSection);
