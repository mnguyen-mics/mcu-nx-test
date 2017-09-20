import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row } from 'antd';

import { EmptyRecords, Form, TableSelector } from '../../../../../../components';
import AdGroupTable from '../AdGroupTable';
import DisplayNetworkServices from '../../../../../../services/DisplayNetworkServices';
import messages from '../../messages';

const { FormSection } = Form;

class Publisher extends Component {

  getAllPublishers = () => {
    return DisplayNetworkServices.getAllPublishers(this.props.organisationId);
  }

  openWindow = () => {
    const { formValues, handlers } = this.props;

    const selectedIds = formValues.filter(elem => !elem.toBeRemoved).map(elem => elem.id);
    const columnsDefinitions = [
      {
        intlMessage: messages.sectionSelectorTitleName,
        key: 'display_network_name',
        isHideable: false,
        render: text => <span>{text}</span>,
      },
    ];

    const additionalProps = {
      formName: 'publisherTable',
      columnsDefinitions,
      close: handlers.closeNextDrawer,
      fetchSelectorData: this.getAllPublishers,
      save: this.updateData,
      selectedIds,
    };

    handlers.openNextDrawer(TableSelector, { additionalProps });
  }

  updateData = (selectedSegmentIds) => {
    const { handlers } = this.props;

    handlers.closeNextDrawer();

    this.getAllPublishers()
      .then((publishers) => {
        const newFields = publishers.reduce((acc, publisher) => {
          return (selectedSegmentIds.includes(publisher.id)
            ? [...acc, publisher]
            : acc
          );
        }, []);

        handlers.updateTableFields({ newFields, tableName: 'publisherTable' });
      });
  }

  render() {
    const { formValues, formatMessage, handlers } = this.props;

    const dataSource = formValues.reduce((tableData, publisher, index) => {
      return (!publisher.toBeRemoved
      ? [
        ...tableData,
        {
          key: publisher.id,
          type: { image: 'question', name: publisher.display_network_name },
          info: [],
          toBeRemoved: index,
        }
      ]
      : tableData
      );
    }, []);

    return (
      <div id="publisher">
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownAdd.id,
              message: messages.dropdownAdd,
              onClick: () => {},
            },
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openWindow,
            },
          ]}
          subtitle={messages.sectionSubtitle4}
          title={messages.sectionTitle4}
        />

        <Row>
          <AdGroupTable
            dataSource={dataSource}
            tableName="publisherTable"
            updateTableFieldStatus={handlers.updateTableFieldStatus}
          />

          {!dataSource.length
          ? <EmptyRecords
            iconType="plus"
            message={formatMessage(messages.contentSection2EmptyTitle)}
          />
          : null
        }
        </Row>
      </div>
    );
  }
}

Publisher.defaultProps = {
  formValues: [],
};

Publisher.propTypes = {
  formValues: PropTypes.arrayOf(PropTypes.shape()),
  formatMessage: PropTypes.func.isRequired,

  handlers: PropTypes.shape({
    closeNextDrawer: PropTypes.func.isRequired,
    openNextDrawer: PropTypes.func.isRequired,
    updateTableFieldStatus: PropTypes.func.isRequired,
  }).isRequired,

  organisationId: PropTypes.string.isRequired
};

export default Publisher;
