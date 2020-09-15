import * as React from 'react';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
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
  FormAlertInput,
  FormSection,
  AddonSelect,
  FormInputField,
  FormAlertInputField,
  FormAddonSelectField,
  FormBoolean,
  FormBooleanField,
  FormTextArea,
  FormTextAreaField,
} from '../../../../../components/Form';
import { McsIcon } from '../../../../../components';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { AudienceSegmentType } from '../../../../../models/audiencesegment';
import { Button } from '@mediarithmics-private/mcs-components-library';

const messagesMap = defineMessages({
  audienceSegmentFormSelectTypeOptionUserList: {
    id: 'audience.segment.section1.select.type.option.list',
    defaultMessage: 'User List',
  },
  audienceSegmentFormSelectTypeOptionUserPixel: {
    id: 'audience.segment.section1.select.type.option.pixel',
    defaultMessage: 'User Pixel',
  },
  audienceSegmentFormSelectTypeOptionUserQuery: {
    id: 'audience.segment.section1.select.type.option.query',
    defaultMessage: 'User Query',
  },
});

export interface GeneralFormSectionProps {
  segmentCreation: boolean;
  segmentType: AudienceSegmentType;
  datamart?: DatamartResource;
}

type Props = InjectedIntlProps &
  ValidatorProps &
  NormalizerProps &
  GeneralFormSectionProps;

interface State {
  technicalName?: string;
  displayAdvancedSection: boolean;
  neverExpire: boolean;
}

class GeneralFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
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
  };

  getTechnicalNameField = () => {
    const {
      intl: { formatMessage },
    } = this.props;

    return (
      <FormAlertInputField
        name="audienceSegment.technical_name"
        component={FormAlertInput}
        onChange={this.handleOnchangeTechnicalName}
        formItemProps={{
          label: formatMessage(
            messages.contentSectionGeneralAdvancedPartRow1Label,
          ),
        }}
        inputProps={{
          placeholder: formatMessage(
            messages.contentSectionGeneralAdvancedPartRow1Placeholder,
          ),
        }}
        helpToolTipProps={{
          title: formatMessage(
            messages.contentSectionGeneralAdvancedPartRow1Tooltip,
          ),
        }}
        iconType="warning"
        type="warning"
        message={formatMessage(messages.warningOnTokenEdition)}
      />
    );
  };

  getAudienceTypeOptions = () => {
    const {
      intl: { formatMessage },
      datamart,
    } = this.props;
    const typeOptions = [
      {
        value: 'USER_LIST',
        title: formatMessage(
          messagesMap.audienceSegmentFormSelectTypeOptionUserList,
        ),
      },
      {
        value: 'USER_QUERY',
        title: formatMessage(
          messagesMap.audienceSegmentFormSelectTypeOptionUserQuery,
        ),
      },
    ];
    if (datamart && datamart.storage_model_version === 'v201709') {
      typeOptions.push({
        value: 'USER_PIXEL',
        title: formatMessage(
          messagesMap.audienceSegmentFormSelectTypeOptionUserPixel,
        ),
      });
    }
    return typeOptions;
  };

  render() {
    const {
      fieldValidators: { isRequired, isNotZero, isValidInteger, isCharLengthLessThan },
      intl: { formatMessage },
      segmentType,
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
            <FormTextAreaField
              name="audienceSegment.short_description"
              component={FormTextArea}
              validate={[isCharLengthLessThan(255)]}
              formItemProps={{
                label: formatMessage(
                  messages.audienceSegmentCreationGeneralDescriptionFieldTitle,
                ),
              }}
              inputProps={{
                placeholder: formatMessage(
                  messages.audienceSegmentCreationGeneralDescriptionFieldPlaceHolder,
                ),
              }}
              helpToolTipProps={{
                title: formatMessage(
                  messages.audienceSegmentCreationGeneralDescriptionFieldHelper,
                ),
              }}
            />
          </div>
          <div>
            <Button
              className="optional-section-title"
              onClick={this.toggleAdvancedSection}
            >
              <McsIcon type="settings" />
              <span className="step-title">
                {formatMessage(messages.contentSectionGeneralAdvancedPartTitle)}
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
              {this.getTechnicalNameField()}
              <div>
                <div className="custom-lifetime">
                  <FormInputField
                    name="defaultLifetime"
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
                              name="defaultLifetimeUnit"
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

              {segmentType === 'USER_QUERY' ||
              segmentType === 'USER_LOOKALIKE' ? (
                <div>
                  <FormBooleanField
                    name="audienceSegment.persisted"
                    component={FormBoolean}
                    formItemProps={{
                      label: formatMessage(
                        messages.audienceSegmentCreationGeneralPersistedFieldTitle,
                      ),
                    }}
                    helpToolTipProps={{
                      title: formatMessage(
                        messages.audienceSegmentCreationGeneralPersistedFieldHelper,
                      ),
                    }}
                  />
                </div>
              ) : null}

              <div>
                <FormBooleanField
                    name="audienceSegment.paused"
                    component={FormBoolean}
                    formItemProps={{
                      label: formatMessage(
                          messages.audienceSegmentCreationGeneralPausedFieldTitle,
                      ),
                    }}
                    helpToolTipProps={{
                      title: formatMessage(
                          messages.audienceSegmentCreationGeneralPausedFieldHelper,
                      ),
                    }}
                />
              </div>
            </div>
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
