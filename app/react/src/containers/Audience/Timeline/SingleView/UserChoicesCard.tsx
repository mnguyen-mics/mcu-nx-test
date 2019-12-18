import * as React from 'react';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import {
  UserChoices,
  ProcessingResource,
  UserConsentResource,
} from '../../../../models/timeline/timeline';
import { Card } from '../../../../components/Card';
import { Row, Col, Tooltip, Modal, Tag } from 'antd';
import messages from '../messages';
import { McsIcon } from '../../../../components';
import moment from 'moment';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';
import { injectFeatures, InjectedFeaturesProps } from '../../../Features';
import injectThemeColors, { InjectedThemeColorsProps } from '../../../Helpers/injectThemeColors';

interface UserChoicesCardProps {
  dataSource: UserChoices;
  isLoading: boolean;
}

interface ProcessingUserChoice {
  processing: ProcessingResource;
  consent: UserConsentResource;
}

interface State {}

type Props = UserChoicesCardProps &
InjectedIntlProps &
InjectedFeaturesProps &
InjectedThemeColorsProps;

class UserChoicesCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  buildData = (data: UserChoices): ProcessingUserChoice[] => {
    const associatedProcessingUserChoices: ProcessingUserChoice[] = data.processings.reduce(
      (accumulator: ProcessingUserChoice[], processing: ProcessingResource) => {
        const associatedConsent = data.userConsents.find(consent => {
          return consent.$processing_id === processing.id;
        });

        if (associatedConsent) {
          accumulator.push({
            processing: processing,
            consent: associatedConsent,
          });
        }

        return accumulator;
      },
      [],
    );

    return associatedProcessingUserChoices;
  };

  renderConsent = (consent: UserConsentResource) => {
    const { colors } = this.props;
    const restOfObject = Object.entries(consent).filter(keyValue => {
      const value = keyValue[1];
      return value !== null;
    });

    const returnedColumnsRestOfObject = restOfObject.map(keyValue => {
      const key = keyValue[0];
      const value = keyValue[1];

      if (key === '$creation_ts' || key === '$consent_ts') {
        const returnedValue = moment(value).format('YYYY-MM-DD, hh:mm:ss');
        return [
          (<span>{key} :</span>),
          (<span>{returnedValue}</span>)
        ];
      } else if (key === '$consent_value') {
        const returnedValue = value ? 
          (<Tag color={colors["mcs-success"]}>True</Tag>) :
          (<Tag color={colors["mcs-error"]}>False</Tag>);
        return [
          (<span>{key} :</span>),
          (<span>{returnedValue}</span>)
        ];
      } else if (typeof value === 'boolean') {
        const returnedValue = value ? 'True' : 'False';
        return [
          (<span>{key} :</span>),
          (<span>{returnedValue}</span>)
        ];
      } else if (typeof value === 'string' || typeof value === 'number') {
        return [
          (<span>{key} :</span>),
          (<span>{value}</span>)
        ];
      } else {
        return [
          (<span>{key} :</span>),
          (<span>{JSON.stringify(value)}</span>)
        ];
      }
    });

    const renderColumn = (columnNumber: number) => {
      return (columns: any[]) => {
        return (
          <span>
            {columns[columnNumber]}
            <br />
          </span>
        );
      };
    };

    const leftColumn = returnedColumnsRestOfObject.map(renderColumn(0));
    const rightColumn = returnedColumnsRestOfObject.map(renderColumn(1));

    return (
      <Row>
        <Col className="table-left" span={12}>
          {leftColumn}
        </Col>
        <Col className="table-right" span={12}>
          {rightColumn}
        </Col>
      </Row>
    );
  };

  uppercaseFirstLetter = (toBeUppercased: string) => {
    return toBeUppercased.charAt(0).toUpperCase() + toBeUppercased.slice(1);
  };

  renderProcessing = (processingUserChoice: ProcessingUserChoice) => {
    const processing = processingUserChoice.processing;
    const legalBasis = this.uppercaseFirstLetter(
      processing.legal_basis.toLowerCase().replace(/_/gi, ' '),
    );
    const consent = processingUserChoice.consent;
    return (
      <Row
        gutter={10}
        key={processingUserChoice.processing.id}
        className="table-line border-top"
      >
        <Row>
          <Col span={21}>
            <span className="title">
              {processing.name} ({legalBasis})
            </span>
          </Col>
          <Col span={3}>
            <Tooltip title={processing.purpose} placement="right">
              <McsIcon className="mcs-timeline-info" type="info" />
            </Tooltip>
          </Col>
        </Row>
        {consent && this.renderConsent(consent)}
      </Row>
    );
  };

  createHandleJSONViewModal = (filteredData: ProcessingUserChoice[]) => {
    return () => {
      const { intl } = this.props;

      Modal.info({
        title: intl.formatMessage(messages.userChoicesJson),
        okText: intl.formatMessage(messages.userChoicesJsonModalOkText),
        width: '650px',
        content: (
          <SyntaxHighlighter language="json" style={docco}>
            {JSON.stringify(filteredData, undefined, 4)}
          </SyntaxHighlighter>
        ),
        onOk() {
          //
        },
      });
    };
  };

  render() {
    const {
      intl: { formatMessage },
      dataSource,
      isLoading,
      hasFeature
    } = this.props;

    const filteredData = this.buildData(dataSource);

    const handleViewJsonModal = this.createHandleJSONViewModal(filteredData);

    const viewJsonButton = (
      <Row>
        <button className="button-sm" onClick={handleViewJsonModal}>
          <FormattedMessage {...messages.userChoicesviewJsonButton} />
        </button>
      </Row>
    );

    return hasFeature('audience-monitoring-user_choices') ? (
      <Card
        title={formatMessage(messages.userChoicesTitle)}
        isLoading={isLoading}
        className={'mcs-userChoicesCard'}
        buttons={viewJsonButton}
      >
        {filteredData.map(this.renderProcessing)}
      </Card>
    ) : null;
  }
}

export default compose<Props, UserChoicesCardProps>(
  injectFeatures,
  injectIntl,
  injectThemeColors
)(UserChoicesCard);
