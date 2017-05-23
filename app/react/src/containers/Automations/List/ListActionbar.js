import React, { Component } from 'react';
import PropTypes from 'prop-types';
<<<<<<< HEAD
=======
import { Icon, Button } from 'antd';
>>>>>>> 31970ec99ef421bc2d17e0f12cd9c39953a83363
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

<<<<<<< HEAD
import { Icons } from '../../../components/Icons';
import { Actionbar, ActionbarButton } from '../../Actionbar';
=======
import { Actionbar } from '../../Actionbar';
>>>>>>> 31970ec99ef421bc2d17e0f12cd9c39953a83363
import * as ActionbarActions from '../../../state/Actionbar/actions';

class ListActionbar extends Component {

  componentWillMount() {

    const {
      translations,
      setBreadcrumb
    } = this.props;

    const breadcrumb = {
      name: translations.AUTOMATIONS_LIST
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
        <Link to={`/${workspaceId}/library/scenarios/`}>
<<<<<<< HEAD
          <ActionbarButton className="mcs-actionbar-button-add mcs-actionbar-button">
            <Icons type="plus" /> <FormattedMessage id="NEW_AUTOMATION" />
          </ActionbarButton>
=======
          <Button type="primary">
            <Icon type="plus" /> <FormattedMessage id="NEW_AUTOMATION" />
          </Button>
>>>>>>> 31970ec99ef421bc2d17e0f12cd9c39953a83363
        </Link>
      </Actionbar>
    );

  }

}

ListActionbar.propTypes = {
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

ListActionbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(ListActionbar);

export default ListActionbar;
