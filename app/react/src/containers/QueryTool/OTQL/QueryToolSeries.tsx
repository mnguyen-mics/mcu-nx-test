import * as React from 'react';
import { Button, Dropdown, Input, Menu } from 'antd';
import { OtqlConsole } from '../../../components/index';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { compose } from 'recompose';
import {
  AbstractQueryModel,
  AbstractSerieQueryModel,
  AnalyticsQueryModel,
  OTQLQueryModel,
  QueryModelType,
  SerieQueryModel,
} from './QueryToolTab';
import { DEFAULT_OTQL_QUERY, getNewSerieQuery, getNewSubSerieQuery } from './utils/QueryUtils';
import { isQueryListModel } from '../../../models/datamart/graphdb/OTQLResult';
import { defineMessages, FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { CloseOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import _ from 'lodash';
import AnalyticsQueryBuilderWrapper from './AnalyticsQueryBuilder/AnalyticsQueryBuilderWrapper';
import {
  AnalyticsDimension,
  AnalyticsMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/Common';

export interface QueryToolSeriesProps {
  datamartId: string;
  actionButtons?: React.ReactNode;
  seriesQueries: SerieQueryModel[];
  onInputChange: (id: string, queryId?: string) => (e: any) => void;
  updateQueryModel: (serieId: string, queryId?: string) => (query: AbstractQueryModel) => void;
  updateNameModel: (id: string, queryId?: string) => (e: any) => void;
  displaySeriesInput: (id: string, queryId?: string) => (e: any) => void;
  onSeriesChange: (series: SerieQueryModel[]) => void;
  editionMode?: boolean;
}

type Props = QueryToolSeriesProps & InjectedFeaturesProps & WrappedComponentProps;

class QueryToolSeries extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  onStepRemove = (stepId: string) => (e: any) => {
    const { seriesQueries, onSeriesChange } = this.props;
    const newSteps = seriesQueries.filter(step => step.id !== stepId);
    onSeriesChange(newSteps);
  };

  addStep = (existingSeriesNames?: string[]) => {
    const { seriesQueries, onSeriesChange } = this.props;
    const newName = this.generateSerieName(seriesQueries.length + 1, existingSeriesNames);
    const newSteps = seriesQueries.concat([getNewSerieQuery(newName, DEFAULT_OTQL_QUERY)]);
    onSeriesChange(newSteps);
  };

  onSubStepRemove = (serieId?: string, subSerieId?: string) => (e: any) => {
    const { seriesQueries, onSeriesChange } = this.props;

    const newSeries = seriesQueries.map(serie => {
      const queryModel = serie.queryModel;
      if (serie.id === serieId && isQueryListModel(queryModel)) {
        // if we delete a subStep and if there is only one left, we swap queryModel
        const newQueryModel = queryModel.filter(q => q.id !== subSerieId);
        if (newQueryModel.length === 1) {
          return { ...newQueryModel[0], name: serie.name };
        } else {
          return {
            ...serie,
            queryModel: newQueryModel,
          };
        }
      }
      return serie;
    });
    onSeriesChange(newSeries);
  };

  generateSerieName = (index: number, existingSeriesNames?: string[]) => {
    if (existingSeriesNames !== undefined) {
      for (let i = 1; i < 100; i++) {
        const candidate = `Series ${i}`;
        if (!existingSeriesNames.find(name => name === candidate)) {
          return candidate;
        }
      }
    }
    return `Series ${index + 1}`;
  };

  renderStepHeader = (
    queryModelStep: AbstractSerieQueryModel,
    i: number,
    isSubStep: boolean,
    existingSeriesNames?: string[],
  ) => {
    const { onInputChange, updateNameModel, displaySeriesInput, editionMode, seriesQueries } =
      this.props;
    const queryModelId = queryModelStep.id;
    const subSerieQueryId = isSubStep ? queryModelStep.id : undefined;
    const hideHeader = seriesQueries.length === 1 && _.isEqual(seriesQueries[0], queryModelStep);
    if (editionMode || hideHeader) {
      return <span />;
    } else {
      return (
        <React.Fragment>
          {queryModelStep.inputVisible ? (
            <Input
              className={'mcs-otqlInputEditor_stepNameInput'}
              onChange={onInputChange(queryModelId, subSerieQueryId)}
              onPressEnter={updateNameModel(queryModelId, subSerieQueryId)}
              value={queryModelStep.name}
            />
          ) : (
            <Button
              className={'mcs-otqlInputEditor_stepNameButton'}
              onClick={displaySeriesInput(queryModelId, subSerieQueryId)}
              type='dashed'
            >
              {queryModelStep.name || this.generateSerieName(i, existingSeriesNames)}
            </Button>
          )}
        </React.Fragment>
      );
    }
  };

  renderAddNewValueButton = (serieQueryModelStep: SerieQueryModel) => {
    const { onSeriesChange, seriesQueries, editionMode } = this.props;
    if (!editionMode) {
      const addNewSubSerie = () => {
        const newSeries = seriesQueries.map(serie => {
          if (serie.id === serieQueryModelStep.id) {
            const previousModels = serie.queryModel;
            const dimensionIndex = isQueryListModel(previousModels) ? previousModels.length + 1 : 1;
            const newModel = [
              getNewSubSerieQuery(`Dimension ${dimensionIndex}`, DEFAULT_OTQL_QUERY),
            ];
            const newQueryModels = isQueryListModel(previousModels)
              ? previousModels.concat(newModel)
              : [
                  getNewSubSerieQuery(`Dimension ${dimensionIndex}`, previousModels, serie.type),
                ].concat(
                  getNewSubSerieQuery(`Dimension ${dimensionIndex + 1}`, DEFAULT_OTQL_QUERY),
                );

            return {
              ...serie,
              type: undefined,
              queryModel: newQueryModels,
            };
          }
          return serie;
        });
        onSeriesChange(newSeries);
      };
      return (
        <div
          className={`${
            typeof serieQueryModelStep.queryModel === 'string'
              ? ''
              : 'mcs-queryToolSeries_newValueContainer'
          }`}
        >
          <Button className='mcs-queryToolSeries_newValue' onClick={addNewSubSerie}>
            <div className='mcs-queryToolSeries_plusBtn'>
              <PlusOutlined />
            </div>
            <FormattedMessage
              id='otql.serieseditor.newseries.newValue'
              defaultMessage='New Value'
            />
          </Button>
        </div>
      );
    }
    return <div />;
  };

  getDefaultQueryModel = (type: QueryModelType): AbstractQueryModel => {
    switch (type) {
      case 'activities_analytics':
      case 'resources_usage':
      case 'collection_volumes':
      case 'data_ingestion':
        return {
          dimensions: [],
          metrics: [],
          dimension_filter_clauses: { operator: 'AND', filters: [] },
          date_ranges: [
            {
              start_date: `now-7d`,
              end_date: 'now',
            },
          ],
        };
      case 'otql':
      default:
        return { query: DEFAULT_OTQL_QUERY };
    }
  };

  renderDatasourceSelector = (queryModelStep: AbstractSerieQueryModel) => {
    const { intl, onSeriesChange, seriesQueries } = this.props;

    const changeQueryModelType = (type: QueryModelType) => {
      const newSeries = seriesQueries.map(serie => {
        if (isQueryListModel(serie.queryModel)) {
          return {
            ...serie,
            queryModel: serie.queryModel.map(list => {
              if (list.id === queryModelStep.id) {
                return {
                  ...list,
                  queryModel: this.getDefaultQueryModel(type),
                  type: type,
                };
              } else {
                return list;
              }
            }),
          };
        } else {
          if (serie.id === queryModelStep.id) {
            return {
              ...serie,
              queryModel: this.getDefaultQueryModel(type),
              type: type,
            };
          } else {
            return serie;
          }
        }
      });

      onSeriesChange(newSeries);
    };

    const onMenuClick = (event: any) => {
      return changeQueryModelType(event.key);
    };

    const queryModelTypeToLabel = (type: QueryModelType) => {
      switch (type) {
        case 'activities_analytics':
          return intl.formatMessage(messages.activitiesAnalytics);
        case 'resources_usage':
          return intl.formatMessage(messages.resourcesUsage);
        case 'collection_volumes':
          return intl.formatMessage(messages.collectionVolumes);
        case 'data_ingestion':
          return intl.formatMessage(messages.dataIngestion);
        case 'otql':
        default:
          return intl.formatMessage(messages.otql);
      }
    };

    const dataSourceTypeMenu = (
      <Menu onClick={onMenuClick} className='mcs-menu-antd-customized'>
        <Menu.Item key='otql' className='mcs-menu-antd-customized_item--history'>
          {queryModelTypeToLabel('otql')}
        </Menu.Item>
        <Menu.Item key='activities_analytics' className='mcs-menu-antd-customized_item--history'>
          {queryModelTypeToLabel('activities_analytics')}
        </Menu.Item>
        <Menu.Item key='resources_usage' className='mcs-menu-antd-customized_item--history'>
          {queryModelTypeToLabel('resources_usage')}
        </Menu.Item>
        <Menu.Item key='collection_volumes' className='mcs-menu-antd-customized_item--history'>
          {queryModelTypeToLabel('collection_volumes')}
        </Menu.Item>
        <Menu.Item key='data_ingestion' className='mcs-menu-antd-customized_item--history'>
          {queryModelTypeToLabel('data_ingestion')}
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown
        overlay={dataSourceTypeMenu}
        trigger={['click']}
        className='mcs-queryToolSeries_datasourceSelector'
      >
        <Button type='text'>
          {queryModelTypeToLabel(queryModelStep.type ? queryModelStep.type : 'otql')}
          <DownOutlined />
        </Button>
      </Dropdown>
    );
  };

  renderBodyStep = (step: SerieQueryModel) => {
    const { updateQueryModel, datamartId, hasFeature } = this.props;
    const queryModelId = step.id;

    const renderQueryBuilder = (
      queryModel: AbstractQueryModel,
      onChange: (query: AbstractQueryModel) => void,
      type?: QueryModelType,
    ) => {
      switch (type) {
        case 'activities_analytics':
        case 'collection_volumes':
        case 'resources_usage':
        case 'data_ingestion':
          return (
            <AnalyticsQueryBuilderWrapper
              type={type}
              datamartId={datamartId}
              onQueryChange={onChange}
              query={queryModel as AnalyticsQueryModel<AnalyticsMetric, AnalyticsDimension>}
            />
          );
        case 'otql':
        default:
          const updateOTQLQueryModel = (query: string) => {
            onChange({ query: query });
          };

          return (
            <OtqlConsole
              key={queryModelId}
              onChange={updateOTQLQueryModel}
              datamartId={datamartId}
              value={(queryModel as OTQLQueryModel).query}
              showPrintMargin={false}
              enableBasicAutocompletion={true}
              enableLiveAutocompletion={false}
              className={'mcs-otqlInputEditor_otqlConsole'}
            />
          );
      }
    };

    return isQueryListModel(step.queryModel) ? (
      <div className='mcs-queryToolSeries_subStepsContainer'>
        {step.queryModel.map((subStep, i) => {
          return (
            <div key={i} className='mcs-queryToolSeries_subStep'>
              {this.renderStepHeader(subStep, i, true)}
              {this.renderDatasourceSelector(subStep)}
              <Button
                shape='circle'
                icon={<CloseOutlined />}
                className={'mcs-queryToolSeries_removeStepBtn'}
                onClick={this.onSubStepRemove(step.id, subStep.id)}
              />
              {renderQueryBuilder(
                subStep.queryModel,
                updateQueryModel(queryModelId, subStep.id),
                subStep.type,
              )}
            </div>
          );
        })}
      </div>
    ) : (
      <React.Fragment>
        {hasFeature('release_querytool_analyticsqueries') ? (
          this.renderDatasourceSelector(step)
        ) : (
          <div />
        )}
        {renderQueryBuilder(step.queryModel, updateQueryModel(queryModelId), step.type)}
      </React.Fragment>
    );
  };

  render() {
    const { seriesQueries, editionMode } = this.props;

    const addStep = () => {
      this.addStep(seriesQueries.map(q => q.name));
    };

    return (
      <div className='mcs-queryToolSeries_container'>
        {seriesQueries.map((serieQuery, i) => {
          return (
            <div key={i} className='mcs-queryToolSeries_mainStep'>
              {this.renderStepHeader(
                serieQuery,
                i,
                false,
                seriesQueries.map(q => q.name),
              )}
              {seriesQueries.length !== 1 && (
                <Button
                  shape='circle'
                  icon={<CloseOutlined />}
                  className={'mcs-queryToolSeries_removeStepBtn'}
                  onClick={this.onStepRemove(serieQuery.id)}
                />
              )}
              {this.renderBodyStep(serieQuery)}
              {this.renderAddNewValueButton(serieQuery)}
            </div>
          );
        })}
        {!editionMode && (
          <Button className={'mcs-timelineStepBuilder_addStepBtn'} onClick={addStep}>
            <FormattedMessage
              {...{
                id: 'queryTool.newSerieButton',
                defaultMessage: 'New series',
              }}
            />
          </Button>
        )}
        <div className='mcs-queryToolSeries_serieButtons'>{this.props.actionButtons}</div>
      </div>
    );
  }
}

export default compose<{}, QueryToolSeriesProps>(injectFeatures, injectIntl)(QueryToolSeries);

const messages = defineMessages({
  otql: {
    id: 'query-tool.otql',
    defaultMessage: 'OTQL',
  },
  activitiesAnalytics: {
    id: 'query-tool.activitiesAnalytics',
    defaultMessage: 'Activities analytics',
  },
  resourcesUsage: {
    id: 'query-tool.resourcesUsage',
    defaultMessage: 'Resources usage',
  },
  collectionVolumes: {
    id: 'query-tool.collectionVolumes',
    defaultMessage: 'Collection volumes',
  },
  dataIngestion: {
    id: 'query-tool.dataIngestion',
    defaultMessage: 'Data ingestion',
  },
});
