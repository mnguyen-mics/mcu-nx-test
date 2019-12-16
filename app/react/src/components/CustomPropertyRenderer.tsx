import * as React from 'react';
import { Tooltip, Tag } from 'antd';

interface CustomPropertyRendererProps {
  name?: string;
  value: any;
  nameNewLineValue?: boolean;
}

class CustomPropertyRenderer extends React.Component<
  CustomPropertyRendererProps
> {
  render() {
    const { name, value, nameNewLineValue } = this.props;

    return name ? (
      <div className={nameNewLineValue ? "PropertyWithNameAndNewLine" : "PropertyWithNameNoNewLine"}>
        <Tooltip title={name}>
          <Tag className="card-tag">{name}</Tag>
        </Tooltip>
        {' : '}
        {nameNewLineValue && <br />}
        {value}
      </div>
    ) : (
      <span className="PropertyValueOnly">{value}</span>
    );
  }
}

export default CustomPropertyRenderer;
