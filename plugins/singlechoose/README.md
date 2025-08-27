# Single Choose Plugin

A single-answer quiz component for the Coob learning platform that allows creating interactive questions with multiple choice options. Students select one correct answer from a list of options and receive immediate feedback.

## Features

- **Multiple Choice Questions**: Create questions with 2-10 answer options
- **Single Correct Answer**: Only one option can be marked as correct
- **Customizable Messages**: Configure success and error messages
- **Explanation Support**: Add explanations for wrong answers
- **Error Handling**: Configurable error handling options
- **Responsive Design**: Works on desktop and mobile devices

## Plugin Structure

```
singlechoose/
├── src/
│   ├── edit/          # Editor interface source code
│   └── view/          # Student view source code
├── dist/              # Built files
│   ├── edit.html      # Editor interface
│   ├── view.html      # Student view
│   ├── handler.lua    # Answer processing logic
│   ├── state.json     # Plugin state definition
│   ├── settings.json  # Plugin settings schema
│   └── icon.png       # Plugin icon
├── manifest.json      # Plugin configuration
├── package.json       # Dependencies and scripts
├── webpack.config.js  # Build configuration
└── README.md          # This file
```

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the plugin directory:
   ```bash
   cd plugins/singlechoose
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development mode:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## How It Works

### State Management

The plugin maintains state through `state.json`:

```json
{
  "question": "What is the capital of France?",
  "options": [
    {
      "text": "London",
      "isCorrect": false,
      "explanation": "London is the capital of England."
    },
    {
      "text": "Paris",
      "isCorrect": true,
      "explanation": ""
    },
    {
      "text": "Berlin",
      "isCorrect": false,
      "explanation": "Berlin is the capital of Germany."
    }
  ]
}
```

### Settings Configuration

Plugin settings are defined in `settings.json` using JSON Schema:

```json
{
  "JSONSchema": {
    "properties": {
      "isIgnoreErrorAnswer": {
        "type": "boolean",
        "title": "Ignore error answer",
        "default": false
      },
      "completedMessages": {
        "type": "object",
        "title": "Messages",
        "properties": {
          "success": {
            "title": "Success message",
            "type": "string",
            "default": "You did a great job!"
          },
          "wrong": {
            "title": "Wrong message",
            "type": "string",
            "default": "Sorry, you are wrong."
          }
        }
      }
    }
  }
}
```

### Answer Processing

The Lua handler (`handler.lua`) processes student responses:

```lua
function main()
    local options = bx_state.component.options or {}
    local answer = bx_state.request.answer
    local settings = bx_state.component._settings or {}
    
    -- Validate answer
    if not answer then
        return false, "Answer is required"
    end
    
    -- Check if answer is correct
    answer = answer + 1  -- Convert to 1-based index
    if options[answer] and options[answer].isCorrect then
        return true, settings.completedMessages.success
    else
        local message = options[answer] and options[answer].explanation or settings.completedMessages.wrong
        return false, message
    end
end
```

## Usage

### For Course Creators

1. **Add the Plugin**: Select "Single Choose" from the plugin library
2. **Configure the Question**: 
   - Enter your question text
   - Add 2-10 answer options
   - Mark one option as correct
   - Add explanations for wrong answers (optional)
3. **Customize Settings**:
   - Set success and error messages
   - Configure error handling options
4. **Test**: Preview the question to ensure it works correctly

### For Students

1. **Read the Question**: Carefully read the question and all options
2. **Select an Answer**: Click on the option you believe is correct
3. **Submit**: Click the submit button to check your answer
4. **Review Feedback**: Read the feedback message and any explanations

## API Integration

### JavaScript Events

The plugin uses the `$_bx` API for platform integration:

```javascript
// Editor interface - validate before saving
$_bx.event().on("before_save_state", (v) => {
    // Validation logic
    if (this.state.options.length === 0) {
        $_bx.showErrorMessage("Please add at least one option");
        return;
    }
    
    if (this.state.options.filter(option => option.isCorrect).length !== 1) {
        $_bx.showErrorMessage("Please select exactly one correct answer");
        return;
    }
    
    v.state = this.state;
});

// Student view - validate before submitting
$_bx.event().on("before_submit", (v) => {
    if (this.state.answer === null || this.state.answer < 0) {
        $_bx.showErrorMessage("Please select an option to continue");
        return;
    }
    v.state.answer = this.state.answer;
});
```

## Publishing

### Using coobcli

1. Install the CLI tool:
   ```bash
   npm install -g coobcli
   ```

2. Login to your account:
   ```bash
   coobcli login
   ```

3. Publish the plugin:
   ```bash
   coobcli publish
   ```

### Manual Publishing

1. Build the plugin:
   ```bash
   npm run build
   ```

2. Ensure all required files are in the `dist/` directory
3. Upload the plugin through the Coob platform interface

## Customization

### Styling

The plugin uses CSS modules for styling. To customize the appearance:

1. Modify the CSS files in `src/edit/` and `src/view/`
2. Rebuild the plugin with `npm run build`

### Functionality

To extend functionality:

1. Modify the React components in `src/edit/` and `src/view/`
2. Update the Lua handler for new logic
3. Adjust the state schema if needed
4. Test thoroughly before publishing

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed with `npm install`
2. **Validation Errors**: Check that exactly one option is marked as correct
3. **Display Issues**: Clear browser cache and rebuild the plugin

### Debug Mode

Enable debug mode by setting the environment variable:
```bash
DEBUG=true npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This plugin is part of the Coob platform and follows the same licensing terms.
