import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { camelCase } from 'lodash';

import withDrawer from '../../../../../components/Drawer';
import AdGroupContent from './AdGroupContent';
import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import { saveAdGroup, getAdGroup } from '../AdGroupServiceWrapper';


class EditAdGroupPage extends Component {

  state = {
    initialValues: {},
    loading: true,
  }

  componentDidMount() {
    const { adGroupId, campaignId, organisationId } = this.props.match.params;

    getAdGroup(organisationId, campaignId, adGroupId).then(adGroup => {
      const initialAdGroupFormatted = Object.keys(adGroup).reduce((acc, key) => ({
        ...acc,
        [key.indexOf('Table') === -1 ? camelCase(`adGroup-${key}`) : key]: adGroup[key]
      }), {});

      this.setState({
        initialValues: initialAdGroupFormatted,
        loading: false,
      });
    });
  }

  onSave = (object) => {
    const { history, match, location } = this.props;

    saveAdGroup(match.params.campaignId, object, this.state.initialValues, true).then(() => {
      return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(`/v2/o/${match.params.organisationId}/campaigns/display/${match.params.campaignId}`);
    });
  }

  render() {
    const { history, match, location } = this.props;

    const onClose = () => (location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(`/v2/o/${match.params.organisationId}/campaigns/display/${match.params.campaignId}`)
    );

    return (
      <AdGroupContent
        closeNextDrawer={this.props.closeNextDrawer}
        editionMode
        initialValues={this.state.initialValues}
        loading={this.state.loading}
        openNextDrawer={this.props.openNextDrawer}
        close={onClose}
        save={this.onSave}
      />
    );
  }
}

EditAdGroupPage.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
};

export default compose(
  withMcsRouter,
  withDrawer,
)(EditAdGroupPage);
