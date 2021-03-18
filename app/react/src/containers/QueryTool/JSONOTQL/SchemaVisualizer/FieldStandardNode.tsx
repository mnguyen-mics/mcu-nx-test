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
  searchString?: string;
}

class FieldNode extends React.Component<FieldNodeProps, any> {
  formatString(search: string, expression: string): string[] {
    const diplayableString: string[] = [];
    const index = expression.toLowerCase().indexOf(search.toLowerCase());
    diplayableString.push(expression.substring(0, index));
    diplayableString.push(expression.substring(index, search.length + index));
    diplayableString.push(expression.substring(index + search.length));
    return diplayableString;
  }

  render() {
    const { item, type, searchString } = this.props;
    const itemName = item.name;

    const Fieldtype =
      type === 'object'
        ? (item as SchemaItem).schemaType
        : (item as FieldInfoEnhancedResource).field_type;
    let helper = (
      <span className="field-type">
        {Fieldtype} <McsIcon type="dots" />
      </span>
    );

    if (
      item.decorator &&
      item.decorator.hidden === false &&
      item.decorator.help_text
    ) {
      const helptext = `${item.decorator.help_text} - ${Fieldtype}`;
      const id = cuid();
      const getPopupContainer = () => document.getElementById(id)!;
      helper = (
        <span className="field-type" id={id}>
          <Tooltip
            placement="left"
            title={helptext}
            getPopupContainer={getPopupContainer}>
            <McsIcon type="question" />
          </Tooltip>
        </span>
      );
    }

    return (
      <div className={`field-node-item`}>
        <div>
          {searchString &&
          itemName.toLocaleLowerCase().includes(searchString.toLowerCase())
            ? this.formatString(searchString, itemName).map(expr => {
                if (expr.toLowerCase() === searchString.toLowerCase())
                  return <b className="mcs-shcemaFieldNode_search">{expr}</b>;
                return expr;
              })
            : itemName}
          {helper}
        </div>
      </div>
    );
  }
}

export default FieldNode;
