import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import injectNotifications from '../../../../Notifications/injectNotifications';
import DatamartActionBar from './DatamartActionBar';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import DatamartHeader from './DatamartHeader';
import DatamartService from '../../../../../services/DatamartService';
import { Row, Col } from 'antd';
import { notifyError } from '../../../../../state/Notifications/actions';
import McsTabs from '../../../../../components/McsTabs';
import DatamartConfigTab from './DatamartConfigTab';
import DatamartObjectViewTab from './DatamartObjectViewTab';
import DatamartActivity from './DatamartActivity';

const { Content } = Layout;

type Props = RouteComponentProps<{
  organisationId: string;
  datamartId: string;
}> &
  InjectedIntlProps;

interface State {
  datamart?: DatamartResource;
  isLoading: boolean;

}

class DatamartDashboardPage extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
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

  render() {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;

    const {
      datamart,
      isLoading,
    } = this.state;

    return (
      <div className="ant-layout">
        <DatamartActionBar />
        <div className="ant-layout">
          <div className="ant-layout-content">
            <Row className="mcs-content-channel">
              <Col className="mcs-datamart-title">
                <DatamartHeader
                  datamart={datamart}
                  isLoading={isLoading}
                />
              </Col>
            </Row>
            <Row>
              <McsTabs 
                items={[
                  {
                    title: "Datamart Configuration",
                    display: <DatamartConfigTab datamartId={datamartId} />
                  },
                  {
                    title: "Datamart Activity",
                    display: <DatamartActivity datamartId={datamartId} />
                  },
                  {
                    title: "Object View Configuration",
                    display: <DatamartObjectViewTab datamartId={datamartId} />
                  },
                ]}
                tabBarStyle={{ margin: "0 40px" }}
              />
            </Row>
          
          </div>
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
