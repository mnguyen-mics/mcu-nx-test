import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormAddonSelectField,
  AddonSelect,
  FormCheckboxGroup,
  FormCheckboxGroupField,
  FormTimePickerField,
  FormTimePicker,
} from '../../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../../components/Form/withNormalizer';
import { DefaultFormData, WaitFormData, FORM_ID } from '../../domain';
import { Switch } from 'antd';
import moment, { Moment } from 'moment';
import { WeekDay } from '../../../../../../../utils/DateHelper';
import { DispatchProp, connect } from 'react-redux';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { getFormValues, change } from 'redux-form';

export const messages: {
  [key: string]: FormattedMessage.MessageDescriptor;
} = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.waitNodeForm.general.title',
    defaultMessage: 'Description',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.waitNodeForm.general.subtitle',
    defaultMessage: `Using {wait}, you can stall the automation for a given amount of time.
    For example, you can wait a few hours before checking if users have bought the product
    they've added to their cart.`,
  },
  wait: {
    id: 'automation.builder.node.waitNodeForm.general.subtitle.wait',
    defaultMessage: 'Wait',
  },
  sectionGeneralConfigurationTitle: {
    id: 'automation.builder.node.waitNodeForm.general.configuration.title',
    defaultMessage: 'Configuration',
  },
  durationTitle: {
    id: 'automation.builder.node.waitNodeForm.duration.title',
    defaultMessage: 'Delay',
  },
  durationPlaceholder: {
    id: 'automation.builder.node.waitNodeForm.duration.placeholder',
    defaultMessage: 'Enter the duration',
  },
  durationUnitHours: {
    id: 'automation.builder.node.waitNodeForm.duration.unit.hours',
    defaultMessage: 'Hours',
  },
  durationUnitDays: {
    id: 'automation.builder.node.waitNodeForm.duration.unit.days',
    defaultMessage: 'Days',
  },
  enableTimeWindow: {
    id: 'automation.builder.node.waitNodeForm.timeWindow.enable',
    defaultMessage: 'Time window',
  },
  enableDayWindow: {
    id: 'automation.builder.node.waitNodeForm.dayWindow.enable',
    defaultMessage: 'Day selection',
  },
  timeWindowTitle: {
    id: 'automation.builder.node.waitNodeForm.timeWindow.title',
    defaultMessage: 'Wait until time is between:',
  },
  betweenTime: {
    id: 'automation.builder.node.waitNodeForm.timeWindow.betweenTime',
    defaultMessage: 'and',
  },
  startTimeRequired: {
    id: 'automation.builder.node.waitNodeForm.timeWindow.error.startTimeRequired',
    defaultMessage: 'Required when end time set',
  },
  endTimeRequired: {
    id: 'automation.builder.node.waitNodeForm.general.error.endTimeRequired',
    defaultMessage: 'Required when start time set',
  },
  startTimeInvalidValue: {
    id: 'automation.builder.node.waitNodeForm.timeWindow.error.startTimeInvalidValue',
    defaultMessage: 'Start time cannot be equal to 23:00',
  },
  endTimeInvalidValue: {
    id: 'automation.builder.node.waitNodeForm.timeWindow.error.endTimeInvalidValue',
    defaultMessage: 'End time cannot be equal to 00:00',
  },
  dayWindowTitle: {
    id: 'automation.builder.node.waitNodeForm.dayWindow.title',
    defaultMessage: 'Wait for the following days:',
  },
  monday: {
    id: 'automation.builder.node.waitNodeForm.dayWindow.monday',
    defaultMessage: 'Monday',
  },
  tuesday: {
    id: 'automation.builder.node.waitNodeForm.dayWindow.tuesday',
    defaultMessage: 'Tuesday',
  },
  wednesday: {
    id: 'automation.builder.node.waitNodeForm.dayWindow.wednesday',
    defaultMessage: 'Wednesday',
  },
  thursday: {
    id: 'automation.builder.node.waitNodeForm.dayWindow.tursday',
    defaultMessage: 'Thursday',
  },
  friday: {
    id: 'automation.builder.node.waitNodeForm.dayWindow.friday',
    defaultMessage: 'Friday',
  },
  saturday: {
    id: 'automation.builder.node.waitNodeForm.dayWindow.saturday',
    defaultMessage: 'Saturday',
  },
  sunday: {
    id: 'automation.builder.node.waitNodeForm.dayWindow.sunday',
    defaultMessage: 'Sunday',
  },
  dayWindowEmpty: {
    id: 'automation.builder.node.waitNodeForm.dayWindow.error.empty',
    defaultMessage: 'You have to choose at least one day',
  },
});

