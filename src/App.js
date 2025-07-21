import { hot } from 'react-hot-loader/root';

import React from 'react';

import { Switch, Route } from 'react-router-dom';

import Dashboard from 'screens/Dashboard';
import Docs from 'screens/Docs';
import NotFound from 'screens/NotFound';

const App = () => {
  return (
    <Switch>
      <Route path="/" component={Dashboard} exact />
      <Route path="/docs/:id?" component={Docs} />
      <Route component={NotFound} />
    </Switch>
  );
};

export default hot(App);
