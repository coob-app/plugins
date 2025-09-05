# Smart Quiz Plugin

🎯 **Advanced Multiple-Choice Quiz Component for Educational Courses**

Smart Quiz is a powerful, feature-rich multiple-choice quiz system designed for educational courses. It provides comprehensive assessment capabilities with intelligent features and customizable settings.

## ✨ Key Features

### 🎲 Smart Answer Shuffling
- **Randomize answer options** to prevent cheating
- **Deterministic shuffling** with different order on each page reload
- **Configurable setting** to enable/disable shuffling

### 📊 Progress Tracking
- **Visual progress bar** showing completion status
- **Real-time updates** as students answer questions
- **Optional display** controlled by settings

### 🧭 Flexible Navigation
- **Question navigation buttons** for jumping between questions
- **Smart access control** - only accessible questions are clickable
- **Optional feature** that can be disabled for linear progression

### 💬 Detailed Feedback
- **Comprehensive results** with correct/incorrect answers
- **Score calculation** with percentage display
- **Question-by-question breakdown** with explanations
- **Optional detailed feedback** controlled by settings

### 🔄 Smart Retry System
- **Automatic retry option** based on passing score
- **Intelligent display** - only shows retry button if score is below passing threshold
- **Configurable retry functionality** with on/off toggle

### 🎯 Passing Score Control
- **Set minimum score requirements** for quiz completion
- **Automatic retry suggestion** for students below passing score
- **Flexible scoring system** with percentage-based evaluation

### 💾 State Persistence
- **Saves progress automatically** across browser sessions
- **Remembers current question** and all answers
- **Seamless continuation** after page reload

### 🌐 Multi-language Support
- **English and Russian translations**
- **Extensible translation system** for additional languages
- **Automatic language detection** based on user settings

## 🎛️ Customizable Settings

| Setting | Description | Default | Impact |
|---------|-------------|---------|---------|
| **Shuffle Options** | Randomize answer order | `true` | Prevents cheating, different order each time |
| **Show Progress Bar** | Display completion progress | `true` | Visual feedback for students |
| **Question Navigation** | Allow jumping between questions | `true` | Flexible navigation vs linear progression |
| **Show Feedback** | Display detailed results | `true` | Comprehensive vs minimal feedback |
| **Show Correct Answers** | Display correct answers for wrong questions | `true` | Show/hide correct answers in results |
| **Allow Retry** | Enable quiz retake | `true` | Retry functionality on/off |
| **Passing Score** | Minimum score for completion | `0` | Retry button only shows below this score |

## 🚀 Usage

### For Educators
1. **Add Smart Quiz** to your course
2. **Configure settings** based on your assessment needs
3. **Set passing score** for your course requirements
4. **Enable/disable features** as needed for your teaching style

### For Students
1. **Answer questions** in any order (if navigation enabled)
2. **See progress** in real-time (if progress bar enabled)
3. **Get detailed feedback** after completion (if feedback enabled)
4. **Retry quiz** if score is below passing threshold (if retry enabled)

## 🔧 Technical Features

- **Preact-based UI** for fast, responsive interface
- **State management** with automatic persistence
- **Event-driven architecture** with proper lifecycle management
- **Modular design** with configurable components
- **Error handling** with comprehensive logging
- **Performance optimized** with efficient rendering

## 📱 Responsive Design

- **Mobile-friendly** interface
- **Touch-optimized** controls
- **Adaptive layout** for different screen sizes
- **Accessible design** with proper ARIA labels

## 📋 Prerequisites

- **Node.js**: Version 16.0 or higher
- **npm**: Latest stable version (comes with Node.js)
- **coob.app CLI**: For publishing the plugin

## 🛠️ Installation & Setup

### 1. Clone and Navigate
```bash
cd /path/to/your/plugins/directory
# Plugin should be placed in the plugins directory of your coob.app installation
```

### 2. Install Dependencies
```bash
npm install
```
This installs all required dependencies including:
- **Preact**: For the React-like component system
- **Webpack**: For building and bundling
- **Babel**: For JavaScript transpilation
- **CSS Loaders**: For processing stylesheets

### 3. Development Workflow

#### Development Build
```bash
npm run build:dev
```
Creates a development build with source maps for debugging.

#### Watch Mode (Recommended for Development)
```bash
npm run watch
```
Automatically rebuilds the plugin when files change during development.

#### Production Build
```bash
npm run build
```
Creates an optimized production build ready for deployment.

### 4. Authentication (Required for Publishing)

Before publishing, you need to authenticate with coob.app:

```bash
npm run login
```
This command will:
- Open your default browser
- Redirect to coob.app authentication
- Store your credentials for future publishing

### 5. Publishing to coob.app

#### Option 1: Build and Publish Separately
```bash
# Build the plugin first
npm run build

# Then publish
npm run publish
```

#### Option 2: Combined Build and Publish
```bash
npm run production
```
This command automatically builds the plugin in production mode and publishes it to coob.app.

## 📁 Project Structure

```
smart-quiz/
├── src/
│   ├── edit/               # Edit mode components
│   │   ├── edit.html      # Edit interface HTML template
│   │   ├── edit.css       # Edit interface styles
│   │   └── edit.js        # Edit mode logic
│   └── view/              # View mode components
│       ├── view.html      # Student interface HTML template
│       ├── view.css       # Student interface styles
│       └── view.js        # Student interaction logic
├── dist/                  # Built files (generated)
│   ├── view.html
│   ├── edit.html
│   ├── settings.json
│   ├── state.json
│   └── handler.lua
├── manifest.json          # Plugin manifest
├── webpack.config.js      # Build configuration
├── package.json           # Dependencies and scripts
├── README.md             # This file
└── PLUGIN_INFO.md        # Technical documentation
```

