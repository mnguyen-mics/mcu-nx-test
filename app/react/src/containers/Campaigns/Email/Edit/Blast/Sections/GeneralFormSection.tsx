import * as React from 'react';
import * as moment from 'moment';
import { Field, GenericField } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Spin } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';

import { FormSection } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import FormInput, { FormInputProps } from '../../../../../../components/Form/FormInput';
import FormDatePicker, { FormDatePickerProps } from '../../../../../../components/Form/FormDatePicker';
import DefaultSelect, { DefaultSelectProps } from '../../../../../../components/Form/FormSelect/DefaultSelect';
import messages from '../../messages';
import { ConsentResource } from '../../../../../../models/consent/ConsentResource';
import ConsentService from '../../../../../../services/ConsentService';
import { EditEmailBlastRouteMatchParam } from '../../domain';

const FormInputField = Field as new() => GenericField<FormInputProps>;
const FormDatePickerField = Field as new() => GenericField<FormDatePickerProps>;
const FormSelectField = Field as new() => GenericField<DefaultSelectProps>;

interface State {
  consents: ConsentResource[];
  fetchingConsents: boolean;
}

type Props =
  InjectedIntlProps &
  ValidatorProps &
  RouteComponentProps<EditEmailBlastRouteMatchParam>;

class GeneralFormSection extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      consents: [],
      fetchingConsents: false,
    };
  }

  componentDidMount() {
    this.setState({ fetchingConsents: true });
    ConsentService.getConsents(
    this.props.match.params.organisationId,
    ).then(response => {
      this.setState({
        fetchingConsents: false,
        consents: response.data,
      });
    });
  }

  render() {

    const {
      intl: { formatMessage },
      fieldValidators: {
        isRequired,
       },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.emailBlastEditorStepSubTitleGeneralInformation}
          title={messages.emailBlastEditorStepTitleGeneralInformation}
        />
        <FormInputField
          name="blast.blast_name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.emailBlastEditorInputLabelBlastName),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.emailBlastEditorInputPlaceholderBlastName),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailBlastEditorInputHelperBlastName),
          }}
        />
        <FormDatePickerField
          name="blast.send_date"
          component={FormDatePicker}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.emailBlastEditorDatePickerLabelSentDate),
            required: true,
          }}
          datePickerProps={{
            format: 'DD/MM/YYYY HH:mm',
            showTime: { format: 'HH:mm' },
            placeholder: formatMessage(messages.emailBlastEditorDatePickerPlaceholderSentDate),
            disabledDate: current => current && current.isBefore(moment.now()),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.emailBlastEditorDatePickerHelperSentDate),
          }}
          unixTimestamp={true}
        />
        <FormSelectField
          name="consentFields[0].model.consent_id"
          component={DefaultSelect}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.emailEditorProviderSelectLabel),
            required: true,
          }}
          selectProps={{
            notFoundContent: this.state.fetchingConsents ? <Spin size="small" /> : null,
          }}
          options={this.state.consents.map(consent => ({
            value: consent.id,
            title: consent.technical_name,
          }))}
          helpToolTipProps={{
            title: formatMessage(messages.emailEditorProviderSelectHelper),
          }}
        />
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  withValidators,
)(GeneralFormSection);
