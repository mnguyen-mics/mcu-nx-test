import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import * as React from 'react';
import AceEditor, { AceEditorProps, Annotation } from 'react-ace';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import { IQueryService } from '../../services/QueryService';
import CustomOtqlMode from './theme/CustomOtqlMode';
import { defineAce } from './theme/style/otql.theme.js';

export interface OtqlConsoleProps extends AceEditorProps {
  datamartId: string;
}

interface State {
  annotations: Annotation[];
}

export default class OtqlConsole extends React.Component<OtqlConsoleProps, State> {
  aceEditor: any = null;
  debouncing: any;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: OtqlConsoleProps) {
    super(props);
    this.state = {
      annotations: [],
    };
  }

  componentDidMount() {
    defineAce();
    if (this.aceEditor && this.aceEditor.editor) {
      this.aceEditor.editor.completers = [this.buildCustomCompleters()];
      const customMode = new CustomOtqlMode();
      this.aceEditor.editor.getSession().setMode(customMode);
    }
  }

  findCompleters = (query: string, row: number, col: number) => {
    return this._queryService.autocompleteOtqlQuery(this.props.datamartId, query, row, col);
  };

  onChange = (value: string, event?: any) => {
    const editor = this.aceEditor.editor;

    if (this.props.onChange) {
      this.props.onChange(value, event);
    }

    if (this.debouncing) {
      window.clearTimeout(this.debouncing);
    }

    this.debouncing = setTimeout(() => {
      this._queryService
        .checkOtqlQuery(this.props.datamartId, value)
        .then(d => d.data)
        .then(d => {
          if (d.status === 'error') {
            const annotation: Annotation = {
              row: d.error.position.row - 1,
              column: d.error.position.col - 1,
              text: d.error.message,
              type: 'error',
            };
            editor.getSession().setAnnotations([annotation]);
            this.setState({ annotations: [annotation] });
          } else {
            this.setState({ annotations: [] });
          }
        })
        .catch(() => this.setState({ annotations: [] }));
    }, 1000);
  };

  buildCustomCompleters = () => {
    return {
      identifierRegexps: [/[\@a-zA-Z_0-9]/],
      getCompletions: (
        editor: any,
        session: any,
        pos: { row: number; column: number },
        prefix: any,
        callback: any,
      ) => {
        this.findCompleters(editor.getValue() as string, pos.row + 1, pos.column + 1).then(res => {
          const valueFromServer = res
            ? res.map(r => ({
                name: r.field_name,
                value: r.field_name,
                meta: r.type,
              }))
            : [];
          callback(null, [
            ...valueFromServer,
            { name: 'SELECT', value: 'SELECT', score: 3, meta: 'keyword' },
            { name: 'FROM', value: 'FROM', score: 3, meta: 'keyword' },
            { name: 'WHERE', value: 'WHERE', score: 3, meta: 'keyword' },
            { name: 'LIMIT', value: 'LIMIT', score: 3, meta: 'keyword' },
          ]);
        });
      },
    };
  };

  render() {
    const setAceEditorRef = (aceEditorRef: any) => (this.aceEditor = aceEditorRef);

    defineAce();

    return (
      <div>
        <AceEditor
          {...this.props}
          onChange={this.onChange}
          annotations={this.state.annotations}
          mode='otql'
          theme='otql'
          ref={setAceEditorRef}
          width='100%'
          setOptions={{
            showGutter: true,
          }}
        />
      </div>
    );
  }
}
