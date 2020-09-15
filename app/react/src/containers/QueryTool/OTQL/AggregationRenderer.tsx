import * as React from 'react';
import { Breadcrumb, Icon, Table, Row, Select } from 'antd';
import {
  OTQLMetric,
  OTQLAggregations,
  OTQLBucket,
  OTQLBuckets,
} from '../../../models/datamart/graphdb/OTQLResult';
import { Button } from '@mediarithmics-private/mcs-components-library';
import { FormattedMessage } from 'react-intl';
import { McsIcon } from '../../../components/index';

interface BucketPath {
  aggregationBucket: OTQLBuckets;
  bucket: OTQLBucket;
}

export interface Props {
  rootAggregations: OTQLAggregations;
}

interface State {
  aggregationsPath: BucketPath[];
  // can be a bucket or metrics
  selectedView: string;
}

class BucketTable extends Table<OTQLBucket> {}
class MetricTable extends Table<OTQLMetric> {}

export default class AggregationRenderer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      aggregationsPath: [],
      selectedView: this.getDefaultView(props.rootAggregations),
    };
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
      <MetricTable
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
    );
  };

  getBuckets = (buckets: OTQLBuckets) => {
    if (buckets.buckets.length === 0)
      return (
        <FormattedMessage
          id="queryTool.otql-result-renderer-aggrations-no-result"
          defaultMessage="No Result"
        />
      );

    const goToBucket = (bucket: OTQLBucket) => {
      if (bucket.aggregations && bucketHasData(bucket)) {
        const aggregations = bucket.aggregations;
        this.setState(prevState => ({
          aggregationsPath: [
            ...prevState.aggregationsPath,
            { aggregationBucket: buckets, bucket },
          ],
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
      if ( bucketHasData(record) ) return 'mcs-table-cursor';
      return '';
    }

    return (
      <BucketTable
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
                  <div className="float-right">
                    <McsIcon type="chevron-right" />
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
      const countBucket = bucketAggregation.buckets.find(
        bucket => bucket.key === head.bucket.key,
      );

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
      <Breadcrumb style={{ marginBottom: 14 }}>
        <Breadcrumb.Item>
          <Button onClick={goToRoot}>
            <Icon type="home" />
          </Button>
        </Breadcrumb.Item>
        {aggregationsPath.map((path, index) => {
          const isLast = index === aggregationsPath.length - 1;
          const pathToStr = `${path.aggregationBucket.fieldName} @${
            path.aggregationBucket.type
          } { ${path.bucket.key} }`;
          const goToPath = () => {
            this.setState({
              aggregationsPath: aggregationsPath.slice(0, index + 1),
              selectedView: this.getDefaultView(path.bucket.aggregations!),
            });
          };
          return (
            <Breadcrumb.Item key={index}>
              {isLast ? (
                pathToStr
              ) : (
                <Button onClick={goToPath}>
                  {pathToStr}
                </Button>
              )}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    );
  };

  render() {
    const { rootAggregations } = this.props;
    const { aggregationsPath, selectedView } = this.state;

    const aggregations = this.findAggregations(
      rootAggregations,
      aggregationsPath,
    )!;

    let selectedAggregationData = null;
    if (selectedView === 'metrics') {
      selectedAggregationData = this.getMetrics(aggregations.metrics);
    } else {
      // selectedView is a buckets indice;
      selectedAggregationData = this.getBuckets(
        aggregations.buckets[parseInt(selectedView, 0)],
      );
    }

    const handleOnSelect = (value: string) =>
      this.setState({ selectedView: value });

    const showSelect =
      (aggregations.buckets.length > 0 && aggregations.metrics.length > 0) ||
      aggregations.buckets.length > 1;

    return (
      <div>
        {this.getBreadcrumb(aggregations)}
        <Row style={{ marginBottom: 14 }}>
          {showSelect && (
            <div>
              <div className="m-r-10" style={{ display: 'inline-block' }}>
                <FormattedMessage
                  id="queryTool.otql-result-renderer-aggrations-viewing"
                  defaultMessage="Viewing :"
                />
              </div>
              <Select
                value={selectedView}
                onSelect={handleOnSelect}
                style={{ width: 150 }}
              >
                {aggregations.buckets.length > 0 && (
                  <Select.OptGroup label="Buckets">
                    {aggregations.buckets.map((bucket, index) => (
                      <Select.Option key={index.toString()} value={index.toString()}>{`${
                        bucket.fieldName
                      } @${bucket.type}`}</Select.Option>
                    ))}
                  </Select.OptGroup>
                )}
                {aggregations.metrics.length > 0 && (
                  <Select.Option value="metrics">Metrics</Select.Option>
                )}
              </Select>
            </div>
          )}
        </Row>
        <Row>{selectedAggregationData}</Row>
      </div>
    );
  }
}
