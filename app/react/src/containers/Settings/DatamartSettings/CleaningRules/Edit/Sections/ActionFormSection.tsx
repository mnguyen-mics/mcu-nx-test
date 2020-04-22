import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import { compose } from 'recompose';
import messages from '../messages';
import {
  FormSection,
  FormLinkedSelectAndPeriodPickerField,
  FormLinkedSelectAndPeriodPicker,
} from '../../../../../../components/Form';
import { Validator } from 'redux-form';
import moment from 'moment';
import {
  USER_EVENT_CLEANING_RULE_MIN_LIFE_DURATION,
  USER_EVENT_CLEANING_RULE_MAX_LIFE_DURATION,
} from '../domain';

type Props = InjectedIntlProps & ValidatorProps;

class ActionFormSection extends React.Component<Props> {
  checkLifeDuration = (): Validator => value => {
    const {
      intl: { formatMessage },
    } = this.props;

    const minLifeDurationInDays = moment
      .duration(USER_EVENT_CLEANING_RULE_MIN_LIFE_DURATION)
      .asDays();
    const maxLifeDurationInDays = moment
      .duration(USER_EVENT_CLEANING_RULE_MAX_LIFE_DURATION)
      .asDays();

    const currentLifeDurationInDays = moment
      .duration(`P${value.periodNumber}${value.periodUnit}`)
      .asDays();

    return currentLifeDurationInDays < minLifeDurationInDays ||
      currentLifeDurationInDays > maxLifeDurationInDays
      ? formatMessage(messages.invalidLifeDuration)
      : undefined;
  };

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;

    const optionsAndSeparators = [
      {
        label: 'KEEP',
        value: 'KEEP',
        separator: 'for',
      },
      {
        label: 'DELETE',
        value: 'DELETE',
        separator: 'after',
      },
    ];

    return (
      <div>
        <FormSection
          subtitle={messages.sectionActionSubTitle}
          title={messages.sectionActionTitle}
        />
        <FormLinkedSelectAndPeriodPickerField
          name="actionAndPeriod"
          component={FormLinkedSelectAndPeriodPicker}
          validate={[isRequired, this.checkLifeDuration()]}
          formItemProps={{
            label: formatMessage(messages.sectionActionLabel),
            required: true,
          }}
          optionsAndSeparators={optionsAndSeparators}
          helpToolTipProps={{
            title: formatMessage(messages.sectionActionHelper),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withValidators)(ActionFormSection);
