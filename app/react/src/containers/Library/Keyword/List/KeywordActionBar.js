import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { Actionbar } from '../../../Actionbar';
import { withTranslations } from '../../../Helpers';
import McsIcons from '../../../../components/McsIcons.tsx';

class KeywordActionbar extends Component {

  render() {

    const {
    match: {
      params: {
        organisationId,
      },
    },
      translations,
  } = this.props;

    const breadcrumbPaths = [{ name: translations.KEYWORD_LIST, url: `/v2/o/${organisationId}/library/keywordslists` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/${organisationId}/library/keywordslists/new`}>
          <Button className="mcs-primary" type="primary">
            <McsIcons type="plus" /> <FormattedMessage id="NEW_KEYWORD_LIST" />
          </Button>
        </Link>
      </Actionbar>
    );

  }

}

KeywordActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

KeywordActionbar = compose(
  withTranslations,
  withRouter,
)(KeywordActionbar);

export default KeywordActionbar;
