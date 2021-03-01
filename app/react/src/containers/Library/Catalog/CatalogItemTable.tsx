import * as React from 'react';
import { ItemRessource } from '../../../models/catalog/catalog';
import { Table, Row, Col, Tag } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';


export interface CatalogItemTableProps {
  records: ItemRessource[];
}

type Props = InjectedIntlProps & CatalogItemTableProps;

class CatalogItemTable extends React.Component<Props, any> {

  expandedItemRowRender = (record: ItemRessource) => {

    const properties = {
      ...record.properties,
      ...record.overriding_properties,
    }
    
    return (
      <Row gutter={24}>
        {properties.$image_link && <Col span={6}>
          <img src={properties.$image_link} style={{ width: '100%' }} />
        </Col>}
        <Col span={properties.$image_link ? 18 : 24}>
          <div><Tag>Item Id</Tag>: <code>{record.item_id}</code></div>
          {Object.keys(properties).map(i => {
            switch(i) {
              case '$link':
                return <div key={i}><Tag>{i}</Tag>: <a href={properties[i]} target="_blank">{properties[i]}</a></div>
              default:
                return <div key={i}><Tag>{i}</Tag>: {properties[i]}</div>
            }
            
          })}
        </Col>
      </Row>
    )
  }
  
  render() {
    const {
      intl
    } = this.props;
    const getClassName = () => {
      return "mcs-table-cursor"
    }
    return (
      <Table<ItemRessource> 
        columns={[
          {
            title: intl.formatMessage(messages.brand),
            render: (test, record) => record.properties.$brand
          },
          {
            title: intl.formatMessage(messages.title),
            render: (test, record) => record.properties.$title
          },
          {
            title: intl.formatMessage(messages.product_type),
            render: (test, record) => record.properties.$product_type
          },
          
        ]}
        dataSource={this.props.records}
        expandedRowRender={this.expandedItemRowRender}
        rowClassName={getClassName}
        rowKey='item_id'
        pagination={{
          size: 'small',
          showSizeChanger: true,
          hideOnSinglePage: true,
        }}
      />
    );
  }
}

export default compose<Props, CatalogItemTableProps>(
  injectIntl
)(CatalogItemTable)