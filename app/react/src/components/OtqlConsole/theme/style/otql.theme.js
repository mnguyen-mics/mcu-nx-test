/* eslint-disable */

export function defineAce() {
  const elemts = global.document.getElementsByClassName('mcs-colors')[0].children;

  const mcsColors = {};

  for (let i = 0; i < elemts.length; i += 1) {
    const elem = elemts[i];
    mcsColors[elem.className] = global.window.getComputedStyle(elem)['background-color'];
  }

  const successColor = mcsColors['mcs-success'] ? mcsColors['mcs-success'] : '#00ab67';
  const infoColor = mcsColors['mcs-info'] ? mcsColors['mcs-info'] : '#00a1df';
  const highlightColor = mcsColors['mcs-highlight'] ? mcsColors['mcs-highlight'] : '#862F2F';
  const warningColor = mcsColors['mcs-warning'] ? mcsColors['mcs-warning'] : '#862F2F';

  const constantsBuiltInColor = infoColor;
  const constantsNumericColor = '#099';
  const variableNumeric = successColor;
  const stringColor = ' #D14';
  const keywordColor = infoColor;
  const operatorColor = warningColor;
  const commentColor = '#998';
  const supportDirectiveColor = highlightColor;
  const supportFunctionColor = highlightColor;
  const variableLanguage = infoColor;
  const variableInstance = successColor;
  const stringRegexpColor = '#009926';

  ace.define(
    'ace/theme/otql',
    ['require', 'exports', 'module', 'ace/lib/dom'],
    function (acequire, exports, module) {
      exports.isDark = false;
      exports.cssClass = 'ace-otql';
      exports.cssText =
        '\
        .ace-otql .ace_gutter {\
        background: #fff;\
        color: #AAA;\
        }\
        .ace-otql  {\
        background: #fff;\
        font-size: 12; \
        border-radius: 5px;\
        color: #000;\
        }\
        .ace-otql .ace_keyword {\
        font-weight: bold;\
        color: ' +
        keywordColor +
        ';\
        }\
        .ace-otql .ace_keyword.ace_operator {\
        font-weight: bold;\
        color: ' +
        operatorColor +
        ';\
        }\
        .ace-otql .ace_string {\
        color: ' +
        stringColor +
        ';\
        }\
        .ace-otql .ace_variable.ace_class {\
        color: ' +
        variableNumeric +
        ';\
        }\
        .ace-otql .ace_constant.ace_numeric {\
        color: ' +
        constantsNumericColor +
        '\
        }\
        .ace-otql .ace_constant.ace_buildin {\
        color: ' +
        constantsBuiltInColor +
        ';\
        }\
        .ace-otql .ace_support.ace_function {\
        color: ' +
        supportFunctionColor +
        ';\
        }\
        .ace-otql .ace_support.ace_directive {\
        color: ' +
        supportDirectiveColor +
        ';\
        }\
        .ace-otql .ace_comment {\
        color: ' +
        commentColor +
        ';\
        font-style: italic;\
        }\
        .ace-otql .ace_variable.ace_language  {\
        color: ' +
        variableLanguage +
        ';\
        }\
        .ace-otql .ace_paren {\
        font-weight: bold;\
        }\
        .ace-otql .ace_boolean {\
        font-weight: bold;\
        }\
        .ace-otql .ace_string.ace_regexp {\
        color: ' +
        stringRegexpColor +
        ';\
        font-weight: normal;\
        }\
        .ace-otql .ace_variable.ace_instance {\
        color: ' +
        variableInstance +
        ';\
        }\
        .ace-otql .ace_constant.ace_language {\
        font-weight: bold;\
        }\
        .ace-otql .ace_cursor {\
        color: black;\
        }\
        .ace-otql.ace_focus .ace_marker-layer .ace_active-line {\
        background: rgb(255, 255, 204);\
        }\
        .ace-otql .ace_marker-layer .ace_active-line {\
        background: rgb(245, 245, 245);\
        }\
        .ace-otql .ace_marker-layer .ace_selection {\
        background: rgb(181, 213, 255);\
        }\
        .ace-otql.ace_multiselect .ace_selection.ace_start {\
        box-shadow: 0 0 3px 0px white;\
        }\
        .ace-otql.ace_nobold .ace_line > span {\
        font-weight: normal !important;\
        }\
        .ace-otql .ace_marker-layer .ace_step {\
        background: rgb(252, 255, 0);\
        }\
        .ace-otql .ace_marker-layer .ace_stack {\
        background: rgb(164, 229, 101);\
        }\
        .ace-otql .ace_marker-layer .ace_bracket {\
        margin: -1px 0 0 -1px;\
        border: 1px solid rgb(192, 192, 192);\
        }\
        .ace-otql .ace_gutter-active-line {\
        background-color : rgba(0, 0, 0, 0.07);\
        }\
        .ace-otql .ace_marker-layer .ace_selected-word {\
        background: rgb(250, 250, 255);\
        border: 1px solid rgb(200, 200, 250);\
        }\
        .ace-otql .ace_invisible {\
        color: #BFBFBF\
        }\
        .ace-otql .ace_print-margin {\
        width: 1px;\
        background: #e8e8e8;\
        }\
        .ace-otql .ace_indent-guide {\
        background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==") right repeat-y;\
        }';

      var dom = acequire('../lib/dom');
      dom.importCssString(exports.cssText, exports.cssClass);
    },
  );
}
