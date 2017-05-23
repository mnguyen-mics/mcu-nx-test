import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { withTranslations } from '../../Helpers';
import { Actionbar } from '../../Actionbar';
import { McsIcons } from '../../../components/McsIcons';

class ListActionbar extends Component {

  render() {

    const {
      match: {
        params: {
          organisationId
        }
      },
      translations
    } = this.props;

    const breadcrumbPaths = [{ name: translations.AUTOMATIONS_LIST, url: `/v2/o/${organisationId}/automations` }];

    const datamartId = 'todo';

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/o${organisationId}d${datamartId}/library/scenarios/`}>
          <Button type="primary">
            <McsIcons type="plus" /> <FormattedMessage id="NEW_AUTOMATION" />
          </Button>
        </Link>
      </Actionbar>
    );

  }

}

ListActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

ListActionbar = compose(
  withTranslations,
  withRouter,
)(ListActionbar);

export default ListActionbar;
