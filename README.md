# Coob Plugins Repository

This repository contains a collection of educational plugins for the Coob learning platform. These plugins extend the functionality of courses by providing interactive components, assessments, and multimedia content.

## Overview

Coob plugins are independent modules that can be integrated into educational courses. They come in three main types:

- **Presentation Plugins**: Display information in courses (text, images, videos, etc.)
- **Training Plugins**: Allow students to complete interactive exercises (quizzes, tasks, etc.)
- **Assignment Plugins**: Enable students to submit work for instructor review

### Common Plugin Features

- **Responsive Design**: All plugins work on desktop and mobile devices
- **Multilingual Support**: Built-in internationalization capabilities
- **Interactive UI**: Modern, user-friendly interfaces with smooth animations
- **Configurable Settings**: Flexible configuration options for different use cases
- **Validation**: Comprehensive input validation and error handling

## Plugin Structure

Each plugin is a directory containing the necessary files for its operation. The root of each plugin must contain a `manifest.json` file that describes the plugin's structure.

### Required Files

- `manifest.json` - Plugin configuration and metadata
- `dist/state.json` - Plugin state definition
- `dist/handler.lua` - Logic handler (for training plugins)
- `dist/settings.json` - Plugin settings schema
- `dist/edit.html` - Editor interface
- `dist/view.html` - Student view interface
- `dist/icon.png` - Plugin icon

## Available Plugins

### [Single Choose](./plugins/singlechoose/)
A single-answer quiz component that allows creating interactive questions with multiple choice options. Students select one correct answer from a list of options and receive immediate feedback.

**Key Features:**
- Multiple choice questions with single correct answer (2-10 options)
- **Option shuffling** - options are randomly shuffled for each attempt
- **Mobile-responsive design** with adaptive UI for different screen sizes
- **Multilingual support** - English and Russian languages
- Customizable success/error messages
- Explanation support for wrong answers
- Configurable error handling
- **Interactive UI** with icons and smooth animations

*More plugins coming soon...*

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Technology Stack

- **Preact** - Lightweight React alternative for UI components
- **Webpack** - Module bundler with inline script support
- **Babel** - JavaScript transpiler with React JSX support
- **CSS Modules** - Scoped styling for components

### Creating a New Plugin

1. Use an existing plugin as a template (e.g., singlechoose)
2. Follow the manifest.json schema
3. Implement the required HTML interfaces (edit.html, view.html)
4. Add Lua handler for training plugins
5. Include responsive design and multilingual support
6. Test thoroughly before publishing

### Building Plugins

Most plugins use Webpack for building. Navigate to the plugin directory and run:

```bash
npm install
npm run build
```

### Publishing Plugins

Use the coobcli tool to publish plugins. **Important**: You must authenticate with your coob.app account before publishing.

#### 1. Install coobcli

```bash
npm install -g coobcli
```

#### 2. Authenticate with your coob.app account

```bash
npx coobcli login
```

This will prompt you to enter your coob.app credentials. You need to authenticate before you can publish any plugins.

#### 3. Publish your plugin

```bash
npx coobcli publish
```

**Note**: Make sure you're in the plugin directory when running the publish command.

## Plugin Development Guide

### Manifest.json Structure

```json
{
  "status": "active",
  "version": "1.0",
  "name": "Plugin Name",
  "description": "Detailed plugin description",
  "short_description": "Brief description",
  "icon": "./dist/icon.png",
  "settings": {
    "answerRequired": true
  },
  "entry": {
    "state": "./dist/state.json",
    "handler": "./dist/handler.lua",
    "settings": "./dist/settings.json",
    "edit": "./dist/edit.html",
    "view": "./dist/view.html"
  }
}
```

### JavaScript API

Plugins can use the `$_bx` global object to interact with the platform:

- `$_bx.onReady(callback)` - Execute after platform loads
- `$_bx.isCorrect()` - Check if answer is correct (for training plugins)
- `$_bx.getComponentID()` - Get current component ID
- `$_bx.language()` - Get current language setting
- `$_bx.event().on("before_save_state", callback)` - Hook into state saving
- `$_bx.event().on("before_submit", callback)` - Hook into submission
- `$_bx.showErrorMessage(message)` - Display error messages
- `$_bx.showSuccessMessage(message)` - Display success messages

### State Management

Plugins maintain state through JSON files:
- `state.json` - Current plugin state and data
- `settings.json` - Plugin configuration using JSON Schema
- `handler.lua` - Logic for processing user input (training plugins only)

### Lua Handler (for Training Plugins)

Training plugins use Lua scripts to process student responses:

```lua
function main()
    -- Access plugin state and user input
    local component = bx_state.component
    local request = bx_state.request
    local settings = bx_state.component._settings or {}
    
    -- Process user input and return result
    -- Return format: (isCorrect: boolean, message: string)
    return isCorrect, message
end
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Develop your plugin following the established patterns
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support, please refer to the plugin documentation or contact the development team.
