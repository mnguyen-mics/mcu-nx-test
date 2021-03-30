import * as React from 'react';
import { Tree } from 'antd';
import { SchemaItem, isSchemaItem, FieldInfoEnhancedResource } from '../domain';
import FieldNode from './FieldNode';
import FieldStandardNode from './FieldStandardNode';
import { DataNode } from 'antd/lib/tree';
import Search from 'antd/lib/input/Search';
import cuid from 'cuid';
import _ from 'lodash';

export interface SchemaVizualizerProps {
  schema?: SchemaItem;
  disableDragAndDrop?: boolean;
}

export interface SchemaVizualizerState {
  searchValue: string;
  expandedKeys: string[];
  treeData: DataNode[] | undefined;
}

export default class SchemaVizualizer extends React.Component<
  SchemaVizualizerProps,
  SchemaVizualizerState
> {
  private debouncedLoop: (
    gData: SchemaItem,
    objectType?: string,
    searchString?: string,
    disableDragAndDrop?: boolean,
  ) => void;
  constructor(props: SchemaVizualizerProps) {
    super(props);
    this.state = {
      searchValue: '',
      expandedKeys: [],
      treeData: [],
    };
    this.debouncedLoop = _.debounce(
      (
        gData: SchemaItem,
        objectType?: string,
        searchString?: string,
        disableDragAndDrop?: boolean,
      ) =>
        this.setState({
          treeData: this.loop(
            gData,
            objectType,
            searchString,
            disableDragAndDrop,
          ),
        }),
      300,
    );
  }

  onExpand = (expandedKeys: string[]) => {
    this.setState({
      expandedKeys: expandedKeys,
    });
  };

  isIncludedInUnderlyingItems(
    item: SchemaItem,
    searchString?: string,
  ): boolean {
    return (
      item &&
      item.fields &&
      item.fields.some(field => {
        if (isSchemaItem(field)) {
          if (
            searchString &&
            (field.decorator
              ? field.decorator.label
                  .toLowerCase()
                  .includes(searchString.toLowerCase())
              : field.name.toLowerCase().includes(searchString.toLowerCase()))
          )
            return true;
          return this.isIncludedInUnderlyingItems(field, searchString);
        }
        if (
          searchString &&
          (field.decorator
            ? field.decorator.label
                .toLowerCase()
                .includes(searchString.toLowerCase())
            : field.name.toLowerCase().includes(searchString.toLowerCase()))
        )
          return true;
        return false;
      })
    );
  }
  // To avoid Tree loosing its state of expanded/collapsed nodes
  // we disable component update.
  // Since schema or disableDragAndDrop props should not change when this component
  // is first mounted, I believe it is safe to disable component update.
  shouldComponentUpdate(
    nextProps: SchemaVizualizerProps,
    nextState: SchemaVizualizerState,
  ) {
    if (
      this.state.searchValue !== nextState.searchValue ||
      this.state.expandedKeys !== nextState.expandedKeys ||
      this.state.treeData !== nextState.treeData ||
      this.props.schema?.id !== nextProps.schema?.id
    )
      return true;
    return false;
  }

  unfilteredLoop = (
    gData: SchemaItem,
    objectType?: string,
    disableDragAndDrop?: boolean,
    searchString?: string,
  ) =>
    gData &&
    gData.fields.map(
      (item): DataNode => {
        if (isSchemaItem(item)) {
          return {
            title: disableDragAndDrop ? (
              <FieldStandardNode
                id={item.id}
                item={item}
                type="object"
                searchString={searchString}
                hasChildren={true}
              />
            ) : (
              <FieldNode
                id={item.id}
                item={item}
                type="object"
                searchString={searchString}
                hasChildren={true}
              />
            ),
            key: cuid(),
            selectable: false,
            className: 'mcs-schemaVizualizer_fieldNode_parent',
            children: this.unfilteredLoop(
              item,
              item.schemaType,
              disableDragAndDrop,
              searchString,
            ),
          };
        }
        return {
          title: disableDragAndDrop ? (
            <FieldStandardNode
              id={item.id}
              type="field"
              schemaType={objectType}
              item={item as FieldInfoEnhancedResource}
              searchString={searchString}
            />
          ) : (
            <FieldNode
              id={item.id}
              type="field"
              schemaType={objectType}
              item={item as FieldInfoEnhancedResource}
              searchString={searchString}
            />
          ),
          key: cuid(),
          className: 'mcs-schemaVizualizer_fieldNode_child',
          selectable: false,
        };
      },
    );
  loop = (
    gData: SchemaItem,
    objectType?: string,
    searchString?: string,
    disableDragAndDrop?: boolean,
  ) =>
    gData &&
    gData.fields
      .filter(item => {
        if (
          isSchemaItem(item) &&
          searchString &&
          !(item.decorator
            ? item.decorator.label
                .toLowerCase()
                .includes(searchString.toLowerCase())
            : item.name.toLowerCase().includes(searchString.toLowerCase())) &&
          !this.isIncludedInUnderlyingItems(item, searchString)
        )
          return false;
        if (
          !isSchemaItem(item) &&
          searchString &&
          !(item.decorator
            ? item.decorator.label
                .toLowerCase()
                .includes(searchString.toLowerCase())
            : item.name.toLowerCase().includes(searchString.toLowerCase()))
        )
          return false;
        return true;
      })
      .map(
        (item): DataNode => {
          if (
            isSchemaItem(item) &&
            searchString &&
            (item.decorator
              ? item.decorator.label
                  .toLowerCase()
                  .includes(searchString.toLowerCase())
              : item.name.toLowerCase().includes(searchString.toLowerCase()))
          ) {
            return {
              title: disableDragAndDrop ? (
                <FieldStandardNode
                  id={item.id}
                  item={item}
                  type="object"
                  searchString={searchString}
                  hasChildren={true}
                />
              ) : (
                <FieldNode
                  id={item.id}
                  item={item}
                  type="object"
                  searchString={searchString}
                  hasChildren={true}
                />
              ),
              key: cuid(),
              className: 'mcs-schemaVizualizer_fieldNode_parent',
              selectable: false,
              children: this.unfilteredLoop(
                item,
                item.schemaType,
                disableDragAndDrop,
                searchString,
              ),
            };
          }
          if (isSchemaItem(item)) {
            return {
              title: disableDragAndDrop ? (
                <FieldStandardNode
                  id={item.id}
                  item={item}
                  type="object"
                  searchString={searchString}
                  hasChildren={true}
                />
              ) : (
                <FieldNode
                  id={item.id}
                  item={item}
                  type="object"
                  searchString={searchString}
                  hasChildren={true}
                />
              ),
              key: cuid(),
              className: 'mcs-schemaVizualizer_fieldNode_parent',
              selectable: false,
              children: this.loop(
                item,
                item.schemaType,
                searchString,
                disableDragAndDrop,
              ),
            };
          }
          return {
            title: disableDragAndDrop ? (
              <FieldStandardNode
                id={item.id}
                type="field"
                schemaType={objectType}
                item={item as FieldInfoEnhancedResource}
                searchString={searchString}
              />
            ) : (
              <FieldNode
                id={item.id}
                type="field"
                schemaType={objectType}
                item={item as FieldInfoEnhancedResource}
                searchString={searchString}
              />
            ),
            key: cuid(),
            className: 'mcs-schemaVizualizer_fieldNode_child',
            selectable: false,
          };
        },
      );

  componentDidUpdate(
    previousProps: SchemaVizualizerProps,
    previousState: SchemaVizualizerState,
  ) {
    const { schema, disableDragAndDrop } = this.props;
    if (
      previousState.treeData !== this.state.treeData &&
      this.state.searchValue &&
      this.state.treeData
    ) {
      this.setState({
        expandedKeys: this.getExpandedKeys(this.state.treeData, []),
      });
    }
    if (
      this.props.schema &&
      previousProps.schema &&
      this.props.schema !== previousProps.schema
    )
      this.setState({
        treeData: schema
          ? this.loop(
              schema,
              undefined,
              this.state.searchValue,
              disableDragAndDrop,
            )
          : [],
      });
  }

  componentDidMount() {
    const { schema, disableDragAndDrop } = this.props;
    this.setState({
      treeData: schema
        ? this.loop(
            schema,
            undefined,
            this.state.searchValue,
            disableDragAndDrop,
          )
        : [],
    });
  }

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { schema, disableDragAndDrop } = this.props;
    this.setState({
      searchValue: e.target.value,
    });
    if (schema)
      this.debouncedLoop(schema, undefined, e.target.value, disableDragAndDrop);
  };

  getExpandedKeys = (tree: DataNode[], expandedKeys: string[]): string[] => {
    tree.map(node => {
      if (node.children && node.children.length > 0)
        expandedKeys.concat(this.getExpandedKeys(node.children, expandedKeys));
      expandedKeys.push(node.key.toString());
    });
    return expandedKeys;
  };

  render() {
    const { schema } = this.props;
    const { expandedKeys, treeData } = this.state;

    return schema ? (
      <div className="mcs-schemaVizualize_content">
        <Search
          className="mcs-schemaVizualizer_search_bar"
          placeholder="Search"
          onChange={this.onChange}
        />
        <Tree
          onExpand={this.onExpand}
          autoExpandParent={false}
          expandedKeys={expandedKeys}
          treeData={treeData}
        />
      </div>
    ) : null;
  }
}
