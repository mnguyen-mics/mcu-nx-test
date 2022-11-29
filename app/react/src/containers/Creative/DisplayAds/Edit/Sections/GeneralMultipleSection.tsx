import * as React from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';

import {
  FormSection,
  FormInput,
  withValidators,
  FormInputField,
} from '../../../../../components/Form';
import messages from '../messages';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import { EditDisplayCreativeRouteMatchParams } from '../domain';
import { RouteComponentProps } from 'react-router-dom';

export interface GeneralFormSectionProps {
  small?: boolean;
}

type Props = ValidatorProps &
  GeneralFormSectionProps &
  WrappedComponentProps &
  RouteComponentProps<EditDisplayCreativeRouteMatchParams>;

interface State {
  displayAdvancedSection: boolean;
  displayWarning: boolean;
}
class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false, displayWarning: false };
  }

  render() {
    const {
      intl: { formatMessage },
      fieldValidators: { isRequired },
      small,
    } = this.props;

    return (
      <div>
        <FormSection
          title={messages.creativeSectionGeneralTitle}
          subtitle={messages.creativeSectionGeneralMultipleSubTitle}
        />

        <FormInputField
          name='creative.destination_domain'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.creativeCreationGeneralDomainFieldTitle),
            required: small,
          }}
          inputProps={{
            placeholder: formatMessage(messages.creativeCreationGeneralDomainFieldPlaceHolder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.creativeCreationGeneralDomainFieldHelper),
          }}
          small={small}
        />
      </div>
    );
  }
}

export default compose<Props, GeneralFormSectionProps>(
  injectIntl,
  withValidators,
)(GeneralFormSection);
