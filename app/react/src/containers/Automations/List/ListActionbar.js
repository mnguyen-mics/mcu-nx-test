import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { withTranslations } from '../../Helpers';
import { Actionbar } from '../../Actionbar';
import McsIcon from '../../../components/McsIcon.tsx';

function ListActionbar({
  match: {
    params: {
      organisationId,
    },
  },
  translations,
}) {

  const breadcrumbPaths = [{
    name: translations.AUTOMATIONS_LIST,
    url: `/v2/o/${organisationId}/automations/list`,
  }];


  return (
    <Actionbar path={breadcrumbPaths}>
      <Link to={`/v2/o/${organisationId}/automations/create`}>
        <Button className="mcs-primary" type="primary">
          <McsIcon type="plus" /> <FormattedMessage id="NEW_AUTOMATION" />
        </Button>
      </Link>
    </Actionbar>
  );

}

ListActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape().isRequired,
};


export default compose(
  withRouter,
  withTranslations,
)(ListActionbar);
