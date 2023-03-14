import { HTTPClient } from './clients/index.js';

switch (process.env.NODE_TYPE) {
  case 'http':
    new HTTPClient();
    break;
  default:
    console.error('NODE_TYPE is not set or is invalid');
}
