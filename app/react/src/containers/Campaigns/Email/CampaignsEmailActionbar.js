import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar, ActionbarButton } from '../../Actionbar';
import * as ActionbarActions from '../../../state/Actionbar/actions';
import { Icons } from '../../../components/Icons';

class CampaignsEmailActionbar extends Component {

  componentWillMount() {

    const {
      translations,
      setBreadcrumb
    } = this.props;

    const breadcrumb = {
      name: translations.EMAIL_CAMPAIGNS
    };

    setBreadcrumb(0, [breadcrumb]);

  }

  render() {

    const {
      activeWorkspace: {
        workspaceId
      }
    } = this.props;

    return (
      <Actionbar {...this.props}>
        <Link to={`/${workspaceId}/campaigns/email/edit`}>
          <ActionbarButton className="mcs-actionbar-button-add mcs-actionbar-button">
            <Icons type="plus" /> <FormattedMessage id="NEW_CAMPAIGN" />
          </ActionbarButton>
        </Link>
      </Actionbar>
    );

  }

}

CampaignsEmailActionbar.propTypes = {
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  setBreadcrumb: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations,
  activeWorkspace: state.sessionState.activeWorkspace
});

const mapDispatchToProps = {
  setBreadcrumb: ActionbarActions.setBreadcrumb
};

CampaignsEmailActionbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsEmailActionbar);

export default CampaignsEmailActionbar;
