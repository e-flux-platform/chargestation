import React, { createRef } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, Container, Divider } from 'semantic';

import StandardPage from './StandardPage';

import DOCS from 'docs';
import { withSession } from 'stores';
import {
  settingsList,
  sessionSettingsList,
  defaultVariableConfig16,
} from 'lib/settings';

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
    settingsMarkdown += `\`${item.key}\`|${item.name}|${item.description}\n`;
  });

  let sessionSettingsMarkdown = 'Attribute|Name|Description\n';
  sessionSettingsMarkdown += '-|-|-\n';
  sessionSettingsList.forEach((item) => {
    sessionSettingsMarkdown += `\`${item.key}\`|${item.name}|${item.description}\n`;
  });

  let configurationMarkdown16 = 'Key|description\n';
  configurationMarkdown16 += '-|-\n';
  defaultVariableConfig16.forEach((item) => {
    configurationMarkdown16 += `\`${item.key}\`|${item.description}\n`;
  });

  return {
    '<SETTINGS_MARKDOWN>': settingsMarkdown,
    '<SESSION_SETTINGS_MARKDOWN>': sessionSettingsMarkdown,
    '<CONFIGURATION_MARKDOWN_16>': configurationMarkdown16,
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
          <Breadcrumb.Section link as={Link} to="/">
            Chargestation.one
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="chevron-right" />
          <Breadcrumb.Section active>API Docs</Breadcrumb.Section>
        </Breadcrumb>
        <Divider hidden />
        <StandardPage page={page} substitutions={getDynamicMarkdown()} />
        <Divider hidden />
      </Container>
    );
  }
}
