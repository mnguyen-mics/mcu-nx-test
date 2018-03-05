import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import {
  FormInput,
  FormSection,
  FormInputField,
} from '../../../../../components/Form';
import { RouteComponentProps, withRouter } from 'react-router';

const messages = defineMessages({
  sectionSubtitleGeneral: {
    id: 'edit.keywordList.form.general.subtitle',
    defaultMessage: 'This is the subtitle part.',
  },
  sectionTitleGeneral: {
    id: 'edit.keywordList.form.general.title',
    defaultMessage: 'General Informations',
  },
  labelKeywordListName: {
    id: 'edit.keywordList.general.infos.label.name',
    defaultMessage: 'Keyword List Name',
  },
  tootltipKeywordListName: {
    id: 'edit.keywordList.general.infos.tooltip.name',
    defaultMessage: 'Lorem Ipsum',
  },
});

type Props = InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  RouteComponentProps<{ organisationId: string; partitionId: string }>;

interface State {}

class GeneralFormSection extends React.Component<Props, State> {
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

        <FormInputField
          name="name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.labelKeywordListName),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.labelKeywordListName),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.labelKeywordListName),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer, withRouter)(
  GeneralFormSection,
);
