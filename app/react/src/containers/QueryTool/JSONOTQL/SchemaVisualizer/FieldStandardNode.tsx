import * as React from 'react';
import { SchemaItem, FieldInfoEnhancedResource } from '../domain';
import { Tooltip } from 'antd';
import cuid from 'cuid';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

export type FieldNodeProps = FieldNodeObjectProps | FieldNodeFieldProps;


interface FieldNodeObjectProps extends FieldNodeCommonProps {
  type: 'object';
  item: SchemaItem;
}

interface FieldNodeFieldProps extends FieldNodeCommonProps {
  type: 'field';
  item: FieldInfoEnhancedResource;
}

interface FieldNodeCommonProps {
  id: string;
  schemaType?: string;
}


class FieldNode extends React.Component<FieldNodeProps, any> {

  render() {
    const { item, type } = this.props;
    const itemName = item.name;

    const Fieldtype = type === 'object' ? (item as SchemaItem).schemaType : (item as FieldInfoEnhancedResource).field_type;
    let helper = (<span className="field-type">{Fieldtype} <McsIcon type="dots" /></span>);

    if (item.decorator && item.decorator.hidden === false && item.decorator.help_text) {
      const helptext = `${item.decorator.help_text} - ${Fieldtype}`;
      const id = cuid();
      const getPopupContainer = () => document.getElementById(id)!
      helper = (<span className="field-type" id={id}><Tooltip placement="left" title={helptext} getPopupContainer={getPopupContainer}><McsIcon type="question" /></Tooltip></span>);
    }

    return (
      <div className={`field-node-item`}>
        <div>{itemName} {helper}</div>
      </div>
    );
  }
}

export default FieldNode;
