import * as React from 'react';
import { compose } from 'recompose';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import messages from '../messages';
import {
  FormAlertInput,
  FormSection,
  FormAlertInputField,
  FormInputField,
  FormInput,
} from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';

export interface GeneralFormSectionProps {
  isCrossDatamart: boolean;
}

type Props = GeneralFormSectionProps & WrappedComponentProps & ValidatorProps & NormalizerProps;

interface State {
  displayAdvancedSection: boolean;
}

class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false };
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      isCrossDatamart,
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubTitle}
          title={messages.sectionGeneralTitle}
        />
        <FormInputField
          name='datamart.name'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentSectionNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentSectionGeneralTokenPlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSectionNameTooltip),
          }}
        />
        {!isCrossDatamart && (
          <FormAlertInputField
            name='datamart.token'
            component={FormAlertInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.contentSectionGeneralTokenLabel),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.contentSectionGeneralTokenPlaceholder),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralTokenTooltip),
            }}
            iconType='warning'
            type='warning'
            message={formatMessage(messages.warningOnTokenEdition)}
          />
        )}
      </div>
    );
  }
}

export default compose<Props, GeneralFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
)(GeneralFormSection);
