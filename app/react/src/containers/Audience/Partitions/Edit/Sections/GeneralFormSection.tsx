import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import queryString from 'query-string';

import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormSelectField,
} from '../../../../../components/Form';
import DefaultSelect from '../../../../../components/Form/FormSelect/DefaultSelect';
import { RouteComponentProps, withRouter } from 'react-router';

const messages = defineMessages({
  sectionSubtitleGeneral: {
    id: 'edit.partition.form.general.subtitle',
    defaultMessage: 'This is the subtitle part.',
  },
  sectionTitleGeneral: {
    id: 'edit.partition.form.general.title',
    defaultMessage: 'General Informations',
  },
  labelPartitionName: {
    id: 'edit.partition.general.infos.label.name',
    defaultMessage: 'Partition Name',
  },
  labelPartitionType: {
    id: 'edit.partition.general.infos.label.type',
    defaultMessage: 'Type',
  },
  labelPartCount: {
    id: 'edit.partition.general.infos.label.partCount',
    defaultMessage: 'Part Count',
  },
  labelClusteringModel: {
    id: 'edit.partition.general.infos.label.clusteringModel',
    defaultMessage: 'Clustering Model',
  },
  tootltipPartitionName: {
    id: 'edit.partition.general.infos.tooltip.name',
    defaultMessage: 'Lorem Ipsum',
  },
});

type Props = InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  RouteComponentProps<{ organisationId: string; partitionId: string }>;

interface State {}

class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      location: { search },
    } = this.props;

    const query = queryString.parse(search);

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitleGeneral}
          title={messages.sectionTitleGeneral}
        />

        <FormInputField
          name="name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.labelPartitionName),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.labelPartitionName),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.tootltipPartitionName),
          }}
        />
        <FormSelectField
          name="audience_partition_type"
          component={DefaultSelect}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.labelPartitionType),
            required: true,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.tootltipPartitionName),
          }}
          options={[
            {
              title: query.type,
              value: query.type,
            },
          ]}
          disabled={true}
        />
        <FormInputField
          name="part_count"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.labelPartCount),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.labelPartCount),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.tootltipPartitionName),
          }}
        />
        {query.type === 'CLUSTERING' && (
          <FormInputField
            name="clustering_model_data_file_uri"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelClusteringModel),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelClusteringModel),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipPartitionName),
            }}
          />
        )}
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer, withRouter)(
  GeneralFormSection,
);
