import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import injectNotifications from '../../../../Notifications/injectNotifications';
import DatamartActionBar from './DatamartActionBar';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import DatamartHeader from './DatamartHeader';
import DatamartService from '../../../../../services/DatamartService';
import { Row, Col, Layout } from 'antd';
import { MobileApplicationsListPage } from '../../MobileApplications/List';
import { SitesListPage } from '../../Sites/List';
import CleaningRulesContainer from '../../CleaningRules/List/CleaningRulesContainer';
import CompartmentContainer from '../../Compartments/List/CompartmentsContainer';
import { PaginationSearchSettings } from '../../../../../utils/LocationSearchHelper';
import { notifyError } from '../../../../../state/Notifications/actions';

const { Content } = Layout;

type Props = RouteComponentProps<{
  organisationId: string;
  datamartId: string;
}> &
  InjectedIntlProps;

interface State {
  datamart?: DatamartResource;
  isLoading: boolean;
  cleaningRulesFilter: PaginationSearchSettings;
  compartmentsFilter: PaginationSearchSettings;
}

class DatamartDashboardPage extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      cleaningRulesFilter: {
        currentPage: 1,
        pageSize: 10,
      },
      compartmentsFilter: {
        currentPage: 1,
        pageSize: 10,
      },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;

    this.fetchDatamart(datamartId);
  }

  fetchDatamart = (datamartId: string) => {
    DatamartService.getDatamart(datamartId)
      .then(res =>
        this.setState({
          datamart: res.data,
          isLoading: false,
        }),
      )
      .catch(err => {
        this.setState({ isLoading: false });
        notifyError(err);
      });
  };

  onCleaningRulesFilterChange = (newFilter: PaginationSearchSettings) => {
    const {
      currentPage,
      pageSize,
    } = newFilter;

    const cleaningRulesFilter = {
      currentPage: currentPage,
      pageSize: pageSize
    };

    this.setState({
      cleaningRulesFilter: cleaningRulesFilter
    });
  };

  onCompartmentsFilterChange = (newFilter: PaginationSearchSettings) => {
    const {
      currentPage,
      pageSize,
    } = newFilter;

    const compartmentsFilter = {
      currentPage: currentPage,
      pageSize: pageSize,
    };

    this.setState({
      compartmentsFilter: compartmentsFilter
    });
  };

  render() {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;

    const {
      datamart,
      isLoading,
      cleaningRulesFilter,
      compartmentsFilter
    } = this.state;

    return (
      <div className="ant-layout">
        <DatamartActionBar />
        <div className="ant-layout">
          <Row className="mcs-content-channel">
            <Col className="mcs-datamart-title">
              <DatamartHeader datamart={datamart} isLoading={isLoading} />
            </Col>
          </Row>
          <Row>
            <Col>
              <MobileApplicationsListPage
                datamartId={datamartId}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <SitesListPage
                datamartId={datamartId}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <CompartmentContainer 
                datamartId={datamartId}
                filter={compartmentsFilter}
                onFilterChange={this.onCompartmentsFilterChange}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <CleaningRulesContainer
                datamartId={datamartId}
                filter={cleaningRulesFilter}
                onFilterChange={this.onCleaningRulesFilterChange}
              />
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications)(
    DatamartDashboardPage
  );
