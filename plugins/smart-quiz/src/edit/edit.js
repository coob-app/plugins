import { h, Component, render } from "preact";
import "./edit.css";

class Edit extends Component {
    constructor() {
        super();

        // Bind methods to prevent recreation on each render
        this.handleFileImport = this.handleFileImport.bind(this);

        // Initialize with empty state, will be restored in componentDidMount
        this.state = {
            quizTitle: '',
            quizzes: [{ id: 1, question: '', options: [{ text: '' }, { text: '' }], correctAnswer: -1 }],
            currentQuizIndex: 0,
            totalQuizzes: 1,
            messages: {
                en: {
                    quizTitle: "Quiz Title",
                    question: "Question",
                    answerOptions: "Answer Options (Select the correct answer using the radio buttons)",
                    addOption: "Add Option",
                    addQuiz: "Add Quiz",
                    enterQuizTitle: "Enter quiz title...",
                    enterQuestion: "Enter your question here...",
                    enterOption: "Option",
                    noCorrectAnswer: "Please select a correct answer",
                    insufficientOptions: "At least 2 options are required",
                    emptyOption: "Option text cannot be empty",
                    emptyQuestion: "Question text cannot be empty",
                    importSection: "Import Questions",
                    downloadExample: "Download Example",
                    importFile: "Import File",
                    importDescription: "Import questions from a text file using the specified format"
                },
                ru: {
                    quizTitle: "Название квиза",
                    question: "Вопрос",
                    answerOptions: "Варианты ответов (Выберите правильный ответ с помощью радиокнопок)",
                    addOption: "Добавить вариант",
                    addQuiz: "Добавить квиз",
                    enterQuizTitle: "Введите название квиза...",
                    enterQuestion: "Введите ваш вопрос здесь...",
                    enterOption: "Вариант",
                    noCorrectAnswer: "Пожалуйста, выберите правильный ответ",
                    insufficientOptions: "Требуется минимум 2 варианта",
                    emptyOption: "Текст варианта не может быть пустым",
                    emptyQuestion: "Текст вопроса не может быть пустым",
                    importSection: "Импорт вопросов",
                    downloadExample: "Скачать пример",
                    importFile: "Импортировать файл",
                    importDescription: "Импортируйте вопросы из текстового файла используя указанный формат"
                }
            }
        };
    }

    handleQuizTitleChange = (e) => {
        this.setState({ quizTitle: e.target.value });
    };

    handleQuestionChange = (e) => {
        const { quizzes, currentQuizIndex } = this.state;
        const newQuizzes = [...quizzes];
        newQuizzes[currentQuizIndex] = { ...newQuizzes[currentQuizIndex], question: e.target.value };
        this.setState({ quizzes: newQuizzes });
    };

