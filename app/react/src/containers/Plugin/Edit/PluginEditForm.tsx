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
import { DrawableContentProps } from '../../../components/Drawer';
import { generateFakeId } from '../../../utils/FakeIdHelper';
import { PropertyResourceShape } from '../../../models/Plugins';
import { PluginFieldGenerator } from '../../Plugin';
import { Omit } from '../../../utils/Types';

import messages from './messages';

const { Content } = Layout;
const FORM_NAME = 'pluginForm';

interface PluginEditFormProps extends  Omit<ConfigProps<any>, 'form'> {
  // formValues: any;
  editionMode: boolean;
  organisationId: string;
  save: (pluginValue: any, propertiesValue: PropertyResourceShape[]) => void;
  pluginProperties: PropertyResourceShape[];
  isLoading: boolean;
  pluginVersionId: string;
  formId: string;
  initialValues: any;
}


type JoinedProps =
  PluginEditFormProps &
  InjectedFormProps &
  ValidatorProps &
  InjectedIntlProps & 
  DrawableContentProps;

interface PluginEditFormState {
  loading: boolean;
}

export interface FormModel {
  id?: string;
  plugin: {
    name: string;
  },
  properties: any;
} 

const fieldGridConfig = {
  labelCol: { span: 3 },
  wrapperCol: { span: 10, offset: 1 },
};

const PluginFieldGeneratorJS = PluginFieldGenerator as any;

class PluginEditForm extends React.Component<JoinedProps, PluginEditFormState> {

  static defaultProps: Partial<JoinedProps> = {
    editionMode: false,
  };

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  onSubmit = (formValues: FormModel) => {
    const {
      editionMode,
      save,
    } = this.props;
    if (editionMode === false) {
      formValues.id = formValues.id ? formValues.id : generateFakeId();
    }

    const pluginData = {
      ...formValues.plugin,
    };

    const formattedProperties = this.props.pluginProperties.filter(item => {
      return item.writable === true;
    }).map(item => {
      return {
        ...item,
        value: formValues.properties[item.technical_name] ? formValues.properties[item.technical_name].value : item.value,
      };
    });
    save(pluginData, formattedProperties);
  }

  pluginFieldGenerated = () => {
    const {
      isLoading,
      organisationId,
      pluginVersionId,
      pluginProperties,
    } = this.props;

    return pluginProperties.map((fieldDef: PropertyResourceShape) => {
      return (
        <PluginFieldGeneratorJS
          key={`${fieldDef.technical_name}`}
          definition={fieldDef}
          fieldGridConfig={fieldGridConfig}
          disabled={isLoading}
          pluginVersionId={pluginVersionId}
          organisationId={organisationId}
          openNextDrawer={this.props.openNextDrawer}
          closeNextDrawer={this.props.closeNextDrawer}
        />
      );
    });
  }

  render() {
    const {
      handleSubmit,
      formId,
      fieldValidators: { isRequired },
      intl: { formatMessage },
      isLoading,
    } = this.props;

    const InputField: FieldCtor<FormInputProps> = Field;
    const fieldProps: FormInputProps = {
      formItemProps: {
        label: formatMessage(messages.sectionGeneralName),
        required: true,
        ...fieldGridConfig,
      },
      inputProps: {
        placeholder: formatMessage(messages.sectionGeneralPlaceholder),
        disabled: isLoading,
      },
      helpToolTipProps: {
        title: formatMessage(messages.sectionGeneralHelper),
      },
    };
    return (
      <Layout>

        <Form
          className={this.state.loading ? 'hide-section' : 'edit-layout ant-layout'}
          onSubmit={handleSubmit(this.onSubmit)}
          id={formId}
        >
          <Content
            className="mcs-content-container mcs-form-container ad-group-form"
            // add ID?
          >
            <div id={'general'}>
              <Row type="flex" align="middle" justify="space-between" className="section-header">
                <FormTitle
                  title={messages.sectionGeneralTitle}
                />
              </Row>
              <Row>
                <InputField
                  name="plugin.name"
                  component={FormInput}
                  validate={[isRequired]}
                  {...fieldProps}
                />

              </Row>
            </div>
            <hr />
            <div id={'properties'}>
              <Row type="flex" align="middle" justify="space-between" className="section-header">
                <FormTitle
                  title={messages.sectionPropertiesTitle}
                />
              </Row>
              <Row>
                {this.pluginFieldGenerated()}
              </Row>
            </div>
          </Content>
        </Form>
      </Layout>
    );
  }
}

export default compose<JoinedProps, PluginEditFormProps & DrawableContentProps>(
  injectIntl,
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
  }),
  withValidators,
)(PluginEditForm);
