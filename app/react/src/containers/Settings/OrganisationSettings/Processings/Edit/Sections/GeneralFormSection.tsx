import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import { compose } from 'recompose';
import {
  FormSection,
  FormInputField,
  FormInput,
  FormTextAreaField,
  FormTextArea,
  FormAlertInputField,
  FormAlertInput,
} from '../../../../../../components/Form';
import messages from '../../messages';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { EditProcessingRouteMatchParams } from '../ProcessingEditPage';
import { RouteComponentProps, withRouter } from 'react-router';

type Props = InjectedIntlProps &
  ValidatorProps &
  RouteComponentProps<EditProcessingRouteMatchParams>;

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
      match: {
        params: { processingId },
      },
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;
    const { displayAdvancedSection } = this.state;

    const tokenField = processingId ? (
      <FormAlertInputField
        name='token'
        component={FormAlertInput}
        formItemProps={{
          label: formatMessage(messages.generalSectionTokenLabel),
          required: true,
        }}
        inputProps={{
          placeholder: formatMessage(messages.generalSectionTokenPlaceholder),
          disabled: true,
        }}
        helpToolTipProps={{
          title: formatMessage(messages.generalSectionTokenTooltip),
        }}
        iconType='warning'
        type='warning'
        message={formatMessage(messages.warningOnTokenEdition)}
      />
    ) : undefined;

    return (
      <div>
        <FormSection
          title={messages.generalSectionTitle}
          subtitle={messages.generalSectionSubTitle}
        />
        <FormInputField
          name='name'
          component={FormInput}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.generalSectionNameLabel),
            required: true,
          }}
          inputProps={{
            className: 'mcs-processingActivities_nameField',
            placeholder: formatMessage(messages.generalSectionNamePlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.generalSectionNameTooltip),
          }}
        />
        <FormTextAreaField
          name='purpose'
          component={FormTextArea}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.generalSectionPurposeLabel),
            required: true,
          }}
          inputProps={{
            className: 'mcs-processingActivities_purposeField',
            placeholder: formatMessage(messages.generalSectionPurposePlaceholder),
          }}
          helpToolTipProps={{
            title: formatMessage(messages.generalSectionPurposeTooltip),
          }}
        />
        <div>
          <Button
            className='optional-section-title  clickable-on-hover'
            onClick={this.toggleAdvancedSection}
          >
            <McsIcon type='settings' />
            <span className='step-title'>
              {formatMessage(messages.generalSectionAdvancedPartTitle)}
            </span>
            <McsIcon type='chevron' />
          </Button>
          <div className={displayAdvancedSection ? 'optional-section-content' : 'hide-section'}>
            <FormInputField
              name='technical_name'
              component={FormInput}
              formItemProps={{
                label: formatMessage(messages.generalSectionTechnicalNameLabel),
              }}
              inputProps={{
                className: 'mcs-processingActivities_technicalNameField',
                placeholder: formatMessage(messages.generalSectionTechnicalNamePlaceholder),
              }}
              helpToolTipProps={{
                title: formatMessage(messages.generalSectionTechnicalNameTooltip),
              }}
            />
            {tokenField}
          </div>
        </div>
      </div>
    );
  }
}

export default compose<Props, {}>(withRouter, injectIntl, withValidators)(GeneralFormSection);
