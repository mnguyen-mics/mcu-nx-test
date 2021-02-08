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
    id: 'edit.dealList.form.general.subtitle',
    defaultMessage: 'Give your Deal List a name.',
  },
  sectionTitleGeneral: {
    id: 'edit.dealList.form.general.title',
    defaultMessage: 'General Information',
  },
  labelDealListName: {
    id: 'edit.dealList.general.infos.label.name',
    defaultMessage: 'Deal List Name',
  },
  tooltipDealListName: {
    id: 'edit.dealList.general.infos.tooltip.name',
    defaultMessage: 'Give your Deal List a name so that you can find it back across the different screens!',
  },
});

type Props = InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  RouteComponentProps<{ organisationId: string; partitionId: string }>;


class GeneralFormSection extends React.Component<Props> {

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
            label: formatMessage(messages.labelDealListName),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.labelDealListName),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.tooltipDealListName),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer, withRouter)(
  GeneralFormSection,
);
