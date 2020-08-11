import * as React from 'react';
import { Button, Layout } from 'antd';
import McsIcon from '../McsIcon';
import { FormattedMessage } from 'react-intl';
import { EmptyTableView } from '../TableView';
import { Actionbar } from '@mediarithmics-private/mcs-components-library';

const { Content } = Layout;

export interface SelectorLayoutProps {
  actionBarTitle: string;
  handleAdd: () => void;
  handleClose: () => void;
  disabled: boolean;
  className?: string;
}

export default class SelectorLayout extends React.Component<
  SelectorLayoutProps,
  any
> {
  render() {
    const {
      actionBarTitle,
      handleAdd,
      handleClose,
      disabled,
      children,
      className,
    } = this.props;

    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Actionbar paths={[{ name: actionBarTitle }]} edition={true}>
            <Button type="primary" className="mcs-primary" onClick={handleAdd}>
              <McsIcon type="plus" />
              <FormattedMessage
                id="components.elementSelector.selectorLayout.actionbar.add.button"
                defaultMessage="Add"
              />
            </Button>
            <McsIcon
              type="close"
              className="close-icon mcs-table-cursor"
              onClick={handleClose}
            />
          </Actionbar>
          <Layout>
            <Content
              className={`mcs-edit-container ${className ? className : ''}`}
            >
              {disabled ? <EmptyTableView iconType="file" /> : children}
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}
