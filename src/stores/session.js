import React, { useContext } from 'react';
import { merge, omit } from 'lodash';
import { withRouter } from 'react-router-dom';

import { wrapContext } from 'utils/hoc';
import { localStorage } from 'utils/storage';

const SessionContext = React.createContext();

@withRouter
export class SessionProvider extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      stored: this.loadStored(),
    };
  }

  componentDidMount() {
    this.attachHistory();
  }

  componentDidCatch(error) {
    this.setState({
      error,
    });
  }

  // Session storage

  setStored = (key, data) => {
    this.updateStored(
      merge({}, this.state.stored, {
        [key]: data,
      })
    );
  };

  removeStored = (key) => {
    this.updateStored(omit(this.state.stored, key));
  };

  clearStored = () => {
    this.updateStored({});
  };

  popStored = (key) => {
    const stored = this.state.stored[key];
    if (stored) {
      this.removeStored(key);
      return stored;
    }
  };

  loadStored = () => {
    let data;
    try {
      const str = localStorage.getItem('session');
      if (str) {
        data = JSON.parse(str);
      }
    } catch (err) {
      localStorage.removeItem('session');
    }
    return data || {};
  };

  updateStored = (data) => {
    if (Object.keys(data).length > 0) {
      localStorage.setItem('session', JSON.stringify(data));
    } else {
      localStorage.removeItem('session');
    }
    this.setState({
      stored: data,
    });
  };

  // History

  attachHistory = () => {
    this.props.history.listen(this.onHistoryChange);
  };

  onHistoryChange = () => {
    this.setState({
      error: null,
    });
  };

  render() {
    return (
      <SessionContext.Provider
        value={{
          ...this.state,
          setStored: this.setStored,
          removeStored: this.removeStored,
          clearStored: this.clearStored,
        }}>
        {this.props.children}
      </SessionContext.Provider>
    );
  }
}

export function useSession() {
  return useContext(SessionContext);
}

export const withSession = wrapContext(SessionContext);

export function withLoadedSession(Component) {
  Component = withSession(Component);
  return (props) => {
    const { loading } = useSession();
    if (loading) {
      return null;
    }
    return <Component {...props} />;
  };
}
