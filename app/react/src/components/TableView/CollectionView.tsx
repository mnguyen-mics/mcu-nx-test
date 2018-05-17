import * as React from 'react';
import { Row, Col, Spin } from 'antd';
import cuid from 'cuid';
import Pagination, { PaginationProps } from 'antd/lib/pagination/Pagination';

export interface CollectionViewProps {
  collectionItems: JSX.Element[];
  pagination?: PaginationProps;
  gutter?: number;
  span?: number;
  loading?: boolean;
}

class CollectionView extends React.Component<CollectionViewProps> {

  static defaultProps: Partial<CollectionViewProps> = {
    gutter: 20,
    span: 6,
    loading: false,
  };

  render() {
    const {
      collectionItems,
      gutter,
      span,
      pagination,
      loading,
    } = this.props;

    return loading ? (<Row style={{ height: '350px' }}><Row className="mcs-aligner"><Spin /></Row></Row>) : (
      <Row className="mcs-table-card">
        <Row gutter={gutter}>
          {collectionItems.map(item => {
            return (
              <Col key={item.key || cuid()} span={span!}>
                {item}
              </Col>
            );
          })}
        </Row>
        { pagination &&
          <Row className="text-right">
            <Pagination {...pagination} />
          </Row>
        }
      </Row>
    );
  }

}

export default CollectionView;
