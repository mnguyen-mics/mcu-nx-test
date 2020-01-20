import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import { compose } from 'recompose';
import messages from '../messages';
import {
  FormSection,
  FormInputField,
  FormInput,
  FormSwitch,
  FormSwitchField,
  FormFieldWrapper,
  FormAlertInput,
  FormAlertInputField,
} from '../../../../../../components/Form';
import { ButtonStyleless, McsIcon } from '../../../../../../components';

type Props = InjectedIntlProps & ValidatorProps;

interface State {
  displayAdvancedSection: boolean;
}

class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      displayAdvancedSection: false,
    };
  }

  toggleAdvancedSection = () => {
    const { displayAdvancedSection } = this.state;
    this.setState({
      displayAdvancedSection: !displayAdvancedSection,
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
          subtitle={messages.sectionGeneralSubTitle}
          title={messages.sectionGeneralTitle}
        />
        <FormInputField
          name="name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.sectionGeneralNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.sectionGeneralNamePlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.sectionGeneralNameTooltip),
          }}
        />
        <FormAlertInputField
          name="token"
          component={FormAlertInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.sectionGeneralTokenLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.sectionGeneralTokenPlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.sectionGeneralTokenTooltip),
          }}
          iconType="warning"
          type="warning"
          message={formatMessage(messages.warningOnTokenEdition)}
        />
        <div>
          <ButtonStyleless
            className="optional-section-title"
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type="settings" />
            <span className="step-title">
              {formatMessage(messages.sectionGeneralAdvancedTitle)}
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
            <FormFieldWrapper
              {...{
                label: formatMessage(messages.sectionGeneralDefaultLabel),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.sectionGeneralDefaultTooltip),
              }}
            >
              <FormSwitchField name="default" component={FormSwitch} />
            </FormFieldWrapper>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators)(GeneralFormSection);
