import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Row, Col } from 'antd';
import cuid from 'cuid';

import messages from '../messages';
import McsIcon from '../../../../../components/McsIcon';

import { FormSection } from '../../../../../components/Form';
import { QueryBooleanOperator } from '../../../../../models/datamart/graphdb/QueryDocument';
// import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { FormItemProps } from 'antd/lib/form';
import { FieldNodeFormData } from '../domain';
import { FieldResource } from '../../../../../models/datamart/graphdb/RuntimeSchema';
import FieldNodeForm from './Field/FieldNodeForm';

export interface FieldNodeSectionProps {
  formItemProps?: FormItemProps;
  availableFields: FieldResource[];
  booleanOperator: QueryBooleanOperator;
  onBooleanOperatorChange: (value: QueryBooleanOperator) => void;
  formChange: (fieldName: string, fieldValue: any) => void;
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
        // <CSSTransition
        //   key={_fields.get(index).key}
        //   timeout={{
        //     enter: 500,
        //     exit: 100,
        //   }}
        //   classNames={{
        //     enter: 'fade-enter',
        //     enterActive: 'fade-enter-active',
        //     exit: 'fade-exit',
        //     exitActive: 'fade-exit-active',
        //   }}
        // >
          <div className={'form-input-group'} key={_fields.get(index).key}>
            <div className={'action-buttons'} onClick={handleRemove}>
              <McsIcon type="close" />
            </div>
            <div>
              <FieldNodeForm
                formChange={formChange}
                name={name}
                expressionIndex={index}
                availableFields={availableFields}
              />
            </div>
          </div>
        // </CSSTransition>
      );
    });

    const onClick = () =>
      onBooleanOperatorChange(booleanOperator === 'OR' ? 'AND' : 'OR');

    const generateOperator = (key: string) => {
      return (
        // <CSSTransition
        //   key={key}
        //   timeout={500}
        //   classNames={{
        //     enter: 'fade-enter',
        //     enterActive: 'fade-enter-active',
        //     exit: 'fade-exit',
        //     exitActive: 'fade-exit-active',
        //   }}
        // >
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
        // </CSSTransition>
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
        <FormSection
          subtitle={messages.fieldConditionSubTitle}
          title={messages.fieldConditionTitle}
        />
        <div className="form-field-wrapper">
          {/* <TransitionGroup>{renderedFields}</TransitionGroup> */}
          {renderedFields}
        </div>
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
      </div>
    );
  }
}

export default injectIntl(FieldNodeSection);
