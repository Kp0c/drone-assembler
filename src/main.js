import { AssemblyArea } from './components/assembly-area/assembly-area.js';
import { App } from './components/app/app.js';
import { Parts } from './components/parts/parts.js';
import { Cart } from './components/cart/cart.js';

window.customElements.define('da-app', App);
window.customElements.define('da-assembly-area', AssemblyArea);
window.customElements.define('da-parts', Parts);
window.customElements.define('da-cart', Cart);
