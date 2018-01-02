import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import { FormSection, FormInputField } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import FormInput from '../../../../../../components/Form/FormInput';
import messages from '../../messages';

class BlastFormSection extends React.Component<
  InjectedIntlProps & ValidatorProps
> {

  render() {

    const {
      intl: { formatMessage },
      fieldValidators: {
        isRequired,
        isValidEmail,
       },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.emailBlastEditorStepSubTitleBlastInformation}
          title={messages.emailBlastEditorStepTitleBlastInformation}
        />
        <FormInputField
          name="blast.subject_line"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.emailBlastEditorInputLabelSubjectLine),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderSubjectLine),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailBlastEditorInputHelperSubjectLine),
          }}
        />
        <FormInputField
          name="blast.from_email"
          component={FormInput}
          validate={[isRequired, isValidEmail]}
          formItemProps={{
            label: formatMessage(messages.emailBlastEditorInputLabelFromEmail),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderFromEmail),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailBlastEditorInputHelperFromEmail),
          }}
        />
        <FormInputField
          name="blast.from_name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.emailBlastEditorInputLabelFromName),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderFromName),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailBlastEditorInputHelperFromName),
          }}
        />
        <FormInputField
          name="blast.reply_to"
          component={FormInput}
          validate={[isRequired, isValidEmail]}
          formItemProps={{
            label: formatMessage(messages.emailBlastEditorInputLabelReplyTo),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderReplyTo),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailBlastEditorInputHelperReplyTo),
          }}
        />
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withValidators,
)(BlastFormSection);
