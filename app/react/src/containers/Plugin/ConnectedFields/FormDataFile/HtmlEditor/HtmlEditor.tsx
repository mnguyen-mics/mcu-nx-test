import * as React from 'react';
import { Button } from 'antd';


import IframeSupport from './IframeSupport';
import ContentArea, { ContentType } from './ContentArea';
import CodeArea from './CodeArea';
import { DrawableContentProps } from '../../../../../components/Drawer'

import McsIcon from '../../../../../components/McsIcon';


export interface HtmlEditorProps extends DrawableContentProps  {
  onChange: (html: string) => void;
  content: string;
}

export default class HtmlEditor extends React.Component<HtmlEditorProps> {

  buildQuickInitialValues = () => {
    const values = this.buildContent();
    return values.reduce((acc, item) => {
      return item ? {
        ...acc,
        [item.name]: item.content,
      } : acc;
    }, {})
  }

  buildCodeInitialValues = () => {
    return {
      code: this.props.content
    }
  }

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
        element.target = '_blank'
      } else {
        listOfSelector[i].innerHTML = values[listOfSelector[i].getAttribute('data-mcs-name') || ''];
      }
     
    }
    this.props.onChange(d.innerHTML)
    this.props.closeNextDrawer()
  };

  onCodeContentChange = (value: { code: string }) => {
    this.props.onChange(value.code)
    this.props.closeNextDrawer()
  }

  buildContent = () => {
    const d = document.createElement('div');
    d.innerHTML = this.props.content;
    const listOfContent = [];
    const listOfSelector = d.querySelectorAll('[data-mcs-type]');
    for (let i = 0; i <= listOfSelector.length - 1; i += 1) {
      const type = listOfSelector[i].getAttribute('data-mcs-type') as ContentType;
      let value;
      if (type === 'image') {
        const elem = listOfSelector[i] as HTMLImageElement;
        value = {
          type: type,
          name: listOfSelector[i].getAttribute('data-mcs-name') as string,
          content: elem.src,
        }
      } else if (type === 'link') {
        const elem = listOfSelector[i] as HTMLLinkElement;
        value = {
          type: type,
          name: listOfSelector[i].getAttribute('data-mcs-name') as string,
          content: elem.href,
        }
      } else {
        value = {
          type: type,
          name: listOfSelector[i].getAttribute('data-mcs-name') as string,
          content: listOfSelector[i].innerHTML,
        };
      }
      listOfContent.push(value);
    }
    return listOfContent;
  };

  onQuickEditClick = () => {
    const props = {
      additionalProps: {
        form: "contentAreaForm",
        initialValues: this.buildQuickInitialValues(),
        content: this.buildContent(),
        onSubmit: this.onQuickContentChange,
        openNextDrawer: this.props.openNextDrawer,
        closeNextDrawer: this.props.closeNextDrawer,
      },
      size: 'small' as any,
      isModal: false,
    }
    this.props.openNextDrawer(ContentArea, props)
  }

  onCodeEditClick = () => {
    const props = {
      additionalProps: {
        form: "codeAreaForm",
        initialValues: this.buildCodeInitialValues(),
        onSubmit: this.onCodeContentChange,
        openNextDrawer: this.props.openNextDrawer,
        closeNextDrawer: this.props.closeNextDrawer,
      },
      size: 'large' as any,
      isModal: false,
    }
    this.props.openNextDrawer(CodeArea, props)
  }

  render() {
    const iframe = <IframeSupport content={this.props.content} />;

    return (
      <div>
        <Button style={{ float: 'right', marginBottom: 20 }} onClick={this.onCodeEditClick}>
          <McsIcon type="code" />
          Code Edit
        </Button>
        {this.buildContent().length ? <Button style={{ float: 'right', marginBottom: 20, marginRight: 20 }} onClick={this.onQuickEditClick}>
          <McsIcon type="pen" />
          Quick Edit
        </Button> : null}
        {iframe}
      </div>
          
    );
  }
}
