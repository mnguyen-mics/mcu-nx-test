import * as React from 'react';
import { Button, Input } from 'antd';
import { OtqlConsole } from '../../../components/index';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { compose } from 'recompose';
import { SerieQueryModel } from './OTQLRequest';
import { DEFAULT_OTQL_QUERY, getNewSerieQuery } from './utils/QueryUtils';
import TimelineStepBuilder, {
  Step,
} from '../../../components/TimelineStepBuilder/TimelineStepBuilder';

export interface OTQLSeriesEditorProps {
  datamartId: string;
  actionButtons?: React.ReactNode;
  seriesQueries: SerieQueryModel[];
  onInputChange: (id: string) => (e: any) => void;
  updateQueryModel: (id: string) => (query: string) => void;
  updateNameModel: (id: string) => (e: any) => void;
  displaySeriesInput: (id: string) => (e: any) => void;
  onSeriesChanged: (series: SerieQueryModel[]) => void;
}

type Props = OTQLSeriesEditorProps & InjectedFeaturesProps;

class OTQLSeriesEditor extends React.Component<Props> {
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

  getSteps(series: SerieQueryModel[]): Array<Step<SerieQueryModel>> {
    return series.map((p, i) => ({
      id: `${i}`,
      name: p.serieName || `Serie ${i}`,
      properties: p,
    }));
  }
  renderHeaderTimeline = () => {
    return <div />;
  };

  renderFooterTimeline = () => {
    return <div />;
  };

  renderStepHeader = (queryModelStep: Step<SerieQueryModel>, i: number) => {
    const { onInputChange, updateNameModel, displaySeriesInput } = this.props;
    const queryModel = queryModelStep.properties;
    const queryModelId = queryModel.id;
    return (
      <React.Fragment>
        {queryModel.inputVisible ? (
          <Input
            className={'mcs-otqlInputEditor_stepNameInput'}
            onChange={onInputChange(queryModelId)}
            onPressEnter={updateNameModel(queryModelId)}
            value={queryModel.serieName}
          />
        ) : (
          <Button
            className={'mcs-otqlInputEditor_stepNameButton'}
            onClick={displaySeriesInput(queryModelId)}
            type='dashed'
          >
            {queryModel.serieName || `Serie ${i + 1}`}
          </Button>
        )}
      </React.Fragment>
    );
  };

  renderStepBody = (queryModelStep: Step<SerieQueryModel>, i: number) => {
    const { updateQueryModel, datamartId } = this.props;
    const queryModel = queryModelStep.properties;
    const queryModelId = queryModel.id;
    return (
      <OtqlConsole
        key={queryModelId}
        onChange={updateQueryModel(queryModelId)}
        datamartId={datamartId}
        value={queryModel.query}
        showPrintMargin={false}
        enableBasicAutocompletion={true}
        enableLiveAutocompletion={false}
        className={'mcs-otqlInputEditor_otqlConsole'}
      />
    );
  };

  renderAfterBulletElement() {
    return <div />;
  }

  render() {
    const { seriesQueries } = this.props;

    const getStepFromSeriesModel = (series: SerieQueryModel) => {
      return {
        id: series.id,
        name: series.serieName,
        properties: {
          id: series.id,
          query: series.query,
        },
      };
    };
    const rendering = {
      shouldDisplayNumbersInBullet: false,
      renderHeaderTimeline: this.renderHeaderTimeline,
      renderFooterTimeline: this.renderFooterTimeline,
      renderStepBody: this.renderStepBody,
      renderAfterBulletElement: this.renderAfterBulletElement,
      renderStepHeader: this.renderStepHeader,
      shouldRenderArrows: false,
      shouldRenderTimeline: false,
      getAddStepText: () => {
        return {
          id: 'otql.serieseditor.newseries',
          defaultMessage: 'New series',
        };
      },
    };

    const newName = `Series ${seriesQueries.length + 1}`;
    const stepManagement = {
      onStepAdded: this.onStepChange,
      onStepRemoved: this.onStepChange,
      onStepsReordered: this.onStepChange,
      getDefaultStep: () => getStepFromSeriesModel(getNewSerieQuery(newName, DEFAULT_OTQL_QUERY)),
    };

    return (
      <div className='mcs-otqlInputEditor_serieQuery'>
        <TimelineStepBuilder
          steps={this.getSteps(seriesQueries)}
          rendering={rendering}
          stepManagement={stepManagement}
          maxSteps={4}
        />
        <div className='mcs-otqlInputEditor_serieButtons'>{this.props.actionButtons}</div>
      </div>
    );
  }
}

export default compose<{}, OTQLSeriesEditorProps>(injectFeatures)(OTQLSeriesEditor);
