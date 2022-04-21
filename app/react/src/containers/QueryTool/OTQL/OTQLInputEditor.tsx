import * as React from 'react';
import { Button, Switch, Select, Modal } from 'antd';
import { FormattedMessage } from 'react-intl';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { QueryPrecisionMode } from '../../../models/datamart/graphdb/OTQLResult';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { compose } from 'recompose';
import { SettingOutlined } from '@ant-design/icons';
import OTQLSeriesEditor from './OTQLSeriesEditor';
import { SerieQueryModel } from './OTQLRequest';

export interface OtqlInputEditorProps {
  onRunQuery: () => void;
  onAbortQuery: () => void;
  runningQuery: boolean;
  datamartId: string;
  defaultValue?: string;
  precision: QueryPrecisionMode;
  evaluateGraphQl: boolean;
  useCache: boolean;
  handleChange: (
    evaluateGraphQl: boolean,
    useCache: boolean,
    precision: QueryPrecisionMode,
  ) => void;
  queryEditorClassName?: string;
  isQuerySeriesActivated?: boolean;
  serieQueries: SerieQueryModel[];
  onInputChange: (id: string) => (e: any) => void;
  updateQueryModel: (id: string) => (query: string) => void;
  updateNameModel: (id: string) => (e: any) => void;
  displaySerieInput: (id: string) => (e: any) => void;
  onSeriesChanged: (series: SerieQueryModel[]) => void;
}

type Props = OtqlInputEditorProps & InjectedFeaturesProps;

interface State {
  visible: boolean;
}

class OTQLInputEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  buildEditorActions = () => {
    const { onRunQuery, onAbortQuery, runningQuery, hasFeature, isQuerySeriesActivated } =
      this.props;
    const abortButton = (
      <Button type='primary' className='m-l-10' onClick={onAbortQuery}>
        <FormattedMessage id='queryTool.otql.edit.abort.label' defaultMessage='Abort Query' />
      </Button>
    );

    const handleOnRunButtonClick = () => onRunQuery();
    const runButton = (
      <Button type='primary' className='m-l-10' onClick={handleOnRunButtonClick}>
        <FormattedMessage id='queryTool.otql.edit.run.label' defaultMessage='Run Query' />
      </Button>
    );

    const newRunButton = (
      <Button
        type='primary'
        className='m-l-10 mcs-otqlInputEditor_run_button'
        onClick={handleOnRunButtonClick}
      >
        <FormattedMessage id='queryTool.otql.edit.new.run.label' defaultMessage='Run' />
      </Button>
    );

    const newAbortButton = (
      <Button
        type='primary'
        className='m-l-10 mcs-otqlInputEditor_abort_button'
        onClick={onAbortQuery}
      >
        <FormattedMessage id='queryTool.otql.edit.new.abort.label' defaultMessage='Abort' />
      </Button>
    );

    const params = (
      <a className='m-l-10' onClick={this.showModal}>
        <McsIcon type='gears' />
      </a>
    );

    const newParams = (
      <a className='mcs-otqlInputEditor_settings_button' onClick={this.showModal}>
        <SettingOutlined />
      </a>
    );

    return !hasFeature('query-tool-graphs') ? (
      <div>
        {!isQuerySeriesActivated}
        {runningQuery ? abortButton : runButton}
        {params}
      </div>
    ) : (
      <div>
        {newParams}
        {!isQuerySeriesActivated}
        {runningQuery ? newAbortButton : newRunButton}
      </div>
    );
  };

  showModal = () => {
    this.setState({ visible: true });
  };

  handleOk = () => {
    this.setState({ visible: false });
  };

  render() {
    const {
      datamartId,
      useCache,
      evaluateGraphQl,
      precision,
      handleChange,
      serieQueries,
      onInputChange,
      updateQueryModel,
      updateNameModel,
      displaySerieInput,
      onSeriesChanged,
    } = this.props;

    const onCacheChange = (a: boolean) => handleChange(evaluateGraphQl, a, precision);
    const onEvaluateGraphQlChange = (a: boolean) => handleChange(a, useCache, precision);
    const onPrecisionChange = (a: QueryPrecisionMode) => handleChange(evaluateGraphQl, useCache, a);

    return (
      <React.Fragment>
        <OTQLSeriesEditor
          datamartId={datamartId}
          actionButtons={this.buildEditorActions()}
          seriesQueries={serieQueries}
          onInputChange={onInputChange}
          updateQueryModel={updateQueryModel}
          updateNameModel={updateNameModel}
          displaySeriesInput={displaySerieInput}
          onSeriesChanged={onSeriesChanged}
        />
        <Modal
          title='Query Settings'
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleOk}
          footer={[
            <Button key={1} onClick={this.handleOk}>
              Ok
            </Button>,
          ]}
        >
          <div style={{ marginBottom: 10 }}>
            <FormattedMessage
              id='queryTool.otql.modal.evaluate.graphql'
              defaultMessage='Evaluate SELECT clause in GraphQL'
            />
            : <Switch checked={evaluateGraphQl} onChange={onEvaluateGraphQlChange} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <FormattedMessage id='queryTool.otql.modal.use.cache' defaultMessage='Use Cache' />
            : <Switch checked={useCache} onChange={onCacheChange} />
          </div>
          <div>
            <Select value={precision} style={{ width: '100%' }} onChange={onPrecisionChange}>
              <Select.Option value='FULL_PRECISION'>
                <FormattedMessage
                  id='queryTool.otql.modal.full.precision'
                  defaultMessage='Full Precision'
                />
              </Select.Option>
              <Select.Option value='MEDIUM_PRECISION'>
                <FormattedMessage
                  id='queryTool.otql.modal.medium.precision'
                  defaultMessage='Medium Precision'
                />
              </Select.Option>
              <Select.Option value='LOWER_PRECISION'>
                <FormattedMessage
                  id='queryTool.otql.modal.low.precision'
                  defaultMessage='Low Precision'
                />
              </Select.Option>
            </Select>
          </div>
        </Modal>
      </React.Fragment>
    );
  }
}

export default compose<{}, OtqlInputEditorProps>(injectFeatures)(OTQLInputEditor);
