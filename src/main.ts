import { TGClient, HTTPClient, WSClient } from './clients/index.js';
import Inquirer from './inquirer/index.js';

switch (process.env.NODE_TYPE) {
  case 'tg':
    new TGClient();
    break;
  case 'ws':
    new WSClient();
    break;
  case 'http':
    new HTTPClient();
    break;
  case 'inquirer':
    new Inquirer();
    break;
  default:
    console.error('NODE_TYPE is not set or is invalid.');
}
//
