import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../../List/messages';
import { FormInput, FormSection, FormInputField } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import {
  FormDataFileField,
  FormDataFile,
} from '../../../../../Plugin/ConnectedFields/FormDataFile';
import { withRouter, RouteComponentProps } from 'react-router';
import { DatamartReplicationRouteMatchParam } from '../domain';

type Props = InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  RouteComponentProps<DatamartReplicationRouteMatchParam>;

class PubSubCustomFormSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false };
  }

  render() {
    const {
      fieldValidators: { isRequired },
      match: {
        params: { datamartReplicationId },
      },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionCustomSubtitle}
          title={messages.sectionCustomTitle}
        />

        <FormDataFileField
          name='credentials_uri'
          component={FormDataFile}
          validate={[isRequired]}
          disabled={!!datamartReplicationId}
          formItemProps={{
            label: formatMessage(messages.datamartReplicationPubSubCredentialsUriLabel),
            required: true,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.datamartReplicationPubSubCredentialsUriTooltip),
          }}
          buttonText={formatMessage(messages.datamartReplicationPubSubCredentialsUriPlaceHolder)}
          accept={`*`}
        />
        <FormInputField
          name='project_id'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.datamartReplicationPubSubProjectIdLabel),
            required: true,
          }}
          inputProps={{
            className: 'mcs-pubSubCustomFormSection_projectIdField',
            placeholder: formatMessage(messages.datamartReplicationPubSubProjectIdPlaceholder),
            disabled: !!datamartReplicationId,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.datamartReplicationPubSubProjectIdTooltip),
          }}
        />
        <FormInputField
          name='topic_id'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.datamartReplicationPubSubTopicIdLabel),
            required: true,
          }}
          inputProps={{
            className: 'mcs-pubSubCustomFormSection_topicIdField',
            placeholder: formatMessage(messages.datamartReplicationPubSubTopicIdPlaceHolder),
            disabled: !!datamartReplicationId,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.datamartReplicationPubSubTopicIdTooltip),
          }}
        />
      </div>
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  withValidators,
  withNormalizer,
)(PubSubCustomFormSection);
