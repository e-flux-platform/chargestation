import { hot } from 'react-hot-loader/root';

import React from 'react';

import { Switch, Route } from 'react-router-dom';
import { useSession } from 'stores';

import Dashboard from 'screens/Dashboard';
import Docs from 'screens/Docs';
import NotFound from 'screens/NotFound';
import Loading from 'screens/Loading';
import Error from 'screens/Error';

const App = () => {
  const { loading, error } = useSession();
  console.log('error', error);
  if (loading) {
    return <Loading />;
  } else if (error) {
    return <Error error={error} />;
  }
  return (
    <Switch>
      <Route path="/" component={Dashboard} exact />
      <Route path="/docs/:id?" component={Docs} />
      <Route component={NotFound} />
    </Switch>
  );
};

export default hot(App);
