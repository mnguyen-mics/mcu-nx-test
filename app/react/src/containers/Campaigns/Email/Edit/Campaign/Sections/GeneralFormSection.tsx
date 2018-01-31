import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';

import { FormSection, FormInputField } from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import FormInput from '../../../../../../components/Form/FormInput';
import messages from '../../messages';
import { EditEmailBlastRouteMatchParam } from '../../domain';

type Props = InjectedIntlProps &
  ValidatorProps &
  RouteComponentProps<EditEmailBlastRouteMatchParam>;

class GeneralFormSection extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      fieldValidators: { isRequired },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.emailBlastEditorStepSubTitleGeneralInformation}
          title={messages.emailBlastEditorStepTitleGeneralInformation}
        />
        <FormInputField
          name="campaign.name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.emailEditorNameInputLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.emailEditorNameInputPlaceholder,
            ),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailEditorNameInputHelper),
          }}
        />
        <FormInputField
          name="campaign.technical_name"
          component={FormInput}
          formItemProps={{
            label: formatMessage(messages.emailEditorTechnicalNameInputLabel),
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.emailEditorTechnicalNameInputPlaceholder,
            ),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailEditorTechnicalNameInputHelper),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withRouter, withValidators)(
  GeneralFormSection,
);
