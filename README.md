# Liquid Playground

![Liquid Playground Logo](https://assets-global.website-files.com/64be309a0c8ae7454454fcef/653932043d90a3fa696fd68a_liquid-logo-text.png)

An extension for Visual Studio Code that allows you to interactively work with Liquid templates and data.

## Features

- **Open Liquid Template**: Open a `.liquid` file alongside a JSON data file and view the rendered output in real-time.
- **Edit Data**: Edit the JSON data file and see immediate updates in the rendered output.
- **Save Rendered Output**: Save the rendered output to a separate file.

## Installation

You can install the Liquid Playground extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=evlian.liquidplayground).

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window or by pressing `Ctrl+Shift+X`.
3. Search for "Liquid Playground".
4. Click Install to install it.

## Usage

### Opening Liquid Playground

1. Right-click on a `.liquid` file in the Explorer or Editor.
2. Select "Open In Liquid Playground" from the context menu.

### Working with Files

- **LIQUID_TEMPLATE.liquid**: This file contains your Liquid template code.
- **DATA.json**: This file contains JSON data that will be used to render the Liquid template.
- **OUTPUT.json**: The rendered output of the Liquid template based on the current data.

### Interacting with the Extension

- Make changes to `LIQUID_TEMPLATE.liquid` or `DATA.json` and observe real-time updates in `OUTPUT.json`.
- Save your changes by clicking on the Save button in the editor, or by pressing `Ctrl+S`.