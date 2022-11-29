import * as React from 'react';
import { AnalyticsSourceType } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/common';
import { compose } from 'recompose';
import AnalyticsQueryBuilder from './AnalyticsQueryBuilder';
import {
  AnalyticsMetric,
  AnalyticsDimension,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/Common';
import { AnalyticsQueryModel } from '../QueryToolTab';
import {
  activitiesAnalyticsDimensionArray,
  activitiesAnalyticsMetricArray,
} from './utils/ActivitiesAnalyticsUtils';
import {
  collectionVolumesDimensionArray,
  collectionVolumesMetricArray,
} from './utils/CollectionVolumesUtils';
import {
  resourcesUsageDimensionArray,
  resourcesUsageMetricArray,
} from './utils/ResourcesUsageUtils';
import { dataIngestionDimensionArray, dataIngestionMetricArray } from './utils/DataIngestionUtils';
import { lazyInject, TYPES } from '@mediarithmics-private/advanced-components';
import {
  ActivitiesAnalyticsDimension,
  ActivitiesAnalyticsMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/ActivitiesAnalyticsReportHelper';
import {
  CollectionVolumesDimension,
  CollectionVolumesMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/CollectionVolumesReportHelper';
import {
  ResourcesUsageDimension,
  ResourcesUsageMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/ResourcesUsageReportHelper';
import {
  DataIngestionDimension,
  DataIngestionMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/DataIngestionReportHelper';
import { IAnalyticsService } from '../../../../services/AnalyticsService';

export interface AnalyticsQueryBuilderWrapperProps {
  type: AnalyticsSourceType;
  query: AnalyticsQueryModel<any, any>;
  datamartId: string;
  onQueryChange: (query: AnalyticsQueryModel<AnalyticsMetric, AnalyticsDimension>) => void;
}

type Props = AnalyticsQueryBuilderWrapperProps;

class AnalyticsQueryBuilderWrapper extends React.Component<Props> {
  @lazyInject(TYPES.IActivitiesAnalyticsService)
  _activitiesAnalyticsService: IAnalyticsService<
    ActivitiesAnalyticsMetric,
    ActivitiesAnalyticsDimension
  >;

  @lazyInject(TYPES.ICollectionVolumesService)
  _collectionVolumesService: IAnalyticsService<CollectionVolumesMetric, CollectionVolumesDimension>;

  @lazyInject(TYPES.IResourcesUsageService)
  _resourcesUsageService: IAnalyticsService<ResourcesUsageMetric, ResourcesUsageDimension>;

  @lazyInject(TYPES.IDataIngestionAnalyticsService)
  _dataIngestionAnalyticsService: IAnalyticsService<DataIngestionMetric, DataIngestionDimension>;

  getAnalyticsService = () => {
    const { type } = this.props;
    switch (type) {
      case 'collection_volumes':
        return this._collectionVolumesService;
      case 'data_ingestion':
        return this._dataIngestionAnalyticsService;
      case 'resources_usage':
        return this._resourcesUsageService;
      default:
      case 'activities_analytics':
        return this._activitiesAnalyticsService;
    }
  };

  getAnalyticsDimensionArray = () => {
    const { type } = this.props;
    switch (type) {
      case 'collection_volumes':
        return collectionVolumesDimensionArray;
      case 'data_ingestion':
        return dataIngestionDimensionArray;
      case 'resources_usage':
        return resourcesUsageDimensionArray;
      default:
      case 'activities_analytics':
        return activitiesAnalyticsDimensionArray;
    }
  };

  getAnalyticsMetricArray = () => {
    const { type } = this.props;
    switch (type) {
      case 'collection_volumes':
        return collectionVolumesMetricArray;
      case 'data_ingestion':
        return dataIngestionMetricArray;
      case 'resources_usage':
        return resourcesUsageMetricArray;
      default:
      case 'activities_analytics':
        return activitiesAnalyticsMetricArray;
    }
  };

  render() {
    const { query, datamartId, onQueryChange } = this.props;
    return (
      <AnalyticsQueryBuilder
        analyticsService={this.getAnalyticsService()}
        analyticsDimensionArray={this.getAnalyticsDimensionArray()}
        analyticsMetricArray={this.getAnalyticsMetricArray()}
        datamartId={datamartId}
        onQueryChange={onQueryChange}
        query={query}
      />
    );
  }
}

export default compose<{}, AnalyticsQueryBuilderWrapperProps>()(AnalyticsQueryBuilderWrapper);
