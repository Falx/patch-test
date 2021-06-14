import { Component, OnInit } from '@angular/core';
import * as solidAuth from '@inrupt/solid-client-authn-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'patch-test';
  info: solidAuth.ISessionInfo | null = null;
  profile: string | null = null;


  private oidcIssuer = 'https://test-account.solidcommunity.net';

  constructor() {

  }

  ngOnInit() {
    solidAuth.handleIncomingRedirect({ restorePreviousSession: true }).then(_ => {
      this.info = solidAuth.getDefaultSession().info;
      this.getProfile();
    });
  }

  getProfile() {
    const fetch = solidAuth.getDefaultSession().fetch;
    fetch(this.info?.webId!).then(res => res.text()).then(txt => this.profile = txt);
  }

  doPatch() {
    const fetch = solidAuth.getDefaultSession().fetch;
    const myPatch = "INSERT DATA { <ex:s> <ex:p> <ex:o> }";
    fetch(this.info?.webId!, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/sparql-update'
      },
      body: myPatch
    })
    .then(_ => this.getProfile())
  }

  doRestoreWebId() {
    const fetch = solidAuth.getDefaultSession().fetch;
    fetch(this.info?.webId!, {
      method: 'put',
      headers: {
        'Content-Type': 'text/turtle'
      },
      body: restorWebIdTxt
    })
    .then(_ => this.getProfile())
  }

  login() {
    solidAuth.login({ oidcIssuer: this.oidcIssuer })
  }

  logout() {
    solidAuth.logout().then(_ => window.location.href = '');
  }
}

function dontIndent(str: any) {
  const countSpaces = (txt: string) => {
    return txt.length - txt.trimStart().length
  }

  let lines: string[] = str[0].split('\n');
  let indent = 100;
  lines.forEach(line => {
    if (line.length > 0) {
      indent = Math.min(indent, countSpaces(line))
    }
  });

  let contentStarted = false;
  lines = lines.filter(line => {
    if (!contentStarted && line.trim().length == 0) {
      return false;
    }
    else if (!contentStarted) {
      contentStarted = true;
      return true
    } else {
      return true;
    }
  });

  return lines.map(line => line.substring(indent)).join('\n');
}

const restorWebIdTxt = dontIndent`
  @prefix : <#>.
  @prefix solid: <http://www.w3.org/ns/solid/terms#>.
  @prefix foaf: <http://xmlns.com/foaf/0.1/>.
  @prefix pim: <http://www.w3.org/ns/pim/space#>.
  @prefix schema: <http://schema.org/>.
  @prefix ldp: <http://www.w3.org/ns/ldp#>.
  @prefix pro: <./>.
  @prefix n0: <http://www.w3.org/ns/auth/acl#>.
  @prefix inbox: </inbox/>.
  @prefix tes: </>.

  pro:card a foaf:PersonalProfileDocument; foaf:maker :me; foaf:primaryTopic :me.

  :me
      a schema:Person, foaf:Person;
      n0:trustedApp
      [ n0:mode n0:Append, n0:Read, n0:Write; n0:origin <http://localhost:4200> ];
      ldp:inbox inbox:;
      pim:preferencesFile </settings/prefs.ttl>;
      pim:storage tes:;
      solid:account tes:;
      solid:privateTypeIndex </settings/privateTypeIndex.ttl>;
      solid:publicTypeIndex </settings/publicTypeIndex.ttl>;
      foaf:name "Test Account".
  `