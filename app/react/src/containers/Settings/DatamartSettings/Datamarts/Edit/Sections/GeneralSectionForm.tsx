import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../messages';
import { RouteComponentProps, withRouter } from 'react-router';
import {
  FormInput,
  FormSection,
  FormInputField,
  FormAlert,
} from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';

type Props = InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  RouteComponentProps<{ datamartId: string }>;

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
        params: { datamartId },
      },
    } = this.props;

    const { displayWarning } = this.state;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubTitle}
          title={messages.sectionGeneralTitle}
        />

        {displayWarning &&
          datamartId && (
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
          name="datamart.token"
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
