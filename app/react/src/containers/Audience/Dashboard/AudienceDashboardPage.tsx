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
import { LayoutShape, Component, layout1393, layout1394 } from './domain';
import GaugePieChart from './Vizualisation/GaugePieChart';
import MapStackedBarChart from './Vizualisation/MapStackedBarChart';

const { Content } = Layout;

const GUTTER = 16;

export interface AudienceDashboardPageProps {}

interface State {
  layout?: LayoutShape;
}

type Props = AudienceDashboardPageProps & InjectedDatamartProps;
class AudienceDashboardPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.fetchLayout();
  }

  componentWillReceiveProps(nextProps: Props) {
    this.fetchLayout();
  }

  fetchLayout = () => {
    const { datamart } = this.props
      try {
        if (datamart.id === "1393" || datamart.id === "1394") {
          let layout = layout1393;
          if (datamart.id === "1394") {
            layout = layout1394;
          }
          const verifyLayout = () => {
            layout.forEach(row => {
              if (row.columns && row.columns.length) {
                row.columns.forEach(col => {
                  if (col.span === undefined) {
                    throw new Error('Not formatted Properly');
                  }
                  col.components.forEach(comp => {
                    if (
                      comp.component.component_type === undefined ||
                      comp.component.datamart_id === undefined ||
                      comp.height === undefined
                    ) {
                      throw new Error('Not formatted Properly');
                    }
                  });
                });
              } else {
                throw new Error('Not formatted Properly');
              }
            });
          };
          verifyLayout();
          this.setState({ layout: layout });
        } else {
          throw new Error("Not Authorized");
        }
        
      } catch (e) {
        log.error(e);
      }
  };

  public render() {
    const generateComponent = (comp: Component, height?: number) => {
      switch (comp.component_type) {
        case 'COUNT':
          return (
            <Count
              datamartId={comp.datamart_id}
              title={comp.title}
              queryId={comp.query_id}
            />
          );
        case 'MAP_PIE_CHART':
          return (
            <MapPieChart
              datamartId={comp.datamart_id}
              title={comp.title}
              queryId={comp.query_id}
              showLegend={comp.show_legend}
              labelsEnabled={comp.labels_enabled}
            />
          );
        case 'MAP_BAR_CHART':
          return (
            <MapBarChart
              datamartId={comp.datamart_id}
              title={comp.title}
              queryId={comp.query_id}
              labelsEnabled={comp.labels_enabled}
              height={height}
            />
          );
        case 'DATE_AGGREGATION_CHART':
          return (
            <DateAggregationChart
              datamartId={comp.datamart_id}
              title={comp.title}
              queryId={comp.query_id}
            />
          );
        case 'GAUGE_PIE_CHART':
          return (
            <GaugePieChart 
              datamartId={comp.datamart_id}
              title={comp.title}
              partialQueryId={comp.partial_query_id}
              showPercentage={comp.show_percentage}
              totalQueryId={comp.total_query_id}
            />
          )
        case 'MAP_STACKED_BAR_CHART':
          return (
            <MapStackedBarChart 
              datamartId={comp.datamart_id}
              height={height}
              keys={comp.keys}
              queryIds={comp.query_ids}
              title={comp.title}

            />
          )
        default:
          return null;
      }
    };

    const generatePadding = (length: number, currentIndex: number): React.CSSProperties => {
      if (length === 0 || length === 1) {
        return { padding: 0 }
      }

      if (length > 1 && currentIndex === 0) {
        return { paddingBottom: GUTTER / 2 }
      }

      if (length > 1 && currentIndex + 1 === length) {
        return { paddingTop: GUTTER / 2 }
      }

      return { paddingTop: GUTTER / 2, paddingBottom: GUTTER / 2 }
    }

    

    return (
      <div className="ant-layout">
        <AudienceDashboardActionBar />
        <div className="ant-layout">
          <Content className="mcs-content-container p-t-40">
            {this.state.layout &&
              this.state.layout.map((row, index) => {
                const rowHeight = (row.size || 1) * 350;
                return (
                  <Row
                    gutter={16}
                    key={index}
                    type="flex"
                    justify="space-around"
                    align="top"
                    style={{ height: rowHeight, marginTop: index !== 0 ? 16 : 0 }}
                  >
                    {row.columns.map((col, i) => {
                      return (
                        <Col span={col.span} key={i}>
                          {col.components.map((comp, ind) => (
                            <div
                              key={ind}
                              style={{
                                height:
                                  (rowHeight / comp.height),
                                ...generatePadding(col.components.length, ind)
                              }}
                            >
                              {generateComponent(comp.component, (rowHeight / comp.height) - 50 )}
                            </div>
                          ))}
                        </Col>
                      );
                    })}
                  </Row>
                );
              })}
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<Props, AudienceDashboardPageProps>(injectDatamart)(
  AudienceDashboardPage,
);
