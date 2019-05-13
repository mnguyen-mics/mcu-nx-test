import * as React from 'react';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import { Card } from '../../../components/Card/index';
import { OtqlConsole } from '../../../components/index';

export interface Props {
  onRunQuery: (query: string) => void;
  onAbortQuery: () => void;
  runningQuery: boolean;
  datamartId: string;
  onQueryChange: (query: string) => void;
  defaultValue?: string
}

interface State {
  query: string;
}

class OTQLInputEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      query: '',
    };
  }

  updateQuery = (
    value: string /*event: React.ChangeEvent<HTMLTextAreaElement>*/,
  ) => {
    this.setState({ query: value });
    this.props.onQueryChange(value)
  }

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
      <Button type="primary" className="m-l-5" disabled={!query} onClick={handleOnRunButtonClick}>
        <FormattedMessage
          id="queryTool.query-tool-run-query"
          defaultMessage="Run Query"
        />
      </Button>
    );

    return (
      <div>
        {query && clearButton}
        {runningQuery ? abortButton : runButton}
      </div>
    );
  };

  render() {
    const { query } = this.state;
    const { datamartId, defaultValue } = this.props;

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
