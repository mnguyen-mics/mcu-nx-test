import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import messages from '../messages';
import { ButtonStyleless, McsIcon } from '../../../../components';
import {
  FormInput,
  FormSection,
  FormInputField,
} from '../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../components/Form/withNormalizer';

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
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubTitle}
          title={messages.sectionGeneralTitle}
        />

        <div>
          <FormInputField
            name="automation.name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.contentSectionGeneralLabel),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(
                messages.contentSectionGeneralPlaceholder,
              ),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralTooltip),
            }}
          />
        </div>

        <div>
          <ButtonStyleless
            className="optional-section-title"
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type="settings" />
            <span className="step-title">
              {formatMessage(messages.contentSectionGeneralAdvancedPartTitle)}
            </span>
            <McsIcon type="chevron" />
          </ButtonStyleless>

          <div
            className={
              !this.state.displayAdvancedSection
                ? 'hide-section'
                : 'optional-section-content'
            }
          >
            <FormInputField
              name="automation.technical_name"
              component={FormInput}
              formItemProps={{
                label: formatMessage(
                  messages.contentSectionGeneralAdvancedPartLabel,
                ),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.contentSectionGeneralAdvancedPartPlaceholder,
                ),
              }}
              helpToolTipProps={{
                title: formatMessage(
                  messages.contentSectionGeneralAdvancedPartTooltip,
                ),
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(
  injectIntl,
  withValidators,
  withNormalizer,
)(GeneralFormSection);
