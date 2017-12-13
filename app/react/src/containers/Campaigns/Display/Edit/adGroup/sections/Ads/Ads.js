import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import { snakeCase } from 'lodash';
import { Spin } from 'antd';


import { EmptyRecords, Form } from '../../../../../../../components/index.ts';
import AdGroupCardList from './AdGroupCardList';
import messages from '../../../messages';
import CreativeCardSelector from '../../../../../Email/Edit/CreativeCardSelector';
import { DisplayCreativeContent } from '../../../../../../Creative/DisplayAds/Edit';
import { createDisplayCreative, updateDisplayCreative } from '../../../../../../../formServices/CreativeServiceWrapper';
import CreativeService from '../../../../../../../services/CreativeService.ts';

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

  openWindowNewCreative = () => {
    const { handlers } = this.props;

    const additionalProps = {
      onClose: handlers.closeNextDrawer,
      save: this.createNewData,
      close: handlers.closeNextDrawer,
    };

    const options = {
      additionalProps: additionalProps,
      isModal: true
    };

    handlers.openNextDrawer(DisplayCreativeContent, options);
  }

  createNewData = (creativeData, formattedProperties, rendererData) => {
    const { formValues, handlers } = this.props;
    const { organisationId } = this.props;
    return createDisplayCreative(creativeData, formattedProperties, organisationId, rendererData)
      .then((createdCreativeData) => {
        const valuesToAdd = [
          ...formValues.filter(item => {
            return !item.toBeRemoved;
          }),
          createdCreativeData
        ];
        this.setState({ loading: true }, () => {
          handlers.updateCreativeTableFields({ newFields: valuesToAdd, tableName: 'adTable' });
          this.props.handlers.closeNextDrawer();
        });
        this.setState({ loading: false });
      }).catch(() => {
        // this.props.notifyError(err);
      });
  }

  updateCreative = (creative, properties) => {
    const {
      formValues,
      handlers,
      organisationId,
    } = this.props;
    const formattedObject = Object.keys(creative).reduce((acc, key) => ({
      ...acc,
      [key.indexOf('Table') !== -1 ? key : snakeCase(key.replace('adGroup', ''))]: creative[key]
    }), {});
    const updatedValues = formValues.map((item) => {
      return item.id === formattedObject.id ? formattedObject : item;
    });
    updateDisplayCreative(organisationId, creative, properties)
    .then(() => {
      this.setState({ loading: true }, () => {
        handlers.updateCreativeTableFields({ newFields: updatedValues, tableName: 'adTable' });
        this.setState({ loading: false });
        this.props.handlers.closeNextDrawer();
      });
    });
  }

  // updateData = (selectedAds) => {
  //   const { handlers } = this.props;
  //   const selectedIds = selectedAds.map(selection => selection.id);

  //   this.setState({ loading: true });
  //   handlers.closeNextDrawer();
  //   const newFields = [];
  //   const promises = selectedIds.map(selectedId => {
  //     return CreativeService.getCreative(selectedId).then(data => {
  //       newFields.push(data);
  //     });
  //   });
  //   Promise.all(promises).then(() => {
  //     handlers.updateTableFields({ newFields, tableName: 'adTable' });
  //     return this.setState({ loading: false });
  //   });
  // }

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
              id: messages.dropdownNew.id,
              message: messages.dropdownNew,
              onClick: this.openWindowNewCreative,
            },
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openWindow,
            },
          ]}
          subtitle={messages.sectionSubtitleAds}
          title={messages.sectionTitleAds}
        />
        <Spin spinning={this.state.loading}>
          <div className="ad-group-ad-section">
            <FieldArray
              className="content"
              component={AdGroupCardList}
              data={formValues}
              loading={this.state.loading}
              name="adTable"
              updateTableFieldStatus={handlers.updateTableFieldStatus}
              handlers={this.props.handlers}
              updateCreative={this.updateCreative}
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
        </Spin>
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

  organisationId: PropTypes.string.isRequired,
  // notifyError: PropTypes.func.isRequired,
};

export default Ads;
