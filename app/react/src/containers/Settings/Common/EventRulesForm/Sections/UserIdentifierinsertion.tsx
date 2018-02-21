import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../messages';
import { FormSelect, FormSelectField, FormInputField, FormInput } from '../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';

const { DefaultSelect } = FormSelect;

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

class CatalogAutoMatch extends React.Component<Props> {

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;

    const typeOptions = [
      {
        title: 'USER_ACCOUNT',
        value: 'USER_ACCOUNT',
      },
      {
        title: 'EMAIL_HASH',
        value: 'EMAIL_HASH',
      },
    ];

    const tranformationFunctionOptions = [
      {
        title: 'NO_HASH',
        value: 'NO_HASH',
      },
      {
        title: 'SHA_256',
        value: 'SHA_256',
      },
      {
        title: 'MD5',
        value: 'MD5',
      },
      {
        title: 'MD2',
        value: 'MD2',
      },
      {
        title: 'SHA_1',
        value: 'SHA_1',
      },
      {
        title: 'SHA_384',
        value: 'SHA_384',
      },
      {
        title: 'SHA_512',
        value: 'SHA_512',
      },
    ];

    return (
      <div>
        <FormSelectField
          name="model.identifier_creation"
          component={DefaultSelect}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentAutoMatchType),
            required: true,
          }}
          options={typeOptions}
          helpToolTipProps={{
            title: formatMessage(messages.contentAutoMatchTooltip),
          }}
        />
        <FormInputField
            name="model.property_source"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.contentUserIdentifierLabel),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(
                messages.contentUserIdentifierPlaceholder,
              ),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentUserIdentifierTooltip),
            }}
          />
        <FormSelectField
          name="model.hash_function"
          component={DefaultSelect}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentAutoMatchType),
            required: true,
          }}
          options={tranformationFunctionOptions}
          helpToolTipProps={{
            title: formatMessage(messages.contentAutoMatchTooltip),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(
  CatalogAutoMatch,
);
