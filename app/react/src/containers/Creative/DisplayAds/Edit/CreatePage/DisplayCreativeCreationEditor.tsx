import * as React from 'react';
import { Field, reduxForm, Form, FormSubmitHandler } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Layout, Row } from 'antd';

import { withMcsRouter } from '../../../../Helpers';
import { FormInput, FormTitle, withValidators, formErrorMessage, FieldCtor } from '../../../../../components/Form';
import { PluginFieldGenerator } from '../../../../Plugin';
import CreativeFormatEditor from '../CreativeFormatEditor';
import { RendererDataProps, AdRendererProps } from '../../../../../models/campaign/display/AdResource';
import messages from '../messages';
import { ValidatorProps } from '../../../../../components/Form/withValidators';
import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';
import { PropertyResourceShape } from '../../../../../models/plugin';
import { FormInputProps } from '../../../../../components/Form/FormInput';

const { Content } = Layout;

const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 10, offset: 1 },
};

interface DisplayCreativeCreationEditorProps {
  handleSubmit?: (onSubmit: () => void) => FormSubmitHandler; // type better
  save: (
    creativeData: Partial<DisplayAdResource>,
    formattedProperties: PropertyResourceShape[],
    rendererData: RendererDataProps,
  ) => void;
  adRenderer: AdRendererProps;
  formats: string[];
  rendererProperties: PropertyResourceShape[];
  organisationId: string;
  formId: string;
  submitFailed?: boolean;
  isLoading: boolean;
  // blasts?: any[];
  // campaignName?: string;
  formValues?: any;
}

type JoinedProps = DisplayCreativeCreationEditorProps & ValidatorProps & InjectedIntlProps;

class DisplayCreativeCreationEditor extends React.Component<JoinedProps> {

  static defaultProps: Partial<JoinedProps> = {
    // blasts: [],
    // campaignName: '',
    submitFailed: false,
    isLoading: true,
  };

  componentWillReceiveProps(nextProps: DisplayCreativeCreationEditorProps) {
    if (nextProps.submitFailed && (this.props.submitFailed !== nextProps.submitFailed)) {
      const {
        intl: {
          formatMessage,
        },
      } = this.props;
      formErrorMessage(formatMessage(messages.errorFormMessage));
    }
  }

  onSubmit = (formValues: any) => {
    const { save } = this.props;

    const formattedProperties = this.props.rendererProperties
      .filter((item: PropertyResourceShape) => item.writable === true)
      .map(item => ({
        ...item,
        value: (formValues.properties[item.technical_name]
          ? formValues.properties[item.technical_name].value
          : item.value
        ),
      }));

    const creativeData = {
      ...formValues.creative,
      ...formValues.creative,
    };

    const rendererData = {
      renderer_artifact_id: this.props.adRenderer.artifact_id,
      renderer_group_id: this.props.adRenderer.group_id,
    };
    save(creativeData, formattedProperties, rendererData);
  }

  render() {
    const {
      intl: { formatMessage },
      handleSubmit,
      isLoading,
      adRenderer: {
        version_id,
      },
      formats,
      organisationId,
      fieldValidators: { isRequired, formatIsNotZero },
    } = this.props;

    const pluginFieldGenerated = this.props.rendererProperties.map(fieldDef => {
      return (
        <PluginFieldGenerator
          key={`${fieldDef.technical_name}`}
          definition={fieldDef}
          fieldGridConfig={fieldGridConfig}
          rendererVersionId={version_id}
          organisationId={organisationId}
        />
      );
    });

    const InputField: FieldCtor<FormInputProps> = Field;
    const nameFieldProps: FormInputProps = {
      formItemProps: {
        label: formatMessage(messages.creativeCreationGeneralNameFieldTitle),
        required: true,
        ...fieldGridConfig,
      },
      inputProps: {
        placeholder: formatMessage(messages.creativeCreationGeneralNameFieldPlaceHolder),
        disabled: isLoading,
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
        disabled: isLoading,
      },
      helpToolTipProps: {
        title: formatMessage(messages.creativeCreationGeneralDomainFieldHelper),
      },
    };

    return (
      <Layout>
        <Form
          id="creativeEditor"
          className="edit-layout ant-layout"
          onSubmit={handleSubmit(this.onSubmit)}
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
              <div id={'properties'}>
                <Row type="flex" align="middle" justify="space-between" className="section-header">
                  <FormTitle
                    title={messages.creativeSectionPropertyTitle}
                    subtitle={messages.creativeSectionPropertySubTitle}
                  />
                </Row>
                <Row>
                  {pluginFieldGenerated}
                </Row>
              </div>
            </Content>
          </Layout>
        </Form>
      </Layout>
    );
  }
}

export default compose<JoinedProps, DisplayCreativeCreationEditorProps>(
  injectIntl,
  withMcsRouter,
  reduxForm({
    form: 'creativeEditor',
    enableReinitialize: true,
  }),
  withValidators,
)(DisplayCreativeCreationEditor);
