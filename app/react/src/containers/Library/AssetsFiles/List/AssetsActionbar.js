import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Button } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar } from '../../../Actionbar';
import * as ActionbarActions from '../../../../state/Actionbar/actions';

class AssetsActionbar extends Component {

  componentWillMount() {

    const {
      translations,
      setBreadcrumb
    } = this.props;

    const breadcrumb = {
      name: translations.ASSETS
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
        <Link to={`/${workspaceId}/library/keywordslists/new`}>
          <Button type="primary">
            <Icon type="plus" /> <FormattedMessage id="NEW_ASSET" />
          </Button>
        </Link>
      </Actionbar>
    );

  }

}

AssetsActionbar.propTypes = {
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  setBreadcrumb: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations,
  activeWorkspace: state.sessionState.activeWorkspace
});

const mapDispatchToProps = {
  setBreadcrumb: ActionbarActions.setBreadcrumb
};

AssetsActionbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(AssetsActionbar);

export default AssetsActionbar;
