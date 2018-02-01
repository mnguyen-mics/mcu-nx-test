import * as React from 'react';
import AceEditor, { AceEditorProps } from "react-ace";
import CustomOtqlMode from './theme/CustomOtqlMode'

import "./theme/style/otql.theme.js";
import "brace/ext/language_tools";

export interface OtqlConsoleProps extends AceEditorProps {
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

  buildCustomCompleters = () => {
    return {
      identifierRegexps: [/[\@a-zA-Z_0-9]/],
      getCompletions: (editor: any, session: any, pos: any, prefix:any, callback: any) => {
        if (prefix.length === 0) {
          callback(null, []);
          return;
        }
        callback(null, [
          { name: "SELECT", value: "SELECT", score: 1, meta: "" },
          { name: "FROM", value: "FROM", score: 2, meta: "" },
          { name: "@count", value: "@count", score: 3, meta: "directive" },
          { name: "@avg", value: "@avg", score: 3, meta: "directive" },
          { name: "@min", value: "@min", score: 3, meta: "directive" },
          { name: "@max", value: "@max", score: 3, meta: "directive" },
          { name: "@stats", value: "@stats", score: 3, meta: "directive" },
          { name: "@cardinality", value: "@cardinality", score: 3, meta: "directive" },
          { name: "@map", value: "@map", score: 3, meta: "directive" },
          { name: "@histogram", value: "@histogram", score: 3, meta: "directive" },
          { name: "@range", value: "@range", score: 3, meta: "directive" },
          { name: "@geo", value: "@geo", score: 3, meta: "directive" },
          { name: "@missing", value: "@missing", score: 3, meta: "directive" },
          { name: "@filter", value: "@filter", score: 3, meta: "directive" },
        ]);
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
