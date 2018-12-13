import * as React from 'react';
import AceEditor, { AceEditorProps } from "react-ace";
import 'brace/ext/searchbox'
import CustomOtqlMode from './theme/CustomOtqlMode'

import "./theme/style/otql.theme.js";
import "brace/ext/language_tools";
import QueryService from '../../services/QueryService';

export interface OtqlConsoleProps extends AceEditorProps {
  datamartId: string;
}

export default class OtqlConsole extends React.Component<OtqlConsoleProps, any> {

  aceEditor: any = null;

  componentDidMount() {
    if (this.aceEditor && this.aceEditor.editor) {
      this.aceEditor.editor.completers = [this.buildCustomCompleters()]
      const customMode = new CustomOtqlMode();
      this.aceEditor.editor.getSession().setMode(customMode);
    }
  }

  findCompleters = (query: string, row: number, col: number) => {
    return QueryService.autocompleteOtqlQuery(
      this.props.datamartId,
      query,
      row,
      col
    )
  }

  buildCustomCompleters = () => {
    return {
      identifierRegexps: [/[\@a-zA-Z_0-9]/],
      getCompletions: (editor: any, session: any, pos: { row: number, column: number }, prefix:any, callback: any) => {
        this.findCompleters(editor.getValue() as string, pos.row + 1, pos.column + 1)
          .then(res => {
            const valueFromServer = res ? res.map(r => ({ name: r.field_name, value: r.field_name, meta: r.type })) : []
            callback(null, [
              ...valueFromServer,
              { name: "SELECT", value: "SELECT", score: 3, meta: "keyword" },
              { name: "FROM", value: "FROM", score: 3, meta: "keyword" },
              { name: "WHERE", value: "WHERE", score: 3, meta: "keyword" },
              { name: "LIMIT", value: "LIMIT", score: 3, meta: "keyword" },
            ]);
          })
       
      }
    };
  }


  render() {
    const setAceEditorRef = (aceEditorRef: any) => (this.aceEditor = aceEditorRef);
    return (
      <div>
        <AceEditor
          {...this.props}
          mode="otql"
          theme="otql"
          ref={setAceEditorRef}
          width='100%' 
        />
      </div>
    );
  }
}
