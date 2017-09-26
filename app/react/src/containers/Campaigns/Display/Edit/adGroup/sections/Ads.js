import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import { Row } from 'antd';

import { EmptyRecords, Form } from '../../../../../../components';
import AdGroupCardList from '../AdGroupCardList';
import messages from '../../messages';
import EmailTemplateSelector from '../../../../Email/Edit/EmailTemplateSelector';
import { getPaginatedApiParam } from '../../../../../../utils/ApiHelper';
import CreativeService from '../../../../../../services/CreativeService';

const { FormSection } = Form;

class Ads extends Component {

  state = { loading: false }

  getAllAds = () => {
    const { pageSize, currentPage, keywords } = this.state;
    const options = { ...getPaginatedApiParam(currentPage, pageSize) };

    if (keywords) {
      options.keywords = keywords;
    }

    return CreativeService.getEmailTemplates(this.props.organisationId, options)
      .then(results => results.data);
  }

  openWindow = () => {
    const { formValues, handlers } = this.props;
    const emailTemplateSelections = formValues
      .filter(ad => !ad.toBeRemoved)
      .map(({ id, ...ad }) => ({ ...ad, email_template_id: id }));

    const emailTemplateSelectorProps = {
      close: handlers.closeNextDrawer,
      emailTemplateSelections,
      save: this.updateData,
    };

    const options = {
      additionalProps: emailTemplateSelectorProps,
      isModal: true,
    };

    handlers.openNextDrawer(EmailTemplateSelector, options);
  }

  updateData = (selectedAds) => {
    const { handlers } = this.props;
    const selectedIds = selectedAds.map(selection => selection.email_template_id);

    this.setState({ loading: true });
    handlers.closeNextDrawer();

    this.getAllAds()
      .then((ads) => {
        const newFields = ads.filter((ad) => selectedIds.includes(ad.id));

        handlers.updateTableFields({ newFields, tableName: 'ads' });
        this.setState({ loading: false });
      });
  }

  render() {
    const { formatMessage, formValues, handlers } = this.props;
    const cardsToDisplay = formValues.filter(ad => !ad.toBeRemoved);

    return (
      <div id="ads">
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownNew.id,
              message: messages.dropdownNew,
              onClick: () => {},
            },
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openWindow,
            },
          ]}
          subtitle={messages.sectionSubtitle7}
          title={messages.sectionTitle7}
        />

        <Row>
          <FieldArray
            component={AdGroupCardList}
            data={cardsToDisplay}
            loading={this.state.loading}
            name="ads"
            updateTableFieldStatus={handlers.updateTableFieldStatus}
          />

          {!formValues.length
            ? <EmptyRecords
              iconType="plus"
              message={formatMessage(messages.contentSection7EmptyTitle)}
            />
            : null
          }
        </Row>
      </div>
    );
  }
}

Ads.defaultProps = {
  formValues: [],
};

Ads.propTypes = {
  formatMessage: PropTypes.func.isRequired,
  formValues: PropTypes.arrayOf(PropTypes.shape()),

  handlers: PropTypes.shape({
    closeNextDrawer: PropTypes.func.isRequired,
    openNextDrawer: PropTypes.func.isRequired,
    updateTableFieldStatus: PropTypes.func.isRequired,
  }).isRequired,

  organisationId: PropTypes.string.isRequired
};

export default Ads;
