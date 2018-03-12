import * as React from 'react';
import {
  Form,
  reduxForm,
  InjectedFormProps,
  Field,
  ConfigProps,
} from 'redux-form';
import { compose } from 'recompose';
import { Layout, Row } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { FormTitle, withValidators, FieldCtor } from '../../../components/Form';
import { ValidatorProps } from '../../../components/Form/withValidators';
import FormInput, { FormInputProps } from '../../../components/Form/FormInput';
import { generateFakeId } from '../../../utils/FakeIdHelper';
import { PluginProperty } from '../../../models/Plugins';
import { PluginFieldGenerator } from '../../Plugin';
import { Omit } from '../../../utils/Types';

import messages from './messages';
import { InjectedDrawerProps } from '../../../components/Drawer/injectDrawer';
import { injectDrawer } from '../../../components/Drawer/index';
import { ButtonStyleless, McsIcon } from '../../../components'
import { PluginLayout, PluginLayoutSectionResource, PluginLayoutFieldResource } from '../../../models/plugin/PluginLayout';
import { withRouter, RouteComponentProps } from 'react-router';
import { BasicProps } from 'antd/lib/layout/layout';

const FORM_NAME = 'pluginForm';

const Content = Layout.Content as React.ComponentClass<
  BasicProps & { id: string }
  >;
interface PluginEditFormProps extends Omit<ConfigProps<any>, 'form'> {
  // formValues: any;
  editionMode: boolean;
  organisationId: string;
  save: (pluginValue: any, propertiesValue: PluginProperty[]) => void;
  pluginProperties: PluginProperty[];
  disableFields: boolean;
  pluginLayout?: PluginLayout;
  isLoading: boolean;
  pluginVersionId: string;
  formId: string;
  initialValues: any;
  showGeneralInformation: boolean;
  showTechnicalName?: boolean;
}

type JoinedProps = PluginEditFormProps &
  InjectedFormProps &
  ValidatorProps &
  InjectedIntlProps &
  InjectedDrawerProps &
  RouteComponentProps<{ organisationId: string }>;

interface PluginEditFormState {
  loading: boolean;
  displayAdvancedSection: boolean;
}

export interface FormModel {
  id?: string;
  plugin: {
    name: string;
  };
  properties: any;
}

