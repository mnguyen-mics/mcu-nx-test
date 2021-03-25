import React from "react";
import { defineMessages, InjectedIntlProps, injectIntl } from "react-intl";
import { connect, DispatchProp } from "react-redux";
import { compose } from "recompose";
import { change, formValueSelector, InjectedFormProps } from "redux-form";
import { ObjectLikeTypeInfoResource } from "../../../../../../models/datamart/graphdb/RuntimeSchema";
import { MicsReduxState } from "../../../../../../utils/ReduxHelper";
import { FieldNode, isFieldNode, isObjectNode, ObjectTreeExpressionNodeShape } from "../../../../../../models/datamart/graphdb/QueryDocument";
import withValidators, { ValidatorProps } from "../../../../../../components/Form/withValidators";
import FormTreeSelect, { FormTreeSelectDataNode } from "../../../../../../components/Form/FormTreeSelect";
import { FormTreeSelectField } from "../../../../../../components/Form";
import EventPropertyFormComparator from "./EventPropertyFormComparator";

export interface EventPropertyFormProps {
  name: string;
  formId: string;
  sourceObjectType: ObjectLikeTypeInfoResource;
  objectTypes: ObjectLikeTypeInfoResource[];
  disabled?: boolean;
  runtimeSchemaId: string;
  datamartId: string;
  filterOutFields: string[];
  formChange: (fieldName: string, fieldValue: any) => void;
}

export type EventPropertyFormData = {
  value?: string;
};

interface MapStateToProps {
  formValues?: {
    value: string;
    objectType: ObjectLikeTypeInfoResource;
    expression: ObjectTreeExpressionNodeShape;
  };
}

type Props = EventPropertyFormProps &
  InjectedIntlProps &
  ValidatorProps &
  MapStateToProps &
  DispatchProp<any> &
  InjectedFormProps<EventPropertyFormData, EventPropertyFormProps>;

type State = {}

class EventPropertyForm extends React.Component<Props, State> {

  constructTreeData = (
    sourceObjectType: ObjectLikeTypeInfoResource,
    objectTypes: ObjectLikeTypeInfoResource[],
    ancestors: string[] = [],
  ): FormTreeSelectDataNode[] => {
    const { filterOutFields } = this.props;

    return sourceObjectType.fields
      .filter(
        f =>
          !filterOutFields.includes(f.name) &&
          (objectTypes.find(ot => {
            const match = f.field_type.match(/\w+/);
            return !!(match && match[0] === ot.name);
          }) || f.directives.find(dir => dir.name === 'TreeIndex')),
      )
      .map(sourceField => {
        const objectNode = objectTypes.find(ot => sourceField.field_type === ot.name);
        const updatedAncestors = objectNode ? [...ancestors, sourceField.name] : ancestors;
        return {
          inputLabel: `${ancestors.length ? `${ancestors.join(" > ")} > ` : ''}${sourceField.name}`,
          children: objectNode ? this.constructTreeData(objectNode, objectTypes, updatedAncestors) : [],
          selectable: !objectNode,
          value: `${ancestors.length ? `${ancestors.join(" ")} ` : ''}${sourceField.name}`,
          label: sourceField.name,
          expression: this.generateExpression(ancestors, sourceField.name),
          objectType: sourceObjectType
        };
      })
  }

  generateExpression = (objectNodes: string[], field: string): ObjectTreeExpressionNodeShape => {
    if (objectNodes.length > 0) {
      return {
        boolean_operator: "AND",
        field: objectNodes[0],
        type: "OBJECT",
        expressions: [this.generateExpression(objectNodes.slice(1), field)],
      }
    } else {
      return {
        type: "FIELD",
        field: field,
      }
    }
  }

  getFieldAndDepth = (tree: ObjectTreeExpressionNodeShape, depth = 0): [FieldNode, number] => {
    if (tree.type === "FIELD") return [tree, depth];
    return this.getFieldAndDepth(tree.expressions[0], depth + 1)
  }

