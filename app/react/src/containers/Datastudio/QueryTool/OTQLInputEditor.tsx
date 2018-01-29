import * as React from 'react';
import { Input, Button } from 'antd';
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
  InjectedIntlProps,
} from 'react-intl';
import { Card } from '../../../components/Card/index';

export interface Props {
  onRunQuery: (query: string) => void;
  onAbortQuery: () => void;
  runningQuery: boolean;
}

interface State {
  query: string | null;
}

class OTQLInputEditor extends React.Component<
  Props & InjectedIntlProps,
  State
> {
  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      query: null,
    };
  }

  updateQuery = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
    this.setState({ query: event.target.value });

  clearQuery = () => this.setState({ query: null });

  validateQuery = () => {
    const { query } = this.state;
    return (
      query &&
      query.toLowerCase().indexOf('select') !== -1 &&
      query.toLowerCase().indexOf('from') !== -1
    );
  };

  buildEditorActions = () => {
    const { onRunQuery, onAbortQuery, runningQuery, intl } = this.props;
    const { query } = this.state;
    const clearButton = (
      <Button onClick={this.clearQuery}>
        <FormattedMessage
          id="query-tool-clear-query"
          defaultMessage="Clear Query"
        />
      </Button>
    );

    const abortButton = (
      <Button type="primary" onClick={onAbortQuery}>
        <FormattedMessage
          id="query-tool-abort-query"
          defaultMessage="Abort Query"
        />
      </Button>
    );

    const handleOnRunButtonClick = () => onRunQuery(query!);
    const runButton = (
      <Button type="primary" disabled={!query} onClick={handleOnRunButtonClick}>
        <FormattedMessage
          id="query-tool-run-query"
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
    const { onRunQuery, onAbortQuery, runningQuery, intl } = this.props;
    const { query } = this.state;

    return (
      <Card
        title={
          <FormattedMessage
            id="otql-query-editor-card-title"
            defaultMessage="OTQL Query"
          />
        }
        buttons={this.buildEditorActions()}
      >
        <Input.TextArea
          rows={8}
          style={{ fontSize: '1.4em' }}
          onChange={this.updateQuery}
          value={query}
          placeholder={intl.formatMessage(messages.otqlInputPlaceholder)}
        />
      </Card>
    );
  }
}

export default injectIntl(OTQLInputEditor);

const messages = defineMessages({
  otqlInputPlaceholder: {
    id: 'otql-input-placeholder',
    defaultMessage: 'Enter your otql here',
  },
});
