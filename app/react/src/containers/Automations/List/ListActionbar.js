import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { withTranslations } from '../../Helpers';
import { Actionbar } from '../../Actionbar';
import McsIcons from '../../../components/McsIcons';
import { getDefaultDatamart } from '../../../state/Session/selectors';

function ListActionbar({
  match: {
    params: {
      organisationId,
    },
  },
  translations,
  defaultDatamart,
}) {

  const breadcrumbPaths = [{
    name: translations.AUTOMATIONS_LIST,
    url: `/v2/o/${organisationId}/automations`,
  }];

  const datamartId = defaultDatamart(organisationId).id;

  return (
    <Actionbar path={breadcrumbPaths}>
      <Link to={`/o${organisationId}d${datamartId}/library/scenarios/`}>
        <Button className="mcs-primary" type="primary">
          <McsIcons type="plus" /> <FormattedMessage id="NEW_AUTOMATION" />
        </Button>
      </Link>
    </Actionbar>
  );

}

ListActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape().isRequired,
  defaultDatamart: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  defaultDatamart: getDefaultDatamart(state),
});

const ConnectedListActionbar = connect(
  mapStateToProps,
)(ListActionbar);

export default compose(
  withTranslations,
  withRouter,
)(ConnectedListActionbar);
