import * as React from 'react';
import {
  BarChartOutlined,
  HomeOutlined,
  RadarChartOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Table, Select, Input, Card } from 'antd';
import {
  OTQLMetric,
  OTQLAggregations,
  OTQLBucket,
  OTQLBuckets,
} from '../../../models/datamart/graphdb/OTQLResult';
import { compose } from 'recompose';
import {
  Button,
  McsIcon,
  McsTabs,
  RadarChart,
  BarChart,
} from '@mediarithmics-private/mcs-components-library';
import { FormattedMessage } from 'react-intl';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { BASE_CHART_HEIGHT } from '../../../components/Charts/domain';
import {
  Dataset,
  Format,
} from '@mediarithmics-private/mcs-components-library/lib/components/charts/utils';
import { RadarChartProps } from '@mediarithmics-private/mcs-components-library/lib/components/charts/radar-chart';
const MAX_ELEMENTS = 999;
interface BucketPath {
  aggregationBucket: OTQLBuckets;
  bucket: OTQLBucket;
}

export interface AggregationRendererProps {
  rootAggregations: OTQLAggregations;
  query?: string;
}
type Props = AggregationRendererProps & InjectedFeaturesProps;

type chartType = 'RADAR' | 'BAR';

interface State {
  aggregationsPath: BucketPath[];
  // can be a bucket or metrics
  selectedView: string;
  numberItems: number;
  selectedChart: chartType;
}

