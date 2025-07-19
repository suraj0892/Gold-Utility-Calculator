<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Gold Purity Calculator

This is a React application using Material UI (MUI) that functions as a Gold Purity Calculator. The app allows the user to input gold weight and purity values to calculate adjustments needed to achieve a target purity.

### Key Features

- Input gold weight in grams
- Input current gold purity as a percentage
- Input target gold purity as a percentage
- Calculate adjustments (copper or pure gold to add)
- Display results dynamically
- Responsive design using MUI components

### Core Formulas

```
current_pure_gold = weight * (current_purity / 100)
target_total_weight = current_pure_gold / (target_purity / 100)
weight_to_add = target_total_weight - weight
```

- If target_purity < current_purity: suggest copper to add
- If target_purity > current_purity: suggest pure gold to add
- If equal: show "No adjustment needed"

### UI Components

The app uses Material UI for the interface:
- AppBar with title
- Card container
- TextField inputs
- Typography for results
- Responsive layout with Stack component
- Custom theming (gold and copper colors)

### Key Files

- `src/App.tsx`: Main application component
- Standard React files (index.tsx, etc.)
