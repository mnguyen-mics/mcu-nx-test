import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Modal } from 'antd';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

import { ButtonStyleless, McsIcons } from '../../../../../../components/index.ts';
import messages from '../../messages';

class GoalsTable extends Component {

  state = {
    isModalOpen: false,
    goalId: null
  }

  openCloseModal = (goalId = null) => {
    this.setState({ isModalOpen: !this.state.isModalOpen, goalId: goalId });
  }

  onClickOnGetPixelGoal = (record) => {
    const {
      intl: {
        formatMessage
      },
      createUniqueGoal,
      organisationId,
    } = this.props;

    if (record.toBeCreated) {
      Modal.confirm({
        title: formatMessage(messages.goalPixelModalTitle),
        content: (
          <div>
            {formatMessage(messages.goalPixelModalSaveGoal)}
          </div>
        ),
        onOk() {
          createUniqueGoal(organisationId, record.key);
        },
        onCancel() {}
      });
    } else {
      this.openCloseModal(record.key);
    }
  }

  render() {

    const { dataSource, loading, tableName, updateTableFieldStatus, openEditionMode, defaultDatamart, organisationId, hasDatamarts } = this.props;

    const columns = [
      {
        colSpan: 8,
        dataIndex: 'type',
        key: 'type',
        render: (type) => (
          <div className="display-row center-vertically row-height">
            <div className="icon-round-border">
              <McsIcons
                type={type.image}
                style={{ color: '#00a1df', fontSize: 24, margin: 'auto' }}
              />
            </div>
            {type.name}
          </div>),
      },
      {
        colSpan: 13,
        dataIndex: 'default',
        key: 'default',
        render: () => {
          return (<span />);
        },
      },

      {
        colSpan: 3,
        dataIndex: 'toBeRemoved',
        key: 'toBeRemoved',
        className: 'text-right',
        render: (index, record) => (
          <span>
            {hasDatamarts(organisationId) ? <ButtonStyleless onClick={(e) => { e.preventDefault(); this.onClickOnGetPixelGoal(record); }}>
              <McsIcons type="settings" style={{ fontSize: 20 }} />
            </ButtonStyleless> : null}
            {record.toBeCreated === true ? <ButtonStyleless onClick={(e) => { e.preventDefault(); openEditionMode(record); }}>
              <McsIcons type="pen" style={{ fontSize: 20 }} />
            </ButtonStyleless> : null}
            <ButtonStyleless onClick={(e) => { e.preventDefault(); updateTableFieldStatus({ index, tableName }); }}>
              <McsIcons type="delete" style={{ fontSize: 20 }} />
            </ButtonStyleless>
          </span>
      ),
      },
    ];

    const tableStyle = (dataSource.length || loading ? 'border-style' : 'hide-section');

    return (
      <div className="adGroup-table testeu">
        <Table
          className={tableStyle}
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          showHeader={false}
        />
        {hasDatamarts(organisationId) ?
          <Modal
            title={<FormattedMessage {...messages.goalPixelModalTitle} />}
            visible={this.state.isModalOpen}
            onOk={this.openCloseModal}
            onCancel={this.openCloseModal}
          >
            <p><FormattedMessage {...messages.goalPixelModalContent} /></p>
            <br />
            <pre><code>{`<img src="//events.mediarithmics.com/v1/touches/pixel?$ev=$conversion&$dat_token=${defaultDatamart(organisationId).token}&$goal_id=${this.state.goalId}" />`}</code></pre>
          </Modal> : null}
      </div>
    );
  }
}

GoalsTable.defaultProps = {
  loading: false,
};


GoalsTable.propTypes = {
  dataSource: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  loading: PropTypes.bool,
  tableName: PropTypes.string.isRequired,
  updateTableFieldStatus: PropTypes.func.isRequired,
  openEditionMode: PropTypes.func.isRequired,
  defaultDatamart: PropTypes.func.isRequired,
  organisationId: PropTypes.string.isRequired,
  hasDatamarts: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  createUniqueGoal: PropTypes.func.isRequired,
};

export default injectIntl(GoalsTable);
