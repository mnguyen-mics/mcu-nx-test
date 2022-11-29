import * as React from 'react';
import { compose } from 'recompose';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import messages from '../messages';
import {
  DefaultSelect,
  FormSelectField,
  FormInputField,
  FormInput,
} from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';

type Props = WrappedComponentProps & ValidatorProps & NormalizerProps;

class PropertyToOriginCopy extends React.Component<Props> {
  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;

    const sourceOptions = [
      {
        title: 'URL',
        value: 'URL',
      },
      {
        title: 'EVENT_PROPERTY',
        value: 'EVENT_PROPERTY',
      },
      {
        title: 'REFERRER',
        value: 'REFERRER',
      },
    ];

    return (
      <div>
        <FormInputField
          name='model.property_name'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentProperty2OriginPropertyNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentProperty2OriginPropertyNamePlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentProperty2OriginPropertyNameTooltip),
          }}
        />
        <FormSelectField
          name='model.property_source'
          component={DefaultSelect}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentProperty2OriginPropertySourceLabel),
            required: true,
          }}
          options={sourceOptions}
          helpToolTipProps={{
            title: formatMessage(messages.contentProperty2OriginPropertySourceTooltip),
          }}
        />
        <FormInputField
          name='model.destination'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentProperty2OriginDestinationLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentProperty2OriginDestinationPlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentProperty2OriginDestinationTooltip),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(PropertyToOriginCopy);
