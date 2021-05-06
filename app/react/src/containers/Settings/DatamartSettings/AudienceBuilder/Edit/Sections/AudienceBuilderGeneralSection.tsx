import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { messages } from '../../messages';
import { FormInput, FormSection, FormInputField } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

class AudienceBuilderGeneralSection extends React.Component<Props> {
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
        <FormSection title={messages.audienceBuilderSectionGeneralTitle} />

        <FormInputField
          name='audienceBuilder.name'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.audienceBuilderNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.audienceBuilderNamePlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.audienceBuilderNameTooltip),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(AudienceBuilderGeneralSection);
