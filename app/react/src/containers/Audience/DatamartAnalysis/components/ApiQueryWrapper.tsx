import * as React from 'react';
import FormatData from './FormatData';


export interface ApiQueryWrapperProps {
    query: string;
    charts: any;
}

class ApiQueryWrapper extends React.Component<ApiQueryWrapperProps, {}> {
    render() {
        const { charts } = this.props;
        return(<FormatData data={[]} charts={charts} />)
    }
}

export default ApiQueryWrapper;