class PluginEditForm extends React.Component<JoinedProps, PluginEditFormState> {
  static defaultProps: Partial<JoinedProps> = {
    editionMode: false,
  };

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      loading: false,
      displayAdvancedSection: false
    };
  }

  toggleAdvancedSection = () => {
    this.setState({
      displayAdvancedSection: !this.state.displayAdvancedSection,
    });
  };

  onSubmit = (formValues: FormModel) => {
    const { editionMode, save } = this.props;
    if (editionMode === false) {
      formValues.id = formValues.id ? formValues.id : generateFakeId();
    }

    const pluginData = {
      ...formValues.plugin,
    };

    const formattedProperties = this.props.pluginProperties
      .filter(item => {
        return item.writable === true;
      })
      .map(item => {
        return {
          ...item,
          value: formValues.properties[item.technical_name]
            ? formValues.properties[item.technical_name].value
            : item.value,
        };
      });
    save(pluginData, formattedProperties);
  };

  pluginFieldGenerated = () => {
    const {
      disableFields,
      organisationId,
      pluginVersionId,
      pluginProperties,
    } = this.props;

    return pluginProperties.map((fieldDef: PluginProperty) => {
      return (
        <PluginFieldGenerator
          key={`${fieldDef.technical_name}`}
          definition={fieldDef}
          disabled={disableFields}
          pluginVersionId={pluginVersionId}
          organisationId={organisationId}
        />
      );
    });
  };

  renderTechnicalName = () => {
    const {
      intl
    } = this.props;
    const InputField: FieldCtor<FormInputProps> = Field;
    return (
      <div>
        <ButtonStyleless
          className="optional-section-title"
          onClick={this.toggleAdvancedSection}
        >
          <McsIcon type="settings" />
          <span className="step-title">
            {intl.formatMessage(messages.advanced)}
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
          <InputField
            name="plugin.technical_name"
            component={FormInput}
            formItemProps={{
              label: intl.formatMessage(
                messages.sectionTechnicalName,
              ),
            }}
            inputProps={{
              placeholder: intl.formatMessage(
                messages.sectionTechnicalPlaceholder,
              ),
            }}
            helpToolTipProps={{
              title: intl.formatMessage(
                messages.sectionTechnicalHelper,
              ),
            }}
          />
        </div>
      </div>)
  }

  generateFormField = (field: PluginLayoutFieldResource) => {
    const {
      organisationId,
      pluginVersionId,
      pluginProperties,
    } = this.props;

    const currentPluginProperty = pluginProperties.find(prop => prop.technical_name === field.property_technical_name);

    if (currentPluginProperty !== undefined) {
      return (
        <Row>
          <PluginFieldGenerator
            definition={currentPluginProperty}
            pluginLayoutFieldDefinition={field}
            organisationId={organisationId}
            pluginVersionId={pluginVersionId}
          />
        </Row>
      );
    }
    else {
      return null;
    }
  }

  generateFormSection = (section: PluginLayoutSectionResource) => {
    const returnedFields = section.fields.map(this.generateFormField)

    return (
      <div id={section.title}>
        <hr />
        <Row type="flex" align="middle" justify="space-between" className="section-header">
          <FormTitle
            title={{ id: `section.${section.title}.title`, defaultMessage: section.title }}
            subtitle={{ id: `section.${section.sub_title}.subTitle`, defaultMessage: section.sub_title }}
          />
        </Row>
        {returnedFields}
      </div>
    );
  }

  generateFormFromPluginLayout = () => {
    const {
      pluginLayout,
    } = this.props;

    if (pluginLayout !== undefined) {

      return pluginLayout.sections.map(this.generateFormSection);
    }
    else return null;
  };

  render() {
    const {
      handleSubmit,
      formId,
      fieldValidators: { isRequired },
      intl: { formatMessage },
      disableFields,
      showTechnicalName,
      isLoading,
      showGeneralInformation,
      pluginLayout
    } = this.props;

    const InputField: FieldCtor<FormInputProps> = Field;
    const fieldProps: FormInputProps = {
      formItemProps: {
        label: formatMessage(messages.sectionGeneralName),
        required: true,
      },
      inputProps: {
        placeholder: formatMessage(messages.sectionGeneralPlaceholder),
        disabled: disableFields,
      },
      helpToolTipProps: {
        title: formatMessage(messages.sectionGeneralHelper),
      },
    };

    if (pluginLayout === undefined) {
      return (
        <Layout>
          <Form
            className={
              this.state.loading ? 'hide-section' : 'edit-layout ant-layout'
            }
            onSubmit={handleSubmit(this.onSubmit)}
            id={formId}
          >
            <Content
              className="mcs-content-container mcs-form-container ad-group-form" id={formId}
            >
              {showGeneralInformation ? <div><div id={'general'}>
                <Row
                  type="flex"
                  align="middle"
                  justify="space-between"
                  className="section-header"
                >
                  <FormTitle title={messages.sectionGeneralTitle} />
                </Row>
                <Row>
                  <InputField
                    name="plugin.name"
                    component={FormInput}
                    validate={[isRequired]}
                    {...fieldProps}
                  />
                  {
                    showTechnicalName ? this.renderTechnicalName() : null
                  }
                </Row>
              </div>
                <hr /></div> : null}
              <div id={'properties'}>
                <Row
                  type="flex"
                  align="middle"
                  justify="space-between"
                  className="section-header"
                >
                  <FormTitle title={messages.sectionPropertiesTitle} />
                </Row>
                <Row>{this.pluginFieldGenerated()}</Row>
              </div>
            </Content>
          </Form>
        </Layout>
      );
    }
    else {

      return (
        <Layout>
          <Form
            className={
              this.state.loading ? 'hide-section' : 'edit-layout ant-layout'
            }
            onSubmit={handleSubmit(this.onSubmit)}
          >
            <Content className="mcs-content-container mcs-form-container ad-group-form" id={formId}>
              {showGeneralInformation ? <div><div id={'general'}>
                <Row
                  type="flex"
                  align="middle"
                  justify="space-between"
                  className="section-header"
                >
                  <FormTitle title={messages.sectionGeneralTitle} />
                </Row>
                <Row>
                  <InputField
                    name="plugin.name"
                    component={FormInput}
                    validate={[isRequired]}
                    {...fieldProps}
                  />
                </Row>
              </div></div> : null}
              {this.generateFormFromPluginLayout()}
            </Content>
          </Form>
        </Layout>

      )

    }
  }
}

export default compose<JoinedProps, PluginEditFormProps>(
  injectIntl,
  withRouter,
  injectDrawer,
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
  }),
  withValidators,
)(PluginEditForm);
