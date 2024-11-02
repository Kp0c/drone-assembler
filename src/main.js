import { AssemblyArea } from './components/assembly-area/assembly-area.js';
import { App } from './components/app/app.js';
import { Parts } from './components/parts/parts.js';

window.customElements.define('da-app', App);
window.customElements.define('da-assembly-area', AssemblyArea);
window.customElements.define('da-parts', Parts);
