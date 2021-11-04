import * as React from 'react';
import { Button, Switch, Select, Modal } from 'antd';
import { FormattedMessage } from 'react-intl';
import { Card, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { OtqlConsole } from '../../../components/index';
import { QueryPrecisionMode } from '../../../models/datamart/graphdb/OTQLResult';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { compose } from 'recompose';
import { SettingOutlined } from '@ant-design/icons';

export interface OtqlInputEditorProps {
  onRunQuery: (query: string) => void;
  onAbortQuery: () => void;
  runningQuery: boolean;
  datamartId: string;
  onQueryChange: (query: string) => void;
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
}

type Props = OtqlInputEditorProps & InjectedFeaturesProps;

interface State {
  query: string;
  visible: boolean;
}

class OTQLInputEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      query: props.defaultValue || '',
      visible: false,
    };
  }

  updateQuery = (value: string /*event: React.ChangeEvent<HTMLTextAreaElement>*/) => {
    this.setState({ query: value });
    this.props.onQueryChange(value);
  };

  clearQuery = () => this.setState({ query: '' });

  validateQuery = () => {
    const { query } = this.state;
    return (
      query &&
      query.toLowerCase().indexOf('select') !== -1 &&
      query.toLowerCase().indexOf('from') !== -1
    );
  };

  buildEditorActions = () => {
    const { onRunQuery, onAbortQuery, runningQuery, hasFeature } = this.props;
    const { query } = this.state;
    const clearButton = (
      <Button onClick={this.clearQuery}>
        <FormattedMessage id='queryTool.otql.edit.clear.label' defaultMessage='Clear Query' />
      </Button>
    );

    const newClearButton = (
      <Button onClick={this.clearQuery} className='mcs-otqlInputEditor_clear_button'>
        <FormattedMessage id='queryTool.otql.edit.new.clear.label' defaultMessage='Clear' />
      </Button>
    );

    const abortButton = (
      <Button type='primary' className='m-l-10' onClick={onAbortQuery}>
        <FormattedMessage id='queryTool.otql.edit.abort.label' defaultMessage='Abort Query' />
      </Button>
    );

    const handleOnRunButtonClick = () => onRunQuery(query);
    const runButton = (
      <Button type='primary' className='m-l-10' disabled={!query} onClick={handleOnRunButtonClick}>
        <FormattedMessage id='queryTool.otql.edit.run.label' defaultMessage='Run Query' />
      </Button>
    );

    const newRunButton = (
      <Button
        type='primary'
        className='m-l-10 mcs-otqlInputEditor_run_button'
        disabled={!query}
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
        {query && clearButton}
        {runningQuery ? abortButton : runButton}
        {params}
      </div>
    ) : (
      <div>
        {newParams}
        {query && newClearButton}
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
    const { query } = this.state;
    const {
      datamartId,
      useCache,
      evaluateGraphQl,
      precision,
      handleChange,
      queryEditorClassName = 'mcs-otqlInputEditor_otqlConsole',
      hasFeature,
    } = this.props;

    const onCacheChange = (a: boolean) => handleChange(evaluateGraphQl, a, precision);
    const onEvaluateGraphQlChange = (a: boolean) => handleChange(a, useCache, precision);
    const onPrecisionChange = (a: QueryPrecisionMode) => handleChange(evaluateGraphQl, useCache, a);

    return (
      <Card
        title={<FormattedMessage id='queryTool.otql.card.title' defaultMessage='OTQL' />}
        buttons={this.buildEditorActions()}
        className={hasFeature('query-tool-graphs') ? 'mcs-otqlInputEditor_card' : ''}
      >
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
        <OtqlConsole
          onChange={this.updateQuery}
          datamartId={datamartId}
          value={query}
          showPrintMargin={false}
          height='250px'
          enableBasicAutocompletion={true}
          enableLiveAutocompletion={false}
          className={queryEditorClassName ? queryEditorClassName : ''}
        />
      </Card>
    );
  }
}

export default compose<{}, OtqlInputEditorProps>(injectFeatures)(OTQLInputEditor);
