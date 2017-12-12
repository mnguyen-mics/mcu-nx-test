import * as React from 'react';
import {
  Form,
  getFormValues,
  reduxForm,
  InjectedFormProps,
  Field,
} from 'redux-form';
import { connect } from 'react-redux';
import { compose, mapProps } from 'recompose';
import { Layout, Row } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import { Loading } from '../../../components';
import { FormTitle, withValidators, FieldCtor } from '../../../components/Form';
import FormInput, { FormInputProps } from '../../../components/Form/FormInput';

import * as actions from '../../../state/Notifications/actions';
import { generateFakeId } from '../../../utils/FakeIdHelper';
import { PluginProperty } from '../../../models/Plugins';
import { PluginFieldGenerator } from '../../Plugin';

import messages from './messages';

const { Content } = Layout;
const FORM_NAME = 'pluginForm';

interface PluginEditFormProps {
  formValues: any;
  editionMode: boolean;
  organisationId: string;
  save: (pluginValue: any, propertiesValue: PluginProperty[]) => void;
  pluginProperties: PluginProperty[];
  isLoading: boolean;
  pluginVersionId: string;
  formId: string;
  initialValues: any;
}

interface InjectedProps {
  RxF: InjectedFormProps;
  fieldValidators: any;
}

type JoinedProps =
  PluginEditFormProps &
  InjectedProps &
  InjectedIntlProps;

interface PluginEditFormState {
  loading: boolean;
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

  onSubmit = () => {
    const {
      formValues,
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

    return pluginProperties.map((fieldDef: PluginProperty) => {
      return (
        <PluginFieldGeneratorJS
          key={`${fieldDef.technical_name}`}
          definition={fieldDef}
          fieldGridConfig={fieldGridConfig}
          disabled={isLoading}
          pluginVersionId={pluginVersionId}
          organisationId={organisationId}
        />
      );
    });
  }

  render() {
    const {
      RxF: { handleSubmit },
      isLoading,
      formId,
      fieldValidators: { isRequired },
      intl: { formatMessage },
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
        {this.state.loading ? <Loading className="loading-full-screen" /> : null}

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

const mapStateToProps = (state: any, ownProps: JoinedProps) => ({
  formValues: getFormValues(ownProps.RxF.form)(state),
});

const mapDispatchToProps = {
  notifyError: actions.notifyError,
};

export default compose<JoinedProps, PluginEditFormProps>(
  injectIntl,
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    propNamespace: 'RxF',
  }),
  withValidators,
  mapProps<any, any>(
    // https://github.com/erikras/redux-form/issues/3529
    // Add missing redux form props to the namespace
    props => {
      const {
        RxF,
        array,
        pure,
        autofill,
        clearAsyncError,
        clearSubmit,
        clearSubmitErrors,
        submit,
        ...rest,
      } = props;
      return {
        RxF: {
          ...RxF,
          array,
          pure,
          autofill,
          clearAsyncError,
          clearSubmit,
          clearSubmitErrors,
          submit,
        },
        ...rest,
      };
    },
  ),
  connect(mapStateToProps, mapDispatchToProps),
)(PluginEditForm);
