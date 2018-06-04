import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import messages from '../messages';
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
import FormAlert from '../../../../../../components/Form/FormAlert';

type Props = InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  RouteComponentProps<{ siteId: string }>;

interface State {
  displayAdvancedSection: boolean;
  displayWarning: boolean;
}

class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { displayAdvancedSection: false, displayWarning: false };
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  warningOnTokenChange = () => {
    this.setState({
      displayWarning: true,
    });
  };

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      match: {
        params: { siteId },
      },
    } = this.props;

    const { displayWarning } = this.state;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubTitle}
          title={messages.sectionGeneralTitle}
        />

        <FormInputField
          name="site.name"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentSectionGeneralNameLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.contentSectionGeneralNamePlaceholder,
            ),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSectionGeneralNameTooltip),
          }}
        />

        {displayWarning &&
          siteId && (
            <div>
              <FormAlert
                iconType="warning"
                type="warning"
                message={formatMessage(messages.warningOnTokenEdition)}
              />
              <br />
            </div>
          )}

        <FormInputField
          name="site.token"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentSectionGeneralTokenLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.contentSectionGeneralTokenPlaceholder,
            ),
            onFocus: this.warningOnTokenChange,
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSectionGeneralTokenTooltip),
          }}
        />

        <FormInputField
          name="site.domain"
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentSectionGeneralDomainLabel),
            required: true,
          }}
          inputProps={{
            placeholder: formatMessage(
              messages.contentSectionGeneralDomainPlaceholder,
            ),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.contentSectionGeneralDomainTooltip),
          }}
        />
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withValidators,
  withNormalizer,
  withRouter,
)(GeneralFormSection);
