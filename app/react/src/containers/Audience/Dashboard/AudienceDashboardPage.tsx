import * as React from 'react';
import { Row, Col, Layout } from 'antd';
import AudienceDashboardActionBar from './AudienceDashboardActionBar';
import { compose } from 'recompose';
import { InjectedDatamartProps, injectDatamart } from '../../Datamart';
import Count from './Vizualisation/Count';
import MapPieChart from './Vizualisation/MapPieChart';
import MapBarChart from './Vizualisation/MapBarChart';
import DateAggregationChart from './Vizualisation/DateAggregationChart';
import log from '../../../utils/Logger';
import { LayoutShape, Column } from './domain';

const {Content} = Layout;

export interface AudienceDashboardPageProps {
}

interface State {
  layout?: LayoutShape
}

type Props = AudienceDashboardPageProps & InjectedDatamartProps
class AudienceDashboardPage extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props)
    this.state = {
      layout: undefined
    }
  }

  componentDidMount() {
    this.fetchLayout()
  }

  componentWillReceiveProps(nextProps: Props) {
    this.fetchLayout()
  }
  
  fetchLayout = () => {
    const layoutFromStorage = window.localStorage.getItem('layout');
    if (layoutFromStorage) {
      try {
        const layout = JSON.parse(layoutFromStorage) as LayoutShape
        const verifyLayout = () => {
          layout.forEach(row => {
            if (row.columns && row.columns.length) {
              row.columns.forEach(col => {
                if ((col.component_type === undefined && col.datamart_id === undefined && col.query_id === undefined && col.span === undefined)) {
                  throw new Error('Not formatted Properly')
                }
              })
            } else {
              throw new Error('Not formatted Properly')
            }
          })
        }
        verifyLayout()
        this.setState({ layout: layout })
      }
      catch(e) {
        log.error(e)
      }
    }
    
  }

  public render() {


    const generateComponent = (col: Column) => {
      switch(col.component_type) {
        case 'COUNT':
          return <Count datamartId={col.datamart_id} title={col.title} queryId={col.query_id} />
        case 'MAP_PIE_CHART':
          return <MapPieChart datamartId={col.datamart_id} title={col.title} queryId={col.query_id} />
        case 'MAP_BAR_CHART':
          return <MapBarChart datamartId={col.datamart_id} title={col.title} queryId={col.query_id} />
        case 'DATE_AGGREGATION_CHART':
          return <DateAggregationChart datamartId={col.datamart_id} title={col.title} queryId={col.query_id} />
        default:
          return null
      }
    }

    return (
      <div className="ant-layout">
        <AudienceDashboardActionBar
        />
        <div className="ant-layout">
          <Content className="mcs-content-container p-t-40">
            {this.state.layout && this.state.layout.map((row, index) => {
              return (
                <Row gutter={16} key={index}>
                  {row.columns.map((col, i) => {
                    return (
                      <Col span={col.span} key={i}>
                        {generateComponent(col)}
                      </Col>
                    )
                  })}
                </Row>
              )
            })}
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<Props, AudienceDashboardPageProps>(
  injectDatamart
)(AudienceDashboardPage)
