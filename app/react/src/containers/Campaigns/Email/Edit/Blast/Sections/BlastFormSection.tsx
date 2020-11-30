import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import { FormSection, FormInputField } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import FormInput from '../../../../../../components/Form/FormInput';
import messages from '../../messages';

interface BlastFormSectionProps {
  small?: boolean;
  fieldName?: string;
  disabled?: boolean;
}

type Props = InjectedIntlProps & ValidatorProps & BlastFormSectionProps;

class BlastFormSection extends React.Component<Props> {

  static defaultProps = {
    fieldName: 'blast'
  }

  render() {

    const {
      intl: { formatMessage },
      fieldValidators: {
        isRequired,
        isValidEmail,
      },
      small,
      fieldName,
      disabled
    } = this.props;

    return (
      <div>
        <FormSection
          title={messages.emailBlastEditorStepTitleBlastInformation}
        />
        <FormInputField
          name={`${fieldName}.subject_line`}
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.emailBlastEditorInputLabelSubjectLine),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderSubjectLine),
            disabled: disabled
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailBlastEditorInputHelperSubjectLine),
          }}
          small={small}
        />
        <FormInputField
          name={`${fieldName}.from_email`}
          component={FormInput}
          validate={[isRequired, isValidEmail]}
          formItemProps={{
            label: formatMessage(messages.emailBlastEditorInputLabelFromEmail),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderFromEmail),
            disabled: disabled
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailBlastEditorInputHelperFromEmail),
          }}
          small={small}
        />
        <FormInputField
          name={`${fieldName}.from_name`}
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.emailBlastEditorInputLabelFromName),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderFromName),
            disabled: disabled
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailBlastEditorInputHelperFromName),
          }}
          small={small}
        />
        <FormInputField
          name={`${fieldName}.reply_to`}
          component={FormInput}
          validate={[isRequired, isValidEmail]}
          formItemProps={{
            label: formatMessage(messages.emailBlastEditorInputLabelReplyTo),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderReplyTo),
            disabled: disabled
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailBlastEditorInputHelperReplyTo),
          }}
          small={small}
        />
      </div>
    );
  }
}

export default compose<Props, BlastFormSectionProps>(
  injectIntl,
  withValidators,
)(BlastFormSection);
