import * as React from 'react';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { connect } from 'react-redux';
import { Layout, Row } from 'antd';
import { FormTitle } from '../../../../../components/Form';
import messages from '../messages';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { MenuList } from '../../../../../components/FormMenu';
import { LegalBasis } from '../../../../../models/consent/UserConsentResource';

const { Content } = Layout;

interface LegalBasisSelectorProps {
  onSelect: (item: LegalBasis) => void;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = LegalBasisSelectorProps &
  InjectedIntlProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string }>;

class LegalBasisSelector extends React.Component<Props> {

  onSelect = (item: LegalBasis) => () => {
    this.props.onSelect(item);
  };

  uppercaseFirstLetter = (toBeUppercased: string) => {
    return toBeUppercased.charAt(0).toUpperCase() + toBeUppercased.slice(1);
  };

  render() {
    const {intl: {formatMessage}} = this.props;
    const legalBasisValues: Array<{
      value: LegalBasis;
      subtitle: FormattedMessage.MessageDescriptor;
    }> = [
      {
        value: 'CONSENT',
        subtitle: messages.consentSubTitle,
      },
      {
        value: 'CONTRACTUAL_PERFORMANCE',
        subtitle: messages.contractualPerformanceSubTitle,
      },
      {
        value: 'LEGAL_OBLIGATION',
        subtitle: messages.legalObligationSubTitle,
      },
      {
        value: 'PUBLIC_INTEREST_OR_EXERCISE_OF_OFFICIAL_AUTHORITY',
        subtitle: messages.publicInterestSubTitle,
      },
      {
        value: 'LEGITIMATE_INTEREST',
        subtitle: messages.legitimateInterestSubTitle,
      },
    ];

    const returnMenuList = (item: {
      value: LegalBasis;
      subtitle: FormattedMessage.MessageDescriptor;
    }): JSX.Element => {
      const {value, subtitle} = item;

      const title = this.uppercaseFirstLetter(
        value.toLowerCase().replace(/_/gi, ' '),
      );

      return (
        <MenuList
        title={title}
        subtitles={[formatMessage(subtitle)]}
        key={value}
        select={this.onSelect(value)}
        />
      );
    };

    return (
      <Layout>
        <div className="edit-layout ant-layout">
          <Layout>
            <Content className="mcs-content-container mcs-form-container text-center">
              <FormTitle
                title={messages.legalBasisTitle}
                subtitle={messages.legalBasisSubTitle}
              />
              <Row className="mcs-selector_container">
                <Row className="menu">
                  {legalBasisValues.map(returnMenuList)}
                </Row>
              </Row>
            </Content>
          </Layout>
        </div>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, LegalBasisSelectorProps>(
  withRouter,
  injectIntl,
  connect(mapStateToProps, undefined),
)(LegalBasisSelector);
