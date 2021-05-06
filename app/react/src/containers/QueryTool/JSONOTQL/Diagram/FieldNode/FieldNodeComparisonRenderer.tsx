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
import { SegmentNameDisplay } from '../../../../Audience/Common/SegmentNameDisplay';
import CompartmentNameDisplay from '../../../../Common/CompartmentNameDisplay';
import ChannelNameDisplay from '../../../../Common/ChannelNameDisplay';
import { getCoreReferenceTypeAndModel } from '../../domain';
import moment from 'moment';
import { UserAccountCompartmentResource } from '../../../../../models/datamart/DatamartResource';
import { AudienceSegmentResource } from '../../../../../models/audiencesegment';
import { ChannelResource } from '../../../../../models/settings/settings';

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
  [key in ComparisonOperator]: FormattedMessage.MessageDescriptor;
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

interface State {
  objectName: string;
}

export default class FieldNodeComparisonRenderer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      objectName: '',
    };
  }

  renderDateValue = (values: string[]) => {
    const formatDate = (v: string | Date) =>
      typeof v === 'string' && v.includes('now') ? v : moment(v).format('YYYY-MM-DD');
    return values.reduce((acc, val, i) => {
      return `${acc}${i !== 0 ? ', ' : ''}${formatDate(val)}`;
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
    const { datamartId } = this.props;

    const setState = (
      v?: UserAccountCompartmentResource | AudienceSegmentResource | ChannelResource,
    ) =>
      this.setState({
        objectName: v
          ? `${this.state.objectName ? `${this.state.objectName}, ${v.name}` : v.name}`
          : this.state.objectName,
      });

    if (type === 'CORE_OBJECT') {
      if (modelType === 'COMPARTMENTS') {
        return (
          <span title={this.state.objectName}>
            {values.reduce((acc, v, i) => {
              acc.push(
                <CompartmentNameDisplay userAccountCompartmentId={v} key={v} onLoad={setState} />,
              );
              if (i !== values.length - 1) acc.push(', ');
              return acc;
            }, [] as React.ReactNode[])}
          </span>
        );
      }
      if (modelType === 'SEGMENTS') {
        return (
          <span title={this.state.objectName}>
            {values.reduce((acc, v, i) => {
              acc.push(<SegmentNameDisplay audienceSegmentId={v} key={v} onLoad={setState} />);
              if (i !== values.length - 1) acc.push(', ');
              return acc;
            }, [] as React.ReactNode[])}
          </span>
        );
      }
      if (modelType === 'CHANNELS') {
        return (
          <span title={this.state.objectName}>
            {values.reduce((acc, v, i) => {
              acc.push(
                <ChannelNameDisplay
                  datamartId={datamartId}
                  channelId={v}
                  key={v}
                  onLoad={setState}
                />,
              );
              if (i !== values.length - 1) acc.push(', ');
              return acc;
            }, [] as React.ReactNode[])}
          </span>
        );
      }
    }
    return this.renderStringValues(values);
  };

  renderValues = (comparison: QueryFieldComparisonShape) => {
    const { node } = this.props;

    const field = node.objectTypeInfo.fields.find(f => f.name === node.fieldNode.field)!;

    const modelAndType = getCoreReferenceTypeAndModel(field.directives);
    if (modelAndType)
      return this.renderReferenceTable(
        comparison.values,
        modelAndType.type,
        modelAndType.modelType,
      );

    switch (comparison.type) {
      case 'BOOLEAN':
        return (
          <span title={this.renderBooleanValues(comparison.values)}>
            {this.renderBooleanValues(comparison.values)}
          </span>
        );
      case 'TIME':
        return (
          <span title={this.renderDateValue(comparison.values)}>
            {this.renderDateValue(comparison.values)}
          </span>
        );
      case 'NUMERIC':
        return (
          <span title={this.renderStringValues(comparison.values)}>
            {this.renderStringValues(comparison.values)}
          </span>
        );
      case 'STRING':
        return (
          <span title={this.renderStringValues(comparison.values)}>
            {this.renderStringValues(comparison.values)}
          </span>
        );
      case 'ENUM':
        return (
          <span title={this.renderStringValues(comparison.values)}>
            {this.renderStringValues(comparison.values)}
          </span>
        );
      default:
        return (
          <span title={this.renderStringValues(comparison.values)}>
            {this.renderStringValues(comparison.values)}
          </span>
        );
    }
    return '';
  };

  render() {
    const { node } = this.props;
    const operator = node.fieldNode.comparison ? node.fieldNode.comparison.operator : null;

    const fieldInfo = node.objectTypeInfo.fields.find(f => f.name === node.fieldNode.field);
    const fieldName =
      fieldInfo &&
      fieldInfo.decorator &&
      fieldInfo.decorator.hidden === false &&
      fieldInfo.decorator.label
        ? fieldInfo.decorator.label
        : node.fieldNode.field;

    return (
      <div className='comparison'>
        <div
          style={{
            color: node.getColor(),
          }}
          className='fieldname'
        >
          {fieldName}
        </div>
        <div>
          <span className='operator'>
            {operator ? <FormattedMessage {...messages[operator as ComparisonOperator]} /> : null}
          </span>{' '}
          {node.fieldNode.comparison && node.fieldNode.comparison.values
            ? this.renderValues(node.fieldNode.comparison)
            : null}
        </div>
      </div>
    );
  }
}
