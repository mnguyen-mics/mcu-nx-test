import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../../List/messages';
import {
  FormInput,
  FormSection,
  FormInputField,
} from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
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

class CustomFormSection extends React.Component<Props> {
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
          name="credentials_uri"
          component={FormDataFile}
          validate={[isRequired]}
          disabled={!!datamartReplicationId}
          formItemProps={{
            label: formatMessage(
              messages.datamartReplicationCredentialsUriLabel,
            ),
            required: true,
          }}
          helpToolTipProps={{
            title: formatMessage(
              messages.datamartReplicationCredentialsUriTooltip,
            ),
          }}
          buttonText={formatMessage(
            messages.datamartReplicationCredentialsUriPlaceHolder,
          )}
          accept={`*`}
        />
        <FormInputField
          name="project_id"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.datamartReplicationProjectIdLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.datamartReplicationProjectIdPlaceHolder,
            ),
            disabled: !!datamartReplicationId
          }}
          helpToolTipProps={{
            title: formatMessage(messages.datamartReplicationProjectIdTooltip),
          }}
        />
        <FormInputField
          name="topic_id"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.datamartReplicationTopicIdLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.datamartReplicationTopicIdPlaceHolder,
            ),
            disabled: !!datamartReplicationId
          }}
          helpToolTipProps={{
            title: formatMessage(messages.datamartReplicationTopicIdTooltip),
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
)(CustomFormSection);
