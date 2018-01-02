import * as React from 'react';
import { Field } from 'redux-form';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';

import {
  FormSection,
  FieldCtor,
  FormInput,
  withValidators,
  FormInputField,
} from '../../../../../components/Form';
import messages from '../messages';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import { EditDisplayCreativeRouteMatchParams } from '../domain';
// import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';
import DisplayCreativeFormatEditor from '../DisplayCreativeFormatEditor';

interface GeneralFormSectionProps {
  // creative?: Partial<DisplayAdResource>
}

type JoinedProps = GeneralFormSectionProps &
  ValidatorProps &
  InjectedIntlProps &
  RouteComponentProps<EditDisplayCreativeRouteMatchParams>;

class GeneralFormSection extends React.Component<JoinedProps> {
  render() {
    const {
      intl: { formatMessage },
      fieldValidators: { isRequired },
    } = this.props;

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
            // set isDisabled to true if creative audit status is pending or success
            // disabled: isDisabled,
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
          validate={[]}
          // disabled={isDisabled}
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
            // set isDisabled to true if creative audit status is pending or success
            // disabled: isDisabled,
          }}
          helpToolTipProps={{
            title: formatMessage(
              messages.creativeCreationGeneralDomainFieldHelper,
            ),
          }}
        />
      </div>
    );
  }
}

export default compose<JoinedProps, GeneralFormSectionProps>(
  injectIntl,
  withRouter,
  withValidators,
)(GeneralFormSection);
