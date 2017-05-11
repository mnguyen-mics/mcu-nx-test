import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar, ActionbarButton } from '../../Actionbar';
import * as ActionbarActions from '../../../state/Actionbar/actions';

class GoalsActionbar extends Component {

  componentWillMount() {

    const {
      translations,
      setBreadcrumb
    } = this.props;

    const breadcrumb = {
      name: translations.GOALS
    };

    setBreadcrumb(0, [breadcrumb]);

  }

  render() {

    const {
      activeWorkspace: {
        organisationId
      }
    } = this.props;

    return (
      <Actionbar {...this.props}>
        <Link to={`${organisationId}/goals/`}>
          <ActionbarButton className="mcs-actionbar-button-add mcs-actionbar-button">
            <Icon type="plus" /><FormattedMessage id="NEW_GOAL" />
          </ActionbarButton>
        </Link>
      </Actionbar>
    );

  }
}

GoalsActionbar.propTypes = {
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

GoalsActionbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(GoalsActionbar);

export default GoalsActionbar;
