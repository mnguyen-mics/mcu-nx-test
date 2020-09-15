import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { Button } from '@mediarithmics-private/mcs-components-library';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import {
  FormInput,
  FormSection,
  FormInputField,
} from '../../../../../components/Form';
import { McsIcon } from '../../../../../components';

const messages = defineMessages({
  sectionSubtitleGeneral: {
    id: 'edit.placement.list.form.general.subtitle',
    defaultMessage: 'Give your Placement List a name.',
  },
  sectionTitleGeneral: {
    id: 'edit.placement.list.form.general.title',
    defaultMessage: 'General Informations',
  },
  labelPlacementListName: {
    id: 'edit.placement.list.general.infos.label.name',
    defaultMessage: 'Placement List Name',
  },
  tootltipPlacementListName: {
    id: 'edit.placement.list.general.infos.tooltip.name',
    defaultMessage: 'Give your Placement List a Name so you can find it back in the different screens.',
  },
  tootltipTechnicalName: {
    id: 'edit.placement.list.general.infos.tooltip.technical.name',
    defaultMessage: 'The technical Name is used for custom integrations.',
  },
  advancedFormSectionButtontext: {
    id: 'edit.placement.list.general.infos.advanced.button',
    defaultMessage: 'Advanced',
  },
  labelTechnicalName: {
    id: 'edit.placement.list.general.infos.label.technicalname',
    defaultMessage: 'Technical Name',
  },
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
              label: formatMessage(messages.labelPlacementListName),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.labelPlacementListName),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipPlacementListName),
            }}
          />
        </div>

        <div>
          <Button
            className="optional-section-title clickable-on-hover"
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type="settings" />
            <span className="step-title">
              {formatMessage(messages.advancedFormSectionButtontext)}
            </span>
            <McsIcon type="chevron" />
          </Button>

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
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(
  GeneralFormSection,
);
