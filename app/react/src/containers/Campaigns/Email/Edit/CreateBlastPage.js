import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import { withMcsRouter } from '../../../Helpers';
import EmailEditor from './EmailEditor';

class CreateBlastPage extends Component {
  constructor(props) {
    super(props);
    this.createEmailCampaign = this.createEmailCampaign.bind(this);
    this.redirect = this.redirect.bind(this);
  }

  createEmailCampaign(email) {
    const { create } = this.props;

    create(email);
  }

  redirect() {
    const { history, organisationId } = this.props;

    const emailCampaignListUrl = `/v2/o/${organisationId}/campaigns/email`;

    history.push(emailCampaignListUrl);
  }

  render() {
    return (
      <EmailEditor save={this.createEmailCampaign} close={this.redirect} />
    );
  }
}

CreateBlastPage.propTypes = {
  organisationId: PropTypes.number.isRequired,
  history: PropTypes.object.isRequired, // eslint-disable-line
  create: PropTypes.func.isRequired
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  create: () => {}
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withMcsRouter
)(CreateBlastPage);
