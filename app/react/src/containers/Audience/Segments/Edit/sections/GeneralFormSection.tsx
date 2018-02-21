import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';

import { compose } from 'recompose';
import { Row } from 'antd/lib/grid';

import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import messages from '../messages';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import {
  FormInput,
  FormSection,
  FormSelect,
  FormInputField,
  FormAddonSelectField,
} from '../../../../../components/Form';

import { ButtonStyleless, McsIcon } from '../../../../../components';const { AddonSelect } = FormSelect;

type Props = InjectedIntlProps & ValidatorProps & NormalizerProps;

interface State {
  technicalName?: string
  displayAdvancedSection: boolean,
  neverExpire: boolean,
}

class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      technicalName: '',
      displayAdvancedSection: false,
      neverExpire: false,
    };
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  handleOnchangeTechnicalName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ technicalName: e.target.value });
  }

  getTechnicalNameField = () => {

    const {
      intl: { formatMessage },
    } = this.props;

    return <FormInputField
      name="audienceSegment.technical_name"
      component={FormInput}
      onChange={this.handleOnchangeTechnicalName}
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

  }

  render() {
    const {
      fieldValidators: { isRequired, isNotZero, isValidInteger },
      intl: { formatMessage },
    } = this.props;

    return (
      <div>
        <FormSection
          title={messages.audienceSegmentSectionGeneralTitle}
          subtitle={messages.audienceSegmentSectionGeneralSubTitle}
        />
        <div id="general">
          <div>
            <FormInputField
              name="audienceSegment.name"
              component={FormInput}
              validate={[isRequired]}
              formItemProps={{
                label: formatMessage(
                  messages.audienceSegmentCreationGeneralNameFieldTitle,
                ),
                required: true,
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.audienceSegmentCreationGeneralNameFieldPlaceHolder,
                ),
              }}
              helpToolTipProps={{
                title: formatMessage(
                  messages.audienceSegmentCreationGeneralNameFieldHelper,
                ),
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
              {this.getTechnicalNameField()}
              <div>
                <div className="custom-lifetime">
                  <FormInputField
                    name="defaultLiftime"
                    component={FormInput}
                    validate={[isValidInteger, isNotZero]}
                    formItemProps={{
                      label: formatMessage(
                        messages.contentSectionGeneralAdvancedPartRow2Label,
                      ),
                    }}
                    inputProps={{
                      disabled: this.state.neverExpire,
                      addonAfter: (
                        <div>
                          <Row>
                            <FormAddonSelectField
                              name="defaultLiftimeUnit"
                              component={AddonSelect}
                              disabled={this.state.neverExpire}
                              options={[
                                {
                                  value: 'days',
                                  title: formatMessage(
                                    messages.contentSectionGeneralRow5OptionDAY,
                                  ),
                                },
                                {
                                  value: 'weeks',
                                  title: formatMessage(
                                    messages.contentSectionGeneralRow5OptionWEEK,
                                  ),
                                },
                                {
                                  value: 'months',
                                  title: formatMessage(
                                    messages.contentSectionGeneralRow5OptionMONTH,
                                  ),
                                },
                              ]}
                            />
                          </Row>
                        </div>
                      ),
                      placeholder: formatMessage(
                        messages.contentSectionGeneralAdvancedPartRow2Placeholder,
                      ),
                      style: { width: '100%' },
                    }}
                    helpToolTipProps={{
                      title: formatMessage(
                        messages.contentSectionGeneralAdvancedPartRow2Tooltip,
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default compose(injectIntl, withValidators, withNormalizer)(
  GeneralFormSection,
);
