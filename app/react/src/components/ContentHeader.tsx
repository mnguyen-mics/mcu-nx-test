import * as React from 'react';

interface Props {
  title: React.ReactNode;
  subTitle?: React.ReactNode;
  loading?: boolean;
}

class ContentHeader extends React.Component<Props> {
  render() {
    const { title, subTitle, loading } = this.props;

    const content = (
      <div>
        <div className="content-subtitle">{subTitle}</div>
        <div className="content-title">{title}</div>
      </div>
    );

    return (
      <div className="content-header">
        {loading ? <i className="mcs-table-cell-loading-large" /> : content}
      </div>
    );
  }
}

export default ContentHeader;
