import * as React from 'react';
import { Button, Input } from 'antd';
import { OtqlConsole } from '../../../components/index';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { compose } from 'recompose';
import { QueryListModel, SerieQueryModel } from './QueryToolTab';
import { DEFAULT_OTQL_QUERY, getNewSerieQuery, getNewSubSerieQuery } from './utils/QueryUtils';
import { isQueryListModel, isSerieQueryModel } from '../../../models/datamart/graphdb/OTQLResult';
import { FormattedMessage } from 'react-intl';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';

export interface OTQLSeriesProps {
  datamartId: string;
  actionButtons?: React.ReactNode;
  seriesQueries: SerieQueryModel[];
  onInputChange: (id: string, queryId?: string) => (e: any) => void;
  updateQueryModel: (serieId: string, queryId?: string) => (query: string) => void;
  updateNameModel: (id: string, queryId?: string) => (e: any) => void;
  displaySeriesInput: (id: string, queryId?: string) => (e: any) => void;
  onSeriesChange: (series: SerieQueryModel[]) => void;
  editionMode?: boolean;
}

type Props = OTQLSeriesProps & InjectedFeaturesProps;

class OTQLSeries extends React.Component<Props> {
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
        let newQueryModel: string | QueryListModel[];
        if (queryModel.length === 2) {
          newQueryModel = DEFAULT_OTQL_QUERY;
        } else {
          newQueryModel = queryModel.filter(q => q.id !== subSerieId);
        }
        return {
          ...serie,
          queryModel: newQueryModel,
        };
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
      return `Series ${index + 1}`;
    } else {
      return `Series ${index + 1}`;
    }
  };

  renderStepHeader = (
    queryModelStep: SerieQueryModel | QueryListModel,
    i: number,
    existingSeriesNames?: string[],
  ) => {
    const { onInputChange, updateNameModel, displaySeriesInput, editionMode, seriesQueries } =
      this.props;
    const queryModel = queryModelStep;
    const queryModelId = queryModel.id;
    const subSerieQueryId = isSerieQueryModel(queryModel) ? undefined : queryModel.id;
    const hideHeader = seriesQueries.length === 1 && isSerieQueryModel(queryModel);
    if (editionMode || hideHeader) {
      return <span />;
    } else {
      return (
        <React.Fragment>
          {queryModel.inputVisible ? (
            <Input
              className={'mcs-otqlInputEditor_stepNameInput'}
              onChange={onInputChange(queryModelId, subSerieQueryId)}
              onPressEnter={updateNameModel(queryModelId, subSerieQueryId)}
              value={queryModel.name}
            />
          ) : (
            <Button
              className={'mcs-otqlInputEditor_stepNameButton'}
              onClick={displaySeriesInput(queryModelId, subSerieQueryId)}
              type='dashed'
            >
              {queryModel.name || this.generateSerieName(i, existingSeriesNames)}
            </Button>
          )}
        </React.Fragment>
      );
    }
  };

  renderAddNewValueButton = (serieQueryModelStep: SerieQueryModel) => {
    const { onSeriesChange, seriesQueries, editionMode } = this.props;
    const model = serieQueryModelStep;
    if (isSerieQueryModel(model) && !editionMode) {
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
              : [getNewSubSerieQuery(`Dimension ${dimensionIndex}`, previousModels)].concat(
                  getNewSubSerieQuery(`Dimension ${dimensionIndex + 1}`, DEFAULT_OTQL_QUERY),
                );

            return {
              ...serie,
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
              : 'mcs-otqlSeries_newValueContainer'
          }`}
        >
          <Button className='mcs-otqlSeries_newValue' onClick={addNewSubSerie}>
            <div className='mcs-otqlSeries_plusBtn'>
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

  renderBodyStep = (step: SerieQueryModel | QueryListModel) => {
    const { updateQueryModel, datamartId } = this.props;
    const queryModelId = step.id;
    const subSerieQueryId = isSerieQueryModel(step) ? undefined : step.id;

    const renderOtqlConsole = (queryModel: string, onChange: (query: string) => void) => {
      return (
        <OtqlConsole
          key={queryModelId}
          onChange={onChange}
          datamartId={datamartId}
          value={queryModel}
          showPrintMargin={false}
          enableBasicAutocompletion={true}
          enableLiveAutocompletion={false}
          className={'mcs-otqlInputEditor_otqlConsole'}
        />
      );
    };

    return isSerieQueryModel(step) ? (
      typeof step.queryModel === 'string' ? (
        renderOtqlConsole(step.queryModel, updateQueryModel(queryModelId, subSerieQueryId))
      ) : (
        <div className='mcs-otqlSeries_subStepsContainer'>
          {step.queryModel.map((subStep, i) => {
            return (
              <div key={i} className='mcs-otqlSeries_subStep'>
                {this.renderStepHeader(subStep, i)}
                <Button
                  shape='circle'
                  icon={<CloseOutlined />}
                  className={'mcs-otqlSeries_removeStepBtn'}
                  onClick={this.onSubStepRemove(step.id, subStep.id)}
                />
                {renderOtqlConsole(subStep.query, updateQueryModel(queryModelId, subStep.id))}
              </div>
            );
          })}
        </div>
      )
    ) : (
      renderOtqlConsole(step.query, updateQueryModel(queryModelId, subSerieQueryId))
    );
  };

  render() {
    const { seriesQueries, editionMode } = this.props;

    const addStep = () => {
      this.addStep(seriesQueries.map(q => q.name));
    };

    return (
      <div className='mcs-otqlSeries_container'>
        {seriesQueries.map((serieQuery, i) => {
          return (
            <div key={i} className='mcs-otqlSeries_mainStep'>
              {this.renderStepHeader(
                serieQuery,
                i,
                seriesQueries.map(q => q.name),
              )}
              {seriesQueries.length !== 1 && (
                <Button
                  shape='circle'
                  icon={<CloseOutlined />}
                  className={'mcs-otqlSeries_removeStepBtn'}
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
                defaultMessage: 'New serie',
              }}
            />
          </Button>
        )}
        <div className='mcs-otqlSeries_serieButtons'>{this.props.actionButtons}</div>
      </div>
    );
  }
}

export default compose<{}, OTQLSeriesProps>(injectFeatures)(OTQLSeries);
