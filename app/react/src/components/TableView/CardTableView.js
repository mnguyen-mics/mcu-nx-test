import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Pagination, Spin } from 'antd';
import CreativeCard from './CreativeCard';


function CardTableView(props) {

  const {
    dataSource,
    dataDefinition,
    gutter,
    span,
    pagination,
    loading,
  } = props;

  return loading ? (<Row style={{ height: '350px' }}><Row className="mcs-aligner"><Spin /></Row></Row>) : (
    <Row className="mcs-table-card">
      <Row gutter={gutter}>
        {dataSource.map(item => {
          return (
            <Col span={span} key={item.id}>
              <CreativeCard item={item} cover={dataDefinition.cover} title={dataDefinition.title} subtitles={dataDefinition.subtitles} footer={dataDefinition.footer} />
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

CardTableView.defaultProps = {
  gutter: 20,
  span: 6,
  loading: false,
};

CardTableView.propTypes = {
  dataSource: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  dataDefinition: PropTypes.shape({
    cover: PropTypes.shape({
      key: PropTypes.string.isRequired,
      render: PropTypes.func.isRequired,
    }).isRequired,
    title: PropTypes.shape({
      key: PropTypes.string.isRequired,
      render: PropTypes.func.isRequired,
    }).isRequired,
    subtitles: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.string.isRequired,
      render: PropTypes.func.isRequired,
    }).isRequired),
    footer: PropTypes.shape({
      key: PropTypes.string.isRequired,
      render: PropTypes.func.isRequired,
    }).isRequired,
  }).isRequired,
  gutter: PropTypes.number,
  span: PropTypes.number,
  loading: PropTypes.bool,
  pagination: PropTypes.shape().isRequired,
};

export default CardTableView;
