import * as React from 'react';
import { Col, Row } from 'antd';

import McsIcons, { McsIconType } from '../McsIcons';
import ButtonStyleless from '../ButtonStyleless';

type RenderItem<T> = (record: T) => React.ReactNode;

interface RecordElementProps<T> {
  recordIconType: McsIconType;
  onEdit?: (record: T) => void;
  onRemove?: (record: T) => void;
  record: T;
  title: RenderItem<T>;
  additionalData?: RenderItem<T>;
  additionalActionButtons?: RenderItem<T>;
}

class RecordElement<T> extends React.Component<RecordElementProps<T>> {
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
    } = this.props;

    return (
      <Row className="related-record row-height">
        <Col style={{ width: 60 }}>
          <div className="icon-round-border">
            <McsIcons type={recordIconType} />
          </div>
        </Col>

        <Col className={this.computeDataClass()}>{title(record)}</Col>
        {additionalData && (
          <Col className={this.computeDataClass()}>
            {additionalData(record)}
          </Col>
        )}

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
            <McsIcons type="pen" additionalClass="big" />
          </ButtonStyleless>
        )}
        {onRemove && (
          <ButtonStyleless
            className="action-button"
            onClick={this.removeTableField}
          >
            <McsIcons type="delete" additionalClass="big" />
          </ButtonStyleless>
        )}
      </Row>
    );
  }
}

export default RecordElement;
