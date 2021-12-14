import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../messages';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormAlertInputField,
} from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import FormAlertInput from '../../../../../../components/Form/FormAlertInput';

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

interface State {
  displayAdvancedSection: boolean;
}

class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false };
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  render() {
    const {
      fieldValidators: { isRequired, isValidDomain },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubTitle}
          title={messages.sectionGeneralTitle}
        />

        <FormInputField
          name='site.name'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentSectionGeneralNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentSectionGeneralNamePlaceholder),
            className: 'mcs-generalFormSection_site_name',
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSectionGeneralNameTooltip),
          }}
        />

        <FormAlertInputField
          name='site.token'
          component={FormAlertInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentSectionGeneralTokenLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentSectionGeneralTokenPlaceholder),
            className: 'mcs-generalFormSection_site_token',
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSectionGeneralTokenTooltip),
          }}
          iconType='warning'
          type='warning'
          message={formatMessage(messages.warningOnTokenEdition)}
        />

        <FormInputField
          name='site.domain'
          component={FormInput}
          validate={[isRequired, isValidDomain]}
          formItemProps={{
            label: formatMessage(messages.contentSectionGeneralDomainLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(messages.contentSectionGeneralDomainPlaceholder),
            className: 'mcs-generalFormSection_site_domain',
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSectionGeneralDomainTooltip),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(GeneralFormSection);
