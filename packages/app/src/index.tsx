import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource-variable/inter';
import '@backstage/ui/css/styles.css';
import './theme/devportal.css';

ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());
