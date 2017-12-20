import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';

import { EmptyRecords, Form } from '../../../../../../../components/index.ts';
import AdGroupCardList from './AdGroupCardList';
import messages from '../../../messages';
import CreativeCardSelector from '../../../../../Email/Edit/CreativeCardSelector';
import CreativeService from '../../../../../../../services/CreativeService.ts';
import {} from '../../../AdGroupServiceWrapper';

const { FormSection } = Form;

class Ads extends Component {

  state = { loading: false }

  getAllAds = (options) => {
    const { organisationId } = this.props;

    return CreativeService.getDisplayAds(organisationId, options)
      .then(({ data, total }) => ({ data, total }));
  }

  openWindow = () => {
    const { formValues, handlers } = this.props;

    const emailTemplateSelectorProps = {
      close: handlers.closeNextDrawer,
      fetchData: this.getAllAds,
      selectedData: formValues.filter(ad => !ad.toBeRemoved),
      save: this.updateData,
      filterKey: 'id',
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

    Promise.all(selectedIds.map(creativeId => {
      return CreativeService.getCreative(creativeId).then(res => res.data);
    })).then(response => {
      handlers.updateTableFields({ newFields: response, tableName: 'adTable' });
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
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openWindow,
            },
          ]}
          subtitle={messages.sectionSubtitleAds}
          title={messages.sectionTitleAds}
        />

        <div className="ad-group-ad-section">
          <FieldArray
            className="content"
            component={AdGroupCardList}
            data={formValues}
            loading={this.state.loading}
            name="adTable"
            updateTableFieldStatus={handlers.updateTableFieldStatus}
          />

          {!formValues.filter(ad => !ad.toBeRemoved).length
            && (
              <EmptyRecords
                iconType="ads"
                message={formatMessage(messages.contentSectionAdEmptyTitle)}
              />
            )
          }
        </div>
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
