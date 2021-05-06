import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import { FormInput, FormSection, FormInputField } from '../../../../../../components/Form';

const messages = defineMessages({
  sectionSubtitleGeneral: {
    id: 'settings.profile.apiToken.edit.general.subtitle',
    defaultMessage: "Modify your Api Token's data.",
  },
  sectionTitleGeneral: {
    id: 'settings.profile.apiToken.edit.general.title',
    defaultMessage: 'General Information',
  },
  labelApiTokenName: {
    id: 'settings.profile.apiToken.edit.general.label.name',
    defaultMessage: 'Name',
  },
  tootltipApiTokenName: {
    id: 'settings.profile.apiToken.edit.general.tooltip.name',
    defaultMessage: 'Give your Api Token a first name.',
  },
  advancedFormSectionButtontext: {
    id: 'settings.profile.apiToken.edit.general.advanced.button',
    defaultMessage: 'Advanced',
  },
});

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
          subtitle={messages.sectionSubtitleGeneral}
          title={messages.sectionTitleGeneral}
        />

        <div>
          <FormInputField
            name='name'
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelApiTokenName),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelApiTokenName),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipApiTokenName),
            }}
          />
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(GeneralFormSection);
