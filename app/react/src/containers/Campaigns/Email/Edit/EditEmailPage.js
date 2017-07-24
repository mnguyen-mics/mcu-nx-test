// import React, { Component } from 'react';
// import PropTypes from 'prop-types';
// import { compose } from 'recompose';
// import { connect } from 'react-redux';
// import { message } from 'antd';

// import { withMcsRouter } from '../../../Helpers';
// import withDrawer from '../../../../components/Drawer';
// import EmailEditor from './EmailEditor';

// class CreateEmailPage extends Component {
//   constructor(props) {
//     super(props);
//     this.updateEmailCampaign = this.updateEmailCampaign.bind(this);
//     this.redirect = this.redirect.bind(this);
//   }

//   // updateEmailCampaign(email) {
//   //   const { updateCampaign } = this.props;

//   //   const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

//   //   const hideMessage = message.loading('Saving campaign', 0);

//   //   return sleep(4000).then(() => {
//   //     hideMessage();
//   //     this.redirect();
//   //   });

//   //   // create(email);
//   // }

//   redirect() {
//     const { history, organisationId } = this.props;

//     const emailCampaignListUrl = `/v2/o/${organisationId}/campaigns/email`;

//     history.push(emailCampaignListUrl);
//   }

//   render() {
//     // const { campaignId } = this.props;

//     return (
//       <EmailEditor
//         campaignId={campaignId}
//         save={this.updateEmailCampaign}
//         close={this.redirect}
//         openNextDrawer={this.props.openNextDrawer}
//       />
//     );
//   }
// }

// CreateEmailPage.propTypes = {
//   organisationId: PropTypes.string.isRequired,
//   history: PropTypes.object.isRequired, // eslint-disable-line
//   create: PropTypes.func.isRequired,
//   openNextDrawer: PropTypes.func.isRequired
// };

// const mapStateToProps = () => ({});

// const mapDispatchToProps = {
//   create: () => {}
// };

// export default compose(
//   connect(mapStateToProps, mapDispatchToProps),
//   withMcsRouter,
//   withDrawer
// )(CreateEmailPage);
