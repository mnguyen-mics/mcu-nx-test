// import { Component } from 'react';
// import PropTypes from 'prop-types';
// import { withRouter } from 'react-router-dom';
// import { Modal } from 'antd';

// class NavigationPrompt extends Component {
//   constructor(props) {
//     super(props);
//     this.state = { nextLocation: null, openModal: false };
//     this.onCancel = this.onCancel.bind(this);
//     this.onConfirm = this.onConfirm.bind(this);
//   }

//   componentDidMount() {
//     this.unblock = this.props.history.block((nextLocation) => {
//       if (this.props.when) {
//         this.setState({
//           openModal: true,
//           nextLocation: nextLocation,
//         });
//       }
//       return !this.props.when;
//     });
//   }

//   componentWillUnmount() {
//     this.unblock();
//   }

//   onCancel() {
//     this.setState({ nextLocation: null, openModal: false });
//   }

//   onConfirm() {
//     this.navigateToNextLocation();
//   }

//   navigateToNextLocation() {
//     this.unblock();
//     this.props.history.push(this.state.nextLocation.pathname);
//   }

//   componentDidUpdate() {
//     const { openModal } = this.state;
//     const self = this;
//     if (openModal) {
//       Modal.confirm({
//         ...this.props.modalProps,
//         onOk() { return self.onConfirm(); },
//         onCancel() { return self.onCancel(); },
//       });
//     }
//   }

//   render() {
//     return null;
//   }
// }

// NavigationPrompt.defaultProps = {
//   modalProps: {
//     title: 'You have unsaved data',
//     content: 'Do you want to close anyway ?',
//     icon: <ExclamationCircleOutlined />,
//     okText: 'Ok',
//     cancelText: 'Cancel',
//   },
// };

// NavigationPrompt.propTypes = {
//   history: PropTypes.object.isRequired, // eslint-disable-line
//   when: PropTypes.bool.isRequired,
//   modalProps: PropTypes.object, // eslint-disable-line
// };

// export default withRouter(NavigationPrompt);
