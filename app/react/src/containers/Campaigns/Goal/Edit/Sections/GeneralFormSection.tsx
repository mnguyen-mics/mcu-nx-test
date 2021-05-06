import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { FormSection, FormInputField } from '../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../components/Form/withValidators';
import FormInput from '../../../../../components/Form/FormInput';
import messages from '../messages';

interface State {
  displayAdvancedSection: boolean;
}

type Props = InjectedIntlProps & ValidatorProps;

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
        <FormSection subtitle={messages.sectionSubtitle1} title={messages.sectionTitle1} />

        <div>
          <FormInputField
            name='goal.name'
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.contentSectionGeneralRow1Label),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(messages.contentSectionGeneralRow1Placeholder),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentSectionGeneralRow1Tooltip),
            }}
          />
        </div>

        <div>
          <Button className='optional-section-title' onClick={this.toggleAdvancedSection}>
            <McsIcon type='settings' />
            <span className='step-title'>
              {formatMessage(messages.contentSectionGeneralAdvancedPartTitle)}
            </span>
            <McsIcon type='chevron' />
          </Button>

          <div
            className={
              !this.state.displayAdvancedSection ? 'hide-section' : 'optional-section-content'
            }
          >
            <FormInputField
              name='goal.technical_name'
              component={FormInput}
              formItemProps={{
                label: formatMessage(messages.contentSectionGeneralAdvancedPartRow1Label),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.contentSectionGeneralAdvancedPartRow1Placeholder,
                ),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.contentSectionGeneralAdvancedPartRow1Tooltip),
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators)(GeneralFormSection);
