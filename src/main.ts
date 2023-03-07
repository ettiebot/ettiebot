import { WSClient } from './clients/index.js';

switch (process.env.NODE_TYPE) {
  case 'ws':
    new WSClient();
    break;
  default:
    console.error('NODE_TYPE is not set or is invalid');
}
