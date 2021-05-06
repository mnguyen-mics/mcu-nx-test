import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from '../../messages';
import { FormSection, FormInputField, FormInput } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import { compose } from 'recompose';

type Props = InjectedIntlProps & ValidatorProps;

class LegalBasisFormSection extends React.Component<Props> {
  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.legalBasisSectionSubTitle}
          title={messages.legalBasisSectionTitle}
        />
        <FormInputField
          name='legal_basis'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.legalBasisSectionLegalBasisLabel),
            required: true,
          }}
          inputProps={{
            placeholder: 'CONSENT',
            disabled: true,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.legalBasisSectionLegalBasisTooltip),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withValidators)(LegalBasisFormSection);
