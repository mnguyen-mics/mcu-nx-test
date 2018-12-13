import * as React from 'react';
import { Alert } from 'antd';
import { defineMessages, FormattedMessage } from 'react-intl';

export interface ImageProps {
  alt: string;
  src: string;
  title: string;
}

interface State  {
  forbidden: boolean
}

const messages = defineMessages({
  error: {
    id: 'markdown.image.forbidden',
    defaultMessage: 'Please host your images as Assets on mediarithmics.'
  }
})

export default class Image extends React.Component<ImageProps, State> {

  constructor(props: ImageProps) {
    super(props)
    this.state = {
      forbidden: false
    }
  }

  checkLocation = (href: string) => {
    const a = document.createElement("a");
    a.href = href;
    return a.hostname.includes('mediarithmics.com');
};

  componentDidMount() {
    const {
      src
    } = this.props;

    if (!this.checkLocation(src)) {
      this.setState({ forbidden: true })
    }
    
  }

  public render() {
    const {
      alt,
      src,
      title
    } = this.props;

    const {
      forbidden
    } = this.state

    return (
      <div className="image">
        { forbidden ? 
          (<Alert message={<FormattedMessage {...messages.error} />} type="error" />) : 
          (<div><img src={src} alt={alt} />{title ? (<div className="title">{title}</div>) : null }</div>) }
      </div>
    );
  }
}
