import React from 'react';
import Markdown from 'components/Markdown';
import Code from 'components/Markdown/Code';
import Heading from './Heading';
import 'github-markdown-css';
import { enrichMarkdown, executeOpenApiMacros } from 'utils/markdown';

import './table.less';

export default class StandardPage extends React.Component {
  state = {
    application: undefined,
  };

  renderCodeBlock = (props) => {
    return <Code {...props} allowCopy />;
  };

  render() {
    const { page } = this.props;
    let markdown = enrichMarkdown(
      page.markdown,
      null,
      null,
      this.props.substitutions
    );

    return (
      <div className="docs markdown-body">
        <Markdown
          trusted
          source={markdown}
          components={{
            code: this.renderCodeBlock,
            heading: Heading,
          }}
        />
      </div>
    );
  }
}
