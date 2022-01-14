import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import * as React from 'react';
import AceEditor, { AceEditorProps, Annotation } from 'react-ace';
import { lazyInject } from '../../config/inversify.config';
import { TYPES } from '../../constants/types';
import { IQueryService } from '../../services/QueryService';
import CustomOtqlMode from './theme/CustomOtqlMode';
import { defineAce } from './theme/style/otql.theme.js';
import { ErrorQueryResource } from '../../models/datamart/DatamartResource';

export interface OtqlConsoleProps extends AceEditorProps {
  datamartId: string;
}

interface State {
  annotations: Annotation[];
  editorWidth: string;
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
      editorWidth: '100%',
    };
  }

  componentDidMount() {
    defineAce();
    if (this.aceEditor && this.aceEditor.editor) {
      this.aceEditor.editor.completers = [this.buildCustomCompleters()];
      this.aceEditor.editor.getSession().setUseWrapMode(true);
      this.aceEditor.editor.setOption('indentedSoftWrap', false);
      this.aceEditor.editor.completers = [this.buildCustomCompleters()];
      const customMode = new CustomOtqlMode();
      this.aceEditor.editor.getSession().setMode(customMode);
    }
  }

  findCompleters = (query: string, row: number, col: number) => {
    return this._queryService.autocompleteOtqlQuery(this.props.datamartId, query, row, col);
  };

  queryAnnotations = (d: ErrorQueryResource): Annotation[] => {
    switch (d.type) {
      case 'VALID':
        return [];
      case 'VALIDATION_ERROR':
        return d.errors.map(error => {
          return {
            row: error.position.row - 1,
            column: error.position.col,
            text: error.message,
            type: 'error',
          };
        });
      case 'PARSING_ERROR':
        return [
          {
            row: d.error.position.row - 1,
            column: d.error.position.col,
            text: d.error.message,
            type: 'error',
          },
        ];
    }
  };

  onChange = (value: string, event?: any) => {
    const editor = this.aceEditor.editor;
    const { editorWidth } = this.state;

    // this fixes a display bug on the query tool editor MICS-10327
    if (editorWidth === '100%') this.setState({ editorWidth: '99.99%' });

    if (this.props.onChange) {
      this.props.onChange(value, event);
    }

    if (this.debouncing) {
      window.clearTimeout(this.debouncing);
    }

    this.debouncing = setTimeout(() => {
      this._queryService
        .checkOtqlQuery(this.props.datamartId, value)
        .then(d => {
          const annotations = this.queryAnnotations(d.data);
          editor.getSession().setAnnotations(annotations);
          this.setState({ annotations: annotations });
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
    const { editorWidth } = this.state;

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
          width={editorWidth}
          setOptions={{
            showGutter: true,
          }}
        />
      </div>
    );
  }
}