## ⚙️ Configuration

### Settings Schema

The plugin uses a comprehensive JSON Schema for configuration:

#### Quiz Behavior
- **`shuffleOptions`**: Enable/disable answer randomization (default: `true`)
- **`showProgress`**: Display progress bar (default: `true`)
- **`questionNavigation`**: Allow jumping between questions (default: `true`)
- **`showFeedback`**: Show detailed feedback after completion (default: `true`)
- **`showCorrectAnswers`**: Display correct answers for wrong questions (default: `false`)
- **`allowRetry`**: Enable quiz retake functionality (default: `true`)
- **`passingScore`**: Minimum percentage required to pass (default: `70`)

#### UI Messages
- **`completedMessages.success`**: Success message text (default: `"You did a great job!"`)
- **`completedMessages.wrong`**: Wrong answer message text (default: `"Sorry, you are wrong."`)

### Example Configuration

```json
{
  "shuffleOptions": true,
  "showProgress": true,
  "questionNavigation": true,
  "showFeedback": true,
  "showCorrectAnswers": false,
  "allowRetry": true,
  "passingScore": 80,
  "completedMessages": {
    "success": "Excellent work!",
    "wrong": "Try again next time."
  }
}
```

## 🔄 State Management

The plugin maintains comprehensive state for each user session:

### Quiz State
- **`currentQuestionIndex`**: Current question being displayed
- **`studentAnswers`**: Array of student's selected answers
- **`answeredQuestions`**: Number of questions answered
- **`totalQuestions`**: Total number of questions in quiz
- **`showResults`**: Whether results screen is displayed

### Results State
- **`results.score`**: Score in format "X/Y"
- **`results.total`**: Total number of questions
- **`results.percentage`**: Percentage score (0-100)
- **`results.correctAnswers`**: Number of correct answers

### System State
- **`loading`**: Whether system is processing
- **`systemError`**: Any system errors encountered

## 🎯 Usage Workflow

### For Students

1. **Quiz Start**: Begin answering questions in sequence or jump around (if navigation enabled)
2. **Answer Selection**: Choose answers with automatic state saving
3. **Progress Tracking**: Monitor completion with progress bar (if enabled)
4. **Submission**: Submit when all questions are answered
5. **Results Review**: View detailed feedback and correct answers (if enabled)
6. **Retry Option**: Retake quiz if score is below passing threshold (if enabled)

### For Educators

1. **Configure Settings**: Set quiz behavior, passing score, and feedback options
2. **Create Questions**: Add multiple-choice questions with correct answers
3. **Monitor Progress**: Track student completion and scores
4. **Analyze Results**: Review student performance and common mistakes

## 🎨 Customization

The plugin supports extensive customization through:
- **Settings configuration** for behavior control
- **CSS styling** for visual customization
- **Translation files** for language support
- **Component structure** for advanced modifications

## 📊 Assessment Capabilities

- **Multiple question types** support
- **Automatic grading** with instant feedback
- **Score calculation** with percentage display
- **Progress tracking** throughout the quiz
- **Result persistence** for later review

## 🔒 Security Features

- **Answer shuffling** to prevent cheating
- **State validation** to ensure data integrity
- **Access control** for question navigation
- **Secure state management** with proper validation

## 🌟 Perfect For

- **Knowledge assessment** in educational courses
- **Skill evaluation** and testing
- **Interactive learning** experiences
- **Certification programs** with passing requirements
- **Training modules** with progress tracking
- **Exam preparation** with retry capabilities

## 📈 Benefits

- **Reduced cheating** through answer shuffling
- **Better engagement** with progress tracking
- **Flexible assessment** with customizable settings
- **Improved learning** with detailed feedback
- **Professional appearance** with modern UI
- **Easy integration** into existing courses

## 🔧 Development Guidelines

### Code Style
- **ES6+**: Modern JavaScript with async/await
- **Preact**: React-like component library for performance
- **CSS Variables**: Consistent theming with design tokens
- **Modular Architecture**: Separated concerns (edit/view)

### Best Practices
- **Error Handling**: Graceful fallbacks for system failures
- **Performance**: Optimized builds and efficient rendering
- **Accessibility**: ARIA labels and keyboard navigation
- **Mobile First**: Responsive design for all devices

### Testing
```bash
# Add tests to package.json scripts section
npm run test
```

## 🚨 Troubleshooting

### Common Issues

#### Build Fails
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Authentication Issues
```bash
# Re-login if publish fails
npm run login
```

#### State Not Saving
- Check browser console for error messages
- Verify localStorage is enabled
- Ensure proper state structure in state.json

#### Settings Not Applied
- Verify settings.json schema is correct
- Check console logs for setting validation errors
- Ensure all required settings have default values

### Support
- Check coob.app documentation
- Review console logs for detailed error messages
- Ensure all prerequisites are installed

## 📈 Future Enhancements

### Planned Features
- **Advanced Analytics**: Detailed learning progress tracking
- **Question Banks**: Reusable question collections
- **Time Limits**: Per-question or total quiz timing
- **Export Capabilities**: CSV/PDF report generation
- **Multi-language Support**: Additional language translations

### UI Improvements
- **Dark Mode**: Theme switching capability
- **Accessibility**: Enhanced screen reader support
- **Animations**: Smooth transitions and micro-interactions
- **Custom Themes**: Branded appearance options

## 📄 License

MIT License - See package.json for full license details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Version:** 2.0.0  
**License:** MIT  
**Author:** CoobApp Team  
**Repository:** [GitHub](https://github.com/coobapp/plugins)

**Built with ❤️ for the coob.app ecosystem**