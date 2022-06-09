import * as React from 'react';
import { Button, Input } from 'antd';
import { OtqlConsole } from '../../../components/index';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { compose } from 'recompose';
import { QueryListModel, SerieQueryModel } from './QueryToolTab';
import { DEFAULT_OTQL_QUERY, getNewSerieQuery, getNewSubSerieQuery } from './utils/QueryUtils';
import TimelineStepBuilder, {
  Step,
  StepManagement,
} from '../../../components/TimelineStepBuilder/TimelineStepBuilder';
import { isQueryListModel, isSerieQueryModel } from '../../../models/datamart/graphdb/OTQLResult';
import { FormattedMessage } from 'react-intl';

export interface OTQLSeriesProps {
  datamartId: string;
  actionButtons?: React.ReactNode;
  seriesQueries: SerieQueryModel[];
  onInputChange: (id: string, queryId?: string) => (e: any) => void;
  updateQueryModel: (serieId: string, queryId?: string) => (query: string) => void;
  updateNameModel: (id: string, queryId?: string) => (e: any) => void;
  displaySeriesInput: (id: string, queryId?: string) => (e: any) => void;
  onSeriesChanged: (series: SerieQueryModel[]) => void;
  editionMode?: boolean;
}

type Props = OTQLSeriesProps & InjectedFeaturesProps;

