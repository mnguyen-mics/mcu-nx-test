import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { messages } from '../../messages';
import {
  FormInput,
  FormSection,
  FormInputField,
} from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

class GeneralFormSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false };
  }

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          title={messages.sectionGeneralTitle}
        />

        <FormInputField
          name="name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.audienceFeatureNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.audienceFeatureNamePlaceholder,
            ),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.audienceFeatureNameTooltip),
          }}
        />
        <FormInputField
          name="description"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.audienceFeatureDescriptionLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.audienceFeatureDescriptionPlaceholder,
            ),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.audienceFeatureDescriptionTooltip),
          }}
        />
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withValidators,
  withNormalizer,
)(GeneralFormSection);
