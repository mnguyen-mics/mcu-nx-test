import * as React from 'react';
import { reduxForm, InjectedFormProps, ConfigProps } from 'redux-form';
import { Omit } from 'react-router';
import { Form } from '@ant-design/compatible';
import {
  AddonSelect,
  FormInputField,
  FormInput,
  withValidators,
  FormAddonSelectField,
} from '../../../components/Form';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { ValidatorProps } from '../../../components/Form/withValidators';

export interface NewExportSimpleFormData {
  name: string;
  outputFormat: 'CSV' | 'JSON';
}

const initialFormData: Partial<NewExportSimpleFormData> = {
  outputFormat: 'JSON',
};

export const FORM_ID = 'exportSimpleForm';

export interface FormProps extends Omit<ConfigProps<NewExportSimpleFormData, FormProps>, 'form'> {
  csvExportDisabled?: boolean;
}

type Props = FormProps & InjectedIntlProps & ValidatorProps;

class NewExportSimleForm extends React.Component<
  Props & InjectedFormProps<NewExportSimpleFormData, Props>
> {
  constructor(props: Props & InjectedFormProps<NewExportSimpleFormData, Props>) {
    super(props);
    this.state = {
      displayAdvancedSection: false,
    };
  }

  getOptionList(csvExportDisabled: boolean = false) {
    if (csvExportDisabled) {
      return [
        {
          value: 'JSON',
          title: 'JSON',
        },
      ];
    } else {
      return [
        {
          value: 'JSON',
          title: 'JSON',
        },
        {
          value: 'CSV',
          title: 'CSV',
        },
      ];
    }
  }

  render() {
    const { fieldValidators, intl, handleSubmit, csvExportDisabled } = this.props;

    return (
      <div className='mcs-legacy_form_container'>
        <Form className='edit-layout ant-layout' layout='vertical' onSubmit={handleSubmit}>
          <div className='mcs-form-container' style={{ paddingTop: '0px' }}>
            <FormInputField
              name='name'
              component={FormInput}
              validate={[fieldValidators.isRequired]}
              formItemProps={{
                label: intl.formatMessage(messages.exportNameLabel),
                required: true,
              }}
              inputProps={{
                placeholder: intl.formatMessage(messages.exportNamelPlaceholder),
                addonAfter: (
                  <FormAddonSelectField
                    name='outputFormat'
                    component={AddonSelect}
                    options={this.getOptionList(csvExportDisabled)}
                  />
                ),
              }}
              helpToolTipProps={{
                title: intl.formatMessage(messages.exportNameTooltip),
              }}
              small={true}
            />
          </div>
        </Form>
      </div>
    );
  }
}

export default compose<Props, FormProps>(
  injectIntl,
  withValidators,
  reduxForm({
    form: FORM_ID,
    initialValues: initialFormData,
  }),
)(NewExportSimleForm);

const messages = defineMessages({
  exportNameLabel: {
    id: 'query.saveas.export.name.title',
    defaultMessage: 'Name',
  },
  exportNamelPlaceholder: {
    id: 'query.saveas.export.name.placeholder',
    defaultMessage: 'Export Name',
  },
  exportNameTooltip: {
    id: 'query.saveas.export.name.helper',
    defaultMessage: 'Give your Export a name to find it back on the export screen.',
  },
});
