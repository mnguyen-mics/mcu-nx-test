import * as React from 'react';
import { Row, Col } from 'antd';
import { ImportFilterParams } from '../../../../Imports/List/ImportsContent';
import ImportsContentContainer from '../../../../Imports/List/ImportsContentContainer';

export interface DatamartConfigTabProps {
  datamartId: string;
}

interface State {
  importFilters: ImportFilterParams;
}

export default class DatamartConfigTab extends React.Component<
  DatamartConfigTabProps,
  State
> {
  constructor(props: DatamartConfigTabProps) {
    super(props);
    this.state = {
      importFilters: {
        currentPage: 1,
        pageSize: 10,
        keywords: '',
      },
    };
  }

  onImportFilterChange = (newFilter: ImportFilterParams) => {
    const { currentPage, pageSize, keywords } = newFilter;

    const importFilter = {
      currentPage: currentPage,
      pageSize: pageSize,
      keywords: keywords,
    };

    this.setState({
      importFilters: importFilter,
    });
  };

  public render() {
    const { datamartId } = this.props;

    const { importFilters } = this.state;

    return (
      <div>
        <Row className="ant-layout">
          <Col className="mcs-content-container ant-layout-content">
            <ImportsContentContainer
              datamartId={datamartId}
              filter={importFilters}
              onFilterChange={this.onImportFilterChange}
              noFilterDatamart={true}
            />
          </Col>
        </Row>
      </div>
    );
  }
}
