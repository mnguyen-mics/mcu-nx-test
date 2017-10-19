import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout, Button } from 'antd';

import { Actionbar } from '../containers/Actionbar';
import McsIcons from './McsIcons.tsx';

const { Content } = Layout;


const withSelector = (WrappedComponent, additionnalProps = {}, childProps = {}) => {

  return class extends Component {
    state = {
      isLoading: true,
    };

    render() {
      const { actionBarTitle, close, save } = additionnalProps;

      return (
        <Layout>
          <div className="edit-layout ant-layout">
            <Actionbar path={[{ name: actionBarTitle }]} edition>
              <Button type="primary mcs-primary" onClick={save}>
                <McsIcons type="plus" /><span>Add</span>
              </Button>
              <McsIcons
                type="close"
                className="close-icon"
                style={{ cursor: 'pointer' }}
                onClick={close}
              />
            </Actionbar>
            <Layout>
              <Content className="mcs-table-edit-container">
                <WrappedComponent {...childProps} />
              </Content>
            </Layout>
          </div>
        </Layout>
      );
    }

  };


};

withSelector.defaultProps = {
  actionBarTitle: 'Add an existing template',
  children: <div />

};

withSelector.propTypes = {
  actionBarTitle: PropTypes.string,
  close: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  children: PropTypes.element,
};

export default withSelector;