const weekDays: WeekDay[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
];

const TIME_FORMAT = 'HH:mm';

interface GeneralInformationFormSectionProps {
  initialValues: Partial<DefaultFormData>;
  disabled?: boolean;
}

interface MapStateToProps {
  formValues: WaitFormData;
}

type Props = GeneralInformationFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  MapStateToProps &
  DispatchProp<any> &
  NormalizerProps;

interface State {
  enableTimeWindow: boolean;
  enableDayWindow: boolean;
}

class GeneralInformationFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      enableTimeWindow: this.isTimeSwitchInitiallyChecked(props.initialValues as WaitFormData),
      enableDayWindow: this.isDaySwitchInitiallyChecked(props.initialValues as WaitFormData),
    };
  }

  isTimeSwitchInitiallyChecked = (waitFormData: WaitFormData): boolean => {
    return !!waitFormData.time_window_start || !!waitFormData.time_window_end;
  };

  isDaySwitchInitiallyChecked = (waitFormData: WaitFormData): boolean => {
    return !!waitFormData.day_window && waitFormData.day_window.length !== 7;
  };

  onTimeSwitchChange = (checked: boolean) => {
    const { dispatch } = this.props;
    if (dispatch) {
      if (checked) {
        dispatch(change(FORM_ID, 'time_window_start', moment('09:00', TIME_FORMAT)));
        dispatch(change(FORM_ID, 'time_window_end', moment('18:00', TIME_FORMAT)));
      } else {
        dispatch(change(FORM_ID, 'time_window_start', null));
        dispatch(change(FORM_ID, 'time_window_end', null));
      }
    }
    return this.setState({
      enableTimeWindow: checked,
    });
  };

  onDaySwitchChange = (checked: boolean) => {
    const { dispatch } = this.props;
    if (dispatch && !checked) {
      dispatch(change(FORM_ID, 'day_window', weekDays));
    }
    return this.setState({
      enableDayWindow: checked,
    });
  };

  onStartTimeChange = (event?: React.ChangeEvent, newValue?: Moment) => {
    const { dispatch, formValues } = this.props;
    if (
      dispatch &&
      newValue &&
      formValues.time_window_end &&
      !newValue.isBefore(formValues.time_window_end)
    ) {
      dispatch(
        change(
          FORM_ID,
          'time_window_end',
          moment(0)
            .hours(newValue.hours() + 1)
            .day(newValue.day()),
        ),
      );
    }
  };

  onEndTimeChange = (event?: React.ChangeEvent, newValue?: Moment) => {
    const { dispatch, formValues } = this.props;
    if (
      dispatch &&
      newValue &&
      formValues.time_window_start &&
      !newValue.isAfter(formValues.time_window_start)
    ) {
      dispatch(
        change(
          FORM_ID,
          'time_window_start',
          moment(0)
            .hours(newValue.hours() - 1)
            .day(newValue.day()),
        ),
      );
    }
  };

  validateStartTime = (value?: Moment) => {
    const {
      intl: { formatMessage },
    } = this.props;

    return value && value.hours() === 23
      ? formatMessage(messages.startTimeInvalidValue)
      : undefined;
  };

  validateEndTime = (value?: Moment) => {
    const {
      intl: { formatMessage },
    } = this.props;

    return value && value.hours() === 0 ? formatMessage(messages.endTimeInvalidValue) : undefined;
  };

  validateNotEmpty = (value: any) => {
    const {
      intl: { formatMessage },
    } = this.props;
    return !value || (value.length !== undefined && !value.length)
      ? formatMessage(messages.dayWindowEmpty)
      : undefined;
  };

  render() {
    const {
      fieldValidators: { isRequired, isValidInteger, isNotZero },
      intl: { formatMessage },
      disabled,
    } = this.props;
    const { enableTimeWindow, enableDayWindow } = this.state;

    const sectionGeneralSubtitle = {
      ...messages.sectionGeneralSubtitle,
      values: {
        wait: (
          <span className='mcs-automation_nodeName'>
            <FormattedMessage {...messages.wait} />
          </span>
        ),
      },
    };

    return (
      <div className='mcs-automationWaitNodeForm'>
        <FormSection subtitle={sectionGeneralSubtitle} title={messages.sectionGeneralTitle} />
        <FormSection title={messages.sectionGeneralConfigurationTitle} />
        <FormInputField
          name='wait_duration.value'
          component={FormInput}
          validate={[isRequired, isValidInteger, isNotZero]}
          formItemProps={{
            label: formatMessage(messages.durationTitle),
            required: true,
          }}
          inputProps={{
            disabled: !!disabled,
            placeholder: formatMessage(messages.durationPlaceholder),
            addonAfter: (
              <FormAddonSelectField
                name='wait_duration.unit'
                component={AddonSelect}
                disabled={disabled}
                options={[
                  {
                    key: 'hours',
                    value: 'hours',
                    title: formatMessage(messages.durationUnitHours),
                  },
                  {
                    key: 'days',
                    value: 'days',
                    title: formatMessage(messages.durationUnitDays),
                  },
                ]}
              />
            ),
            style: { width: '100%' },
          }}
          small={true}
        />

        <div className={'mcs-automationWaitNodeForm_switchSection'}>
          <Switch
            defaultChecked={enableTimeWindow}
            disabled={disabled}
            onChange={this.onTimeSwitchChange}
          />
          <div className={'mcs-automationWaitNodeForm_switchSection_label'}>
            {formatMessage(messages.enableTimeWindow)}
          </div>
        </div>

        {enableTimeWindow && (
          <div>
            <div className={'mcs-automationWaitNodeForm_sectionDescription'}>
              {formatMessage(messages.timeWindowTitle)}
            </div>
            <div className={'mcs-automationWaitNodeForm_timeSection'}>
              <FormTimePickerField
                name='time_window_start'
                component={FormTimePicker}
                timeFormat={TIME_FORMAT}
                allowClear={false}
                minuteStep={60}
                validate={[isRequired, this.validateStartTime]}
                onChange={this.onStartTimeChange}
                disabled={disabled}
              />
              <div className={'mcs-automationWaitNodeForm_timeSection_label'}>
                {formatMessage(messages.betweenTime)}
              </div>
              <FormTimePickerField
                name='time_window_end'
                component={FormTimePicker}
                timeFormat={TIME_FORMAT}
                allowClear={false}
                minuteStep={60}
                validate={[isRequired, this.validateEndTime]}
                onChange={this.onEndTimeChange}
                disabled={disabled}
              />
            </div>
          </div>
        )}

        <div className={'mcs-automationWaitNodeForm_switchSection'}>
          <Switch
            defaultChecked={enableDayWindow}
            disabled={disabled}
            onChange={this.onDaySwitchChange}
          />
          <div className={'mcs-automationWaitNodeForm_switchSection_label'}>
            {formatMessage(messages.enableDayWindow)}
          </div>
        </div>

        {enableDayWindow && (
          <div>
            <div className={'mcs-automationWaitNodeForm_sectionDescription'}>
              {formatMessage(messages.dayWindowTitle)}
            </div>
            <FormCheckboxGroupField
              name='day_window'
              className='mcs-automationWaitNodeForm_checkBoxGroup'
              component={FormCheckboxGroup}
              validate={this.validateNotEmpty}
              disabled={disabled}
              options={weekDays.map(day => {
                return {
                  label: formatMessage(messages[day.toLowerCase()]),
                  value: day,
                };
              })}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, GeneralInformationFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  connect(mapStateToProps),
)(GeneralInformationFormSection);
