import * as React from 'react';
import { Row, Col, Radio } from 'antd';
import { compose } from 'recompose';

import IframeSupport from './IframeSupport';
import AceEditor from 'react-ace';
import 'brace/ext/searchbox';

import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { injectDrawer } from '../../../../../components/Drawer/index';
import { RadioChangeEvent } from 'antd/lib/radio';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';

export interface HtmlEditorProps {
  onChange: (html: string) => void;
  content: string;
}

type Size = 'LARGE' | 'MEDIUM' | 'SMALL';
type Type = 'CODE' | 'QUICK';
interface HtmlEditorState {
  size: Size;
  type: Type;
}

type Props = HtmlEditorProps & InjectedDrawerProps;

class HtmlEditor extends React.Component<Props, HtmlEditorState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      size: 'MEDIUM',
      type: 'CODE',
    };
  }

  buildCodeInitialValues = () => {
    return {
      code: this.props.content,
    };
  };

  onQuickContentChange = (values: any) => {
    const d = document.createElement('div');
    d.innerHTML = this.props.content;
    const listOfSelector = d.querySelectorAll('[data-mcs-type]');
    for (let i = 0; i <= listOfSelector.length - 1; i += 1) {
      if (listOfSelector[i].getAttribute('data-mcs-type') === 'image') {
        const element = listOfSelector[i] as HTMLImageElement;
        element.src = values[listOfSelector[i].getAttribute('data-mcs-name') || ''];
      } else if (listOfSelector[i].getAttribute('data-mcs-type') === 'link') {
        const element = listOfSelector[i] as HTMLLinkElement;
        element.href = values[listOfSelector[i].getAttribute('data-mcs-name') || ''];
        element.target = '_blank';
      } else if (listOfSelector[i].getAttribute('data-mcs-type') === 'text') {
        listOfSelector[i].innerHTML = values[listOfSelector[i].getAttribute('data-mcs-name') || ''];
      }
    }
    this.props.onChange(d.innerHTML);
  };

  onCodeContentChange = (code: string) => {
    this.props.onChange(code);
  };

  render() {
    const iframe = <IframeSupport content={this.props.content} />;
    const codeEdit = (
      <AceEditor
        value={this.props.content}
        theme='monokai'
        name='code'
        width={'100%'}
        height={'800px'}
        mode={'handlebars'}
        showPrintMargin={false}
        showGutter={true}
        highlightActiveLine={true}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
        onChange={this.onCodeContentChange}
        wrapEnabled={true}
      />
    );

    const onSizeChange = (e: RadioChangeEvent) => this.setState({ size: e.target.value as Size });
    const onTypeChange = (e: RadioChangeEvent) => this.setState({ type: e.target.value as Type });

    const changedSize = this.state.size === 'LARGE' ? -4 : this.state.size === 'SMALL' ? 4 : 0;

    return (
      <div>
        <Row style={{ marginBottom: 10 }}>
          <Col span={12 - changedSize}>
            <Radio.Group onChange={onTypeChange} defaultValue={this.state.type}>
              <Radio.Button value='CODE'>
                <McsIcon type='code' />
                Code
              </Radio.Button>
            </Radio.Group>
          </Col>
          <Col span={12 + changedSize} style={{ textAlign: 'right' }}>
            <Radio.Group onChange={onSizeChange} defaultValue={this.state.size}>
              <Radio.Button value='SMALL'>Large</Radio.Button>
              <Radio.Button value='MEDIUM'>Medium</Radio.Button>
              <Radio.Button value='LARGE'>Small</Radio.Button>
            </Radio.Group>
          </Col>
        </Row>
        <Row style={{ maxHeight: 800 }}>
          <Col
            span={12 - changedSize}
            style={{
              overflowY: this.state.type === 'CODE' ? 'initial' : 'scroll',
              maxHeight: 800,
            }}
          >
            {this.state.type === 'CODE' && codeEdit}
          </Col>

          <Col span={12 + changedSize} style={{ overflowY: 'scroll', maxHeight: 800 }}>
            {iframe}
          </Col>
        </Row>
      </div>
    );
  }
}

export default compose<HtmlEditorProps, HtmlEditorProps>(injectDrawer)(HtmlEditor);
