import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import { Row } from 'antd';

import { EmptyRecords, Form } from '../../../../../../components';
import AdGroupCardList from '../AdGroupCardList';
import messages from '../../messages';
import CreativeCardSelector from '../../../../Email/Edit/CreativeCardSelector';
import CreativeService from '../../../../../../services/CreativeService';

const { FormSection } = Form;

class Ads extends Component {

  state = { loading: false }

  getAllAds = () => {
    const { organisationId } = this.props;

    return CreativeService.getDisplayAds({ organisationId })
      .then(({ data, total }) => ({ data, total }));
  }

  openWindow = () => {
    const { formValues, handlers } = this.props;

    const emailTemplateSelectorProps = {
      close: handlers.closeNextDrawer,
      fetchData: this.getAllAds,
      selectedData: formValues.filter(ad => !ad.toBeRemoved),
      save: this.updateData,
    };

    const options = {
      additionalProps: emailTemplateSelectorProps,
      isModal: true,
    };

    handlers.openNextDrawer(CreativeCardSelector, options);
  }

  updateData = (selectedAds) => {
    const { handlers } = this.props;
    const selectedIds = selectedAds.map(selection => selection.id);

    this.setState({ loading: true });
    handlers.closeNextDrawer();

    this.getAllAds()
      .then(({ data }) => {
        const newFields = data.filter((ad) => selectedIds.includes(ad.id));

        handlers.updateTableFields({ newFields, tableName: 'ads' });

        return this.setState({ loading: false });
      });
  }

  render() {
    const { formatMessage, formValues, handlers } = this.props;

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
            data={formValues}
            loading={this.state.loading}
            name="ads"
            updateTableFieldStatus={handlers.updateTableFieldStatus}
          />

          {!formValues.filter(ad => !ad.toBeRemoved).length
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
