import * as React from 'react';
import { Row, Col } from 'antd';
import { compose } from 'recompose';
import { MobileApplicationsListPage } from '../../MobileApplications/List';
import { SitesListPage } from '../../Sites/List';
import { PaginationSearchSettings } from '../../../../../utils/LocationSearchHelper';
import CompartmentsContainer from '../../Compartments/List/CompartmentsContainer';
import { injectFeatures, InjectedFeaturesProps } from '../../../../Features';

export interface DatamartConfigTabProps {
  datamartId: string;
}

interface State {
  compartmentsFilter: PaginationSearchSettings;
}

type Props = DatamartConfigTabProps & InjectedFeaturesProps;

class DatamartConfigTab extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      compartmentsFilter: {
        currentPage: 1,
        pageSize: 10,
      },
    };
  }

  onCompartmentsFilterChange = (newFilter: PaginationSearchSettings) => {
    const { currentPage, pageSize } = newFilter;

    const compartmentsFilter = {
      currentPage: currentPage,
      pageSize: pageSize,
    };

    this.setState({
      compartmentsFilter: compartmentsFilter,
    });
  };

  public render() {
    const { datamartId } = this.props;

    const { compartmentsFilter } = this.state;

    return (
      <div>
        <Row>
          <Col>
            <MobileApplicationsListPage datamartId={datamartId} />
          </Col>
        </Row>
        <Row>
          <Col>
            <SitesListPage datamartId={datamartId} />
          </Col>
        </Row>
        <Row>
          <Col>
            <CompartmentsContainer
              datamartId={datamartId}
              filter={compartmentsFilter}
              onFilterChange={this.onCompartmentsFilterChange}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default compose<Props, DatamartConfigTabProps>(injectFeatures)(
  DatamartConfigTab,
);
