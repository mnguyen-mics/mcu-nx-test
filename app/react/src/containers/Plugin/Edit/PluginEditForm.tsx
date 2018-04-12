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
import { InjectDrawerProps } from '../../../components/Drawer/injectDrawer';
import { injectDrawer } from '../../../components/Drawer/index';
import { ButtonStyleless, McsIcon } from '../../../components';

const { Content } = Layout;
const FORM_NAME = 'pluginForm';

interface PluginEditFormProps extends Omit<ConfigProps<any>, 'form'> {
  // formValues: any;
  editionMode: boolean;
  organisationId: string;
  save: (pluginValue: any, propertiesValue: PluginProperty[]) => void;
  pluginProperties: PluginProperty[];
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
  InjectDrawerProps;

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
      displayAdvancedSection: false,
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
      isLoading,
      organisationId,
      pluginVersionId,
      pluginProperties,
    } = this.props;

    return pluginProperties.map((fieldDef: PluginProperty) => {
      return (
        <PluginFieldGenerator
          key={`${fieldDef.technical_name}`}
          definition={fieldDef}
          disabled={isLoading}
          pluginVersionId={pluginVersionId}
          organisationId={organisationId}
        />
      );
    });
  };

  renderTechnicalName = () => {
    const { intl } = this.props;
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
              label: intl.formatMessage(messages.sectionTechnicalName),
            }}
            inputProps={{
              placeholder: intl.formatMessage(
                messages.sectionTechnicalPlaceholder,
              ),
            }}
            helpToolTipProps={{
              title: intl.formatMessage(messages.sectionTechnicalHelper),
            }}
          />
        </div>
      </div>
    );
  };

  render() {
    const {
      handleSubmit,
      formId,
      fieldValidators: { isRequired },
      intl: { formatMessage },
      isLoading,
      showGeneralInformation,
      showTechnicalName,
    } = this.props;

    const InputField: FieldCtor<FormInputProps> = Field;
    const fieldProps: FormInputProps = {
      formItemProps: {
        label: formatMessage(messages.sectionGeneralName),
        required: true,
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
          className={
            this.state.loading ? 'hide-section' : 'edit-layout ant-layout'
          }
          onSubmit={handleSubmit(this.onSubmit)}
          id={formId}
        >
          {/* this button enables submit on enter */}
          <button type="submit" style={{ display: 'none' }} />
          <Content
            className="mcs-content-container mcs-form-container ad-group-form"
            // add ID?
          >
            {showGeneralInformation ? (
              <div>
                <div id={'general'}>
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
                    {showTechnicalName ? this.renderTechnicalName() : null}
                  </Row>
                </div>
                <hr />
              </div>
            ) : null}
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
}

export default compose<JoinedProps, PluginEditFormProps>(
  injectIntl,
  injectDrawer,
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
  }),
  withValidators,
)(PluginEditForm);
