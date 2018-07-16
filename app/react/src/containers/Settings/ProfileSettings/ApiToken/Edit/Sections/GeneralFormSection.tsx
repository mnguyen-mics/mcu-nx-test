import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import {
  FormInput,
  FormSection,
  FormInputField,
} from '../../../../../../components/Form';

const messages = defineMessages({
  sectionSubtitleGeneral: {
    id: 'edit.apiToken.form.general.subtitle',
    defaultMessage: "Modify your Api Token's data.",
  },
  sectionTitleGeneral: {
    id: 'edit.apiToken.form.general.title',
    defaultMessage: 'General Informations',
  },
  labelApiTokenName: {
    id: 'edit.apiToken.form.general.label.name',
    defaultMessage: 'Name',
  },
  tootltipApiTokenName: {
    id: 'edit.apiToken.form.general.tooltip.name',
    defaultMessage: 'Give your Api Token a first name.',
  },
  advancedFormSectionButtontext: {
    id: 'edit.user.general.advanced.button',
    defaultMessage: 'Advanced',
  },
  //   tootltipTechnicalName: {
  //     id: 'edit.user.general.infos.tooltip.technical.name',
  //     defaultMessage: 'The technical Name is used for custom integrations.',
  //   },
});

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
          subtitle={messages.sectionSubtitleGeneral}
          title={messages.sectionTitleGeneral}
        />

        <div>
          <FormInputField
            name="name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelApiTokenName),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelApiTokenName),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipApiTokenName),
            }}
          />
        </div>

        {/* <div>
          <ButtonStyleless
            className="optional-section-title clickable-on-hover"
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type="settings" />
            <span className="step-title">
              {formatMessage(messages.advancedFormSectionButtontext)}
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
                label: formatMessage(messages.labelTechnicalName),
              }}
              inputProps={{
                placeholder: formatMessage(messages.labelTechnicalName),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.tootltipTechnicalName),
              }}
            />
          </div>
        </div> */}
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(
  GeneralFormSection,
);
