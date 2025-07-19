# Gold Purity Calculator

A responsive React application using Material UI that helps calculate gold purity adjustments.

![Gold Purity Calculator](gold-calculator-screenshot.png)

## Overview

This app allows users to calculate how much gold or copper to add to reach a target gold purity. It provides an intuitive interface for jewelers, hobbyists, or anyone working with gold.

### Features

- Calculate gold/copper additions to achieve desired purity
- Real-time calculation without submit button
- Select from common gold purity values (22K, 18K, 14K, etc.) or enter custom value
- Display total metal weight and pure gold content
- Clean, responsive Material UI design
- Color-coded results (gold/copper)
- Works on both mobile and desktop devices

### How It Works

The calculator uses the following formulas:
```
current_pure_gold = weight * (current_purity / 100)
target_total_weight = current_pure_gold / (target_purity / 100)
weight_to_add = target_total_weight - weight
```

Based on whether you're increasing or decreasing purity:
- When decreasing purity: Add copper
- When increasing purity: Add pure gold (100%)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
