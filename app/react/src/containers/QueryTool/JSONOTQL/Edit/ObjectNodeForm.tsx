import * as React from 'react';
import { 
  Omit, connect,
} from 'react-redux';
import { 
  reduxForm,
  InjectedFormProps,
  ConfigProps,
  FieldArray,
  GenericFieldArray,
  Field,
  getFormValues,
 } from 'redux-form';
import { ObjectNodeFormData, FORM_ID } from './domain';
import { Path } from '../../../../components/ActionBar';
import { Layout, Form } from 'antd';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { McsFormSection } from '../../../../utils/FormHelper';
import messages from './messages'
import ObjectNodeSection from './Sections/ObjectNodeSection';
import { QueryBooleanOperator } from '../../../../models/datamart/graphdb/QueryDocument';
import { ObjectLikeTypeInfoResource, FieldResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import FieldNodeSection, { FieldNodeSectionProps } from './Sections/FieldNodeSection';

const { Content } = Layout;

export interface ObjectNodeFormProps extends Omit<ConfigProps<ObjectNodeFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
  schemaPath: string[];
  objectTypes: ObjectLikeTypeInfoResource[];
}

interface MapStateToProps {
  formValues: ObjectNodeFormData;
}

const FieldNodeListFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  FieldNodeSectionProps>;

interface QueryToolDocumentFormState {
  selectedFields: FieldResource[];
}

type Props = InjectedFormProps<
ObjectNodeFormData,
ObjectNodeFormProps
> &
ObjectNodeFormProps &
InjectedIntlProps &
RouteComponentProps<{ organisationId: string }> &
MapStateToProps;

class ObjectNodeForm extends React.Component<Props, QueryToolDocumentFormState> {

  constructor(props: Props) {
    super(props);
    this.state = {
      selectedFields: [],
    }
  }

  componentWillReceiveProps (nextProps: Props) {
    const {
      formValues
    } = this.props;
    const {
      formValues: nextFormValues,
      change,
    } = nextProps;
    if (formValues && nextFormValues && formValues.objectNodeForm && nextFormValues.objectNodeForm && formValues.objectNodeForm.field !== nextFormValues.objectNodeForm.field) {
      // resetting value when the object node is change;
      change('fieldNodeForm', []);
    }

    if (nextFormValues && nextFormValues.objectNodeForm && nextFormValues.objectNodeForm.field) {
      this.setState({
        selectedFields: this.buildAvailableFieldResource(nextFormValues.objectNodeForm.field)
      })
    }
  }

  buildAvailableFieldResource = (selectedValue: string): FieldResource[] => {
    const selectedObject = this.props.objectTypes.find(i => i.name === selectedValue);
    const objectTypesNames = this.props.objectTypes.map(i => i.name);
    return selectedObject && selectedObject.fields ? selectedObject.fields.filter(i => !objectTypesNames.find(o => i.field_type.indexOf(o) > -1)) : [];
  }
  

  buildOptionsFromPath = (fieldPath: string[]): FieldResource[] => {
    let selectedObject: ObjectLikeTypeInfoResource | undefined;
    fieldPath.forEach((fieldName, index) => {
      if (index === 0) {
        // has to be an object of the domain
        selectedObject = this.props.objectTypes.find(i => i.name === fieldName);
      } else {
        const selectedField = selectedObject && selectedObject.fields && selectedObject.fields.find(i => i.name === fieldName);
        if (selectedField && selectedField.field_type.indexOf('[') &&  selectedField.field_type.indexOf(']')) {
          // check if the field is a list
          const selectedFieldName = selectedField.field_type.replace('[', '').replace(']', '').replace('!', '');
          selectedObject = this.props.objectTypes.find(i => i.name === selectedFieldName)
        }
      }
    })
    return selectedObject && selectedObject.fields ? selectedObject.fields : [];
  }

  render() {

    const {
      handleSubmit,
      breadCrumbPaths,
      close,
      schemaPath,
      change,
      formValues,
    } = this.props;
    
    const genericFieldArrayProps = {
      formChange: change,
      rerenderOnEveryChange: true,
    };

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadCrumbPaths,
      message: messages.save,
      onClose: close,
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'general',
      title: messages.objectNodeTitle,
      component: <ObjectNodeSection availableFields={this.buildOptionsFromPath(schemaPath)} domainObjects={this.props.objectTypes.map(a => a.name)} />,
    });

    const onBooleanOperatorChange = (value: QueryBooleanOperator) => change('objectNodeForm.booleanOperator', value);

    if (formValues && formValues.objectNodeForm && formValues.objectNodeForm.field)

      

      sections.push({
        id: 'fieldConditions',
        title: messages.objectNodeTitle,
        component: <FieldNodeListFieldArray
          name="fieldNodeForm"
          component={FieldNodeSection}
          availableFields={this.state.selectedFields}
          formChange={change}
          booleanOperator={formValues.objectNodeForm.booleanOperator}
          onBooleanOperatorChange={onBooleanOperatorChange}
          {...genericFieldArrayProps}
        />,
      });


    const renderedSections = sections.map((section, index) => {
      return (
        <div key={section.id}>
          <div key={section.id} id={section.id}>
            {section.component}
          </div>
          {index !== sections.length - 1 && <hr />}
        </div>
      );
    });

    

    return (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form
            className="edit-layout ant-layout"
            onSubmit={handleSubmit as any}
            layout='vertical'
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container"
            >
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: any) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, ObjectNodeFormProps>(
  injectIntl,
  withRouter,
  connect(mapStateToProps),
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true, 
  }),
)(ObjectNodeForm)