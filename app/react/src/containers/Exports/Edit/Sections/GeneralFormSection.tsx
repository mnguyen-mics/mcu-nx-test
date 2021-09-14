import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';

import withValidators, { ValidatorProps } from '../../../../components/Form/withValidators';
import withNormalizer, { NormalizerProps } from '../../../../components/Form/withNormalizer';
import { FormInput, FormSection, FormInputField } from '../../../../components/Form';

const messages = defineMessages({
  sectionTitleGeneral: {
    id: 'exports.edit.generalInfoSection.title',
    defaultMessage: 'General Information',
  },
  sectionSubTitleGeneral: {
    id: 'exports.edit.generalInfoSection.subtitle',
    defaultMessage: 'Give your Export a name',
  },
  labelExportName: {
    id: 'exports.edit.generalInfoSection.label.name',
    defaultMessage: 'Export Name',
  },
  tootltipExportName: {
    id: 'exports.edit.generalInfoSection.tooltip.name',
    defaultMessage: 'Give your Export a Name so you can find it back in the different screens.',
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
          title={messages.sectionTitleGeneral}
          subtitle={messages.sectionSubTitleGeneral}
        />

        <div>
          <FormInputField
            name='export.name'
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.labelExportName),
              required: true,
            }}
            inputProps={{
              className: 'mcs-exports_exportName',
              placeholder: formatMessage(messages.labelExportName),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.tootltipExportName),
            }}
          />
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(GeneralFormSection);
