import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormSelectField,
  DefaultSelect,
} from '../../../../../../components/Form';

const messages = defineMessages({
  sectionTitleGeneral: {
    id: 'settings.organisation.users.edit.userInfoSection.title',
    defaultMessage: 'User Information',
  },
  labelUserName: {
    id: 'settings.organisation.users.edit.userInfoSection.label.name',
    defaultMessage: 'Name',
  },
  labelUserEmail: {
    id: 'settings.organisation.users.edit.userInfoSection.label.email',
    defaultMessage: 'Email',
  },
  labelOrganisation: {
    id: 'settings.organisation.users.edit.userInfoSection.label.organisation',
    defaultMessage: 'Organisation',
  },
});

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

class UserInfoFormSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection title={messages.sectionTitleGeneral} />

        <div>
          <FormInputField
            name='user_name'
            component={FormInput}
            formItemProps={{
              label: formatMessage(messages.labelUserName),
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelUserName),
              disabled: true,
            }}
          />
          <FormInputField
            name='email'
            component={FormInput}
            formItemProps={{
              label: formatMessage(messages.labelUserEmail),
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelUserEmail),
              disabled: true,
            }}
          />
          <FormSelectField
            name='organisation_name'
            component={DefaultSelect}
            disabled={true}
            formItemProps={{
              label: formatMessage(messages.labelOrganisation),
            }}
          />
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(UserInfoFormSection);
