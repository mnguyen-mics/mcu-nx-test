import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../../List/messages';
import { FormInput, FormSection, FormInputField } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import { FormDataFileField, FormDataFile } from '@mediarithmics-private/advanced-components';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { DatamartReplicationRouteMatchParam } from '../domain';

type Props = InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  RouteComponentProps<DatamartReplicationRouteMatchParam>;

class EventHubsCustomFormSection extends React.Component<Props> {
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
            label: formatMessage(messages.datamartReplicationEventHubsConnectionStringUriLabel),
            required: true,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.datamartReplicationEventHubsConnectionStringUriTooltip),
          }}
          buttonText={formatMessage(
            messages.datamartReplicationEventHubsConnectionStringUriPlaceHolder,
          )}
          accept={`*`}
        />
        <FormInputField
          name='event_hub_name'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.datamartReplicationEventHubNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.datamartReplicationEventHubNamePlaceholder),
            disabled: !!datamartReplicationId,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.datamartReplicationEventHubNameTooltip),
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
)(EventHubsCustomFormSection);
