/* eslint-disajble */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Scrollspy from 'react-scrollspy';
import { Field, reduxForm } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Layout, Form, Row, Button } from 'antd';

import { ReactRouterPropTypes } from '../../../../validators/proptypes';
import { withMcsRouter } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import { McsIcons } from '../../../../components/McsIcons';
import { FormInput, FormTitle, FormSelect, withValidators } from '../../../../components/Form';
import { RecordElement, RelatedRecords } from '../../../../components/RelatedRecord';
import { generateFakeId, isFakeId } from '../../../../utils/FakeIdHelper';
import messages from './messages';
// import EmailBlastEditor from './EmailBlastEditor';
import EmailRouterService from '../../../../services/EmailRouterService';

const { Content, Sider } = Layout;

class AdGroupEditor extends Component {
  constructor(props) {
    super(props);
    // this.handleCliclOnNewBlast = this.handleCliclOnNewBlast.bind(this);
    // this.handleClickOnEditBlast = this.handleClickOnEditBlast.bind(this);
    // this.handleClickOnRemoveBlast = this.handleClickOnRemoveBlast.bind(this);
    // this.handleAddBlast = this.handleAddBlast.bind(this);
    // this.handleEditBlast = this.handleEditBlast.bind(this);
    // this.handleSaveEmailCampaign = this.handleSaveEmailCampaign.bind(this);

    this.state = {
      routerOptions: [],
      blasts: []
    };
  }

  componentDidMount() {
    const {
      match: { params: { organisationId } }
    } = this.props;

    EmailRouterService.getRouters(organisationId).then((response) => {
      this.setState({
        routerOptions: response.data
      });
    });
  }

  render() {
    // const hasUnsavedChange = dirty; // dirty is for redux-form only, TODO handle wider email campaign modifiction (blasts)

    return (
      <Layout>
        <div>Dans AdBlockEditor, futur form</div>
      </Layout>
    );
  }
}

AdGroupEditor.defaultProps = {
  blasts: [],
  campaignName: ''
};

AdGroupEditor.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
  // intl: intlShape.isRequired,
  // handleSubmit: PropTypes.func.isRequired,
  // submitting: PropTypes.bool.isRequired,
  // fieldValidators: PropTypes.shape().isRequired,
  // openNextDrawer: PropTypes.func.isRequired,
  // closeNextDrawer: PropTypes.func.isRequired,
  // save: PropTypes.func.isRequired,
  // close: PropTypes.func.isRequired,
  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string,
  })).isRequired,
  // blasts: PropTypes.arrayOf(PropTypes.shape()),
};

AdGroupEditor = compose(
  injectIntl,
  withMcsRouter,
  // reduxForm({
  //   form: 'emailEditor',
  //   enableReinitialize: true
  // }),
  withValidators
)(AdGroupEditor);

export default AdGroupEditor;
