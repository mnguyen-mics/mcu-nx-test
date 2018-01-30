import * as React from 'react';
import AceEditor, { AceEditorProps } from "react-ace";
import CustomOtqlMode from './theme/CustomOtqlMode'

import "./theme/style/otql.theme.js";

export interface OtqlConsoleProps extends AceEditorProps {
}

export default class OtqlConsole extends React.Component<OtqlConsoleProps, any> {

  aceEditor: any = null;

  componentDidMount() {
    if (this.aceEditor && this.aceEditor.editor) {
      this.aceEditor.editor.completers = [this.buildCustomCompleters()]
      console.log(this.aceEditor.editor.completers);
      const customMode = new CustomOtqlMode();
      this.aceEditor.editor.getSession().setMode(customMode);
    }
  }

  buildCustomCompleters = () => {
    return {
      getCompletions: (editor: any, session: any, pos: any, prefix:any, callback: any) => {
        if (prefix.length === 0) {
          callback(null, []);
          return;
        }
        callback(null, [
          { name: "UserPoint", value: "UserPoint", score: 1, meta: "User Point" },
          { name: "UserAgent", value: "UserAgent", score: 2, meta: "User Agent" },
          { name: "UserProfile", value: "UserProfile", score: 3, meta: "User Profile" }
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
