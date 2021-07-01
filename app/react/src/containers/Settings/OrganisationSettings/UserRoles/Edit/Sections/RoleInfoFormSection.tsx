import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import { FormSection, FormSelectField, DefaultSelect } from '../../../../../../components/Form';
import { roleOptions } from '../../messages';

const messages = defineMessages({
  sectionSubtitleGeneral: {
    id: 'settings.organisation.users.edit.generalInfoSection.subtitle',
    defaultMessage: "Modify your User's role.",
  },
  sectionTitleGeneral: {
    id: 'settings.organisation.users.edit.roleInfoSection.title',
    defaultMessage: 'Role Information',
  },
  labelRoleTitle: {
    id: 'settings.organisation.users.edit.roleInfoSection.label.role',
    defaultMessage: 'Role',
  },
});

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

class RoleFormSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

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
          <FormSelectField
            name='role'
            component={DefaultSelect}
            validate={[isRequired]}
            options={roleOptions}
            defaultValueTitle={'None'}
            formItemProps={{
              className: 'mcs-roleInfoFormSection_selectField',
              label: formatMessage(messages.labelRoleTitle),
              required: true,
            }}
          />
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(RoleFormSection);
