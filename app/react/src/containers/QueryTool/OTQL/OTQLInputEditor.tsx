import * as React from 'react';
import { Button, Switch, Select, Modal } from 'antd';
import { FormattedMessage } from 'react-intl';
import { Card } from '../../../components/Card/index';
import { OtqlConsole, McsIcon } from '../../../components/index';
import { QueryPrecisionMode } from '../../../models/datamart/graphdb/OTQLResult';

export interface Props {
  onRunQuery: (query: string) => void;
  onAbortQuery: () => void;
  runningQuery: boolean;
  datamartId: string;
  onQueryChange: (query: string) => void;
  defaultValue?: string;
  precision: QueryPrecisionMode;
  useCache: boolean;
  handleChange: (useCache: boolean, precision: QueryPrecisionMode) => void;
}

interface State {
  query: string;
  visible: boolean;
}

class OTQLInputEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      query: '',
      visible: false,
    };
  }

  updateQuery = (
    value: string /*event: React.ChangeEvent<HTMLTextAreaElement>*/,
  ) => {
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
    const { onRunQuery, onAbortQuery, runningQuery } = this.props;
    const { query } = this.state;
    const clearButton = (
      <Button onClick={this.clearQuery}>
        <FormattedMessage
          id="queryTool.query-tool-clear-query"
          defaultMessage="Clear Query"
        />
      </Button>
    );

    const abortButton = (
      <Button type="primary" onClick={onAbortQuery}>
        <FormattedMessage
          id="queryTool.query-tool-abort-query"
          defaultMessage="Abort Query"
        />
      </Button>
    );

    const handleOnRunButtonClick = () => onRunQuery(query!);
    const runButton = (
      <Button
        type="primary"
        className="m-l-10"
        disabled={!query}
        onClick={handleOnRunButtonClick}
      >
        <FormattedMessage
          id="queryTool.query-tool-run-query"
          defaultMessage="Run Query"
        />
      </Button>
    );

    const params = (
      <a className="m-l-10" onClick={this.showModal}>
        <McsIcon type="gears" />
      </a>
    );

    return (
      <div>
        {query && clearButton}
        {runningQuery ? abortButton : runButton}
        {params}
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
      defaultValue,
      useCache,
      precision,
      handleChange,
    } = this.props;

    const onCacheChange = (a: boolean) => handleChange(a, precision);
    const onPrecisionChange = (a: QueryPrecisionMode) =>
      handleChange(useCache, a);

    return (
      <Card
        title={
          <FormattedMessage
            id="queryTool.otql-query-editor-card-title"
            defaultMessage="OTQL Query"
          />
        }
        buttons={this.buildEditorActions()}
      >
        <Modal
          title="Query Settings"
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
              id="otql-query-editor-cache"
              defaultMessage="Use Cache"
            />
            : <Switch checked={useCache} onChange={onCacheChange} />
          </div>
          <div>
            <Select
              value={precision}
              style={{ width: '100%' }}
              onChange={onPrecisionChange}
            >
              <Select.Option value="FULL_PRECISION">
                <FormattedMessage
                  id="otql-query-editor-precision-full"
                  defaultMessage="Full Precision"
                />
              </Select.Option>
              <Select.Option value="MEDIUM_PRECISION">
                <FormattedMessage
                  id="otql-query-editor-precision-medium"
                  defaultMessage="Medium Precision"
                />
              </Select.Option>
              <Select.Option value="LOWER_PRECISION">
                <FormattedMessage
                  id="otql-query-editor-precision-low"
                  defaultMessage="Low Precision"
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
          height="250px"
          enableBasicAutocompletion={true}
          enableLiveAutocompletion={false}
          defaultValue={defaultValue}
        />
      </Card>
    );
  }
}

export default OTQLInputEditor;
