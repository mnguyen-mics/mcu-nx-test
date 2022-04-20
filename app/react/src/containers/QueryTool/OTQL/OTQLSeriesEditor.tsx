import * as React from 'react';
import { Button, Input } from 'antd';
import { FormattedMessage } from 'react-intl';
import { Card } from '@mediarithmics-private/mcs-components-library';
import { OtqlConsole } from '../../../components/index';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { compose } from 'recompose';
import { CloseOutlined } from '@ant-design/icons';
import { SerieQueryModel } from './OTQLRequest';

export interface OTQLSeriesEditorProps {
  datamartId: string;
  actionButtons?: React.ReactNode;
  serieQueries: SerieQueryModel[];
  onInputChange: (id: string) => (e: any) => void;
  updateQueryModel: (id: string) => (query: string) => void;
  updateNameModel: (id: string) => (e: any) => void;
  displaySerieInput: (id: string) => (e: any) => void;
  addNewSerie: (index: number) => () => void;
  deleteSerie: (id: string) => () => void;
}

type Props = OTQLSeriesEditorProps & InjectedFeaturesProps;

class OTQLSeriesEditor extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const {
      serieQueries,
      onInputChange,
      updateQueryModel,
      updateNameModel,
      displaySerieInput,
      addNewSerie,
      deleteSerie,
    } = this.props;
    const { hasFeature, datamartId, actionButtons } = this.props;
    return (
      <div className='mcs-otqlInputEditor_serieQuery'>
        {serieQueries.map((queryModel, i) => {
          const queryModelId = queryModel.id;
          const title = (
            <React.Fragment>
              {queryModel.inputVisible ? (
                <Input
                  style={{ width: '200px' }}
                  onChange={onInputChange(queryModelId)}
                  onPressEnter={updateNameModel(queryModelId)}
                  value={queryModel.serieName}
                />
              ) : (
                <Button onClick={displaySerieInput(queryModelId)} type='dashed'>
                  {queryModel.serieName || `Serie ${i + 1}`}
                </Button>
              )}
              <CloseOutlined
                className='mcs-otqlInputEditor_deleteSerie'
                onClick={deleteSerie(queryModelId)}
                style={{ visibility: i === 0 ? 'hidden' : 'visible' }}
              />
            </React.Fragment>
          );
          return (
            <Card
              key={queryModelId}
              title={title}
              className={
                hasFeature('query-tool-graphs')
                  ? 'mcs-otqlInputEditor_card mcs-modal_container'
                  : 'mcs-modal_container'
              }
            >
              <OtqlConsole
                onChange={updateQueryModel(queryModelId)}
                datamartId={datamartId}
                value={queryModel.query}
                showPrintMargin={false}
                height='100px'
                enableBasicAutocompletion={true}
                enableLiveAutocompletion={false}
                className={'mcs-otqlInputEditor_otqlConsole'}
              />
            </Card>
          );
        })}
        <div className='mcs-otqlInputEditor_serieButtons'>
          <Button
            className='mcs-otqlInputEditor_newSerieButton'
            onClick={addNewSerie(serieQueries.length + 1)}
          >
            <FormattedMessage id='queryTool.otql.newSerie' defaultMessage='New Series' />
          </Button>
          {actionButtons}
        </div>
      </div>
    );
  }
}

export default compose<{}, OTQLSeriesEditorProps>(injectFeatures)(OTQLSeriesEditor);
