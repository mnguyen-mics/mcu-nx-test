import * as React from 'react';
import { compose } from 'recompose';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import messages from '../../List/messages';
import { FormInput, FormSection, FormInputField } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';

type Props = WrappedComponentProps & ValidatorProps & NormalizerProps;

class GeneralFormSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false };
  }

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubTitle}
          title={messages.sectionGeneralTitle}
        />

        <FormInputField
          name='name'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.datamartReplicationNameLabel),
            required: true,
          }}
          inputProps={{
            className: 'mcs-replications_nameField',
            placeholder: formatMessage(messages.datamartReplicationNamePlaceHolder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.datamartReplicationNameTooltip),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(GeneralFormSection);
