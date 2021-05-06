import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import { FormSection, FormInputField } from '../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../components/Form/withNormalizer';
import FormInput from '../../../../../components/Form/FormInput';

import messages from '../messages';

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

class AttributionFormSection extends React.Component<Props> {
  render() {
    const {
      fieldNormalizer: { normalizeInteger },
      fieldValidators: { isRequired, isValidInteger },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection subtitle={messages.sectionSubtitle2} title={messages.sectionTitle2} />

        <div>
          <FormInputField
            name='lookbackWindow.postClick'
            component={FormInput}
            normalize={normalizeInteger}
            validate={[isRequired, isValidInteger]}
            formItemProps={{
              label: formatMessage(messages.contentSection2Row1Label),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.contentSection2Row1Placeholder),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSection2Row1Tooltip),
            }}
          />
        </div>

        <div>
          <FormInputField
            name='lookbackWindow.postView'
            component={FormInput}
            normalize={normalizeInteger}
            validate={[isRequired, isValidInteger]}
            formItemProps={{
              label: formatMessage(messages.contentSection2Row2Label),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.contentSection2Row2Placeholder),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSection2Row2Tooltip),
            }}
          />
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(AttributionFormSection);