    handleOptionChange = (optionIndex, value) => {
        const { quizzes, currentQuizIndex } = this.state;
        const newQuizzes = [...quizzes];
        const newOptions = [...newQuizzes[currentQuizIndex].options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], text: value };
        newQuizzes[currentQuizIndex] = { ...newQuizzes[currentQuizIndex], options: newOptions };
        this.setState({ quizzes: newQuizzes });
    };

    handleCorrectAnswerChange = (optionIndex) => {
        const { quizzes, currentQuizIndex } = this.state;
        const newQuizzes = [...quizzes];
        newQuizzes[currentQuizIndex] = { ...newQuizzes[currentQuizIndex], correctAnswer: optionIndex };
        this.setState({ quizzes: newQuizzes });
    };

    addOption = () => {
        const { quizzes, currentQuizIndex } = this.state;
        const newQuizzes = [...quizzes];
        const newOptions = [...newQuizzes[currentQuizIndex].options, { text: '' }];
        newQuizzes[currentQuizIndex] = { ...newQuizzes[currentQuizIndex], options: newOptions };
        this.setState({ quizzes: newQuizzes });
    };

    removeOption = (optionIndex) => {
        const { quizzes, currentQuizIndex } = this.state;
        const newQuizzes = [...quizzes];
        const currentOptions = newQuizzes[currentQuizIndex].options;
        
        const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
        let newCorrectAnswer = newQuizzes[currentQuizIndex].correctAnswer;

        // Adjust correct answer index if necessary
        if (newCorrectAnswer >= optionIndex) {
            newCorrectAnswer = Math.max(0, newCorrectAnswer - 1);
        }

        newQuizzes[currentQuizIndex] = { 
            ...newQuizzes[currentQuizIndex], 
            options: newOptions, 
            correctAnswer: newCorrectAnswer 
        };
        
        this.setState({ quizzes: newQuizzes });
    };

    addQuiz = () => {
        const { quizzes, totalQuizzes } = this.state;
        const newQuiz = {
            id: totalQuizzes + 1,
            question: '',
            options: [{ text: '' }, { text: '' }],
            correctAnswer: -1
        };
        
        this.setState({
            quizzes: [...quizzes, newQuiz],
            totalQuizzes: totalQuizzes + 1,
            currentQuizIndex: totalQuizzes
        });
    };

    removeQuiz = (quizIndex) => {
        const { quizzes, totalQuizzes, currentQuizIndex } = this.state;
        
        if (totalQuizzes <= 1) return; // Minimum 1 quiz
        
        const newQuizzes = quizzes.filter((_, i) => i !== quizIndex);
        let newCurrentIndex = currentQuizIndex;
        
        // Adjust current index if necessary
        if (quizIndex <= currentQuizIndex && currentQuizIndex > 0) {
            newCurrentIndex = currentQuizIndex - 1;
        }
        
        this.setState({
            quizzes: newQuizzes,
            totalQuizzes: totalQuizzes - 1,
            currentQuizIndex: newCurrentIndex
        });
    };

    goToQuiz = (quizIndex) => {
        this.setState({ currentQuizIndex: quizIndex });
    };

    /**
     * Parse imported text format and convert to quiz structure
     */
    parseImportedText = (text) => {
        const lines = text.split('\n');
        const quizzes = [];
        let currentQuiz = null;
        let questionId = 1;
        let importedTitle = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines and comments
            if (!line || line.startsWith('#')) {
                continue;
            }

            // Title line
            if (line.startsWith('Title:')) {
                importedTitle = line.substring(6).trim();
                continue;
            }

            // Question line
            if (line.startsWith('Q:')) {
                // Save previous quiz if exists
                if (currentQuiz && currentQuiz.options.length >= 2) {
                    quizzes.push(currentQuiz);
                }
                
                // Start new quiz
                currentQuiz = {
                    id: questionId++,
                    question: line.substring(2).trim(),
                    options: [],
                    correctAnswer: -1
                };
            }
            // Answer line
            else if (line.startsWith('A:') || line.startsWith('A*:')) {
                if (!currentQuiz) continue;
                
                const isCorrect = line.startsWith('A*:');
                const answerText = line.substring(isCorrect ? 3 : 2).trim();
                
                // Remove inline comments (everything after #)
                const cleanAnswerText = answerText.split('#')[0].trim();
                
                if (cleanAnswerText) {
                    currentQuiz.options.push({ text: cleanAnswerText });
                    
                    if (isCorrect) {
                        currentQuiz.correctAnswer = currentQuiz.options.length - 1;
                    }
                }
            }
        }

        // Add the last quiz if it exists
        if (currentQuiz && currentQuiz.options.length >= 2) {
            quizzes.push(currentQuiz);
        }

        return { quizzes, title: importedTitle };
    };


    /**
     * Handle file import
     */
    handleFileImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importResult = this.parseImportedText(e.target.result);
                const { quizzes: importedQuizzes, title: importedTitle } = importResult;
                
                if (importedQuizzes.length === 0) {
                    $_bx.showErrorMessage('No valid questions found in the file. Please check the format.');
                    return;
                }

                // Validate imported quizzes
                let hasErrors = false;
                importedQuizzes.forEach((quiz, index) => {
                    if (quiz.correctAnswer === -1) {
                        $_bx.showErrorMessage(`Question ${index + 1}: No correct answer selected`);
                        hasErrors = true;
                    }
                    if (quiz.options.length < 2) {
                        $_bx.showErrorMessage(`Question ${index + 1}: At least 2 options required`);
                        hasErrors = true;
                    }
                });

                if (hasErrors) return;

                // Import successful - replace current quizzes and title
                this.setState({
                    quizTitle: importedTitle || this.state.quizTitle, // Keep current title if no title in import
                    quizzes: importedQuizzes,
                    totalQuizzes: importedQuizzes.length,
                    currentQuizIndex: 0
                });

                const successMessage = importedTitle 
                    ? `Successfully imported "${importedTitle}" with ${importedQuizzes.length} questions!`
                    : `Successfully imported ${importedQuizzes.length} questions!`;
                
                $_bx.showSuccessMessage(successMessage);
                
            } catch (error) {
                console.error('Import error:', error);
                $_bx.showErrorMessage('Error parsing the file. Please check the format.');
            }
        };
        
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    };

    validateQuizzes = (userMessages) => {
        const { quizzes, quizTitle } = this.state;
        let hasErrors = false;

        // Проверяем, что заголовок квиза не пустой
        if (!quizTitle.trim()) {
            $_bx.showErrorMessage(`Quiz title is required`);
            hasErrors = true;
        }

        quizzes.forEach((quiz, index) => {
            // Проверяем, что выбран правильный ответ
            if (quiz.correctAnswer === -1) {
                $_bx.showErrorMessage(`Quiz ${index + 1}: ${userMessages.noCorrectAnswer}`);
                hasErrors = true;
            }

            // Проверяем, что есть хотя бы 2 опции
            if (quiz.options.length < 2) {
                $_bx.showErrorMessage(`Quiz ${index + 1}: ${userMessages.insufficientOptions} (currently ${quiz.options.length})`);
                hasErrors = true;
            }

            // Проверяем, что все опции имеют текст
            quiz.options.forEach((option, optionIndex) => {
                if (!option.text.trim()) {
                    $_bx.showErrorMessage(`Quiz ${index + 1}, Option ${optionIndex + 1}: ${userMessages.emptyOption}`);
                    hasErrors = true;
                }
            });

            // Проверяем, что вопрос не пустой
            if (!quiz.question.trim()) {
                $_bx.showErrorMessage(`Quiz ${index + 1}: ${userMessages.emptyQuestion}`);
                hasErrors = true;
            }
        });

        return !hasErrors;
    };

    /**
     * Restore state from saved data
     */
    restoreState = () => {
        try {
            // Try to get saved state from $_bx
            const savedQuizTitle = $_bx.get("quizTitle");
            const savedQuizzes = $_bx.get("quizzes");
            const savedCurrentQuizIndex = $_bx.get("currentQuizIndex");
            const savedTotalQuizzes = $_bx.get("totalQuizzes");

            // If we have saved data, restore it
            if (savedQuizTitle || savedQuizzes) {
                this.setState({
                    quizTitle: savedQuizTitle || '',
                    quizzes: savedQuizzes || [{ id: 1, question: '', options: [{ text: '' }, { text: '' }], correctAnswer: -1 }],
                    currentQuizIndex: savedCurrentQuizIndex || 0,
                    totalQuizzes: savedTotalQuizzes || 1
                });
                console.log('State restored from saved data');
            } else {
                console.log('No saved data found, using default state');
            }
        } catch (error) {
            console.error('Error restoring state:', error);
            // In case of error, keep default state
        }
    };

    /**
     * Lifecycle method: Set up event listeners after component mounts
     * Configures the before_save_state event to save data when form is submitted
     */
    componentDidMount() {
        $_bx.onReady(() => {
            // Restore state from saved data
            this.restoreState();

            // Get user language for localization
            let userLanguage = $_bx.language() || "en";
            
            // Update messages in state with current language
            this.setState({
                messages: this.state.messages,
                currentLanguage: userLanguage
            });

            const userMessages = this.state.messages[userLanguage];

            $_bx.event().on("before_save_state", (v) => {
                const { quizTitle, quizzes } = this.state;

                // Filter out empty options for current quiz
                const currentQuiz = quizzes[this.state.currentQuizIndex];
                const validOptions = currentQuiz.options.filter(opt => opt.text.trim());

                const updatedQuiz = { ...currentQuiz, options: validOptions };
                const newQuizzes = [...quizzes];
                newQuizzes[this.state.currentQuizIndex] = updatedQuiz;

                const config = {
                    quizTitle: quizTitle.trim(),
                    quizzes: newQuizzes,
                    currentQuizIndex: this.state.currentQuizIndex,
                    totalQuizzes: this.state.totalQuizzes
                };

                // Validate before saving
                if (!this.validateQuizzes(userMessages)) {
                    return; // Exit if validation fails
                }

                v.state.submitMeta = {
                     // disable buttons we use custom
                     isDisabled: true,
                };

                // Save to global state
                v.state.quizTitle = config.quizTitle;
                v.state.quizzes = config.quizzes;
                v.state.currentQuizIndex = config.currentQuizIndex;
                v.state.totalQuizzes = config.totalQuizzes;
            });
        });
    }

    render() {
        const { quizTitle, quizzes, currentQuizIndex, totalQuizzes, messages, currentLanguage } = this.state;
        const currentQuiz = quizzes[currentQuizIndex];
        const userMessages = messages[currentLanguage || 'en'];

        return (
            <div className="edit-container">
                {/* Import Section */}
                <div className="import-section">
                    <div className="import-content">
                        <div className="import-text">
                            Import questions from text file
                        </div>
                        <div className="import-buttons">
                            <a
                                href="https://1673f157-8972-4778-a72f-1f25830b1b56.selstorage.ru/examples/q1.txt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="download-example-btn"
                                title="Download example file"
                                download="quiz_import.txt"
                            >
                                ⬇️
                            </a>
                            
                            <label className="import-file-btn" title="Import questions from file">
                                📁
                                <input
                                    type="file"
                                    accept=".txt,.text,.md,.csv"
                                    onChange={this.handleFileImport}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Quiz Title */}
                <div className="form-section">
                    <div className="form-group">
                        <label className="bx-form-label">{userMessages.quizTitle}</label>
                        <input
                            type="text"
                            className="bx-form-input"
                            value={quizTitle}
                            onChange={this.handleQuizTitleChange}
                            placeholder={userMessages.enterQuizTitle}
                        />
                    </div>
                </div>


                {/* Quiz Navigation */}
                <div className="quiz-navigation">
                    <div className="quiz-tabs">
                        {quizzes.map((quiz, index) => (
                            <button
                                key={quiz.id}
                                className={`quiz-tab ${currentQuizIndex === index ? 'active' : ''}`}
                                onClick={() => this.goToQuiz(index)}
                            >
                                Quiz {index + 1}
                                {totalQuizzes > 1 && (
                                    <button
                                        className="remove-quiz-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            this.removeQuiz(index);
                                        }}
                                        title="Remove quiz"
                                    >
                                        ✕
                                    </button>
                                )}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="add-quiz-btn"
                        onClick={this.addQuiz}
                    >
                        + {userMessages.addQuiz}
                    </button>
                </div>



                {/* Current Quiz Form */}
                <div className="form-section">
                    <div className="form-group">
                        <label className="bx-form-label">{userMessages.question} {currentQuizIndex + 1}</label>
                        <textarea
                            className="bx-form-textarea"
                            value={currentQuiz.question}
                            onChange={this.handleQuestionChange}
                            placeholder={userMessages.enterQuestion}
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label className="bx-form-label">{userMessages.answerOptions}</label>
                        <div className="options-list">
                            {currentQuiz.options.map((option, index) => (
                                <div key={index} className="option-item">
                                    <input
                                        type="radio"
                                        name={`correct-answer-${currentQuizIndex}`}
                                        checked={currentQuiz.correctAnswer === index}
                                        onChange={() => this.handleCorrectAnswerChange(index)}
                                        className="correct-radio"
                                    />
                                    <input
                                        type="text"
                                        className="bx-form-input"
                                        value={option.text}
                                        onChange={(e) => this.handleOptionChange(index, e.target.value)}
                                        placeholder={`${userMessages.enterOption} ${index + 1}`}
                                    />
                                    <button
                                        type="button"
                                        className="remove-option-btn"
                                        onClick={() => this.removeOption(index)}
                                        title="Remove option"
                                    >
                                        ✕
                                    </button>
                                    {currentQuiz.correctAnswer === index && (
                                        <span className="correct-indicator">✓ Correct</span>
                                        )}
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="add-option-btn"
                            onClick={this.addOption}
                        >
                            + {userMessages.addOption}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

render(<Edit />, document.querySelector("#root"));
