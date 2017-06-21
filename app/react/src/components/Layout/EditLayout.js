import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout, Row } from 'antd';
// import Drawer from 'rc-drawer';

import { NavigatorHeader } from '../../containers/Header';

const { Content } = Layout;

class EditLayout extends Component {

  // constructor(props) {
    // super(props);
    // this.state = {
    //   open: false
    // };
    // this.toggleDrawer = this.toggleDrawer.bind(this);
  // }

  // toggleDrawer() {
  //   this.setState({ open: !this.state.open });
  // }

  // getActionBar() {
  //   const { actionBarComponent: ActionBarComponent } = this.props;

  //   if (ActionBarComponent) {
  //     return <ActionBarComponent />;
  //   }
  //   return null;
  // }

  render() {

    const { editComponent: EditComponent } = this.props;

    // const sidebar = (<div style={{ backgroundColor: 'white', height: '100%' }}>
    //   <h3>
    //     <button onClick={this.toggleDrawer}>
    //       Close
    //     </button>
    //   </h3>
    //   <p>this is content!</p>
    // </div>);

    return (
      // <Drawer open={this.state.open} sidebar={sidebar} position={'right'}>
      <Layout id="mcs-edit-layout" className="mcs-fullscreen">
        <NavigatorHeader />
        { /* { this.getActionBar() }*/ }
        <EditComponent />
      </Layout>
      // </Drawer>
    );
  }
}

EditLayout.propTypes = {
  editComponent: PropTypes.func.isRequired
};

export default EditLayout;
