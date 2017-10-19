import React, { Component } from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { FieldArray } from 'redux-form';
import PropTypes from 'prop-types';
import { Row } from 'antd';
import { camelCase, snakeCase } from 'lodash';

import { EmptyRecords, Form } from '../../../../../../components';
import messages from '../messages';
import { getDefaultDatamart } from '../../../../../../state/Session/selectors';
import { AdGroupsTable } from '../Tables';
import AdGroupContent from '../../adGroup/AdGroupContent';


const { FormSection } = Form;

const tableName = 'adGroupsTable';

class AdGroups extends Component {

  state = { loading: false }


  openNewWindow = () => {
    const { handlers } = this.props;
    const additionalProps = {
      openNextDrawer: handlers.openNextDrawer,
      closeNextDrawer: handlers.closeNextDrawer,
      close: handlers.closeNextDrawer,
      save: this.createNewData,
    };

    const options = {
      additionalProps,
      isModal: true
    };

    handlers.openNextDrawer(AdGroupContent, options);
  }

  createNewData = (object) => {
    const { formValues, handlers } = this.props;
    const formattedObject = Object.keys(object).reduce((acc, key) => ({
      ...acc,
      [key.indexOf('Table') !== -1 ? key : snakeCase(key.replace('adGroup', ''))]: object[key]
    }), {});
    formattedObject.toBeCreated = true;
    const valuesToAdd = formValues.filter(item => {
      return !item.toBeRemoved;
    });
    valuesToAdd.push(formattedObject);
    this.setState({ loading: true }, () => {
      handlers.updateTableFields({ newFields: valuesToAdd, tableName: tableName });
    });
    this.setState({ loading: false });
    this.props.handlers.closeNextDrawer();
  }


  updateNewData = (object) => {
    const {
      formValues,
      handlers
    } = this.props;
    const formattedObject = Object.keys(object).reduce((acc, key) => ({
      ...acc,
      [key.indexOf('Table') !== -1 ? key : snakeCase(key.replace('adGroup', ''))]: object[key]
    }), {});

    const newValues = formValues.map((item) => {
      return item.id === formattedObject.id ? formattedObject : item;
    });
    this.setState({ loading: true }, () => {
      handlers.updateTableFields({ newFields: newValues, tableName: tableName });
      this.setState({ loading: false });
      this.props.handlers.closeNextDrawer();
    });

  }

  handleClickOnAdGroup = (adGroupValue) => {
    const {
      handlers,
      formValues
    } = this.props;

    const initialAdGroup = formValues.find(item => {
      return item.id === adGroupValue.key;
    });

    const initialAdGroupFormatted = Object.keys(initialAdGroup).reduce((acc, key) => ({
      ...acc,
      [key.indexOf('Table') === -1 ? camelCase(`adGroup-${key}`) : key]: initialAdGroup[key]
    }), {});

    const adGroupEditorProps = {
      editionMode: true,
      initialValues: initialAdGroupFormatted,
      openNextDrawer: handlers.openNextDrawer,
      closeNextDrawer: handlers.closeNextDrawer,
      close: handlers.closeNextDrawer,
      save: this.updateNewData,
    };

    const options = {
      additionalProps: adGroupEditorProps,
      isModal: true,
    };

    handlers.openNextDrawer(AdGroupContent, options);
  }

  render() {
    const { formatMessage, formValues, handlers } = this.props;
    const dataSource = formValues.reduce((tableData, adGroup, index) => {
      return (!adGroup.toBeRemoved
        ? [
          ...tableData,
          {
            key: adGroup.id,
            type: { image: 'goals', name: adGroup.name ? adGroup.name : adGroup.ad_group_name },
            default: { bool: adGroup.default, index },
            toBeRemoved: index,
            toBeCreated: adGroup.toBeCreated
          }
        ]
        : tableData
      );
    }, []);

    return (
      <div id="adGroups">
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownNew.id,
              message: messages.dropdownNew,
              onClick: this.openNewWindow,
            },
          ]}
          subtitle={messages.sectionSubtitle3}
          title={messages.sectionTitle3}
        />

        <Row>
          <FieldArray
            component={AdGroupsTable}
            dataSource={dataSource}
            loading={this.state.loading}
            name={tableName}
            tableName={tableName}
            updateTableFieldStatus={handlers.updateTableFieldStatus}
            openEditionMode={this.handleClickOnAdGroup}
          />

          {!dataSource.length
            ? <EmptyRecords
              iconType="plus"
              message={formatMessage(messages.contentSection3EmptyTitle)}
            />
            : null
          }
        </Row>
      </div>
    );
  }
}

AdGroups.defaultProps = {
  formValues: [],
};

AdGroups.propTypes = {
  formValues: PropTypes.arrayOf(PropTypes.shape()),
  formatMessage: PropTypes.func.isRequired,

  handlers: PropTypes.shape({
    closeNextDrawer: PropTypes.func.isRequired,
    updateTableFieldStatus: PropTypes.func.isRequired,
    openNextDrawer: PropTypes.func.isRequired,
    updateTableFields: PropTypes.func.isRequired,
  }).isRequired,
};

export default compose(
  connect(
    state => ({
      defaultDatamart: getDefaultDatamart(state),
    }),
  ),
)(AdGroups);