class AggregationRenderer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      aggregationsPath: [],
      selectedView: this.getDefaultView(props.rootAggregations),
      numberItems:
        props.rootAggregations &&
        props.rootAggregations.buckets &&
        props.rootAggregations.buckets[0] &&
        props.rootAggregations.buckets[0].buckets &&
        props.rootAggregations.buckets[0].buckets.length <= 6
          ? props.rootAggregations.buckets[0].buckets.length
          : 6,
      selectedChart: 'RADAR',
    };
  }

  componentDidMount() {
    if (this.hasDateHistogram()) this.setNbrOfShowedItems();
  }

  getDefaultView = (aggregations: OTQLAggregations) => {
    if (aggregations.buckets.length > 0) {
      return '0';
    } else {
      return 'metrics';
    }
  };

  getMetrics = (metrics: OTQLMetric[] = []) => {
    if (metrics.length === 0) return null;
    return (
      <div className='mcs-table-container'>
        <Table<OTQLMetric>
          columns={[
            { title: 'Name', dataIndex: 'name' },
            { title: 'Value', dataIndex: 'value' },
          ]}
          dataSource={metrics}
          pagination={{
            size: 'small',
            showSizeChanger: true,
            hideOnSinglePage: true,
          }}
        />
      </div>
    );
  };

  setNbrOfShowedItems = (e?: React.ChangeEvent<HTMLInputElement>) => {
    const { rootAggregations } = this.props;
    const { aggregationsPath, selectedView } = this.state;

    const aggregations = this.findAggregations(rootAggregations, aggregationsPath)!;
    const buckets: OTQLBuckets = aggregations.buckets[parseInt(selectedView, 0)];
    const value = e ? parseInt(e.target.value, 10) : MAX_ELEMENTS;
    this.setState({
      numberItems: Math.min(MAX_ELEMENTS, buckets.buckets.length, value),
    });
  };

  hasDateHistogram = () => {
    const { query } = this.props;
    return query && query.indexOf('@date_histogram') > -1;
  };

  handleChartTypeChange = (value: chartType) => {
    this.setState({
      selectedChart: value,
    });
  };

  formatDataset(buckets: OTQLBucket[], limit: number): Dataset | undefined {
    if (!buckets || buckets.length === 0) return undefined;
    else {
      const dataset: any = buckets.map(buck => {
        return {
          key: buck.key,
          count: buck.count,
          buckets: this.formatDataset(
            buck.aggregations?.buckets[0].buckets.slice(0, limit) || [],
            limit,
          ),
        };
      });
      return dataset;
    }
  }

  getBuckets = (buckets: OTQLBuckets) => {
    const { hasFeature } = this.props;
    const { numberItems } = this.state;
    if (buckets.buckets.length === 0)
      return (
        <FormattedMessage
          id='queryTool.otql-result-renderer-aggrations-no-result'
          defaultMessage='No Result'
        />
      );

    const goToBucket = (bucket: OTQLBucket) => {
      if (bucket.aggregations && bucketHasData(bucket)) {
        const aggregations = bucket.aggregations;
        this.setState(prevState => ({
          aggregationsPath: [...prevState.aggregationsPath, { aggregationBucket: buckets, bucket }],
          selectedView: this.getDefaultView(aggregations),
        }));
      }
    };

    const handleOnRow = (record: OTQLBucket) => ({
      onClick: () => goToBucket(record),
    });

    const bucketHasData = (record: OTQLBucket) => {
      return !!(
        record.aggregations &&
        (record.aggregations.buckets.find(b => b.buckets.length > 0) ||
          record.aggregations.metrics.length > 0)
      );
    };

    const getRowClassName = (record: OTQLBucket) => {
      if (bucketHasData(record)) return 'mcs-table-cursor';
      return '';
    };

    if (hasFeature('query-tool-graphs')) {
      const currentBuckets = buckets.buckets.slice(0, numberItems);
      const stackedBarChartDataset: Dataset = this.formatDataset(
        currentBuckets,
        this.state.numberItems,
      ) as Dataset;
      const radarChartDataset = currentBuckets.map(bucket => {
        return { xKey: bucket.key, value: bucket.count };
      });

      const optionsForBarChart = {
        xKey: 'key',
        yKeys: [
          {
            key: 'count',
            message: 'count',
          },
        ],
        xAxis: { title: { text: '' } },
        chartOptions: {
          yAxis: { title: { text: '' } },
        },
        colors: ['#00a1df'],
        legend: {
          enabled: true,
        },
        format: 'count' as Format,
      };

      const radarChartProps: RadarChartProps = {
        dataset: radarChartDataset,
        height: BASE_CHART_HEIGHT,
        xKey: 'xKey',
        yKeys: [
          {
            key: 'value',
            message: 'count',
          },
        ],
        dataLabels: {
          enabled: false,
        },
      };

      const renderShowTop = () => {
        return (
          <div className={'mcs-otqlChart_items'}>
            Show top{' '}
            <Input
              type='number'
              className='mcs-otqlChart_items_input'
              value={numberItems}
              onChange={this.setNbrOfShowedItems}
            />{' '}
            / {buckets.buckets.length}
          </div>
        );
      };

      const tabs = [
        {
          title: <TableOutlined className='mcs-otqlChart_icons' />,
          key: 'table',
          display: (
            <Card bordered={false}>
              <div className='mcs-table-container'>
                <Table<OTQLBucket>
                  columns={[
                    {
                      title: 'Key',
                      dataIndex: 'key',
                      sorter: (a, b) =>
                        typeof a.key === 'string' &&
                        typeof b.key === 'string' &&
                        !isNaN(Date.parse(a.key)) &&
                        !isNaN(Date.parse(b.key))
                          ? Date.parse(a.key) - Date.parse(b.key)
                          : a.key.length - b.key.length,
                    },
                    {
                      title: 'Count',
                      dataIndex: 'count',
                      sorter: (a, b) => a.count - b.count,
                    },
                    {
                      render: (text, record) => {
                        if (bucketHasData(record)) {
                          return (
                            <div className='float-right'>
                              <McsIcon type='chevron-right' />
                            </div>
                          );
                        }
                        return null;
                      },
                    },
                  ]}
                  className='mcs-aggregationRendered_table'
                  onRow={handleOnRow}
                  rowClassName={getRowClassName}
                  dataSource={buckets.buckets}
                  pagination={{
                    size: 'small',
                    showSizeChanger: true,
                    hideOnSinglePage: true,
                  }}
                />
              </div>
            </Card>
          ),
        },
        {
          title: <BarChartOutlined className='mcs-otqlChart_icons' />,
          key: 'bar',
          display: (
            <Card bordered={false}>
              <BarChart
                {...optionsForBarChart}
                dataset={stackedBarChartDataset ? stackedBarChartDataset : []}
                drilldown={true}
                bigBars={true}
              />
            </Card>
          ),
        },
        {
          title: <RadarChartOutlined className='mcs-otqlChart_icons' />,
          key: 'radar',
          display: (
            <Card bordered={false}>
              <RadarChart {...radarChartProps} />
            </Card>
          ),
        },
      ];
      return (
        <div>
          <McsTabs
            items={tabs}
            animated={false}
            className='mcs-otqlChart_tabs'
            defaultActiveKey={this.hasDateHistogram() ? 'bar' : 'table'}
          />
          {renderShowTop()}
        </div>
      );
    }

    return (
      <div className='mcs-table-container'>
        <Table<OTQLBucket>
          columns={[
            {
              title: 'Key',
              dataIndex: 'key',
              sorter: (a, b) => a.key.length - b.key.length,
            },
            {
              title: 'Count',
              dataIndex: 'count',
              sorter: (a, b) => a.count - b.count,
            },
            {
              render: (text, record) => {
                if (bucketHasData(record)) {
                  return (
                    <div className='float-right'>
                      <McsIcon type='chevron-right' />
                    </div>
                  );
                }
                return null;
              },
            },
          ]}
          onRow={handleOnRow}
          rowClassName={getRowClassName}
          dataSource={buckets.buckets}
          pagination={{
            size: 'small',
            showSizeChanger: true,
            hideOnSinglePage: true,
          }}
        />
      </div>
    );
  };

  findAggregations = (
    aggregations: OTQLAggregations,
    aggregationsPath: BucketPath[],
  ): OTQLAggregations | null => {
    if (aggregationsPath.length === 0) return aggregations;

    const [head, ...tail] = aggregationsPath;

    const bucketAggregation = aggregations.buckets.find(
      bagg => bagg.name === head.aggregationBucket.name,
    );

    if (bucketAggregation) {
      const countBucket = bucketAggregation.buckets.find(bucket => bucket.key === head.bucket.key);

      if (countBucket && countBucket.aggregations) {
        return this.findAggregations(countBucket.aggregations, tail);
      } else return null;
    } else return null;
  };

  getBreadcrumb = (aggregations: OTQLAggregations) => {
    const { aggregationsPath } = this.state;

    if (aggregationsPath.length === 0) return null;

    const goToRoot = () =>
      this.setState({
        aggregationsPath: [],
        selectedView: this.getDefaultView(aggregations),
      });

    return (
      <Breadcrumb style={{ marginBottom: 14 }} className='mcs-breadcrumb'>
        <Breadcrumb.Item>
          <Button onClick={goToRoot}>
            <HomeOutlined />
          </Button>
        </Breadcrumb.Item>
        {aggregationsPath.map((path, index) => {
          const isLast = index === aggregationsPath.length - 1;
          const pathToStr = `${path.aggregationBucket.field_name} @${path.aggregationBucket.type} { ${path.bucket.key} }`;
          const goToPath = () => {
            this.setState({
              aggregationsPath: aggregationsPath.slice(0, index + 1),
              selectedView: this.getDefaultView(path.bucket.aggregations!),
            });
          };
          return (
            <Breadcrumb.Item key={index}>
              {isLast ? pathToStr : <Button onClick={goToPath}>{pathToStr}</Button>}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    );
  };

  render() {
    const { rootAggregations } = this.props;
    const { aggregationsPath, selectedView } = this.state;

    const aggregations = this.findAggregations(rootAggregations, aggregationsPath)!;

    let selectedAggregationData = null;
    if (selectedView === 'metrics') {
      selectedAggregationData = this.getMetrics(aggregations.metrics);
    } else {
      // selectedView is a buckets indice;
      selectedAggregationData = this.getBuckets(aggregations.buckets[parseInt(selectedView, 0)]);
    }

    const handleOnSelect = (value: string) => this.setState({ selectedView: value });

    const showSelect =
      (aggregations.buckets.length > 0 && aggregations.metrics.length > 0) ||
      aggregations.buckets.length > 1;

    return (
      <div>
        {this.getBreadcrumb(aggregations)}
        <div style={{ marginBottom: 14 }}>
          {showSelect && (
            <div>
              <div className='m-r-10' style={{ display: 'inline-block' }}>
                <FormattedMessage
                  id='queryTool.otql-result-renderer-aggrations-viewing'
                  defaultMessage='Viewing :'
                />
              </div>
              <Select value={selectedView} onSelect={handleOnSelect} style={{ width: 150 }}>
                {aggregations.buckets.length > 0 && (
                  <Select.OptGroup label='Buckets'>
                    {aggregations.buckets.map((bucket, index) => (
                      <Select.Option
                        key={index.toString()}
                        value={index.toString()}
                      >{`${bucket.field_name} @${bucket.type}`}</Select.Option>
                    ))}
                  </Select.OptGroup>
                )}
                {aggregations.metrics.length > 0 && (
                  <Select.Option value='metrics'>Metrics</Select.Option>
                )}
              </Select>
            </div>
          )}
        </div>
        <div>{selectedAggregationData}</div>
      </div>
    );
  }
}

export default compose<{}, AggregationRendererProps>(injectFeatures)(AggregationRenderer);
