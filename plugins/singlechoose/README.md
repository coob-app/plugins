# Single Choose Plugin

A single-answer quiz component for the Coob learning platform that allows creating interactive questions with multiple choice options. Students select one correct answer from a list of options and receive immediate feedback.

## Features

- **Single Choice Questions**: Create questions with 2-10 answer options (only one correct answer)
- **Single Correct Answer**: Only one option can be marked as correct (no multiple selection)
- **Option Shuffling**: Options are randomly shuffled for each student attempt
- **Mobile-Responsive Design**: Adaptive UI with special mobile editing mode
- **Multilingual Support**: Built-in English and Russian language support
- **Explanation Support**: Add explanations for wrong answers
- **Interactive UI**: Icons, smooth animations, and intuitive controls
- **Validation**: Comprehensive input validation (minimum 2, maximum 10 options)

## Plugin Structure

```
й/
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

### Technology Stack

- **Preact** - Lightweight React alternative for UI components
- **Webpack** - Module bundler with inline script support
- **Babel** - JavaScript transpiler with React JSX support
- **CSS Modules** - Scoped styling for components
- **Preact Feather Icons** - Icon library for UI elements

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

### Option Shuffling

The plugin automatically shuffles options for each student attempt to prevent memorization:

- **When shuffling occurs**: On first view or after incorrect answers
- **Index preservation**: Original option indices are preserved via `id` field
- **Randomization**: Uses Fisher-Yates shuffle algorithm for fair distribution

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
  },
  "UISchema": {
    "isIgnoreErrorAnswer": {
      "ui:widget": "checkbox",
      "ui:help": "If checked, the answer will be ignored if an error occurs."
    }
  }
}
```

**Available Settings:**
- **isIgnoreErrorAnswer**: When enabled, treats wrong answers as correct (useful for debugging)
- **completedMessages.success**: Custom message shown for correct answers
- **completedMessages.wrong**: Custom message shown for incorrect answers

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
   - Add 2-10 answer options (minimum 2, maximum 10)
   - Mark exactly one option as correct (single choice only)
   - Add explanations for wrong answers (optional)
3. **UI Features**:
   - "Add Option" button appears only when less than 10 options
   - Options counter shows current count: "Options (X)"
   - Delete button (trash icon) for each option
4. **Mobile Considerations**:
   - On mobile devices, explanations are edited in a separate mode
   - Use the "Back" button to return to option editing
5. **Customize Settings** (optional):
   - Set custom success and error messages
   - Enable "Ignore error answer" for debugging
6. **Test**: Preview the question to ensure it works correctly

### For Students

1. **Read the Question**: Carefully read the question and all options
2. **Select an Answer**: Click on the option you believe is correct (single choice only)
   - Options are shuffled for each attempt to prevent memorization
   - You can click either the radio button or the option text
   - Only one option can be selected at a time
3. **Submit**: Click the submit button to check your answer
4. **Review Feedback**: Read the feedback message and any explanations
   - If incorrect, you'll see the explanation for the chosen option (if provided)

## API Integration

### JavaScript Events

The plugin uses the `$_bx` API for platform integration:

```javascript
// Editor interface - validate before saving
$_bx.event().on("before_save_state", (v) => {
    // Validation logic with multilingual support
    const userLanguage = $_bx.language() || "en";
    const messages = {
        en: {
            addOption: "Please add at least one option",
            selectCorrect: "Please select a correct option",
            selectOnlyOne: "Please select only one correct option",
            addAtMost: "Please add at most 10 options",
            enterText: "Please enter option text in all options",
            addAtLeastTwo: "Please add at least two options"
        },
        ru: {
            addOption: "Добавьте как минимум один вариант",
            selectCorrect: "Выберите правильный вариант",
            selectOnlyOne: "Выберите только один правильный вариант",
            addAtMost: "Добавьте не более 10 вариантов",
            enterText: "Введите текст для всех вариантов",
            addAtLeastTwo: "Добавьте как минимум два варианта"
        }
    };
    
    const userMessages = messages[userLanguage];
    
    if (this.state.options.length === 0) {
        $_bx.showErrorMessage(userMessages.addOption);
        return;
    }
    
    if (this.state.options.filter(option => option.isCorrect).length !== 1) {
        $_bx.showErrorMessage(userMessages.selectOnlyOne);
        return;
    }
    
    if (this.state.options.length > 10) {
        $_bx.showErrorMessage(userMessages.addAtMost);
        return;
    }
    
    if (this.state.options.length === 1) {
        $_bx.showErrorMessage(userMessages.addAtLeastTwo);
        return;
    }
    
    v.state = this.state;
});

// Student view - validate before submitting
$_bx.event().on("before_submit", (v) => {
    if (this.state.answer === null || this.state.answer < 0) {
        $_bx.showErrorMessage("Error: Please select an option to continue.");
        return;
    }
    v.state.answer = this.state.answer;
});
```

## Publishing

### Using coobcli

**Important**: You must authenticate with your coob.app account before publishing.

1. Install the CLI tool:
   ```bash
   npm install -g coobcli
   ```

2. **Authenticate with your coob.app account**:
   ```bash
   npx coobcli login
   ```
   
   This will prompt you to enter your coob.app credentials. You need to authenticate before you can publish any plugins.

3. Publish the plugin:
   ```bash
   npx coobcli publish
   ```
   
   **Note**: Make sure you're in the plugin directory when running the publish command.

### Manual Publishing

1. Build the plugin:
   ```bash
   npm run build
   ```

2. Ensure all required files are in the `dist/` directory
3. Upload the plugin through the Coob platform interface

## Customization

### Mobile Responsiveness

The plugin includes special mobile adaptations:

- **Mobile Detection**: Automatically detects screens ≤600px width
- **Separate Editing Mode**: On mobile, explanations are edited in a dedicated view
- **Back Navigation**: "Back" button to return from explanation editing
- **Adaptive Layout**: Form fields adjust width for mobile screens
- **Touch-Friendly**: Larger touch targets for mobile interaction

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

## Validation Rules

The plugin enforces several validation rules based on the code:

- **Minimum Options**: At least 2 options must be provided (`this.state.options.length === 1` triggers error)
- **Maximum Options**: No more than 10 options allowed (`this.state.options.length > 10` triggers error)
- **Single Correct Answer**: Exactly one option must be marked as correct (single choice validation)
- **Option Text**: All options must have non-empty text content (validated by `validateOptions()`)
- **Question Text**: Question field cannot be empty
- **No Empty Options**: Cannot save with 0 options (`this.state.options.length === 0` triggers error)

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed with `npm install`
2. **Validation Errors**: 
   - Check that exactly one option is marked as correct
   - Ensure you have 2-10 options with text content
   - Verify question text is not empty
3. **Display Issues**: Clear browser cache and rebuild the plugin
4. **Mobile Issues**: Test on actual mobile devices, not just browser dev tools

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