  getSelectedFieldType = (fieldName: string | undefined) => {
    const { objectTypes, formValues, sourceObjectType } = this.props;

    const selectedObjectType: ObjectLikeTypeInfoResource | undefined =
      formValues?.expression ? this.getSelectedObjectType(formValues?.expression, sourceObjectType) : undefined;

    if (!selectedObjectType) return;

    const availableFields = selectedObjectType.fields
      .filter(
        f =>
          !objectTypes.find(ot => {
            const match = f.field_type.match(/\w+/);
            return !!(match && match[0] === ot.name);
          }) && f.directives.find(dir => dir.name === 'TreeIndex'),
      );

    const possibleFieldType = availableFields.find(i => i.name === fieldName);
    if (possibleFieldType) {
      const fieldType = possibleFieldType.field_type;
      const match = fieldType.match(/\w+/);
      return match?.[0];
    }

    return;
  }

  onSelectTreeSelect = (value: any, option: FormTreeSelectDataNode) => {
    const { dispatch, formId, name, formValues } = this.props;
    if (dispatch && formValues?.value !== option.value) {
      dispatch(change(formId, name, option));
    }
  }

  getSelectedObjectType = (tree: ObjectTreeExpressionNodeShape, currentObjectType: ObjectLikeTypeInfoResource): ObjectLikeTypeInfoResource | undefined => {
    const { objectTypes } = this.props;
    if (isFieldNode(tree)) return currentObjectType;
    else if (isObjectNode(tree)) {
      const correspondingFieldNextObjectType = currentObjectType.fields.find(lot => lot.name === tree.field);
      const nextObjectType = objectTypes.find(ot => ot.name === correspondingFieldNextObjectType?.field_type);
      if (!nextObjectType) return;
      return this.getSelectedObjectType(tree.expressions[0], nextObjectType);
    }

    return;
  }

  getDirectives = (fieldName?: string, objectType?: ObjectLikeTypeInfoResource) => {
    const { objectTypes } = this.props;
    if (!fieldName || !objectType) return [];
    const field = objectType.fields
      .filter(
        f =>
          !objectTypes.find(ot => {
            const match = f.field_type.match(/\w+/);
            return !!(match && match[0] === ot.name);
          }) && f.directives.find(dir => dir.name === 'TreeIndex'),
      ).find(f => f.name === fieldName);
    return field ? field.directives : [];
  }

  render() {
    const {
      name,
      sourceObjectType,
      objectTypes,
      disabled,
      datamartId,
      runtimeSchemaId,
      intl: { formatMessage },
      fieldValidators: { isRequired },
      formValues,
      formChange,
    } = this.props;

    const [fieldNode, depth] = formValues?.expression ? this.getFieldAndDepth(formValues.expression) : [undefined, 0];
    const comparatorName = `${name}.expression${".expressions[0]".repeat(depth)}`;
    const fieldType = this.getSelectedFieldType(fieldNode?.field);
    const selectedObjectType = formValues?.expression ? this.getSelectedObjectType(formValues?.expression, sourceObjectType) : undefined;
    const directives = this.getDirectives(fieldNode?.field, selectedObjectType);

    return (
      <div>
        <FormTreeSelectField
          name={`${name}.value`}
          component={FormTreeSelect}
          validate={[isRequired]}
          treeData={this.constructTreeData(sourceObjectType, objectTypes)}
          onSelect={this.onSelectTreeSelect}
          treeNodeLabelProp='inputLabel'
          formItemProps={{
            label: formatMessage(messages.treeSelectLabel),
            required: true,
          }}
          small={true}
          disabled={disabled}
        />
        <EventPropertyFormComparator
          name={comparatorName}
          datamartId={datamartId}
          runtimeSchemaId={runtimeSchemaId}
          fieldNode={fieldNode}
          fieldType={fieldType}
          directives={directives}
          objectType={selectedObjectType || sourceObjectType}
          disabled={disabled}
          formChange={formChange}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: MicsReduxState, props: EventPropertyFormProps) => {
  const selector = formValueSelector(props.formId)
  return {
    formValues: selector(state, props.name),
  }
};

export default compose<Props, EventPropertyFormProps>(
  injectIntl,
  withValidators,
  connect(mapStateToProps),
)(EventPropertyForm);

const messages = defineMessages({
  treeSelectLabel: {
    id: 'eventPropertyForm.treeSelect.label',
    defaultMessage: 'Field Name'
  },
});
