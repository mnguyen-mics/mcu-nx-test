import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import {
  FormSection,
  FormInputField,
  FormInput,
  FormAlertInputField,
  FormAlertInput,
} from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import messages from '../../messages';
import { EditEmailBlastRouteMatchParam } from '../../domain';

type Props = WrappedComponentProps &
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
          name='campaign.name'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.emailEditorNameInputLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.emailEditorNameInputPlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailEditorNameInputHelper),
          }}
        />
        <FormAlertInputField
          name='campaign.technical_name'
          component={FormAlertInput}
          formItemProps={{
            label: formatMessage(messages.emailEditorTechnicalNameInputLabel),
          }}
          inputProps={{
            placeholder: formatMessage(messages.emailEditorTechnicalNameInputPlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailEditorTechnicalNameInputHelper),
          }}
          iconType='warning'
          type='warning'
          message={formatMessage(messages.warningOnTokenEdition)}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withRouter, withValidators)(GeneralFormSection);
