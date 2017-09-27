import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Pagination, Spin } from 'antd';


function CollectionView(props) {

  const {
    collectionItems,
    gutter,
    span,
    pagination,
    loading,
  } = props;

  return loading ? (<Row style={{ height: '350px' }}><Row className="mcs-aligner"><Spin /></Row></Row>) : (
    <Row className="mcs-table-card">
      <Row gutter={gutter}>
        {collectionItems && collectionItems.map(item => {
          return (
            <Col key={item.key} span={span}>
              { item }
            </Col>
          );
        })}

      </Row>
      <Row className="text-right">
        <Pagination {...pagination} />
      </Row>
    </Row>
  );
}

CollectionView.defaultProps = {
  gutter: 20,
  span: 6,
  loading: false,
  collectionItems: null
};

CollectionView.propTypes = {
  collectionItems: PropTypes.arrayOf(PropTypes.element.isRequired),
  gutter: PropTypes.number,
  span: PropTypes.number,
  loading: PropTypes.bool,
  pagination: PropTypes.shape().isRequired,
};

export default CollectionView;
