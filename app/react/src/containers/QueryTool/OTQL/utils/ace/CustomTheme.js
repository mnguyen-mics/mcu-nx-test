/* eslint-disable */

export default function defineAce(isSafari) {
  ace.define(
    'ace/theme/custom_json',
    ['require', 'exports', 'module', 'ace/lib/dom'],
    function (acequire, exports, module) {
      const customTagStyle = isSafari
        ? ''
        : `
      .ace-custom_json .ace_user_point_id {
        pointer-events: auto;
      }

      .ace-custom_json .ace_user_account_id {
          pointer-events: auto;
      }

      .ace-custom_json .ace_user_agent_id {
          pointer-events: auto;
      }

      .ace-custom_json .ace_email_hash {
          pointer-events: auto;
      }

      .ace-custom_json .ace_user_point_id:hover {
        text-decoration: underline;
        cursor: pointer;
      }

      .ace-custom_json .ace_user_account_id:hover {
        text-decoration: underline;
        cursor: pointer;
      }

      .ace-custom_json .ace_user_agent_id:hover {
        text-decoration: underline;
        cursor: pointer;
      }

      .ace-custom_json .ace_email_hash:hover {
        text-decoration: underline;
        cursor: pointer;
      }`;
      exports.isDark = false;
      exports.cssClass = 'ace-custom_json';
      exports.cssText = `
      .ace-custom_json .ace_gutter {
        background: #fff;
        color: #AAA;
      }

      .ace-custom_json  {
        background: #fff;
        color: #000;
        border-radius: 8px;
        margin-top: 10px;
        margin-bottom: 10px;
      }

      .ace-custom_json .ace_keyword {
        font-weight: bold;
      }

      .ace-custom_json .ace_string {
        color: #D14;
      }

      .ace-custom_json .ace_variable.ace_class {
        color: teal;
      }

      .ace-custom_json .ace_constant.ace_numeric {
        color: #099;
      }

      .ace-custom_json .ace_constant.ace_buildin {
        color: #0086B3;
      }

      .ace-custom_json .ace_support.ace_function {
        color: #0086B3;
      }

      .ace-custom_json .ace_comment {
        color: #998;
        font-style: italic;
      }

      .ace-custom_json .ace_variable.ace_language  {
        color: #0086B3;
      }

      .ace-custom_json .ace_paren {
        font-weight: bold;
      }
      .ace-custom_json .ace_boolean {
        font-weight: bold;
      }

      .ace-custom_json .ace_string.ace_regexp {
        color: #009926;
        font-weight: normal;
      }

      .ace-custom_json .ace_variable.ace_instance {
        color: teal;
      }

      .ace-custom_json .ace_constant.ace_language {
        font-weight: bold;
      }

      .ace-custom_json .ace_cursor {
        color: black;
      }

      .ace-custom_json.ace_focus .ace_marker-layer .ace_active-line {
        background: #d3dbe1;
      }

      .ace-custom_json .ace_marker-layer .ace_active-line {
        background: #f0f3f5;
      }

      .ace-custom_json .ace_marker-layer .ace_selection {
        background: #cce8ff;
      }

      .ace-custom_json.ace_multiselect .ace_selection.ace_start {
        box-shadow: 0 0 3px 0px white;
      }

      .ace-custom_json.ace_nobold .ace_line > span {
        font-weight: normal !important;
      }

      .ace-custom_json .ace_marker-layer .ace_step {
        background: rgb(252, 255, 0);
      }

      .ace-custom_json .ace_marker-layer .ace_stack {
        background: rgb(164, 229, 101);
      }

      .ace-custom_json .ace_marker-layer .ace_bracket {
        margin: -1px 0 0 -1px;
        border: 1px solid rgb(192, 192, 192);
      }

      .ace-custom_json .ace_gutter-active-line {
        background-color : rgba(0, 0, 0, 0.07);
      }

      .ace-custom_json .ace_marker-layer .ace_selected-word {
        background: rgb(250, 250, 255);
        border: 1px solid rgb(200, 200, 250);
      }

      .ace-custom_json .ace_invisible {
        color: #BFBFBF
      }

      .ace-custom_json .ace_print-margin {
        width: 1px;
        background: #e8e8e8;
      }

      ${customTagStyle}

      .ace-custom_json .ace_indent-guide {
        background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==") right repeat-y;
      }
      `;

      var dom = acequire('../lib/dom');
      dom.importCssString(exports.cssText, exports.cssClass);
    },
  );
}
