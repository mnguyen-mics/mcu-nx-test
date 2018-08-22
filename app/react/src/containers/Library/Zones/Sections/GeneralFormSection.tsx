import * as React from 'react';
import {
  FormSection,
  FormInput,
  FormInputField,
} from '../../../../components/Form';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import withValidators, {
  ValidatorProps,
} from '../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../components/Form/withNormalizer';

import { ButtonStyleless, McsIcon } from '../../../../components';
import messages from '../messages';

export interface GeneralFormSectionProps {
}

type Props = GeneralFormSectionProps &
  InjectedIntlProps &
  NormalizerProps &
  ValidatorProps;

interface State {
  displayAdvancedSection: boolean;
}

class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      displayAdvancedSection: false,
    };
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  render() {
    const {
      intl: { formatMessage },
      fieldValidators: { isRequired },
    } = this.props;

    return (
      <div>
        <FormSection title={messages.title} subtitle={messages.title} />
        <div>
          <FormInputField
            name="name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelZoneName),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.placeholderZoneName),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tooltipZoneName),
            }}
          />
        </div>
        <div>
          <ButtonStyleless
            className="optional-section-title clickable-on-hover"
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type="settings" />
            <span className="step-title">
              {formatMessage(messages.advanced)}
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
              name="technical_name"
              component={FormInput}
              formItemProps={{
                label: formatMessage(messages.labeZoneTechnicalName),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.placeholderZoneTechnicalName,
                ),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.tooltipZoneTechnicalName),
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose<Props, GeneralFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
)(GeneralFormSection);
