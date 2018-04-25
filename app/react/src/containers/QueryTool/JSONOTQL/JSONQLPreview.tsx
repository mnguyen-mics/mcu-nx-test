import * as React from 'react';
import { CounterDashboard } from '../../../components/Counter';
import { LoadingCounterValue } from '../../../components/Counter/Counter';
import {
  ObjectTreeExpressionNodeShape,
  QueryDocument,
} from '../../../models/datamart/graphdb/QueryDocument';
import McsIcon, { McsIconType } from '../../../components/McsIcon';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import { Button } from 'antd';
import { injectDrawer } from '../../../components/Drawer';
import { InjectDrawerProps } from '../../../components/Drawer/injectDrawer';
import JSONQLBuilderContainer, {
  JSONQLBuilderContainerProps,
} from './JSONQLBuilderContainer';
import ActionBar from '../../../components/ActionBar';

export interface JSONQLPreviewProps {
  value?: string;
  onChange?: (e: string) => void;
  datamartId: string;
}

export interface View extends LoadingCounterValue {
  name: string;
}

interface State {
  views: View[];
  parsedQuery: ObjectTreeExpressionNodeShape | undefined;
}

type Props = JSONQLPreviewProps & InjectedIntlProps & InjectDrawerProps;

class JSONQLPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      parsedQuery: props.value ? JSON.parse(props.value) : undefined,
      views: [
        {
          name: 'UserPoint',
          loading: true,
        },
      ],
    };
  }

  componentDidMount() {
    const { value } = this.props;
    if (value) {
      this.setState({ parsedQuery: JSON.parse(value) });
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const { value } = nextProps;
    if (value) {
      this.setState({ parsedQuery: JSON.parse(value) });
    }
  }

  fetchViewValue = () => {
    // todo add api call to fetch number of userpoint
  };

  getIconType = (name: string): McsIconType => {
    switch (name) {
      case 'UserPoint':
        return 'full-users';
      case 'UserAccount':
        return 'users';
      case 'UserAgent':
        return 'display';
      case 'UserEmail':
        return 'email-inverted';
      default:
        return 'question';
    }
  };

  getTitle = (name: string): string => {
    const { intl } = this.props;

    switch (name) {
      case 'UserPoint':
        return intl.formatMessage({
          id: 'jsonql.querytool.userpoint',
          defaultMessage: 'User Points',
        });
      case 'UserAccount':
        return intl.formatMessage({
          id: 'jsonql.querytool.useraccounts',
          defaultMessage: 'User Accounts',
        });
      case 'UserAgent':
        return intl.formatMessage({
          id: 'jsonql.querytool.useragent',
          defaultMessage: 'Display Cookies',
        });
      case 'UserEmail':
        return intl.formatMessage({
          id: 'jsonql.querytool.UserEmail',
          defaultMessage: 'Emails',
        });
      default:
        return name;
    }
  };

  openEditor = () => {
    const { intl } = this.props;

    const actionbar = (query: QueryDocument, datamartId: string) => {
      const onSave = () => {
        if (this.props.onChange) this.props.onChange(JSON.stringify(query));
        this.props.closeNextDrawer();
      };
      const onClose = () => this.props.closeNextDrawer();
      return (
        <ActionBar
          edition={true}
          paths={[
            {
              name: intl.formatMessage({
                id: 'jsonql.querytool.query.edit',
                defaultMessage: 'Edit Your Query',
              }),
            },
          ]}
        >
          <Button
            disabled={!query}
            className="mcs-primary"
            type="primary"
            onClick={onSave}
          >
            <FormattedMessage
              id="jsonql.querytool.query.edit.update"
              defaultMessage="Update"
            />
          </Button>
          <McsIcon
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={onClose}
            />
        </ActionBar>
      );
    };

    this.props.openNextDrawer<JSONQLBuilderContainerProps>(
      JSONQLBuilderContainer,
      {
        additionalProps: {
          datamartId: this.props.datamartId,
          renderActionBar: actionbar,
          editionLayout: true,
        },
      },
    );
  };

  render() {
    const counters = this.state.views.map(v => ({
      loading: v.loading,
      title: this.getTitle(v.name),
      value: v.value,
      iconType: this.getIconType(v.name),
    }));

    return (
      <div>
        <div className="audience-statistic">
          <CounterDashboard counters={counters} invertedColor={true} />
        </div>f
        <div className="text-center m-t-20">
          <Button onClick={this.openEditor}>
            {this.props.intl.formatMessage({
              id: 'jsonql.button.query.edit',
              defaultMessage: 'Edit Query',
            })}
          </Button>
        </div>
      </div>
    );
  }
}

export default compose<Props, JSONQLPreviewProps>(injectIntl, injectDrawer)(
  JSONQLPreview,
);
