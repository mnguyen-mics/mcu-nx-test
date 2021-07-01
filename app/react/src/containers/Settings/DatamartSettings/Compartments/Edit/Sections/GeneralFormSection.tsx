import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
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
          name='compartment.name'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.sectionGeneralNameLabel),
            required: true,
          }}
          inputProps={{
            className: 'mcs-compartments_nameField',
            placeholder: formatMessage(messages.sectionGeneralNamePlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.sectionGeneralNameTooltip),
          }}
        />
        <FormAlertInputField
          name='compartment.token'
          component={FormAlertInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.sectionGeneralTokenLabel),
            required: true,
          }}
          inputProps={{
            className: 'mcs-compartments_tokenField',
            placeholder: formatMessage(messages.sectionGeneralTokenPlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.sectionGeneralTokenTooltip),
          }}
          iconType='warning'
          type='warning'
          message={formatMessage(messages.warningOnTokenEdition)}
        />
        <div>
          <Button className='optional-section-title' onClick={this.toggleAdvancedSection}>
            <McsIcon type='settings' />
            <span className='step-title'>
              {formatMessage(messages.sectionGeneralAdvancedTitle)}
            </span>
            <McsIcon type='chevron' />
          </Button>

          <div className={displayAdvancedSection ? 'optional-section-content' : 'hide-section'}>
            <FormFieldWrapper
              {...{
                label: formatMessage(messages.sectionGeneralDefaultLabel),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.sectionGeneralDefaultTooltip),
              }}
            >
              <FormSwitchField
                className='mcs-compartments_switchField'
                name='compartment.default'
                component={FormSwitch}
              />
            </FormFieldWrapper>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators)(GeneralFormSection);
