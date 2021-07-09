import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import messages from '../messages';
import {
  FormSection,
  FormSelectField,
  DefaultSelect,
  FormInputField,
  FormInput,
} from '../../../../../../components/Form';
import { CleaningRuleType } from '../../../../../../models/cleaningRules/CleaningRules';
import { MicsReduxState } from '../../../../../../utils/ReduxHelper';
import { getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { FORM_ID } from '../CleaningRuleEditForm';
import { CleaningRuleFormData, isUserEventCleaningRuleFormData } from '../domain';
import { UserActivityType } from '../../../../../../models/datamart/graphdb/RuntimeSchema';
import { DefaultOptionProps } from '../../../../../../components/Form/FormSelect/DefaultSelect';

interface ScopeFormSectionProps {
  options: DefaultOptionProps[];
  cleaningRuleType: CleaningRuleType;
  formChange: (field: string, value: any) => void;
}

interface MapStateToProps {
  formValues: CleaningRuleFormData;
}

interface State {
  options: DefaultOptionProps[];
}

type Props = ScopeFormSectionProps & InjectedIntlProps & MapStateToProps;

class ScopeFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      options: props.options,
    };
  }

  onActivityTypeFilterChange = (value: UserActivityType | '') => {
    const { formChange } = this.props;
    const { options } = this.props;
    formChange('channelFilter', null);
    if (value === 'SITE_VISIT') {
      this.setState({
        options: options.filter(o => o.key?.includes('SITE') || o.key === 'NO_FILTER'),
      });
    } else if (value === 'APP_VISIT') {
      this.setState({
        options: options.filter(o => o.key?.includes('APP') || o.key === 'NO_FILTER'),
      });
    } else {
      this.setState({
        options: options,
      });
    }
  };

  render() {
    const {
      intl: { formatMessage },
      cleaningRuleType,
      formValues,
    } = this.props;

    const { options } = this.state;

    const displayChannelFilter =
      isUserEventCleaningRuleFormData(formValues) &&
      !(
        formValues.activityTypeFilter === 'TOUCH' ||
        formValues.activityTypeFilter === 'DISPLAY_AD' ||
        formValues.activityTypeFilter === 'EMAIL'
      );

    return cleaningRuleType === 'USER_EVENT_CLEANING_RULE' ? (
      <div>
        <FormSection
          subtitle={messages.sectionScopeUserEventSubTitle}
          title={messages.sectionScopeTitle}
        />
        <FormSelectField
          name='activityTypeFilter'
          component={DefaultSelect}
          formItemProps={{
            label: formatMessage(messages.sectionScopeActivityTypeLabel),
            required: false,
          }}
          selectProps={{
            onSelect: this.onActivityTypeFilterChange,
            className: 'mcs-scopeFormSection_activityTypeFilter_select',
          }}
          options={[
            {
              value: '',
              title: formatMessage(messages.sectionScopeActivityTypeAllTypes),
              className: 'mcs-scopeFormSection_activityTypeFilter_option--DEFAULT',
            },
            {
              value: 'SITE_VISIT',
              title: 'SITE_VISIT',
              className: 'mcs-scopeFormSection_activityTypeFilter_option--SITE_VISIT',
            },
            {
              value: 'APP_VISIT',
              title: 'APP_VISIT',
              className: 'mcs-scopeFormSection_activityTypeFilter_option--APP_VISIT',
            },
            {
              value: 'TOUCH',
              title: 'TOUCH',
              className: 'mcs-scopeFormSection_activityTypeFilter_option--TOUCH',
            },
            {
              value: 'DISPLAY_AD',
              title: 'DISPLAY_AD',
              className: 'mcs-scopeFormSection_activityTypeFilter_option--DISPLAY_AD',
            },
            {
              value: 'EMAIL',
              title: 'EMAIL',
              className: 'mcs-scopeFormSection_activityTypeFilter_option--EMAIL',
            },
          ]}
          helpToolTipProps={{
            title: formatMessage(messages.sectionScopeActivityTypeHelper),
          }}
        />
        {displayChannelFilter && (
          <FormSelectField
            name='channelFilter'
            component={DefaultSelect}
            formItemProps={{
              label: formatMessage(messages.sectionScopeChannelLabel),
              required: false,
            }}
            selectProps={{
              className: 'mcs-scopeFormSection_channelFilter_select',
            }}
            options={options}
            helpToolTipProps={{
              title: formatMessage(messages.sectionScopeChannelHelper),
            }}
          />
        )}
        <FormInputField
          name='eventNameFilter'
          component={FormInput}
          inputProps={{
            className: 'mcs-scopeFormSection_eventNameFilter_input',
          }}
          formItemProps={{
            label: formatMessage(messages.sectionScopeEventNameLabel),
            required: false,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.sectionScopeEventNameHelper),
          }}
        />
      </div>
    ) : (
      <div>
        <FormSection
          subtitle={messages.sectionScopeUserProfileSubTitle}
          title={messages.sectionScopeTitle}
        />
        <FormSelectField
          name='userProfileCleaningRule.compartment_filter'
          component={DefaultSelect}
          formItemProps={{
            label: formatMessage(messages.sectionScopeCompartmentLabel),
            required: false,
          }}
          options={options}
          helpToolTipProps={{
            title: formatMessage(messages.sectionScopeCompartmentHelper),
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, ScopeFormSectionProps>(
  injectIntl,
  connect(mapStateToProps),
)(ScopeFormSection);
