import * as React from 'react';
import lodash from 'lodash';
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
import { Layout } from 'antd';
import { Form } from '@ant-design/compatible';
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
import { ObjectLikeTypeInfoResource } from '../../../../models/datamart/graphdb/RuntimeSchema';
import FieldNodeSection, { FieldNodeSectionProps } from './Sections/FieldNodeSection';
import { typesTrigger } from '../domain';
import { MicsReduxState } from '../../../../utils/ReduxHelper';

const { Content } = Layout;

export interface ObjectNodeFormProps extends Omit<ConfigProps<ObjectNodeFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  objectType: ObjectLikeTypeInfoResource;
  objectTypes: ObjectLikeTypeInfoResource[];
  isTrigger: boolean;
  isEdge: boolean;
  datamartId: string;
  runtimeSchemaId: string;
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
  /**
   * Filter fields by field_type that represent
   * an object type (ie not scalar ie [UserEvent!]!)
   * We use a regexp to extract the type
   * A TreeIndex directive means it is queryable (ie indexed)
   */

  filterAvailableFields(objectType: ObjectLikeTypeInfoResource): boolean {
    return lodash
      .flatMap(objectType.directives, d =>
        d.arguments.map(a =>
          Object.values(typesTrigger).includes(a.value.replace(/[^a-zA-Z]+/g, '')),
        ),
      )
      .reduce((acc: boolean, val: boolean) => {
        return acc || val;
      }, false);
  }

  getQueryableObjectTypes = (isTrigger: boolean, isEdge: boolean) => {
    const { objectType, objectTypes } = this.props;

    if (isTrigger && objectType.name === 'UserPoint') {
      const filteredObjectTypes = objectTypes.filter(o => this.filterAvailableFields(o));
      return objectType.fields.filter(field => {
        const found = filteredObjectTypes.find(ot => {
          const match = field.field_type.match(/\w+/);
          return !!(match && match[0] === ot.name);
        });
        return !!found;
      });
    }

    return objectType.fields.filter(field => {
      const found = objectTypes.find(ot => {
        const match = field.field_type.match(/\w+/);
        return !!(match && match[0] === ot.name);
      });
      const hasIndexedField =
        !!found &&
        !!found.fields.find(
          f =>
            !!f.directives.find(dir => dir.name === 'TreeIndex') &&
            (isEdge ? !!f.directives.find(dir => dir.name === 'EdgeAvailability') : true),
        );
      return !!found && hasIndexedField;
    });
  };

  getSelectedObjectType = () => {
    const { objectType, objectTypes, formValues } = this.props;

    const selectedFieldType = objectType.fields.find(
      f => f.name === formValues.objectNodeForm.field,
    )!.field_type;

    return objectTypes.find(ot => {
      const match = selectedFieldType.match(/\w+/);
      return !!(match && match[0] === ot.name);
    })!;
  };

  /**
   * Same a getQueryableObjectTypes but for scalar types
   */
  getQueryableFields = () => {
    const { objectTypes, isEdge } = this.props;
    return this.getSelectedObjectType().fields.filter(
      f =>
        !objectTypes.find(ot => {
          const match = f.field_type.match(/\w+/);
          return !!(match && match[0] === ot.name);
        }) &&
        f.directives.find(dir => dir.name === 'TreeIndex') &&
        (isEdge ? f.directives.find(dir => dir.name === 'EdgeAvailability') : true),
    );
  };

  render() {
    const {
      handleSubmit,
      breadCrumbPaths,
      close,
      change,
      formValues,
      isTrigger,
      isEdge,
      objectType,
      datamartId,
      runtimeSchemaId,
    } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
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

    const hasField = formValues && formValues.objectNodeForm.field;
    const showFieldNodeForm = hasField;

    const sections: McsFormSection[] = [];
    sections.push({
      id: 'objectNode',
      title: messages.objectNodeTitle,
      component: (
        <ObjectNodeSection
          objectTypeFields={this.getQueryableObjectTypes(isTrigger, isEdge)}
          objectType={objectType}
          selectedObjectType={hasField ? this.getSelectedObjectType() : undefined}
          onSelect={resetFieldNodeForm}
          isTrigger={isTrigger}
        />
      ),
    });

    const onBooleanOperatorChange = (value: QueryBooleanOperator) =>
      change('objectNodeForm.boolean_operator', value);

    if (showFieldNodeForm) {
      sections.push({
        id: 'fieldConditions',
        title: messages.objectNodeTitle,
        component: (
          <FieldNodeListFieldArray
            name='fieldNodeForm'
            component={FieldNodeSection}
            availableFields={this.getQueryableFields()}
            formChange={change}
            rerenderOnEveryChange={true}
            booleanOperator={formValues.objectNodeForm.boolean_operator}
            onBooleanOperatorChange={onBooleanOperatorChange}
            objectType={this.getSelectedObjectType()}
            datamartId={datamartId}
            runtimeSchemaId={runtimeSchemaId}
            title={messages.fieldConditionTitle}
            subtitle={messages.fieldConditionSubTitle}
            isEdge={isEdge}
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
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form className='edit-layout ant-layout' onSubmit={handleSubmit} layout='vertical'>
            <Content id={FORM_ID} className='mcs-content-container mcs-form-container'>
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
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
