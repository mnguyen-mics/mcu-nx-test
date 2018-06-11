import * as React from 'react';
import { Field, getFormInitialValues, Validator } from 'redux-form';
import { connect } from 'react-redux';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';

import {
  FormSection,
  FieldCtor,
  FormInput,
  withValidators,
  FormInputField,
  FormAlert,
} from '../../../../../components/Form';
import messages from '../messages';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import {
  EditDisplayCreativeRouteMatchParams,
  DisplayCreativeFormData,
  DISPLAY_CREATIVE_FORM,
  isDisplayAdResource,
} from '../domain';
import DisplayCreativeFormatEditor from '../DisplayCreativeFormatEditor';
import { ButtonStyleless, McsIcon } from '../../../../../components';

interface MapStateProps {
  initialValue: DisplayCreativeFormData;
}

type Props = ValidatorProps &
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

  warningOnTokenChange = () => {
    const { initialValue } = this.props;
    const technicalName =
      initialValue &&
      initialValue.creative &&
      initialValue.creative.technical_name;
    this.setState({
      displayWarning: !!technicalName,
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
      match: {
        params: { creativeId },
      },
    } = this.props;

    const { displayWarning } = this.state;

    let isDisabled = false;

    if (isDisplayAdResource(creative)) {
      isDisabled =
        creative.audit_status === 'AUDIT_PASSED' ||
        creative.audit_status === 'AUDIT_PENDING';
    }

    const CreativeFormatEditorField: FieldCtor<{ disabled?: boolean }> = Field;

    return (
      <div>
        <FormSection
          title={messages.creativeSectionGeneralTitle}
          subtitle={messages.creativeSectionGeneralSubTitle}
        />
        <FormInputField
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
        />
        <CreativeFormatEditorField
          name="creative.format"
          component={DisplayCreativeFormatEditor}
          validate={[this.isCreativeFormatValid()]}
          disabled={isDisabled}
        />
        <FormInputField
          name="creative.destination_domain"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(
              messages.creativeCreationGeneralDomainFieldTitle,
            ),
            required: true,
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
        />
        <div>
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
            {displayWarning &&
              creativeId && (
                <div>
                  <FormAlert
                    iconType="warning"
                    type="warning"
                    message={formatMessage(messages.warningOnTokenEdition)}
                  />
                  <br />
                </div>
              )}
            <FormInputField
              name="creative.technical_name"
              component={FormInput}
              formItemProps={{
                label: formatMessage(
                  messages.creativeCreationAdvancedTechnicalFieldTitle,
                ),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.creativeCreationAdvancedTechnicalFieldPlaceholder,
                ),
                onFocus: this.warningOnTokenChange,
              }}
              helpToolTipProps={{
                title: formatMessage(
                  messages.creativeCreationAdvancedTechnicalFieldTooltip,
                ),
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose<Props, {}>(
  injectIntl,
  withRouter,
  withValidators,
  connect((state: any, ownProps: Props) => ({
    initialValue: getFormInitialValues(DISPLAY_CREATIVE_FORM)(
      state,
    ) as DisplayCreativeFormData,
  })),
)(GeneralFormSection);
