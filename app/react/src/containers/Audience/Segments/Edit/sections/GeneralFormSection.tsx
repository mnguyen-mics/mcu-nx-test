import * as React from 'react';
import {
  Form,
  reduxForm,
  ConfigProps,
  InjectedFormProps,
  Validator,
} from 'redux-form';
import { connect } from 'react-redux';

import { InjectedIntlProps } from 'react-intl';
import { withRouter } from 'react-router';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import { Omit } from '../../../../../utils/Types';
import ScrollspySider, {
  SidebarWrapperProps,
} from '../../../../../components/Layout/ScrollspySider';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import messages from '../messages';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../components/Form/withNormalizer';
import {
  AudienceSegmentFormData,
  SegmentTypeFormLoader
} from '../domain'
import {
  FeedType
} from "../../../../../models/audiencesegment/";
import * as FeatureSelectors from '../../../../../state/Features/selectors';

import {
  FormInput,
  FormSection,
  FormSelect,
  FormInputField,
  FormAddonSelectField,
} from '../../../../../components/Form';
import { Layout } from 'antd';
import { BasicProps } from 'antd/lib/layout/layout';

import { ButtonStyleless, McsIcon } from '../../../../../components';
import { PixelSection } from './pixel'
import { compose } from 'recompose';
import { Row } from 'antd/lib/grid';

const FORM_ID = 'audienceSegmentForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
  >;
const { AddonSelect } = FormSelect;

export interface AudienceSegmentFormProps extends Omit<ConfigProps<AudienceSegmentFormData>, 'form'> {
  close: () => void;
  onSubmit: (audienceSegmentFormData: AudienceSegmentFormData) => void;
  audienceSegmentFormData: AudienceSegmentFormData;
  datamartToken: string,
  segmentType: SegmentTypeFormLoader;
  feedType?: FeedType;
}

type Props = InjectedFormProps<AudienceSegmentFormProps> &
  AudienceSegmentFormProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps;

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
  }

  handleOnchangeTechnicalName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ technicalName: e.target.value });
  }

  technicalNameFieldValidate = () => {
    const {
      fieldValidators: { isRequired },
      segmentType,
    } = this.props;

    let validates: Validator[] = [];
    if (segmentType == 'USER_PIXEL') {
      validates.push(isRequired);
      return validates;
    }
    return validates;
  }

  getSegmentType = () => {
    const {
      segmentType,
    } = this.props;

    return segmentType;
  }


  getTechnicalNameField = () => {

    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
    } = this.props;

    return <FormInputField
      name="audienceSegment.technical_name"
      component={FormInput}
      validate={this.getSegmentType() == 'USER_PIXEL' ? isRequired : undefined}
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
      handleSubmit, close
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: [],
      message: messages.audienceSegmentSaveButton,
      onClose: close,
    };

    const sideBarProps: SidebarWrapperProps = {
      items: [
        {
          sectionId: '',
          title: messages.audienceSegmentSiderMenuSemgnetType
        },
        {
          sectionId: 'general',
          title: messages.audienceSegmentSectionGeneralTitle
        },
        {
          sectionId: 'properties',
          title: messages.audienceSegmentSiderMenuProperties
        },
      ],
      scrollId: FORM_ID
    };

    const loadSpecificComponenet = () => {

      const {
        segmentType,
        datamartToken
      } = this.props;

      switch (segmentType) {
        case 'USER_PIXEL':
          return <PixelSection
            datamartToken={datamartToken}
            userListTechName={this.state.technicalName}
          />;
        default:
          return null
      }
    };

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <ScrollspySider {...sideBarProps} />
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit as any}
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              <div>
                <FormSection
                  title={messages.audienceSegmentSectionGeneralTitle}
                  subtitle={messages.audienceSegmentSectionGeneralSubTitle}
                />
                <div id='general'>
                  <div>
                    <FormInputField
                      name="audienceSegment.name"
                      component={FormInput}
                      validate={[isRequired]}
                      formItemProps={{
                        label: formatMessage(messages.audienceSegmentCreationGeneralNameFieldTitle),
                        required: true,
                      }}
                      inputProps={{
                        placeholder: formatMessage(
                          messages.audienceSegmentCreationGeneralNameFieldPlaceHolder,
                        ),
                      }}
                      helpToolTipProps={{
                        title: formatMessage(messages.audienceSegmentCreationGeneralNameFieldHelper),
                      }}
                    />
                  </div>
                  {
                    this.getSegmentType() == 'USER_PIXEL' ? this.getTechnicalNameField() : null
                  }
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

                    <div className={!this.state.displayAdvancedSection ?
                      'hide-section' :
                      'optional-section-content'}
                    >
                      {
                        this.getSegmentType() != 'USER_PIXEL' ? this.getTechnicalNameField() : null
                      }
                      <div>
                        <div className="custom-lifetime">
                          <FormInputField
                            name="defaultLiftime"
                            component={FormInput}
                            validate={[isValidInteger, isNotZero]}
                            formItemProps={{
                              label: formatMessage(messages.contentSectionGeneralAdvancedPartRow2Label)
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
                                        { value: 'days', title: formatMessage(messages.contentSectionGeneralRow5OptionDAY) },
                                        { value: 'weeks', title: formatMessage(messages.contentSectionGeneralRow5OptionWEEK) },
                                        { value: 'months', title: formatMessage(messages.contentSectionGeneralRow5OptionMONTH) },
                                      ]}
                                    />
                                  </Row>
                                </div>
                              ),
                              placeholder: formatMessage(messages.contentSectionGeneralAdvancedPartRow2Placeholder),
                              style: { width: '100%' },

                            }}
                            helpToolTipProps={{
                              title: formatMessage(messages.contentSectionGeneralAdvancedPartRow2Tooltip),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <hr />
                <div id='properties'>
                  {loadSpecificComponenet()}
                </div>
              </div>
            </Content>
          </Form>
        </Layout>
      </Layout>

    )
  }
}

export default compose<Props, AudienceSegmentFormProps>(
  withRouter,
  withValidators,
  withNormalizer,
  reduxForm<AudienceSegmentFormProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect(state => ({
    hasFeature: FeatureSelectors.hasFeature(state),
  }))
)(GeneralFormSection);
