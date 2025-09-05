# Smart Quiz Plugin - Technical Information

## 📋 Plugin Overview

**Name:** Smart Quiz  
**Version:** 2.0.0  
**Type:** Multiple-Choice Quiz Component  
**Status:** Active  

## 🎯 Core Features Implemented

### 1. Answer Shuffling (`shuffleOptions`)
- **Function:** `getShuffledOptions(questionIndex)`
- **Algorithm:** Fisher-Yates shuffle with seeded random generation
- **Seed Generation:** Component ID + language + timestamp + random values
- **Result:** Different shuffle order on each page reload

### 2. Progress Bar (`showProgress`)
- **Function:** `shouldShowProgress()`
- **Display:** Visual progress bar showing completion percentage
- **Default:** Enabled (true)

### 3. Question Navigation (`questionNavigation`)
- **Function:** `shouldShowQuestionNavigation()`
- **Logic:** Smart access control - only accessible questions are clickable
- **Access Rules:** Current question + answered questions + next unanswered question
- **Default:** Enabled (true)

### 4. Detailed Feedback (`showFeedback`)
- **Function:** `shouldShowFeedback()`
- **Content:** Question-by-question breakdown with correct/incorrect answers
- **Default:** Enabled (true)

### 5. Correct Answers Display (`showCorrectAnswers`)
- **Function:** `shouldShowCorrectAnswers()`
- **Content:** Shows correct answer only for incorrectly answered questions
- **Default:** Enabled (true)

### 6. Retry System (`allowRetry` + `passingScore`)
- **Function:** `shouldAllowRetry()`
- **Logic:** Show retry button only if score < passing score
- **Default:** `allowRetry = true`, `passingScore = 0`

## 🔧 Technical Implementation

### State Management
- **Current Question Index:** Persistent across sessions
- **Student Answers:** Array of selected answers
- **Results:** Calculated scores and percentages
- **Auto-save:** State saved after each navigation

### Event Handling
- **before_submit:** Prevents submission until all questions answered
- **Answer Changes:** Immediate state updates
- **Navigation:** State persistence on question changes

### UI Components
- **Question Display:** Number + text on same line
- **Answer Options:** Shuffled or original order
- **Navigation Buttons:** Smart enabled/disabled states
- **Progress Bar:** Real-time completion tracking
- **Results Screen:** Comprehensive feedback display

## 📊 Settings Schema

```json
{
  "shuffleOptions": {
    "type": "boolean",
    "default": true,
    "description": "Randomize answer options"
  },
  "showProgress": {
    "type": "boolean", 
    "default": true,
    "description": "Show progress bar"
  },
  "questionNavigation": {
    "type": "boolean",
    "default": true,
    "description": "Enable question navigation"
  },
  "showFeedback": {
    "type": "boolean",
    "default": true,
    "description": "Show detailed feedback"
  },
  "showCorrectAnswers": {
    "type": "boolean",
    "default": true,
    "description": "Show correct answers for wrong questions"
  },
  "allowRetry": {
    "type": "boolean",
    "default": true,
    "description": "Allow quiz retry"
  },
  "passingScore": {
    "type": "number",
    "default": 0,
    "description": "Minimum passing score (0-100)"
  }
}
```

## 🌐 Internationalization

### Supported Languages
- **English (en):** Default language
- **Russian (ru):** Full translation

### Translation Keys
- `question`, `of`, `submitQuiz`, `submitting`
- `retryQuiz`, `quizResults`, `score`
- `correctAnswers`, `outOf`, `yourAnswer`
- `correctAnswer`, `noAnswer`, `allQuestionsAnswered`
- `pleaseAnswer`, `questionsCompleted`

## 🚀 Build Process

### Commands
- `npm run build` - Production build
- `npm run build:dev` - Development build  
- `npm run watch` - Development with watch mode
- `npm run publish` - Publish to CoobApp

### Output Files
- `dist/view.html` - Main quiz interface
- `dist/edit.html` - Quiz editor interface
- `dist/settings.json` - Settings configuration
- `dist/state.json` - Initial state structure
- `dist/handler.lua` - Server-side logic

## 🔍 Debugging

### Console Logging
- `🎲 Shuffle check` - Answer shuffling status
- `📊 Progress check` - Progress bar visibility
- `🧭 Question navigation check` - Navigation status
- `💬 Feedback check` - Feedback display status
- `✅ Correct answers check` - Correct answers display status
- `🔄 Retry check` - Retry button logic
- `🎯 Rendering results` - Results calculation

### State Logging
- `💾 Saving state` - State persistence
- `🔄 Restoring state` - State restoration
- `📝 State restored` - Restored state details

## 📱 Browser Compatibility

- **Modern Browsers:** Chrome, Firefox, Safari, Edge
- **Mobile Support:** iOS Safari, Android Chrome
- **Features Used:** ES6+, CSS Flexbox, Local Storage

## 🔒 Security Considerations

- **Answer Shuffling:** Prevents answer pattern recognition
- **State Validation:** Ensures data integrity
- **Access Control:** Prevents unauthorized question access
- **Input Sanitization:** Safe handling of user inputs

---

**Last Updated:** 2024  
**Maintainer:** CoobApp Team  
**Repository:** [GitHub](https://github.com/coobapp/plugins)
