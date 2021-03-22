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

interface FieldNodeState {
  truncated: boolean;
}

interface FieldNodeCommonProps {
  id: string;
  schemaType?: string;
  searchString?: string;
  hasChildren?: boolean;
}

class FieldNode extends React.Component<FieldNodeProps, FieldNodeState> {
  contentRef: React.RefObject<HTMLDivElement>;
  formatString(search: string, expression: string): string[] {
    const diplayableString: string[] = [];
    const index = expression.toLowerCase().indexOf(search.toLowerCase());
    diplayableString.push(expression.substring(0, index));
    diplayableString.push(expression.substring(index, search.length + index));
    diplayableString.push(expression.substring(index + search.length));
    return diplayableString;
  }
  constructor(props: FieldNodeProps) {
    super(props);
    this.state = {
      truncated: false,
    };
    this.contentRef = React.createRef();
  }
  componentDidMount() {
    if (
      this.contentRef &&
      this.contentRef.current &&
      this.contentRef.current?.offsetWidth <
        this.contentRef.current?.scrollWidth
    )
      this.setState({
        truncated: true,
      });
  }

  render() {
    const { item, type, searchString, hasChildren } = this.props;
    const { truncated } = this.state;
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
      <div className={`field-node-item ${hasChildren ? '' : 'mcs-fieldNode_child'}`}>
        <Tooltip
          color="#fafafa"
          overlayClassName="mcs-fieldNode_truncated_tooltip"
          title={truncated ? itemName : undefined}>
          <div
            ref={this.contentRef}
            className={`mcs-fieldNode_content ${
              hasChildren ? 'mcs-fieldNode_parent' : ''
            }`}>
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
        </Tooltip>
      </div>
    );
  }
}

export default FieldNode;
