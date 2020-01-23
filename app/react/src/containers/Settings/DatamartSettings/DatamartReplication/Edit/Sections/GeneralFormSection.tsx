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
import { withRouter, RouteComponentProps } from 'react-router';
import { DatamartReplicationRouteMatchParam } from '../domain';

type Props = InjectedIntlProps &
  ValidatorProps &
  RouteComponentProps<DatamartReplicationRouteMatchParam> &
  NormalizerProps;

class GeneralFormSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false };
  }

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      match: {
        params: { datamartReplicationId },
      },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubTitle}
          title={messages.sectionGeneralTitle}
        />

        <FormInputField
          name="name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.datamartReplicationNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.datamartReplicationNamePlaceHolder,
            ),
            disabled: !!datamartReplicationId,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.datamartReplicationNameTooltip),
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
)(GeneralFormSection);
