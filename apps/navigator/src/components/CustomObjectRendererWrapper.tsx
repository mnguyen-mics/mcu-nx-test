import * as React from 'react';
import CustomObjectRenderer from './CustomObjectRenderer';
import { FormattedMessage, WrappedComponentProps, injectIntl, defineMessages } from 'react-intl';
import { Row } from 'antd';
import { AnyJson } from '../models/datamart/UserActivityResource';

const messages = defineMessages({
  expandAll: {
    id: 'components.customObjectRenderer.expandAll',
    defaultMessage: 'Expand all',
  },
  collapseAll: {
    id: 'components.customObjectRenderer.collapseAll',
    defaultMessage: 'Collapse all',
  },
});

export interface TemplateDefinitions {
  [varName: string]: (value: AnyJson) => AnyJson | JSX.Element;
}

export interface RenderingTemplates {
  absoluteTemplates: TemplateDefinitions;
  relativeTemplates: TemplateDefinitions;
}

export interface ExtendedTemplates extends RenderingTemplates {
  transformedTemplates: TemplateDefinitions;
}

interface CustomObjectRendererWrapperProps {
  customObject: AnyJson;
  customRenderingTemplates: RenderingTemplates;
}

type Props = CustomObjectRendererWrapperProps & WrappedComponentProps;

export type ExpandAllStatus = 'INIT_OR_NOT_NEEDED' | 'EXPAND_ALL' | 'COLLAPSE_ALL';

interface State {
  expandAllStatus: ExpandAllStatus;
}

class CustomObjectRendererWrapper extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      expandAllStatus: 'INIT_OR_NOT_NEEDED',
    };
  }

  authorizeExpandAll = (): void => {
    const { expandAllStatus } = this.state;
    if (expandAllStatus === 'INIT_OR_NOT_NEEDED') {
      this.setState({
        expandAllStatus: 'EXPAND_ALL',
      });
    }
  };

  invertDisplayExpandAll = () => {
    const { expandAllStatus } = this.state;
    if (expandAllStatus === 'EXPAND_ALL') {
      this.setState({
        expandAllStatus: 'COLLAPSE_ALL',
      });
    } else if (expandAllStatus === 'COLLAPSE_ALL') {
      this.setState({
        expandAllStatus: 'EXPAND_ALL',
      });
    }
  };

  getButtonExpandAll = () => {
    const { expandAllStatus } = this.state;

    if (expandAllStatus !== 'INIT_OR_NOT_NEEDED') {
      const message = expandAllStatus === 'EXPAND_ALL' ? messages.expandAll : messages.collapseAll;

      return (
        <Row className='button-expand-all'>
          <button className='button-sm' onClick={this.invertDisplayExpandAll}>
            <FormattedMessage {...message} />
          </button>
        </Row>
      );
    }
    return null;
  };

  render() {
    const { customObject, customRenderingTemplates } = this.props;
    const { expandAllStatus } = this.state;
    const extendedTemplates: ExtendedTemplates = {
      transformedTemplates: {},
      ...customRenderingTemplates,
    };

    const buttonExpandAll = this.getButtonExpandAll();

    return (
      <div className='custom-object-renderer'>
        {buttonExpandAll}
        <CustomObjectRenderer
          objectToBeRendered={customObject}
          customRenderingTemplates={extendedTemplates}
          leftBorder={false}
          expandAllStatus={expandAllStatus}
          authorizeExpandAll={this.authorizeExpandAll}
        />
      </div>
    );
  }
}

export default injectIntl(CustomObjectRendererWrapper);
