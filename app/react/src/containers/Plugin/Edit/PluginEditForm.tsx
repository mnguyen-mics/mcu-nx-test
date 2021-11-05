import * as React from 'react';
import { Form, reduxForm, InjectedFormProps, Field, GenericField, ConfigProps } from 'redux-form';
import { compose } from 'recompose';
import { Layout, Row } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import {
  FormTitle,
  withValidators,
  FieldCtor,
  FormFieldWrapper,
  DefaultSelectField,
  DefaultSelect,
} from '../../../components/Form';
import { ValidatorProps } from '../../../components/Form/withValidators';
import FormInput, { FormInputProps } from '../../../components/Form/FormInput';
import { generateFakeId } from '../../../utils/FakeIdHelper';
import { PluginFieldGenerator } from '../../Plugin';
import { Omit } from '../../../utils/Types';

import messages from './messages';
import { InjectedDrawerProps } from '../../../components/Drawer/injectDrawer';
import { injectDrawer } from '../../../components/Drawer/index';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { PluginLayout } from '../../../models/plugin/PluginLayout';
import { withRouter, RouteComponentProps } from 'react-router';
import { BasicProps } from 'antd/lib/layout/layout';
import PluginSectionGenerator from '../PluginSectionGenerator';
import { PropertyResourceShape } from '../../../models/plugin';

const FORM_NAME = 'pluginForm';

const Content = (Layout.Content as unknown) as React.ComponentClass<BasicProps & { id: string }>;
interface PluginEditFormProps extends Omit<ConfigProps<any>, 'form'> {
  // formValues: any;
  editionMode: boolean;
  organisationId: string;
  save: (pluginValue: any, propertiesValue: PropertyResourceShape[]) => void;
  pluginProperties: PropertyResourceShape[];
  disableFields: boolean;
  pluginLayout?: PluginLayout;
  isLoading: boolean;
  pluginVersionId: string;
  formId: string;
  initialValues: any;
  showGeneralInformation: boolean;
  showedMessage?: React.ReactNode;
  showTechnicalName?: boolean;
  renderSpecificFields?: SpecificFieldsFunction;
}

export type SpecificFieldsFunction = (
  disabled: boolean,
  fieldNamePrefix: string,
) => React.ReactNode;

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
    const { disableFields, organisationId, pluginVersionId, pluginProperties } = this.props;

    return pluginProperties.map((fieldDef: PropertyResourceShape) => {
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
    const { intl } = this.props;
    const InputField: FieldCtor<FormInputProps> = Field as new () => GenericField<FormInputProps>;
    return (
      <div>
        <Button className='optional-section-title' onClick={this.toggleAdvancedSection}>
          <McsIcon type='settings' />
          <span className='step-title'>{intl.formatMessage(messages.advanced)}</span>
          <McsIcon type='chevron' />
        </Button>
        <div
          className={
            !this.state.displayAdvancedSection ? 'hide-section' : 'optional-section-content'
          }
        >
          <InputField
            name='plugin.technical_name'
            component={FormInput}
            formItemProps={{
              label: intl.formatMessage(messages.sectionTechnicalName),
            }}
            inputProps={{
              placeholder: intl.formatMessage(messages.sectionTechnicalPlaceholder),
            }}
            helpToolTipProps={{
              title: intl.formatMessage(messages.sectionTechnicalHelper),
            }}
          />
        </div>
      </div>
    );
  };

  generateFormFromPluginLayout = (pluginLayout: PluginLayout) => {
    const { organisationId, pluginVersionId, pluginProperties, disableFields } = this.props;

    return pluginLayout.sections.map((section, index) => {
      const indexCondition = index !== pluginLayout.sections.length - 1;
      const fieldsCondition = section.fields !== null && section.fields.length !== 0;
      const advancedFieldsCondition =
        section.advanced_fields !== null && section.advanced_fields.length !== 0;
      const hrBooleanCondition = indexCondition && (fieldsCondition || advancedFieldsCondition);
      return (
        <div key={section.title}>
          <PluginSectionGenerator
            pluginLayoutSection={section}
            organisationId={organisationId}
            pluginProperties={pluginProperties}
            disableFields={disableFields}
            pluginVersionId={pluginVersionId}
          />
          {hrBooleanCondition ? <hr /> : null}
        </div>
      );
    });
  };

  render() {
    const {
      handleSubmit,
      formId,
      fieldValidators: { isRequired },
      intl: { formatMessage },
      disableFields,
      showTechnicalName,
      showGeneralInformation,
      showedMessage,
      pluginLayout,
      renderSpecificFields,
    } = this.props;

    const InputField: FieldCtor<FormInputProps> = Field as new () => GenericField<FormInputProps>;
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

    const fieldPropsErrorStrategy: FormInputProps = {
      formItemProps: {
        label: formatMessage(messages.sectionGeneralErrorRecoveryStrategy),
        required: true,
      },
      inputProps: {
        placeholder: formatMessage(messages.sectionGeneralErrorRecoveryStrategy),
        disabled: disableFields,
      },
      helpToolTipProps: {
        title: formatMessage(messages.sectionGeneralErrorRecoveryStrategyHelper),
      },
    };

    const errorOptions = [
      { title: 'Store With Error Id', value: 'STORE_WITH_ERROR_ID' },
      {
        title: 'Store With Error Id And Skip Upcoming Analyzers',
        value: 'STORE_WITH_ERROR_ID_AND_SKIP_UPCOMING_ANALYZERS',
      },
      { title: 'Drop', value: 'DROP' },
    ];

    return (
      <Layout>
        <Form
          className={this.state.loading ? 'hide-section' : 'edit-layout ant-layout'}
          onSubmit={handleSubmit(this.onSubmit)}
          id={formId}
        >
          <Content className='mcs-content-container mcs-form-container ad-group-form' id={formId}>
            <Row>
              <span className='ant-col-3' />
              <FormFieldWrapper>{showedMessage}</FormFieldWrapper>
            </Row>
            {showGeneralInformation ? (
              <div>
                <div id={'general'}>
                  <Row align='middle' justify='space-between' className='section-header'>
                    <FormTitle title={messages.sectionGeneralTitle} />
                  </Row>
                  <div>
                    <InputField
                      name='plugin.name'
                      component={FormInput}
                      validate={[isRequired]}
                      {...fieldProps}
                    />
                    <DefaultSelectField
                      name='plugin.error_recovery_strategy'
                      component={DefaultSelect}
                      options={errorOptions}
                      {...fieldPropsErrorStrategy}
                    />
                    {renderSpecificFields ? renderSpecificFields(disableFields, 'plugin') : null}
                    {showTechnicalName ? this.renderTechnicalName() : null}
                  </div>
                </div>
                <hr />
              </div>
            ) : null}
            {pluginLayout === undefined ? (
              <div id={'properties'}>
                <Row align='middle' justify='space-between' className='section-header'>
                  <FormTitle title={messages.sectionPropertiesTitle} />
                </Row>
                <div style={{ display: 'block' }}>{this.pluginFieldGenerated()}</div>
              </div>
            ) : (
              <div>{this.generateFormFromPluginLayout(pluginLayout)}</div>
            )}
          </Content>
        </Form>
      </Layout>
    );
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
