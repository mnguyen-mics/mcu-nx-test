import * as React from 'react';
import { Field, getFormInitialValues } from 'redux-form';
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
} from '../../../../../components/Form';
import messages from '../messages';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import { EditDisplayCreativeRouteMatchParams, DisplayCreativeFormData, DISPLAY_CREATIVE_FORM, isDisplayAdResource } from '../domain';
// import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';
import DisplayCreativeFormatEditor from '../DisplayCreativeFormatEditor';

interface MapStateProps {
  initialValue: DisplayCreativeFormData;
}

type Props = 
  ValidatorProps &
  InjectedIntlProps &
  MapStateProps &
  RouteComponentProps<EditDisplayCreativeRouteMatchParams>;

class GeneralFormSection extends React.Component<Props> {
  render() {
    const {
      intl: { formatMessage },
      fieldValidators: { isRequired },
      initialValue: { creative },
    } = this.props;

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
          validate={[]}
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
