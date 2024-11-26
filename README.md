# Drone assembler
The UI to assemble drones and share configuration with others.
https://drone-assembler.vercel.app/

## Description
This project is a DevChallenge XXI final submission.

## Technical information
The solution is based on pure vanilla js with no libs using [Vite](https://vitejs.dev/) as a bundler.

For tests it is using [Vitest](https://vitest.dev/) that is using [WebdriverIO](https://webdriver.io/) under the hood.

## Project structure
- `components` - 0Project is using component-based approach with custom elements. Components are using `da-` prefix that means "Drone Assembler."
    - The `da-app` component is the main component containing the whole app.
    - The `da-assembly-area` represents the assembly area where you drop parts.
    - The `da-parts` represents the parts panel where you can drag parts from.
    - The `da-cart` represents the cart where you can see the selected parts.
- `helpers` - Helper classes
    - `observable` - Observable implementation to add reactivity to the app
    - `utilities` - utilities
- `models` - Models
  - `detail` - Detail model
  - `history` - History "engine"
- `services` - Services
  - `state.service` - Service to manage the state of the app
  - `history.service` - Service to manage the history of the app
- `styles` - additional styles
    - `common` - styles that are common for the app and most likely needed in most/all components
- `main.js` - file defines all components

## Available functionality
- frame selection
- parts selection with frame check
- show the selected frame
- drag & drop parts to the assembly area
- show where the part is going to be installed
- install part to the closest point
- visually show the installed part
- calculate the cost
- allow editing assembly
- allow clearing all
- show the progress of the assembly
- export to json
- export to csv
- go back and forth in history
- import from json/csv
- set the max price and check it everywhere
- zooming and panning

## Improvements in case if I have more time
- [ ] fix duplicated parts of cart and parts components
- [ ] Extract part into a separate component
- [ ] Add tests for the components

## How to run
1. Clone the repo
2. Run `npm install`
3. Run `npm run dev`

## How to run test
1. Clone the repo
2. Run `npm install`
3. Run `npm run test`
