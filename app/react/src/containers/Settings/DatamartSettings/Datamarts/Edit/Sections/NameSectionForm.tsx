import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../messages';
import {
  FormSection,
  FormInputField,
  FormInput,
} from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

class NameFormSection extends React.Component<Props> {

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionNameSubTitle}
          title={messages.sectionNameTitle}
        />

        <FormInputField
          name="datamart.name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentSectionNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.contentSectionGeneralTokenPlaceholder,
            ),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSectionNameTooltip),
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
)(NameFormSection);
