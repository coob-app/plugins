# Plugin Development Guide

This guide provides comprehensive information for developing plugins for the Coob learning platform.

## Table of Contents

1. [Plugin Types](#plugin-types)
2. [Plugin Structure](#plugin-structure)
3. [Development Setup](#development-setup)
4. [Core Concepts](#core-concepts)
5. [API Reference](#api-reference)
6. [Best Practices](#best-practices)
7. [Testing](#testing)
8. [Publishing](#publishing)

## Plugin Types

### 1. Presentation Plugins
Display information in courses (text, images, videos, etc.)
- **Purpose**: Show content to students
- **Examples**: Text, Image, Video, Document
- **Handler**: Not required

### 2. Training Plugins
Allow students to complete interactive exercises
- **Purpose**: Assess student knowledge
- **Examples**: Single Choose, Multiple Choose, Drag Match
- **Handler**: Required (Lua script)

### 3. Assignment Plugins
Enable students to submit work for instructor review
- **Purpose**: Collect student work
- **Examples**: Free Response, File Upload
- **Handler**: Required (Lua script)

## Plugin Structure

```
plugin-name/
├── src/
│   ├── edit/          # Editor interface source code
│   │   ├── index.js   # Main editor component
│   │   ├── styles.css # Editor styles
│   │   └── ...
│   └── view/          # Student view source code
│       ├── index.js   # Main view component
│       ├── styles.css # View styles
│       └── ...
├── dist/              # Built files (generated)
│   ├── edit.html      # Editor interface
│   ├── view.html      # Student view
│   ├── handler.lua    # Answer processing logic
│   ├── state.json     # Plugin state definition
│   ├── settings.json  # Plugin settings schema
│   └── icon.png       # Plugin icon
├── manifest.json      # Plugin configuration
├── package.json       # Dependencies and scripts
├── webpack.config.js  # Build configuration
└── README.md          # Plugin documentation
```

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/coob-app/plugins.git
   cd plugins
   ```

2. **Use an existing plugin as template**:
   ```bash
   cp -r plugins/singlechoose plugins/my-new-plugin
   cd plugins/my-new-plugin
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## Core Concepts

### State Management

Plugins maintain state through JSON files:

#### state.json
Defines the plugin's data structure and default values:

```json
{
  "question": "",
  "options": [],
  "correctAnswer": null
}
```

#### settings.json
Defines configurable options using JSON Schema:

```json
{
  "JSONSchema": {
    "properties": {
      "showFeedback": {
        "type": "boolean",
        "title": "Show feedback",
        "default": true
      }
    }
  },
  "UISchema": {
    "showFeedback": {
      "ui:widget": "checkbox"
    }
  }
}
```

### Handler Logic (Lua)

Training and assignment plugins require a Lua handler to process student responses:

```lua
function main()
    -- Access plugin state
    local component = bx_state.component
    local request = bx_state.request
    local settings = bx_state.component._settings
    
    -- Process student answer
    local answer = request.answer
    local isCorrect = false
    local message = ""
    
    -- Your logic here
    if answer == component.correctAnswer then
        isCorrect = true
        message = "Correct!"
    else
        message = "Incorrect. Try again."
    end
    
    -- Return result
    return isCorrect, message
end
```

### JavaScript API

Plugins interact with the platform through the `$_bx` global object:

#### Core Methods

```javascript
// Platform ready event
$_bx.onReady(() => {
    console.log('Platform loaded');
});

// Get component ID
const componentId = $_bx.getComponentID();

// Check if answer is correct (in view mode)
const isCorrect = $_bx.isCorrect();

// Get current language
const language = $_bx.language();
```

#### Event System

```javascript
// Editor events
$_bx.event().on("before_save_state", (v) => {
    // Validate state before saving
    if (!this.state.question) {
        $_bx.showErrorMessage("Question is required");
        return;
    }
    v.state = this.state;
});

// View events
$_bx.event().on("before_submit", (v) => {
    // Validate submission
    if (!this.state.answer) {
        $_bx.showErrorMessage("Please provide an answer");
        return;
    }
    v.state.answer = this.state.answer;
});

$_bx.event().on("after_submit", (v) => {
    // Handle post-submission logic
    console.log('Answer submitted:', v.state.answer);
});
```

#### UI Methods

```javascript
// Show messages
$_bx.showErrorMessage("Error message");
$_bx.showSuccessMessage("Success message");
$_bx.showInfoMessage("Info message");

// Navigate
$_bx.navigateToNext();
$_bx.navigateToPrevious();

// Get/set data
const data = $_bx.getData();
$_bx.setData({ key: "value" });
```

## API Reference

### Manifest.json Schema

```json
{
  "status": "active|inactive|deprecated",
  "version": "1.0.0",
  "name": "Plugin Name",
  "description": "Detailed description with HTML support",
  "short_description": "Brief description",
  "icon": "./dist/icon.png",
  "settings": {
    "answerRequired": true,
    "assignmentApproveRequired": false
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

### bx_state Object (Lua)

```lua
-- Access plugin state
local component = bx_state.component
local request = bx_state.request
local settings = bx_state.component._settings

-- Component structure
component = {
    question = "What is 2+2?",
    options = {
        { text = "3", isCorrect = false },
        { text = "4", isCorrect = true },
        { text = "5", isCorrect = false }
    }
}

-- Request structure (student answer)
request = {
    answer = 1  -- 0-based index
}

-- Settings structure
settings = {
    showFeedback = true,
    customMessages = {
        success = "Great job!",
        wrong = "Try again!"
    }
}
```

## Best Practices

### 1. Code Organization

- Keep components small and focused
- Use meaningful variable and function names
- Add comments for complex logic
- Follow consistent code style

### 2. Error Handling

```javascript
// Always validate input
$_bx.event().on("before_save_state", (v) => {
    try {
        // Validation logic
        if (!this.state.question.trim()) {
            throw new Error("Question cannot be empty");
        }
        
        v.state = this.state;
    } catch (error) {
        $_bx.showErrorMessage(error.message);
    }
});
```

### 3. Accessibility

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Test with screen readers

### 4. Performance

- Minimize bundle size
- Use lazy loading for large components
- Optimize images and assets
- Cache expensive calculations

### 5. Internationalization

```javascript
// Use language-specific messages
const messages = {
    en: {
        submit: "Submit",
        error: "Error"
    },
    ru: {
        submit: "Отправить",
        error: "Ошибка"
    }
};

const currentLanguage = $_bx.language();
const message = messages[currentLanguage] || messages.en;
```

## Testing

### Manual Testing

1. **Editor Testing**:
   - Test all form inputs
   - Verify validation messages
   - Check state saving
   - Test responsive design

2. **View Testing**:
   - Test student interaction
   - Verify answer submission
   - Check feedback display
   - Test accessibility

3. **Integration Testing**:
   - Test with different course contexts
   - Verify data persistence
   - Check error handling

### Automated Testing

```javascript
// Example test structure
describe('Single Choose Plugin', () => {
    test('should validate required fields', () => {
        // Test validation logic
    });
    
    test('should process correct answers', () => {
        // Test answer processing
    });
    
    test('should handle errors gracefully', () => {
        // Test error handling
    });
});
```

## Publishing

### 1. Prepare for Publishing

```bash
# Build the plugin
npm run build

# Verify all files are present
ls -la dist/
```

### 2. Using coobcli

```bash
# Install CLI tool
npm install -g coobcli

# Login to your account
coobcli login

# Publish the plugin
coobcli publish
```

### 3. Version Management

- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update version in manifest.json
- Document changes in README.md
- Test thoroughly before publishing

### 4. Quality Checklist

- [ ] All required files are present
- [ ] Plugin builds without errors
- [ ] All functionality works correctly
- [ ] Documentation is complete
- [ ] Code follows best practices
- [ ] Accessibility requirements met
- [ ] Performance is acceptable

## Troubleshooting

### Common Issues

1. **Build Errors**:
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **State Not Saving**:
   - Check validation logic in before_save_state
   - Verify state structure matches schema
   - Check for JavaScript errors

3. **Handler Not Working**:
   - Verify Lua syntax
   - Check bx_state structure
   - Test with simple logic first

4. **UI Not Rendering**:
   - Check HTML structure
   - Verify CSS is loaded
   - Check for JavaScript errors

### Debug Mode

Enable debug mode for detailed logging:

```bash
DEBUG=true npm run dev
```

### Getting Help

- Check existing plugin examples
- Review platform documentation
- Ask questions in the community forum
- Report bugs with detailed information

## Resources

- [Plugin Examples](./plugins/)
- [Platform Documentation](https://docs.coob.app)
- [JSON Schema Reference](https://json-schema.org/)
- [Lua Documentation](https://www.lua.org/manual/)
- [React Documentation](https://reactjs.org/docs/)
