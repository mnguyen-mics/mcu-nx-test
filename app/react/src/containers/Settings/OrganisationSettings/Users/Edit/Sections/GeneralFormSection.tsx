import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import {
  FormInput,
  FormSection,
  FormInputField,
} from '../../../../../../components/Form';

const messages = defineMessages({
  sectionSubtitleGeneral: {
    id: 'settings.organisation.users.edit.generalInfoSection.subtitle',
    defaultMessage: 'Modify your User\'s data.',
  },
  sectionTitleGeneral: {
    id: 'settings.organisation.users.edit.generalInfoSection.title',
    defaultMessage: 'General Information',
  },
  labelUserFirstName: {
    id: 'settings.organisation.users.edit.generalInfoSection.label.firstname',
    defaultMessage: 'First Name',
  },
  labelUserLastName: {
    id: 'settings.organisation.users.edit.generalInfoSection.label.lastname',
    defaultMessage: 'Last Name',
  },
  tootltipUserFirstName: {
    id: 'settings.organisation.users.edit.generalInfoSection.tooltip.firstname',
    defaultMessage: 'Give your User a first name.',
  },
  tootltipUserLastName: {
    id: 'settings.organisation.users.edit.generalInfoSection.tooltip.lastname',
    defaultMessage: 'Give your User a last name.',
  },
  labelUserEmail: {
    id: 'settings.organisation.users.edit.generalInfoSection.label.email',
    defaultMessage: 'Email',
  },
  tootltipUserEmail: {
    id: 'settings.organisation.users.edit.generalInfoSection.tooltip.email',
    defaultMessage: 'Give your User an email',
  },
  advancedFormSectionButtontext: {
    id: 'settings.organisation.users.edit.generalInfoSection.advanced.button',
    defaultMessage: 'Advanced',
  },
//   tootltipTechnicalName: {
//     id: 'edit.user.general.infos.tooltip.technical.name',
//     defaultMessage: 'The technical Name is used for custom integrations.',
//   },
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
            name="first_name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelUserFirstName),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelUserFirstName),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipUserFirstName),
            }}
          />
          <FormInputField
            name="last_name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelUserLastName),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelUserLastName),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipUserLastName),
            }}
          />
          <FormInputField
            name="email"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelUserEmail),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelUserEmail),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipUserEmail),
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
