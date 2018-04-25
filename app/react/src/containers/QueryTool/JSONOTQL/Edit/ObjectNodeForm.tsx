import * as React from 'react';
import { Omit, connect } from 'react-redux';
import {
  reduxForm,
  InjectedFormProps,
  ConfigProps,
  FieldArray,
  GenericFieldArray,
  Field,
  getFormValues,
} from 'redux-form';
import { ObjectNodeFormData, FORM_ID, FrequencyFormData } from './domain';
import { Path } from '../../../../components/ActionBar';
import { Layout, Form } from 'antd';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../components/Layout/FormLayoutActionbar';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { McsFormSection } from '../../../../utils/FormHelper';
import messages from './messages';
import ObjectNodeSection from './Sections/ObjectNodeSection';
import { QueryBooleanOperator } from '../../../../models/datamart/graphdb/QueryDocument';
import {
  ObjectLikeTypeInfoResource,
  FieldResource,
} from '../../../../models/datamart/graphdb/RuntimeSchema';
import FieldNodeSection, {
  FieldNodeSectionProps,
} from './Sections/FieldNodeSection';

const { Content } = Layout;

export interface ObjectNodeFormProps
  extends Omit<ConfigProps<ObjectNodeFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: Path[];
  objectType: ObjectLikeTypeInfoResource;
  objectTypes: ObjectLikeTypeInfoResource[];
}

interface MapStateToProps {
  formValues: ObjectNodeFormData;
}

const FieldNodeListFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  FieldNodeSectionProps
>;

type Props = InjectedFormProps<ObjectNodeFormData, ObjectNodeFormProps> &
  ObjectNodeFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  MapStateToProps;

class ObjectNodeForm extends React.Component<Props> {
  buildAvailableFieldResource = (selectedValue: string): FieldResource[] => {
    const selectedObject = this.props.objectTypes.find(
      i => i.name === selectedValue,
    );
    const objectTypesNames = this.props.objectTypes.map(i => i.name);
    return selectedObject && selectedObject.fields
      ? selectedObject.fields.filter(
          i => !objectTypesNames.find(o => i.field_type.indexOf(o) > -1),
        )
      : [];
  };

  render() {
    const {
      handleSubmit,
      breadCrumbPaths,
      close,
      change,
      formValues,
      objectType,
      objectTypes,
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

    const resetFieldNodeForm = () => {
      const resetFrequency: FrequencyFormData = {
        enabled: false,
        mode: 'AT_LEAST',
      };
      change('frequency', resetFrequency);
      change('fieldNodeForm', []);
    };

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'objectNode',
      title: messages.objectNodeTitle,
      component: (
        <ObjectNodeSection
          objectTypeFields={objectType.fields.filter(field => {
            const found = objectTypes.find(ot => field.field_type.indexOf(ot.name) > -1);            
            const hasIndexedField = !!found && !!found.fields.find(f => !f.directives.find(dir => dir.name === 'TreeIndex'))
            return !!found && hasIndexedField;
          })}
          onSelect={resetFieldNodeForm}
        />
      ),
    });

    const onBooleanOperatorChange = (value: QueryBooleanOperator) =>
      change('objectNodeForm.boolean_operator', value);

    const hasField = formValues && formValues.objectNodeForm.field;
    const showFieldNodeForm = hasField;

    if (showFieldNodeForm) {
      const selectedFieldType = objectType.fields.find(
        f => f.name === formValues.objectNodeForm.field,
      )!.field_type;
      sections.push({
        id: 'fieldConditions',
        title: messages.objectNodeTitle,
        component: (
          <FieldNodeListFieldArray
            name="fieldNodeForm"
            component={FieldNodeSection}
            availableFields={objectTypes
              .find(ot => selectedFieldType.indexOf(ot.name) > -1)!
              .fields.filter(
                f =>
                  !objectTypes.find(ot => f.field_type.indexOf(ot.name) > -1) &&
                  f.directives.find(dir => dir.name === 'TreeIndex'),
              )}
            formChange={change}
            booleanOperator={formValues.objectNodeForm.boolean_operator}
            onBooleanOperatorChange={onBooleanOperatorChange}
            {...genericFieldArrayProps}
          />
        ),
      });
    }

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
            layout="vertical"
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
)(ObjectNodeForm);