class OTQLSeries extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  onStepChange = (steps: Array<Step<SerieQueryModel>>) => {
    this.props.onSeriesChanged(
      steps.map(x => {
        return x.properties;
      }),
    );
  };

  onSubStepChange = (serieId?: string) => (steps: Array<Step<QueryListModel>>) => {
    const { seriesQueries } = this.props;

    const newSeries = seriesQueries.map(serie => {
      const queryModel = serie.queryModel;
      if (serie.id === serieId && isQueryListModel(queryModel)) {
        // if we delete a subStep and if there is only one left, we swap queryModel
        let newQueryModel: string | QueryListModel[];
        if (queryModel.length === 2) {
          newQueryModel = DEFAULT_OTQL_QUERY;
        } else {
          newQueryModel = steps.map(s => s.properties);
        }
        return {
          ...serie,
          queryModel: newQueryModel,
        };
      }
      return serie;
    });
    this.props.onSeriesChanged(newSeries);
  };

  getSteps(series: SerieQueryModel[]): Array<Step<SerieQueryModel>> {
    return series.map((p, i) => ({
      id: p.id,
      name: p.name || `Serie ${i}`,
      properties: p,
    }));
  }

  getSubSteps(subSeries: QueryListModel[]): Array<Step<QueryListModel>> {
    return subSeries.map((p, i) => ({
      id: p.id,
      name: p.name || `Dimension ${i}`,
      properties: p,
    }));
  }

  renderStepHeader = (queryModelStep: Step<SerieQueryModel | QueryListModel>, i: number) => {
    const { onInputChange, updateNameModel, displaySeriesInput, editionMode, seriesQueries } =
      this.props;
    const queryModel = queryModelStep.properties;
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
              {queryModel.name || `Serie ${i + 1}`}
            </Button>
          )}
        </React.Fragment>
      );
    }
  };

  renderAfterBulletElement = (
    queryModelStep: Step<SerieQueryModel | QueryListModel>,
    i: number,
  ) => {
    const { onSeriesChanged, seriesQueries, editionMode } = this.props;
    const model = queryModelStep.properties;
    if (isSerieQueryModel(model) && !editionMode) {
      const addNewSubSerie = () => {
        const newSeries = seriesQueries.map(serie => {
          if (serie.id === queryModelStep.id) {
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
        onSeriesChanged(newSeries);
      };
      return (
        <Button className='mcs-otqlInputEditor_newSubSerieQuery' onClick={addNewSubSerie}>
          <FormattedMessage id='otql.serieseditor.newseries.newValue' defaultMessage='New Value' />
        </Button>
      );
    }
    return <div />;
  };

  getRenderingProps = (isMainStep?: boolean) => {
    const { editionMode } = this.props;
    return {
      shouldDisplayNumbersInBullet: false,
      renderStepBody: this.renderStepBody,
      renderStepHeader: this.renderStepHeader,
      shouldRenderArrows: false,
      renderAfterBulletElement: this.renderAfterBulletElement,
      shouldRenderTimeline: editionMode ? false : !!isMainStep,
      getAddStepText: () => {
        return {
          id: 'otql.serieseditor.newseries',
          defaultMessage: 'New series',
        };
      },
    };
  };

  getStepManagementProps = (isMainStep: boolean, serieId?: string) => {
    const { seriesQueries } = this.props;
    const getStepFromSeriesModel = (serie: SerieQueryModel | QueryListModel) => {
      const queryProperty = isSerieQueryModel(serie)
        ? {
            queryModel: serie.queryModel,
          }
        : { query: serie.query };
      return {
        id: serie.id,
        name: serie.name,
        properties: {
          id: serie.id,
          name: serie.name,
          inputVisble: serie.inputVisible,
          ...queryProperty,
        },
      };
    };

    const getDefaultStep = () => {
      if (isMainStep) {
        return getStepFromSeriesModel(getNewSerieQuery(newName, DEFAULT_OTQL_QUERY));
      } else {
        return getStepFromSeriesModel(getNewSubSerieQuery(newName, DEFAULT_OTQL_QUERY));
      }
    };

    const newName = `Series ${seriesQueries.length + 1}`;
    const stepManagement: StepManagement<SerieQueryModel | QueryListModel> = {
      onStepAdded: this.onStepChange,
      onStepRemoved: isMainStep ? this.onStepChange : this.onSubStepChange(serieId),
      onStepsReordered: this.onStepChange,
      getDefaultStep: () => getDefaultStep(),
    };
    return stepManagement;
  };

  renderStepBody = (step: Step<SerieQueryModel | QueryListModel>) => {
    const { updateQueryModel, datamartId, editionMode } = this.props;
    const properties = step.properties;
    const queryModelId = properties.id;
    const subSerieQueryId = isSerieQueryModel(properties) ? undefined : properties.id;

    return isSerieQueryModel(properties) ? (
      typeof properties.queryModel === 'string' ? (
        <OtqlConsole
          key={queryModelId}
          onChange={updateQueryModel(queryModelId, subSerieQueryId)}
          datamartId={datamartId}
          value={properties.queryModel}
          showPrintMargin={false}
          enableBasicAutocompletion={true}
          enableLiveAutocompletion={false}
          className={'mcs-otqlInputEditor_otqlConsole'}
        />
      ) : (
        <TimelineStepBuilder
          steps={this.getSubSteps(properties.queryModel)}
          rendering={this.getRenderingProps()}
          stepManagement={this.getStepManagementProps(false, queryModelId)}
          maxSteps={0}
          editionMode={editionMode}
        />
      )
    ) : (
      <OtqlConsole
        key={queryModelId}
        onChange={updateQueryModel(queryModelId, subSerieQueryId)}
        datamartId={datamartId}
        value={properties.query}
        showPrintMargin={false}
        enableBasicAutocompletion={true}
        enableLiveAutocompletion={false}
        className={'mcs-otqlInputEditor_otqlConsole'}
      />
    );
  };

  render() {
    const { seriesQueries, editionMode } = this.props;

    return (
      <div className='mcs-otqlInputEditor_serieQuery'>
        <TimelineStepBuilder
          steps={this.getSteps(seriesQueries)}
          rendering={this.getRenderingProps(true)}
          stepManagement={this.getStepManagementProps(true)}
          maxSteps={4}
          editionMode={editionMode}
          mainStep={true}
        />
        <div className='mcs-otqlInputEditor_serieButtons'>{this.props.actionButtons}</div>
      </div>
    );
  }
}

export default compose<{}, OTQLSeriesProps>(injectFeatures)(OTQLSeries);
