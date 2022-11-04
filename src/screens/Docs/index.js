import React, { createRef } from 'react';
import { Switch, Route, Link, NavLink } from 'react-router-dom';
import { startCase, kebabCase } from 'lodash';
import {
  Breadcrumb,
  Container,
  Divider,
  Menu,
  Message,
  Ref,
  Button,
  Icon,
} from 'semantic';

import { Layout } from 'components/Layout';
import { Menu as ResponsiveMenu } from 'components/Responsive';
import { APP_NAME } from 'utils/env';

import StandardPage from './StandardPage';
import PageLoader from 'components/PageLoader';

import { request } from 'utils/api';
import screen from 'helpers/screen';

import DOCS from 'docs';
import PortalSettings from 'modals/PortalSettings';
import { userHasAccess } from 'utils/permissions';
import { withSession } from 'stores';
import { settingsList, configurationList } from 'lib/settings';

const DEFAULT_PAGE_ID = 'getting-started';

const page = {
  id: DEFAULT_PAGE_ID,
  name: 'Getting Started',
  markdown: DOCS.GETTING_STARTED,
};

function getDynamicMarkdown() {
  let settingsMarkdown = 'Attribute|Name|Description\n';
  settingsMarkdown += '-|-|-\n';
  settingsList.forEach((item) => {
    settingsMarkdown += `\`${item.key}\`|${item.name}|${item.description}`;
  });

  let configurationMarkdown = 'Key|description\n';
  configurationMarkdown += '-|-\n';
  configurationList.forEach((item) => {
    configurationMarkdown += `\`${item.key}\`|${item.description}`;
  });

  return {
    '<SETTINGS_MARKDOWN>': settingsMarkdown,
    '<CONFIGURATION_MARKDOWN>': configurationMarkdown,
  };
}

@withSession
export default class Docs extends React.Component {
  static layout = 'portal';

  contextRef = createRef();

  constructor(props) {
    super(props);
    this.state = {
      openApi: null,
      loading: true,
      error: null,
    };
  }

  render() {
    return (
      <Container>
        <Divider hidden />
        <Breadcrumb size="mini">
          <Breadcrumb.Section link as={Link} to="/docs">
            API Docs
          </Breadcrumb.Section>
        </Breadcrumb>
        <Divider hidden />
        <StandardPage page={page} substitutions={getDynamicMarkdown()} />
        <Divider hidden />
      </Container>
    );
  }
}
