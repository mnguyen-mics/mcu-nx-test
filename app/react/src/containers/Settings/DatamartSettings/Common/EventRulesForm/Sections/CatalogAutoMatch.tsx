import * as React from 'react';
import { compose } from 'recompose';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import messages from '../messages';
import { DefaultSelect, FormSelectField } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';

type Props = WrappedComponentProps & ValidatorProps & NormalizerProps;

class CatalogAutoMatch extends React.Component<Props> {
  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;

    const optionsProps = [
      {
        title: 'PRODUCT',
        value: 'PRODUCT',
      },
      {
        title: 'PRODUCT_AND_CATEGORY',
        value: 'PRODUCT_AND_CATEGORY',
      },
      {
        title: 'CATEGORY',
        value: 'CATEGORY',
      },
    ];

    return (
      <div>
        <FormSelectField
          name='model.auto_match_type'
          component={DefaultSelect}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentAutoMatchType),
            required: true,
          }}
          options={optionsProps}
          helpToolTipProps={{
            title: formatMessage(messages.contentAutoMatchTooltip),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(CatalogAutoMatch);
