import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Row, Col } from 'antd';
import cuid from 'cuid';

import messages from '../messages';
import McsIcon from '../../../../../components/McsIcon';

import { FormSection } from '../../../../../components/Form';
import { QueryBooleanOperator } from '../../../../../models/datamart/graphdb/QueryDocument';
// import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { FormItemProps } from 'antd/lib/form';
import { FieldNodeFormData } from '../domain';
import {
  FieldInfoResource,
  ObjectLikeTypeInfoResource,
} from '../../../../../models/datamart/graphdb/RuntimeSchema';
import FieldNodeForm from './Field/FieldNodeForm';

export interface FieldNodeSectionProps {
  formItemProps?: FormItemProps;
  availableFields: FieldInfoResource[];
  booleanOperator: QueryBooleanOperator;
  onBooleanOperatorChange: (value: QueryBooleanOperator) => void;
  formChange: (fieldName: string, fieldValue: any) => void;
  objectType: ObjectLikeTypeInfoResource;
  datamartId: string;
  runtimeSchemaId: string;
  formName?: string;
  title: FormattedMessage.MessageDescriptor;
  subtitle: FormattedMessage.MessageDescriptor;
  disabled?: boolean;
  isEdge?: boolean;
}

type JoinedProps = InjectedIntlProps &
  FieldNodeSectionProps &
  WrappedFieldArrayProps<FieldNodeFormData>;

class FieldNodeSection extends React.Component<JoinedProps> {
  render() {
    const {
      fields,
      intl,
      availableFields,
      formChange,
      onBooleanOperatorChange,
      booleanOperator,
      objectType,
      datamartId,
      runtimeSchemaId,
      formName,
      title,
      subtitle,
      disabled,
      isEdge,
    } = this.props;

    const handleOnClick = () =>
      fields.push({
        type: 'FIELD',
        field: '',
        key: cuid(),
      });

    let renderedFields = fields.map((name, index, _fields) => {
      const handleRemove = () => fields.remove(index);
      return (
        <div className={'form-input-group'} key={_fields.get(index).key}>
          {!disabled && (
            <div className={'action-buttons'} onClick={handleRemove}>
              <McsIcon type="close" />
            </div>
          )}
          <div>
            <FieldNodeForm
              formChange={formChange}
              name={name}
              expressionIndex={index}
              availableFields={availableFields}
              objectType={objectType}
              datamartId={datamartId}
              runtimeSchemaId={runtimeSchemaId}
              formName={formName}
              disabled={disabled}
              isEdge={isEdge}
            />
          </div>
        </div>
      );
    });

    const onClick = () =>
      onBooleanOperatorChange(booleanOperator === 'OR' ? 'AND' : 'OR');

    const generateOperator = (key: string) => {
      return (
        <div key={key} className={'form-input-group-separator'}>
          <div className="wrapper">
            <div className={'item'}>
              <input
                id={key}
                className="tgl tgl-operator"
                type="checkbox"
                checked={booleanOperator === 'OR' ? true : false}
                onChange={onClick}
              />
              <label
                className="tgl-btn"
                data-tg-off="AND"
                data-tg-on="OR"
                htmlFor={key}
              />
            </div>
          </div>
        </div>
      );
    };

    renderedFields = renderedFields.reduce(
      (r, a, i) =>
        i === renderedFields.length - 1
          ? r.concat(a)
          : r.concat(a, generateOperator(`operator${i}`)),
      [] as JSX.Element[],
    );

    return (
      <div>
        <FormSection title={title} subtitle={subtitle} />
        <div className="form-field-wrapper">{renderedFields}</div>
        {!disabled && (
          <Row>
            <Col span={24}>
              <div onClick={handleOnClick}>
                <Col span={24} className="add-field-button">
                  <p>
                    <McsIcon type="plus" />
                    {intl.formatMessage(messages.fieldConditionAdditionButton)}
                  </p>
                </Col>
              </div>
            </Col>
          </Row>
        )}
      </div>
    );
  }
}

export default injectIntl(FieldNodeSection);
