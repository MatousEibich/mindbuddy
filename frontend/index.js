import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import App from './App';

// Silence warnings related to Constants.manifest deprecation
LogBox.ignoreLogs([
  'Constants.manifest has been deprecated',
  'Constants.manifest is null'
]);

// Register the main App component
registerRootComponent(App);
