import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import { injectIntl, InjectedIntlProps, FormattedMessage, defineMessages } from 'react-intl';
import { Row, Col } from 'antd';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { FormItemProps } from 'antd/lib/form';
import { QueryBooleanOperator } from '../../../../../../models/datamart/graphdb/QueryDocument';
import EventPropertyForm, {
  EventPropertyFormData,
  EventPropertyFormProps,
} from './EventPropertyForm';
import { FormSection } from '../../../../../../components/Form';

export type EventPropertyFormSectionProps = {
  formItemProps?: FormItemProps;
  booleanOperator: QueryBooleanOperator;
  onBooleanOperatorChange?: (value: QueryBooleanOperator) => void;
  formChange: (fieldName: string, fieldValue: any) => void;
  title: FormattedMessage.MessageDescriptor;
  subtitle: FormattedMessage.MessageDescriptor;
  disabled?: boolean;
  isEdge?: boolean;
  filterOutFields: string[];
} & EventPropertyFormProps;

type Props = InjectedIntlProps &
  EventPropertyFormSectionProps &
  WrappedFieldArrayProps<EventPropertyFormData>;

class EventPropertyFormSection extends React.Component<Props> {
  render() {
    const {
      fields,
      intl,
      onBooleanOperatorChange,
      booleanOperator,
      sourceObjectType,
      objectTypes,
      datamartId,
      runtimeSchemaId,
      formId,
      title,
      subtitle,
      disabled,
      filterOutFields,
      formChange,
    } = this.props;

    const handleOnClick = () =>
      fields.push({
        value: '',
      });

    let renderedFields = fields.map((name, index, _fields) => {
      const handleRemove = () => fields.remove(index);
      return (
        <div className={'form-input-group'} key={index}>
          {!disabled && (
            <div className={'action-buttons'} onClick={handleRemove}>
              <McsIcon type='close' />
            </div>
          )}
          <div>
            <EventPropertyForm
              name={name}
              formId={formId}
              sourceObjectType={sourceObjectType}
              objectTypes={objectTypes}
              datamartId={datamartId}
              runtimeSchemaId={runtimeSchemaId}
              filterOutFields={filterOutFields}
              formChange={formChange}
              disabled={disabled}
            />
          </div>
        </div>
      );
    });

    const onClick = () =>
      onBooleanOperatorChange && onBooleanOperatorChange(booleanOperator === 'OR' ? 'AND' : 'OR');

    const generateOperator = (key: string) => {
      return (
        <div key={key} className={'form-input-group-separator'}>
          <div className='wrapper'>
            <div className={'item'}>
              <input
                id={key}
                className='tgl tgl-operator'
                type='checkbox'
                checked={booleanOperator === 'OR' ? true : false}
                onChange={onClick}
              />
              <label className='tgl-btn' data-tg-off='AND' data-tg-on='OR' htmlFor={key} />
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
        <div className='form-field-wrapper'>{renderedFields}</div>
        {!disabled && (
          <Row>
            <Col span={24}>
              <div onClick={handleOnClick}>
                <Col span={24} className='add-field-button'>
                  <p>
                    <McsIcon type='plus' />
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

export default injectIntl(EventPropertyFormSection);

const messages = defineMessages({
  fieldConditionAdditionButton: {
    id: 'eventPropertyFormSection.additionButton',
    defaultMessage: 'Add a Field Condition',
  },
});
