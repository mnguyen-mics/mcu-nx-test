import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import { compose } from 'recompose';
import {
  FormSection,
  FormInputField,
  FormInput,
  FormTextAreaField,
  FormTextArea,
  FormAlertInputField,
  FormAlertInput,
} from '../../../../../../components/Form';
import messages from '../../messages';
import { ButtonStyleless, McsIcon } from '../../../../../../components';

type Props = InjectedIntlProps & ValidatorProps;

interface State {
  displayAdvancedSection: boolean;
}

class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false };
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;
    const { displayAdvancedSection } = this.state;

    return (
      <div>
        <FormSection
          title={messages.generalSectionTitle}
          subtitle={messages.generalSectionSubTitle}
        />
        <FormInputField
          name="name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.generalSectionNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.generalSectionNamePlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.generalSectionNameTooltip),
          }}
        />
        <FormTextAreaField
          name="purpose"
          component={FormTextArea}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.generalSectionPurposeLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.generalSectionPurposePlaceholder,
            ),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.generalSectionPurposeTooltip),
          }}
        />
        <div>
          <ButtonStyleless
            className="optional-section-title  clickable-on-hover"
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type="settings" />
            <span className="step-title">
              {formatMessage(messages.generalSectionAdvancedPartTitle)}
            </span>
            <McsIcon type="chevron" />
          </ButtonStyleless>
          <div
            className={
              displayAdvancedSection
                ? 'optional-section-content'
                : 'hide-section'
            }
          >
            <FormInputField
              name="technical_name"
              component={FormInput}
              validate={[isRequired]}
              formItemProps={{
                label: formatMessage(messages.generalSectionTechnicalNameLabel),
                required: true,
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.generalSectionTechnicalNamePlaceholder,
                ),
              }}
              helpToolTipProps={{
                title: formatMessage(
                  messages.generalSectionTechnicalNameTooltip,
                ),
              }}
            />
            <FormAlertInputField
              name="token"
              component={FormAlertInput}
              formItemProps={{
                label: formatMessage(messages.generalSectionTokenLabel),
                required: true,
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.generalSectionTokenPlaceholder,
                ),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.generalSectionTokenTooltip),
              }}
              iconType="warning"
              type="warning"
              message={formatMessage(messages.warningOnTokenEdition)}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose<Props, {}>(
  injectIntl,
  withValidators,
)(GeneralFormSection);
