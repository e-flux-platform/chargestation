import React from 'react';
import { startCase } from 'lodash';
import { Helmet } from 'react-helmet-async';
import { wrapComponent, getWrappedComponent } from 'utils/hoc';

export default function (Component) {
  const Wrapped = getWrappedComponent(Component);
  const title = Wrapped.title || startCase(Wrapped.name.replace(/Screen$/, ''));
  const Layout = React.Fragment;

  class Screen extends React.PureComponent {
    render() {
      return (
        <React.Fragment>
          <Helmet>
            {this.renderTitle()}
            {this.renderCanonical()}
          </Helmet>
          <Layout>
            <Component {...this.props} />
          </Layout>
        </React.Fragment>
      );
    }

    renderTitle() {
      const parts = [];
      parts.push(Component.title || title);
      return <title>{parts.join(' | ')}</title>;
    }

    renderCanonical() {
      const url = `${location.origin}${location.pathname}`;
      return <link rel="canonical" href={url} />;
    }
  }
  return wrapComponent(Component, Screen);
}
