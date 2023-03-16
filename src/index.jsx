/* @refresh reload */
import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';

import 'flowbite';
import './index.css';

import App from '@src/App';

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById('root'),
);
