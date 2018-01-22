import * as React from 'react';
import { Row, Col, Input } from 'antd';
import { SearchProps } from 'antd/lib/input/Search';

import CollectionView, { CollectionViewProps } from './CollectionView';

const Search = Input.Search;

export interface CollectionViewFiltersProps extends CollectionViewProps {
  searchOptions?: SearchProps;
}

class CollectionViewFilters extends React.Component<CollectionViewFiltersProps> {

  render() {

    const {
      searchOptions,
    } = this.props;

    const searchInput = searchOptions
      ? (
        <Search
          className="mcs-search-input"
          {...searchOptions}
        />
      ) : null;

    return (
      <Row>
        <Row className="mcs-table-header">
          <Col span={24}>
            {searchInput}
          </Col>
        </Row>
        <Row className="mcs-table-body">
          <Col span={24}>
            <CollectionView
              {...this.props}
            />
          </Col>
        </Row>
      </Row>
    );
  }
}

export default CollectionViewFilters;
