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
    id: 'edit.user.form.general.subtitle',
    defaultMessage: 'Modify your User\'s data.',
  },
  sectionTitleGeneral: {
    id: 'edit.user.form.general.title',
    defaultMessage: 'General Informations',
  },
  labelUserFirstName: {
    id: 'edit.user.form.general.label.firstname',
    defaultMessage: 'First Name',
  },
  labelUserLastName: {
    id: 'edit.user.form.general.label.lastname',
    defaultMessage: 'Last Name',
  },
  tootltipUserFirstName: {
    id: 'edit.user.form.general.tooltip.firstname',
    defaultMessage: 'Give your User a first name.',
  },
  tootltipUserLastName: {
    id: 'edit.user.form.general.tooltip.lastname',
    defaultMessage: 'Give your User a last name.',
  },
  labelUserEmail: {
    id: 'edit.user.form.general.label.email',
    defaultMessage: 'Email',
  },
  tootltipUserEmail: {
    id: 'edit.user.form.general.tooltip.email',
    defaultMessage: 'Give your User an email',
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
            name="first_name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelUserFirstName),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelUserFirstName),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipUserFirstName),
            }}
          />
          <FormInputField
            name="last_name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelUserLastName),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelUserLastName),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipUserLastName),
            }}
          />
          <FormInputField
            name="email"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelUserEmail),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelUserEmail),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipUserEmail),
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
