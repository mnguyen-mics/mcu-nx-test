import * as React from 'react';
import { reduxForm, InjectedFormProps, ConfigProps } from 'redux-form';
import { Form } from '@ant-design/compatible';
import { Button } from 'antd';
import {
  FormInputField,
  FormInput,
  withValidators,
  withNormalizer,
} from '../../../../components/Form';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { ValidatorProps } from '../../../../components/Form/withValidators';
import { NormalizerProps } from '../../../../components/Form/withNormalizer';
import { AutomationResource } from '../../../../models/automations/automations';
import { BlurredModal, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { ButtonProps } from 'antd/lib/button';

export type AutomationSimpleFormData = Partial<AutomationResource>;

export const FORM_ID = 'automationSimpleForm';

export interface FormProps extends Omit<ConfigProps<AutomationSimpleFormData, FormProps>, 'form'> {
  visible: boolean;
  onClose: () => void;
  onHandleOk: () => void;
}

type Props = FormProps & InjectedIntlProps & ValidatorProps & NormalizerProps;

class AutomationSimpleForm extends React.Component<
  Props & InjectedFormProps<AutomationSimpleFormData, Props>
> {
  constructor(props: Props & InjectedFormProps<AutomationSimpleFormData, Props>) {
    super(props);
  }

  render() {
    const { fieldValidators, intl, handleSubmit, visible, onClose, onHandleOk } = this.props;

    const submitButtonProps: ButtonProps = {
      htmlType: 'submit',
      type: 'primary',
      onClick: onHandleOk,
    };

    const modalFooter = (
      <Button {...submitButtonProps} className='mcs-primary'>
        <McsIcon type='plus' />
        Save
      </Button>
    );

    return (
      <div className='mcs-legacy_form_container'>
        <Form className='edit-layout ant-layout' onSubmit={handleSubmit as any}>
          <BlurredModal onClose={onClose} formId={FORM_ID} opened={visible} footer={modalFooter}>
            <FormInputField
              name='name'
              component={FormInput}
              validate={[fieldValidators.isRequired]}
              formItemProps={{
                label: intl.formatMessage(messages.automationNameLabel),
                required: true,
              }}
              inputProps={{
                placeholder: intl.formatMessage(messages.automationNamePlaceHolder),
                className: 'mcs-automationName',
              }}
              helpToolTipProps={{
                title: intl.formatMessage(messages.automationNameTooltip),
              }}
            />
          </BlurredModal>
        </Form>
      </div>
    );
  }
}

export default compose<Props, FormProps>(
  injectIntl,
  withValidators,
  withNormalizer,
  reduxForm({
    form: FORM_ID,
  }),
)(AutomationSimpleForm);

const messages = defineMessages({
  automationNameLabel: {
    id: 'automation.builder.page.actionbar.form.name.label',
    defaultMessage: 'Name',
  },
  automationNamePlaceHolder: {
    id: 'automation.builder.page.actionbar.form.name.placeholder',
    defaultMessage: 'Automation Name',
  },
  automationNameTooltip: {
    id: 'automation.builder.page.actionbar.form.name.helper',
    defaultMessage: 'Give your Automation a name to find it back on the automation screen.',
  },
});
