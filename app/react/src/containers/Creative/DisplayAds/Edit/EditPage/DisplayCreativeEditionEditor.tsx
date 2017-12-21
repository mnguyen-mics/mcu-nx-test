import * as React from 'react';
import { Field, reduxForm, Form } from 'redux-form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Layout, Row, Modal } from 'antd';

import * as actions from '../../../../../state/Notifications/actions';
import { withMcsRouter } from '../../../../Helpers';
import { FormInput, FormTitle, withValidators, formErrorMessage, FieldCtor } from '../../../../../components/Form';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import AuditComponent from './AuditComponent';
import { PluginFieldGenerator } from '../../../../Plugin';
import { Card } from '../../../../../components/Card';
import modalMessages from '../../../../../common/messages/modalMessages';
import CreativeFormatEditor from '../CreativeFormatEditor';
import messages from '../messages';
import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';
import { PropertyResourceShape } from '../../../../../models/plugin';
import { FormInputProps } from '../../../../../components/Form/FormInput';

const { Content } = Layout;

const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 10, offset: 1 },
};

const configuration = {
  ADS_PREVIEW_URL: '//ads.mediarithmics.com/ads/render',
};

interface DisplayCreativeEditionEditorProps {
  handleSubmit?: () => void; // check type
  save: (
    creativeData: Partial<DisplayAdResource>,
    formattedProperties: PropertyResourceShape[],
  ) => void;
  creative: DisplayAdResource;
  rendererProperties: PropertyResourceShape[];
  formats: string[];
  refreshCreative: () => void;
  isLoading: boolean;
  organisationId: string;
  formId: string;
  submitFailed?: boolean;
  formValues?: any;
}

interface DisplayCreativeEditionEditorState {
  formats: string[];
  rendererProperties: PropertyResourceShape[];
  creative: Partial<DisplayAdResource>;
}

type JoinedProps = DisplayCreativeEditionEditorProps & ValidatorProps & InjectedIntlProps;

