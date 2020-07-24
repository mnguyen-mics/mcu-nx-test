import * as React from 'react';
import { Col, Row, Popconfirm } from 'antd';

import McsIcon, { McsIconType } from '../McsIcon';
import ButtonStyleless from '../ButtonStyleless';
import { defineMessages, InjectedIntlProps, injectIntl } from 'react-intl';

type RenderItem<T> = (record: T) => React.ReactNode;

const messages = defineMessages({
  removeRecordElement: {
    id: 'popconfirm.remove.record.element',
    defaultMessage: 'Are you sure delete this item?',
  },
});

interface RecordElementProps<T> {
  recordIconType: McsIconType;
  onEdit?: (record: T) => void;
  onRemove?: (record: T) => void;
  record: T;
  title: RenderItem<T>;
  additionalData?: RenderItem<T>;
  additionalActionButtons?: RenderItem<T>;
  editable?: boolean;
}

class RecordElement<T> extends React.Component<
  RecordElementProps<T> & InjectedIntlProps
> {
  editTableField = () =>
    this.props.onEdit && this.props.onEdit(this.props.record);

  removeTableField = () =>
    this.props.onRemove && this.props.onRemove(this.props.record);

  computeDataClass = () => {
    const { additionalData, additionalActionButtons } = this.props;

    if (additionalData && additionalActionButtons) {
      return 'additional-data-action-buttons';
    } else if (additionalData || additionalActionButtons) {
      return 'additional-data';
    } else if (!additionalData && !additionalActionButtons) {
      return 'data';
    }
    return 'data';
  };

  render() {
    const {
      recordIconType,
      title,
      additionalData,
      additionalActionButtons,
      onEdit,
      onRemove,
      record,
      intl,
      editable,
    } = this.props;

    const nonEditable = editable !== undefined && editable === false;

    const className = `${
      nonEditable ? 'non-editable-related-record' : 'related-record'
    } row-height`;

    const additionalElements = nonEditable ? (
      undefined
    ) : (
      <div>
        {additionalActionButtons && (
          <Col className={`${this.computeDataClass()} text-right m-r-20`}>
            {additionalActionButtons(record)}
          </Col>
        )}
        {onEdit && (
          <ButtonStyleless
            className="action-button"
            onClick={this.editTableField}
          >
            <McsIcon type="pen" className="big" />
          </ButtonStyleless>
        )}
        {onRemove && (
          <Popconfirm
            title={intl.formatMessage(messages.removeRecordElement)}
            onConfirm={this.removeTableField}
            okText="Yes"
            cancelText="No"
          >
            <div className="action-button" style={{ cursor: 'pointer' }}>
              <McsIcon type="delete" className="big" />
            </div>
          </Popconfirm>
        )}
      </div>
    );

    return (
      <Row className={className}>
        <Col style={{ width: 60 }}>
          <div className="icon-round-border">
            <McsIcon type={recordIconType} />
          </div>
        </Col>

        <Col className={this.computeDataClass()}>{title(record)}</Col>
        {additionalData && (
          <Col className={this.computeDataClass()}>
            {additionalData(record)}
          </Col>
        )}
        {additionalElements}
      </Row>
    );
  }
}

export default injectIntl(RecordElement);
