import React from 'react';
import AceEditor, { AceEditorProps } from 'react-ace';
import CustomJsonMode from './utils/ace/CustomJsonMode';
import defineAce from './utils/ace/CustomTheme';
import 'brace/mode/json';

interface QueryToolJsonResultRendererProps extends AceEditorProps {
  rows: unknown[];
  organisationId: string;
}

interface State {}

export class QueryToolJsonResultRenderer extends React.Component<
  QueryToolJsonResultRendererProps,
  State
> {
  aceEditorRef: any = null;
  browser: string = 'unknown';

  constructor(props: QueryToolJsonResultRendererProps) {
    super(props);
    this.browser = this.getBrowser();
    this.state = {};
  }

  componentDidMount() {
    defineAce(this.browser === 'Apple Safari');
    if (this.aceEditorRef && this.aceEditorRef.editor) {
      this.aceEditorRef.editor.getSession().setUseWrapMode(false);
    }
    if (this.aceEditorRef && this.aceEditorRef.editor && this.browser !== 'Apple Safari') {
      const customMode = new CustomJsonMode();
      this.aceEditorRef.editor.getSession().setMode(customMode);
      this.aceEditorRef.editor.on('click', this.onClick);
    }
  }

  getBrowser = (): string => {
    const { userAgent } = navigator;

    if (userAgent.indexOf('Firefox') > -1) {
      return 'Mozilla Firefox';
      // "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0"
    } else if (userAgent.indexOf('SamsungBrowser') > -1) {
      return 'Samsung Internet';
      // "Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G955F Build/PPR1.180610.011) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/9.4 Chrome/67.0.3396.87 Mobile Safari/537.36
    } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
      return 'Opera';
      // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 OPR/57.0.3098.106"
    } else if (userAgent.indexOf('Trident') > -1) {
      return 'Microsoft Internet Explorer';
      // "Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; Zoom 3.6.0; wbx 1.0.0; rv:11.0) like Gecko"
    } else if (userAgent.indexOf('Edge') > -1) {
      return 'Microsoft Edge';
      // "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299"
    } else if (userAgent.indexOf('Chrome') > -1) {
      return 'Google Chrome or Chromium';
      // "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/66.0.3359.181 Chrome/66.0.3359.181 Safari/537.36"
    } else if (userAgent.indexOf('Safari') > -1) {
      return 'Apple Safari';
      // "Mozilla/5.0 (iPhone; CPU iPhone OS 11_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/11.0 Mobile/15E148 Safari/604.1 980x1306"
    } else {
      return 'unknown';
    }
  };

  onClick = (e: any) => {
    const editor = e.editor;
    const { organisationId } = this.props;
    const pos = editor.getCursorPosition();
    const token = editor.session.getTokenAt(pos.row, pos.column);
    const { protocol, host } = window.location;
    if (/\buser_point_id\b/.test(token.type)) {
      window.open(
        `${protocol}//${host}/#/v2/o/${organisationId}/audience/timeline/user_point_id/${token.value}`,
        '_blank',
      );
    } else if (/\buser_agent_id\b/.test(token.type)) {
      window.open(
        `${protocol}//${host}/#/v2/o/${organisationId}/audience/timeline/user_agent_id/vec:${token.value}`,
        '_blank',
      );
    } else if (/\bemail_hash\b/.test(token.type)) {
      window.open(
        `${protocol}//${host}/#/v2/o/${organisationId}/audience/timeline/email_hash/${token.value}`,
        '_blank',
      );
    } else if (/\buser_account_id\b/.test(token.type)) {
      const [compartmentId, userAccountId] = token.value.split(':');
      window.open(
        `${protocol}//${host}/#/v2/o/${organisationId}/audience/timeline/user_account_id/${userAccountId}?compartmentId=${compartmentId}`,
        '_blank',
      );
    }
  };

  render() {
    const setAceEditorRef = (aceEditorRef: any) => (this.aceEditorRef = aceEditorRef);
    const { rows } = this.props;
    defineAce(this.browser === 'Apple Safari');

    const json = JSON.stringify(rows, null, 2);
    const mode = this.browser === 'Apple Safari' ? 'json' : 'json_result';
    return (
      <AceEditor
        value={json}
        ref={setAceEditorRef}
        theme='custom_json'
        mode={mode}
        width={'100%'}
        readOnly={true}
        showPrintMargin={false}
        tabSize={2}
        setOptions={{
          highlightGutterLine: false,
        }}
        maxLines={1000}
        {...this.props}
      />
    );
  }
}
