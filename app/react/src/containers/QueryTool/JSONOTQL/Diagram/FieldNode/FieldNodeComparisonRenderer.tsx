import * as React from 'react';
import FieldNodeModel from './FieldNodeModel';
import { FormattedMessage, defineMessages } from 'react-intl';
import {
  QueryFieldComparisonShape,
  StringComparisonOperator,
  TimeComparisonOperator,
  EnumComparisonOperator,
  BooleanComparisonOperator,
  NumericComparisonOperator,
} from '../../../../../models/datamart/graphdb/QueryDocument';
import SegmentNameDisplay from '../../../../Audience/Common/SegmentNameDisplay';
import CompartmentNameDisplay from '../../../../Common/CompartmentNameDisplay';
import ChannelNameDisplay from '../../../../Common/ChannelNameDisplay';
import { getCoreReferenceTypeAndModel } from '../../domain';

type ComparisonOperator =
  | StringComparisonOperator
  | TimeComparisonOperator
  | EnumComparisonOperator
  | BooleanComparisonOperator
  | NumericComparisonOperator;

interface Props {
  node: FieldNodeModel;
  datamartId: string;
}

const messages: {
  [key in ComparisonOperator]: FormattedMessage.MessageDescriptor
} = defineMessages({
  EQ: {
    id: 'fieldnoderenderer.fieldCondition.condition.EQ',
    defaultMessage: 'equals',
  },
  NOT_EQ: {
    id: 'fieldnoderenderer.fieldCondition.condition.NOT_EQ',
    defaultMessage: 'does not equal',
  },
  MATCHES: {
    id: 'fieldnoderenderer.fieldCondition.condition.MATCHES',
    defaultMessage: 'matches',
  },
  DOES_NOT_MATCH: {
    id: 'fieldnoderenderer.fieldCondition.condition.DOES_NOT_MATCH',
    defaultMessage: 'does not match',
  },
  STARTS_WITH: {
    id: 'fieldnoderenderer.fieldCondition.condition.STARTS_WITH',
    defaultMessage: 'starts with',
  },
  DOES_NOT_START_WITH: {
    id: 'fieldnoderenderer.fieldCondition.condition.DOES_NOT_START_WITH',
    defaultMessage: 'does not start with',
  },
  CONTAINS: {
    id: 'fieldnoderenderer.fieldCondition.condition.CONTAINS',
    defaultMessage: 'contains',
  },
  DOES_NOT_CONTAIN: {
    id: 'fieldnoderenderer.fieldCondition.condition.DOES_NOT_CONTAIN',
    defaultMessage: 'does not contain',
  },
  BEFORE: {
    id: 'fieldnoderenderer.fieldCondition.condition.BEFORE',
    defaultMessage: 'before',
  },
  BEFORE_OR_EQUAL: {
    id: 'fieldnoderenderer.fieldCondition.condition.BEFORE_OR_EQUAL',
    defaultMessage: 'before or equal',
  },
  AFTER: {
    id: 'fieldnoderenderer.fieldCondition.condition.AFTER',
    defaultMessage: 'after',
  },
  AFTER_OR_EQUAL: {
    id: 'fieldnoderenderer.fieldCondition.condition.AFTER_OR_EQUAL',
    defaultMessage: 'after or equal',
  },
  EQUAL: {
    id: 'fieldnoderenderer.fieldCondition.condition.EQUAL',
    defaultMessage: 'equals',
  },
  NOT_EQUAL: {
    id: 'fieldnoderenderer.fieldCondition.condition.NOT_EQUAL',
    defaultMessage: 'does not equal',
  },
  LT: {
    id: 'fieldnoderenderer.fieldCondition.condition.LT',
    defaultMessage: 'is less than',
  },
  LTE: {
    id: 'fieldnoderenderer.fieldCondition.condition.LTE',
    defaultMessage: 'is less than or equals to',
  },
  GT: {
    id: 'fieldnoderenderer.fieldCondition.condition.GT',
    defaultMessage: 'is greater than',
  },
  GTE: {
    id: 'fieldnoderenderer.fieldCondition.condition.GTE',
    defaultMessage: 'is greater than or equals',
  },
});

export default class FieldNodeComparisonRenderer extends React.Component<
  Props
> {
  renderDateValue = (values: string[]) => {
    return values.reduce((acc, val, i) => {
      return `${acc}${i !== 0 ? ', ' : ''}${val}`;
    }, '');
  };

  renderStringValues = (values: string[]) => {
    return values.reduce((acc, val, i) => {
      return `${acc}${i !== 0 ? ', ' : ''}${val}`;
    }, '');
  };

  renderBooleanValues = (values: string[]) => {
    return values.reduce((acc, val, i) => {
      return `${acc}${i !== 0 ? ', ' : ''}${val === 'true' ? 'true' : 'false'}`;
    }, '');
  };

  renderReferenceTable = (values: string[], type: string, modelType: string) => {
    const {
      datamartId
    } = this.props;

    if (type === 'CORE_OBJECT') {
      if (modelType === 'COMPARTMENTS') {
        return values.map(v => <CompartmentNameDisplay userAccountCompartmentId={v} key={v} />) 
      }
      if (modelType === 'SEGMENTS') {
        return values.map(v => <SegmentNameDisplay audienceSegmentId={v} key={v} />)
      }
      if (modelType === 'CHANNELS') {
        return values.map(v => <ChannelNameDisplay datamartId={datamartId} channelId={v} key={v} />)
      }
    } 
    return this.renderStringValues(values)
  }

  renderValues = (comparison: QueryFieldComparisonShape) => {

    const { node } = this.props;

    const field = node.objectTypeInfo.fields.find(f => f.name === node.fieldNode.field)!;

    const modelAndType = getCoreReferenceTypeAndModel(field.directives);
    if (modelAndType) return this.renderReferenceTable(comparison.values, modelAndType.type, modelAndType.modelType);


    switch (comparison.type) {
      case 'BOOLEAN':
        return this.renderBooleanValues(comparison.values);
      case 'TIME':
        return this.renderDateValue(comparison.values);
      case 'NUMERIC':
        return this.renderStringValues(comparison.values);
      case 'STRING':
        return this.renderStringValues(comparison.values);
    }
    return '';
  };

  render() {
    const { node } = this.props;
    const operator = node.fieldNode.comparison
      ? node.fieldNode.comparison.operator
      : null;

    const fieldInfo = node.objectTypeInfo.fields.find(f => f.name === node.fieldNode.field);
    const fieldName = fieldInfo && fieldInfo.decorator && fieldInfo.decorator.hidden === false && fieldInfo.decorator.label ? fieldInfo.decorator.label : node.fieldNode.field

   
    return (
      <div className="comparison">
        <div
          style={{
            color: node.getColor(),
          }}
          className="fieldname"
        >
          {fieldName}
        </div>
        <div>
          <span className="operator">
            {operator ? (
              <FormattedMessage {...messages[operator as ComparisonOperator]} />
            ) : null}
          </span>{' '}
          {node.fieldNode.comparison && node.fieldNode.comparison.values
            ? this.renderValues(node.fieldNode.comparison)
            : null}
        </div>
      </div>
    );
  }
}
