To start
ng serve


## Change node version
nvm use <number of node server you want to use>


## Update

To update Angular version, follow [Angular Upgrade guide](https://update.angular.io/)

## Change proxy setting
## 2 Changes currently needed
### First change / create proxy configuration.

**src/proxy.conf.js**
```
const PROXY_CONFIG = {
  "/api/coreapi": {
    "target": "https://crm.koneqt.com",
    "changeOrigin": true,
    "secure": false,
    "logLevel": "debug",
    "onProxyReq": function (pr, req, res) {
      pr.removeHeader('Origin');
    }
  }
};
module.exports = PROXY_CONFIG;

/*
URL that contains "/api/coreapi" will be swaped
Use this config if you want to test angular app with local server.
const PROXY_CONFIG = {
  "/koneqtv2-core/web": {
    "target": "http://localhost:8080",
    "changeOrigin": true,
    "secure": false,
    "logLevel": "debug",
    "onProxyReq": function (pr, req, res) {
      pr.removeHeader('Origin');
    }
  }
};
*/
```


Also, change api url from environment.
Environment.ts file will be
### Change / Create api url from environment.

**src/environments/environment.ts**
```
export const environment = {
  production: false,
  apiEndPoint: 'http://localhost:4200',
  liveURL: 'http://angular.koneqt.com',
  documentURL: 'http://crm.koneqt.com/dta/dms/'
  // Change this url if you want to test with local server
  // apiEndPoint: 'http://localhost:4200/koneqtv2-core/web'
};
```

**src/environments/environment.prod.ts**
```
export const environment = {
  production: true,
  apiEndPoint: 'https://crm.koneqt.com',
  liveURL: 'http://angular.koneqt.com',
  documentURL: 'http://crm.koneqt.com/dta/dms/'
};
```


## Create new custom thinq layout

### 1. Add/Update cabinet class

Create
**src/app/core/thinq/cabinet/`[ClassGroup]`/`[Cabinet]`.ts**

There is cabinet class which contains field info like `fieldname`, `startCol`, `endCol`.
Here you can edit field name and layout with `startCol`, `endCol`.

For example
```
/* eslint-disable @typescript-eslint/naming-convention */
import { ThinqFormFieldUI } from '@core/thinq/thinq.type';

export class Contact {
  fields: ThinqFormFieldUI[] = [
    {
      fieldName: 'OptOut',
      startCol: 1,
      endCol: 5
    },
    {
      fieldName: 'UserId',
      startCol: 5,
      endCol: 9
    },
    {
      fieldName: 'Status',
      startCol: 1,
      endCol: 5
    },
    {
      fieldName: 'Industry',
      startCol: 5,
      endCol: 9
    },
    {
      fieldName: 'AssignedTo',
      startCol: 9,
      endCol: 13
    },
    {
      fieldName: 'Salutation',
      startCol: 1,
      endCol: 5
    },
    {
      fieldName: 'FirstName',
      startCol: 5,
      endCol: 9
    },
    {
      fieldName: 'LastName',
      startCol: 9,
      endCol: 13
    },
    {
      fieldName: 'Organisation'
    },
    {
      fieldName: 'JobTitle',
    },
    {
      fieldName: 'Telephone',
    },
    {
      fieldName: 'Email',
    },
    {
      fieldName: 'CompanyName',
    },
    {
      fieldName: 'IdNo',
    },
    {
      fieldName: 'Description',
    },
    {
      fieldName: 'PrimaryAddress',
    },
    {
      fieldName: 'Tag',
    }

  ];
  constructor() {
  }
}
```

Each field type is `ThinqFormFieldUI`
```
export interface ThinqFormFieldUI {
  fieldName: string;
  startCol?: number;
  endCol?: number;
}
```

### 2. Add new custom layout case to thinq form rendering.

`src/app/modules/admin/thinq/thinq-form/thinq-form.component.ts`

`getCabinetFields` render form for each cabinet layout.

## Deployment

### 1. Build production

To build Angular production app, run `ng build`.
It will generate app in `dist/koneqt` folder.

### 2. Add rewrite rule for Angular routing

Detailed [Guide](https://angular.io/guide/deployment#routed-apps-must-fallback-to-indexhtml)

Apache: add a rewrite rule to the `.htaccess` file.

```
RewriteEngine On
# If an existing asset or directory is requested go to it as it is
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
RewriteRule ^ - [L]

# If the requested resource doesn't exist, use index.html
RewriteRule ^ /index.html
```

Examples [here](https://angular.io/guide/deployment#fallback-configuration-examples)

### 3. Copy app to sever