class DisplayCreativeEditionEditor extends React.Component<JoinedProps, DisplayCreativeEditionEditorState> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      formats: [],
      rendererProperties: [],
      creative: {
        name: '',
      },
    };
  }

  componentWillReceiveProps(nextProps: DisplayCreativeEditionEditorProps) {
    if (nextProps.submitFailed && (this.props.submitFailed !== nextProps.submitFailed)) {
      const {
        intl: {
          formatMessage,
        },
      } = this.props;
      formErrorMessage(formatMessage(messages.errorFormMessage));
    }
  }

  handleSaveDisplayCreative = () => {
    const { save, formValues } = this.props;

    const creativeData = {
      ...formValues.creative,
    };

    const formattedProperties = this.props.rendererProperties.filter((item: PropertyResourceShape) => {
      return item.writable === true;
    }).map((item: PropertyResourceShape) => {
      return {
        ...item,
        value: formValues.properties[item.technical_name] ? formValues.properties[item.technical_name].value : item.value,
      };
    });

    save(creativeData, formattedProperties);
  }

  formatDimension = (format: string) => {
    if (format) {
      return {
        width: parseInt(format.split('x')[0], 10),
        height: parseInt(format.split('x')[1], 10),
      };
    }
    return {
      width: '',
      height: '',
    };
  }

  renderIframeCreative = () => {
    const {
      creative,
      rendererProperties,
    } = this.props;

    let tagType = 'iframe';

    const foundTagType = rendererProperties.find((prop: PropertyResourceShape) => {
      return prop.technical_name === 'tag_type';
    });

    if (foundTagType) {
      switch (foundTagType.property_type) {
        case 'STRING':
          tagType = foundTagType!.value.value;
          break;
        case 'URL':
          tagType = foundTagType!.value.url;
          break;
      }
    }

    let previewUrl = `${configuration.ADS_PREVIEW_URL}?ctx=PREVIEW&rid=${creative.id}&caid=preview`;
    if (tagType === 'script') {
      previewUrl = `data:text/html;charset=utf-8,` +
      `${encodeURI(`<html><body style="margin-left: 0%; margin-right: 0%; margin-top: 0%; margin-bottom: 0%">` +
      `<script type="text/javascript" src="https:${configuration.ADS_PREVIEW_URL}?ctx=PREVIEW&rid=${creative.id}&caid=preview"></script>` +
      `</body></html>`)}`;
    }

    return previewUrl;
  }

  noUploadModal = () => {
    const {
      intl: {
        formatMessage,
      },
      creative,
    } = this.props;
    Modal.warning({
      title: formatMessage(modalMessages.noActionTitle),
      content: creative.audit_status === 'AUDIT_PASSED' ?
        formatMessage(modalMessages.noUploadMessage) :
        formatMessage(modalMessages.noUpdateMessage),
      iconType: 'exclamation-circle',
      okText: formatMessage(modalMessages.confirm),
    });
  }

  render() {
    const {
      intl: { formatMessage },
      handleSubmit,
      fieldValidators: { formatIsNotZero, isRequired },
      formats,
      creative,
      isLoading,
      organisationId,
      formId,
    } = this.props;

    const isDisabled = isLoading || creative.audit_status === 'AUDIT_PASSED' || creative.audit_status === 'AUDIT_PENDING';

    const InputField: FieldCtor<FormInputProps> = Field;
    const nameFieldProps: FormInputProps = {
      formItemProps: {
        label: formatMessage(messages.creativeCreationGeneralNameFieldTitle),
        required: true,
        ...fieldGridConfig,
      },
      inputProps: {
        placeholder: formatMessage(messages.creativeCreationGeneralNameFieldPlaceHolder),
        disabled: isDisabled,
      },
      helpToolTipProps: {
        title: formatMessage(messages.creativeCreationGeneralNameFieldHelper),
      },
    };
    const destinationDomainFieldProps: FormInputProps = {
      formItemProps: {
        label: formatMessage(messages.creativeCreationGeneralDomainFieldTitle),
        required: true,
        ...fieldGridConfig,
      },
      inputProps: {
        placeholder: formatMessage(messages.creativeCreationGeneralDomainFieldPlaceHolder),
        defaultValue: this.state.creative && this.state.creative.name,
        disabled: isDisabled,
      },
      helpToolTipProps: {
        title: formatMessage(messages.creativeCreationGeneralDomainFieldHelper),
      },
    };

    return (
      <Layout>
        <Form
          className="edit-layout ant-layout"
          onSubmit={handleSubmit(this.handleSaveDisplayCreative)}
          id={formId}
        >
          <Layout>
            <Content className="mcs-content-container mcs-form-container">
              <div id={'general_infos'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle
                    title={messages.creativeSectionGeneralTitle}
                    subtitle={messages.creativeSectionGeneralSubTitle}
                  />
                </Row>
                <Row>
                  <InputField
                    name="creative.name"
                    component={FormInput}
                    validate={[isRequired]}
                    {...nameFieldProps}
                  />
                  <Field
                    name="creative.format"
                    component={CreativeFormatEditor}
                    validate={[formatIsNotZero]}
                    formats={formats}
                    disabled={isDisabled}
                  />
                  <InputField
                    name="creative.destination_domain"
                    component={FormInput}
                    validate={[isRequired]}
                    {...destinationDomainFieldProps}
                  />
                </Row>
              </div>
              <hr />
              <div id={'audit_status'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle
                    title={messages.creativeSectionAuditTitle}
                    subtitle={messages.creativeSectionAuditSubTitle}
                  />
                </Row>
                <Row>
                  <Card>
                    <AuditComponent
                      creative={creative}
                      onAuditChange={this.props.refreshCreative}
                      mode="card"
                    />
                  </Card>
                </Row>
              </div>
              <hr />
              <div id={'properties'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle
                    title={messages.creativeSectionPropertyTitle}
                    subtitle={messages.creativeSectionPropertySubTitle}
                  />
                </Row>
                <Row>
                  {this.props.rendererProperties && this.props.rendererProperties.length && this.props.rendererProperties.map(fieldDef => {
                    return (
                      <PluginFieldGenerator
                        key={fieldDef.technical_name}
                        definition={fieldDef}
                        fieldGridConfig={fieldGridConfig}
                        disabled={isDisabled}
                        rendererVersionId={creative.renderer_version_id}
                        organisationId={organisationId}
                        noUploadModal={this.noUploadModal}
                        pluginVersionId={creative.renderer_version_id}
                      />
                    );
                  })}
                </Row>
              </div>
              <hr />
              <div id={'preview'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle
                    title={messages.creativeSectionPreviewTitle}
                    subtitle={messages.creativeSectionPreviewSubTitle}
                  />
                </Row>
                <Row>
                  <iframe
                    className="renderer"
                    src={this.renderIframeCreative()}
                    frameBorder="0"
                    scrolling="no"
                    width={this.formatDimension(this.props.creative.format).width}
                    height={this.formatDimension(this.props.creative.format).height}
                  />
                </Row>
              </div>
            </Content>
          </Layout>
        </Form>
      </Layout>
    );
  }
}

export default compose<JoinedProps, DisplayCreativeEditionEditor>(
  withMcsRouter,
  injectIntl,
  reduxForm({
    form: 'creativeEditionForm',
    enableReinitialize: true,
  }),
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
  withValidators,
)(DisplayCreativeEditionEditor);
