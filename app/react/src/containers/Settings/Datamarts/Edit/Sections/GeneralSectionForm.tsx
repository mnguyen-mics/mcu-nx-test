import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../messages';
import {
  FormInput,
  FormSection,
  FormInputField,
} from '../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

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
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubTitle}
          title={messages.sectionGeneralTitle}
        />

        <div>
          <FormInputField
            name="datamart.token"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.contentSectionGeneralTokenLabel),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(
                messages.contentSectionGeneralTokenPlaceholder,
              ),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralTokenTooltip),
            }}
          />
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(
  GeneralFormSection,
);