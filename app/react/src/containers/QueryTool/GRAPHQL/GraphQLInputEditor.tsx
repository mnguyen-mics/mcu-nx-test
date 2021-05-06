import * as React from 'react';
import { Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import { Card } from '@mediarithmics-private/mcs-components-library';
import AceEditor from 'react-ace';

export interface Props {
  onRunQuery: (query: string) => void;
  onAbortQuery: () => void;
  runningQuery: boolean;
  datamartId: string;
  onQueryChange: (query: string) => void;
  defaultValue?: string;
}

interface State {
  query: string;
  visible: boolean;
}

class GraphQLInputEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      query: '',
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
    const { onRunQuery, onAbortQuery, runningQuery } = this.props;
    const { query } = this.state;
    const clearButton = (
      <Button onClick={this.clearQuery}>
        <FormattedMessage id='queryTool.otql.edit.clear.label' defaultMessage='Clear Query' />
      </Button>
    );

    const abortButton = (
      <Button type='primary' className='m-l-10' onClick={onAbortQuery}>
        <FormattedMessage id='queryTool.otql.edit.abort.label' defaultMessage='Abort Query' />
      </Button>
    );

    const handleOnRunButtonClick = () => onRunQuery(query!);
    const runButton = (
      <Button type='primary' className='m-l-10' disabled={!query} onClick={handleOnRunButtonClick}>
        <FormattedMessage id='queryTool.otql.edit.run.label' defaultMessage='Run Query' />
      </Button>
    );

    return (
      <div>
        {query && clearButton}
        {runningQuery ? abortButton : runButton}
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
    const { defaultValue } = this.props;

    return (
      <Card
        title={
          <FormattedMessage id='queryTool.graphql.card.title' defaultMessage='GraphQL Query' />
        }
        buttons={this.buildEditorActions()}
      >
        <div>
          <AceEditor
            value={query}
            showPrintMargin={false}
            height='250px'
            enableBasicAutocompletion={true}
            enableLiveAutocompletion={false}
            defaultValue={defaultValue}
            onChange={this.updateQuery}
            mode='otql'
            theme='otql'
            width='100%'
            setOptions={{
              showGutter: true,
            }}
          />
        </div>
      </Card>
    );
  }
}

export default GraphQLInputEditor;
