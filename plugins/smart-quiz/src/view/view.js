import { h, Component, render, Fragment } from "preact";
import "./view.css";

/**
 * View Component for MCQ Quiz v2 Plugin
 * Displays the quiz interface with questions, options, and results
 */
class View extends Component {
    constructor(props) {
        super(props);

        // Initialize component state
        this.state = {
            currentQuestionIndex: 0,
            studentAnswers: [],
            answeredQuestions: 0,
            totalQuestions: 0,
            quizTitle: '',
            quizzes: [],
            showResults: false,
            loading: false,
            systemError: null,
            retryCount: 0,
            isSubmitting: false,
            results: {
                score: 0,
                total: 0,
                percentage: 0,
                correctAnswers: 0
            }
        };

        // Quiz state variables
        this.quizData = null;
        this.saveInterval = null;
        this.saveTimeout = null;

        // Translations
        this.translations = {
            en: {
                question: "Question",
                of: "of",
                submitQuiz: "Submit Quiz",
                submitting: "Submitting...",
                retryQuiz: "Retry Quiz",
                quizResults: "Quiz Results",
                score: "Score",
                correctAnswers: "Correct answers",
                outOf: "out of",
                yourAnswer: "Your answer",
                correctAnswer: "Correct answer",
                noAnswer: "No answer",
                pleaseAnswerAll: "Please answer all questions before submitting",
                allQuestionsAnswered: "All questions answered. Ready to submit!",
                questionsCompleted: "questions completed",
                pleaseAnswer: "Please answer all questions",
                noQuizData: "No quiz data available",
                pluginNotInitialized: "Plugin not properly initialized"
            },
            ru: {
                question: "Вопрос",
                of: "из",
                submitQuiz: "Отправить квиз",
                submitting: "Отправка...",
                retryQuiz: "Повторить квиз",
                quizResults: "Результаты квиза",
                score: "Результат",
                correctAnswers: "Правильных ответов",
                outOf: "из",
                yourAnswer: "Ваш ответ",
                correctAnswer: "Правильный ответ",
                noAnswer: "Нет ответа",
                pleaseAnswerAll: "Пожалуйста, ответьте на все вопросы перед отправкой",
                allQuestionsAnswered: "Все вопросы отвечены. Готово к отправке!",
                questionsCompleted: "вопросов отвечено",
                pleaseAnswer: "Пожалуйста, ответьте на все вопросы",
                noQuizData: "Данные квиза недоступны",
                pluginNotInitialized: "Плагин не инициализирован должным образом"
            }
        };

        // Bind methods to prevent recreation on each render
        this.handleAnswerChange = this.handleAnswerChange.bind(this);
        this.submitQuiz = this.submitQuiz.bind(this);
        this.retryQuiz = this.retryQuiz.bind(this);
        this.saveState = this.saveState.bind(this);
        this.restoreState = this.restoreState.bind(this);
        this.getShuffledOptions = this.getShuffledOptions.bind(this);
        this.shouldShowProgress = this.shouldShowProgress.bind(this);
        this.shouldShowFeedback = this.shouldShowFeedback.bind(this);
        this.shouldShowQuestionNavigation = this.shouldShowQuestionNavigation.bind(this);
        this.shouldAllowRetry = this.shouldAllowRetry.bind(this);
        this.shouldShowCorrectAnswers = this.shouldShowCorrectAnswers.bind(this);
        this.canRetry = this.canRetry.bind(this);
    }

    /**
     * Get translation for current language
     */
    t = (key, params = {}) => {
        const lang = $_bx.language() || "en";
        let text = this.translations[lang]?.[key] || this.translations['en'][key];

        // Replace parameters
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });

        return text;
    };

    /**
     * Get shuffled options for a question if shuffle is enabled
     */
    getShuffledOptions = (questionIndex) => {
        const settings = $_bx.getSettings();
        const shuffleOptions = settings?.shuffleOptions !== false; // Default to true if not set
        
        console.log('🔀 Shuffle options check:', {
            questionIndex: questionIndex + 1,
            shuffleOptions,
            settings
        });
        
        if (!shuffleOptions) {
            console.log('📋 Using original order for question', questionIndex + 1);
            return this.state.quizzes[questionIndex].options;
        }

        // Create a deterministic seed based on question index and user ID
        const seed = this.getSeed(questionIndex);
        const options = [...this.state.quizzes[questionIndex].options];
        
        console.log('🔀 Shuffling options for question', questionIndex + 1, {
            original: options.map(o => o.text),
            seed
        });
        
        // Shuffle using seeded random
        const shuffled = this.shuffleArray(options, seed);
        
        console.log('🔀 Shuffled options:', shuffled.map(o => o.text));
        
        return shuffled;
    };

    /**
     * Check if progress bar should be shown based on settings
     */
    shouldShowProgress = () => {
        const settings = $_bx.getSettings();
        const showProgress = settings?.showProgress !== false; // Default to true if not set
        
        console.log('📊 Progress bar check:', {
            showProgress,
            settings
        });
        
        return showProgress;
    };

    /**
     * Check if detailed feedback should be shown based on settings
     */
    shouldShowFeedback = () => {
        const settings = $_bx.getSettings();
        const showFeedback = settings?.showFeedback !== false; // Default to true if not set
        
        console.log('💬 Feedback check:', {
            showFeedback,
            settings
        });
        
        return showFeedback;
    };

    /**
     * Check if question navigation should be shown based on settings
     */
    shouldShowQuestionNavigation = () => {
        const settings = $_bx.getSettings();
        const questionNavigation = settings?.questionNavigation !== false; // Default to true if not set
        
        console.log('🧭 Question navigation check:', {
            questionNavigation,
            settings
        });
        
        return questionNavigation;
    };

    /**
     * Check if retry functionality should be allowed based on settings and passing score
     */
    shouldAllowRetry = () => {
        const settings = $_bx.getSettings();
        const allowRetry = settings?.allowRetry !== false; // Default to true if not set
        const passingScore = settings?.passingScore || 0; // Default to 0 if not set
        
        // Get current results percentage
        const currentPercentage = this.state.results?.percentage || 0;
        
        // Check if student can retry based on max retries
        const canRetryBasedOnLimit = this.canRetry();
        
        // Show retry button only if:
        // 1. allowRetry is enabled AND
        // 2. current percentage is less than passing score AND
        // 3. student hasn't exceeded max retries
        const shouldShow = allowRetry && currentPercentage < passingScore && canRetryBasedOnLimit;
        
        console.log('🔄 Retry check:', {
            allowRetry,
            passingScore,
            currentPercentage,
            canRetryBasedOnLimit,
            shouldShow,
            settings
        });
        
        return shouldShow;
    };

    /**
     * Check if correct answers should be shown in results based on settings
     */
    shouldShowCorrectAnswers = () => {
        const settings = $_bx.getSettings();
        const showCorrectAnswers = settings?.showCorrectAnswers === true; // Default to false if not set
        
        console.log('✅ Correct answers check:', {
            showCorrectAnswers,
            settings
        });
        
        return showCorrectAnswers;
    };

    /**
     * Check if student can retry based on max retries setting
     */
    canRetry = () => {
        const settings = $_bx.getSettings();
        const maxRetries = settings?.maxRetries || 0; // Default to 0 (unlimited)
        const currentRetries = this.state.retryCount || 0;
        
        // If maxRetries is 0, unlimited retries allowed
        if (maxRetries === 0) {
            return true;
        }
        
        // Check if current retries are less than max allowed
        const canRetry = currentRetries < maxRetries;
        
        console.log('🔄 Retry limit check:', {
            maxRetries,
            currentRetries,
            canRetry,
            settings
        });
        
        return canRetry;
    };

    /**
     * Generate a random seed for different shuffling on each page load
     */
    getSeed = (questionIndex) => {
        const componentId = $_bx.getComponentID() || 'default';
        const timestamp = Date.now();
        const userAgent = navigator.userAgent || 'unknown';
        const language = $_bx.language() || 'en';
        
        // Add random component to make it different on each page load
        const randomComponent = Math.random().toString(36).substring(2, 15);
        const sessionStart = performance.now(); // High precision timestamp
        
        // Create a unique identifier that changes on each page load
        const uniqueId = `${componentId}_${language}_${questionIndex}_${randomComponent}_${sessionStart}`;
        const seedString = `${uniqueId}_${userAgent.slice(0, 20)}`;
        
        console.log('🌱 Generating random seed for page load:', {
            questionIndex: questionIndex + 1,
            componentId,
            language,
            randomComponent,
            sessionStart: Math.floor(sessionStart),
            seedString: seedString.slice(0, 50) + '...'
        });
        
        // Simple hash function to convert string to number
        let hash = 0;
        for (let i = 0; i < seedString.length; i++) {
            const char = seedString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    };

    /**
     * Shuffle array using seeded random
     */
    shuffleArray = (array, seed) => {
        const shuffled = [...array];
        let currentSeed = seed;
        
        // Simple seeded random number generator
        const seededRandom = () => {
            currentSeed = (currentSeed * 9301 + 49297) % 233280;
            return currentSeed / 233280;
        };

        // Fisher-Yates shuffle with seeded random
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(seededRandom() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    };

    /**
     * Lifecycle method: Set up event listeners after component mounts
     */
    componentDidMount() {
        $_bx.onReady(() => {
            // Restore state from saved data
            this.restoreState();

            // Set up before_submit event to validate and save response
            $_bx.event().on("before_submit", (v) => {
                console.log('🔄 Before submit triggered:', {
                    answeredQuestions: this.state.answeredQuestions,
                    totalQuestions: this.state.totalQuestions,
                    currentQuestionIndex: this.state.currentQuestionIndex
                });

                if (this.state.answeredQuestions < this.state.totalQuestions) {
                    console.log('❌ Validation failed: not all questions answered');
                    const errorMessage = this.t('pleaseAnswerAll') || 'Please answer all questions before submitting';
                    console.log('Showing error message:', errorMessage);
                    $_bx.showErrorMessage(errorMessage);
                    return;
                }

                // Calculate final results
                this.calculateResults();

                // Save final state before submission
                v.state.currentQuestionIndex = this.state.currentQuestionIndex;
                v.state.studentAnswers = this.state.studentAnswers;
                v.state.answeredQuestions = this.state.answeredQuestions;
                v.state.totalQuestions = this.state.totalQuestions;
                v.state.quizTitle = this.state.quizTitle || 'Smart Quiz';
                v.state.quizzes = this.state.quizzes;
                v.state.showResults = true;
                v.state.results = this.state.results;
                v.state.lastSaved = Date.now();
                v.state.submittedAt = new Date().toISOString();
                v.state.completed = true;
                v.state.retryCount = this.state.retryCount || 0;
                v.state.submitMeta = {
                    isDisabled: true,
                };

                console.log('✅ Final state prepared for submission:', {
                    currentQuestionIndex: v.state.currentQuestionIndex,
                    answeredQuestions: v.state.answeredQuestions,
                    completed: v.state.completed
                });
            });
        });
    }

    /**
     * Save current state using user-specific state API
     */
    saveState = () => {
        try {
            const userState = {
                currentQuestionIndex: this.state.currentQuestionIndex,
                studentAnswers: this.state.studentAnswers,
                answeredQuestions: this.state.answeredQuestions,
                totalQuestions: this.state.totalQuestions,
                quizTitle: this.state.quizTitle || 'Smart Quiz',
                quizzes: this.state.quizzes,
                showResults: this.state.showResults,
                loading: this.state.loading,
                systemError: this.state.systemError,
                retryCount: this.state.retryCount || 0,
                isSubmitting: this.state.isSubmitting || false,
                results: this.state.results,
                lastSaved: Date.now(),
                timestamp: Date.now(),
                sessionId: $_bx.getComponentID(),
                submitMeta: {
                    isDisabled: true,
                }
            };

            console.log('💾 Saving quiz state:', {
                currentQuestionIndex: userState.currentQuestionIndex,
                currentQuestionDisplay: userState.currentQuestionIndex + 1, // 1-based for readability
                answeredQuestions: userState.answeredQuestions,
                totalQuestions: userState.totalQuestions,
                showResults: userState.showResults,
                hasAnswers: userState.studentAnswers && userState.studentAnswers.some(answer => answer !== -1),
                answersSnapshot: userState.studentAnswers ? userState.studentAnswers.map((answer, index) => answer !== -1 ? `${index + 1}:✓` : `${index + 1}:○`).join(', ') : 'none',
                timestamp: new Date().toLocaleTimeString()
            });

            // Save user state to database
            $_bx.saveUserState(userState).then(() => {
                console.log('✅ Quiz user state saved successfully');
            }).catch((error) => {
                console.error('❌ Failed to save quiz user state:', error);
            });
        } catch (error) {
            console.error('❌ Error preparing quiz user state:', error);
        }
    };

    /**
     * Restore state from saved data
     */
    restoreState = () => {
        try {
            console.log('=== STARTING STATE RESTORATION ===');

            // Try to get saved state from $_bx
            const savedQuizTitle = $_bx.get("quizTitle");
            const savedQuizzes = $_bx.get("quizzes");
            const savedState = $_bx.getState();

            console.log('🔍 Raw data from $_bx:', {
                savedQuizTitle: savedQuizTitle,
                savedQuizzes: savedQuizzes,
                savedState: savedState,
                savedStateType: typeof savedState,
                savedStateKeys: savedState ? Object.keys(savedState) : 'no state'
            });

            if (savedState && typeof savedState === 'object') {
                console.log('📊 Detailed saved state:', {
                    currentQuestionIndex: savedState.currentQuestionIndex,
                    answeredQuestions: savedState.answeredQuestions,
                    totalQuestions: savedState.totalQuestions,
                    studentAnswers: savedState.studentAnswers,
                    studentAnswersLength: savedState.studentAnswers ? savedState.studentAnswers.length : 0,
                    showResults: savedState.showResults,
                    lastSaved: savedState.lastSaved ? new Date(savedState.lastSaved).toLocaleString() : 'never'
                });
            }

            console.log('Available data:', {
                savedQuizTitle: !!savedQuizTitle,
                savedQuizzes: savedQuizzes ? savedQuizzes.length : 0,
                savedState: !!savedState,
                savedStateKeys: savedState ? Object.keys(savedState) : []
            });

            if (savedQuizTitle && savedQuizzes && savedQuizzes.length > 0) {
                this.quizData = {
                    quizTitle: savedQuizTitle || 'Smart Quiz',
                    quizzes: savedQuizzes
                };

                // If we have saved user state, restore it
                if (savedState) {
                    console.log('Saved state details:', {
                        currentQuestionIndex: savedState.currentQuestionIndex,
                        answeredQuestions: savedState.answeredQuestions,
                        studentAnswers: savedState.studentAnswers ? savedState.studentAnswers.length : 0,
                        showResults: savedState.showResults,
                        hasAnswers: savedState.studentAnswers && savedState.studentAnswers.some(answer => answer !== -1)
                    });

                    // Determine current question index - prefer saved index, but ensure it's valid
                    let currentIndex = 0;

                    // Always prefer the saved currentQuestionIndex if it's valid
                    if (typeof savedState.currentQuestionIndex === 'number' &&
                        savedState.currentQuestionIndex >= 0 &&
                        savedState.currentQuestionIndex < savedQuizzes.length) {
                        currentIndex = savedState.currentQuestionIndex;
                        console.log('✅ Using saved currentQuestionIndex:', currentIndex);
                    } else {
                        console.log('⚠️ Saved currentQuestionIndex invalid, calculating new one');

                        // If we have saved answers, try to find the best question to show
                        if (savedState.studentAnswers && savedState.studentAnswers.length > 0) {
                            const answeredCount = savedState.studentAnswers.filter(answer => answer !== -1).length;
                            const totalQuestions = savedQuizzes.length;

                            if (answeredCount === totalQuestions) {
                                // All questions answered - stay on last question or show results
                                currentIndex = totalQuestions - 1;
                                console.log('🎯 All questions answered, staying on last question');
                            } else {
                                // Find first unanswered question
                                const firstUnanswered = savedState.studentAnswers.findIndex(answer => answer === -1);
                                currentIndex = firstUnanswered !== -1 ? firstUnanswered : 0;
                                console.log('🔍 Found first unanswered question:', currentIndex);
                            }
                        } else {
                            console.log('📝 No saved answers, starting from first question');
                            currentIndex = 0;
                        }
                    }

                    console.log('Calculated currentQuestionIndex:', currentIndex);

                    this.setState({
                        currentQuestionIndex: currentIndex,
                        studentAnswers: savedState.studentAnswers || new Array(savedQuizzes.length).fill(-1),
                        answeredQuestions: savedState.answeredQuestions || 0,
                        totalQuestions: savedQuizzes.length,
                        quizTitle: savedQuizTitle || 'Smart Quiz',
                        quizzes: savedQuizzes,
                        showResults: savedState.showResults || false,
                        loading: savedState.loading || false,
                        systemError: savedState.systemError || null,
                        retryCount: savedState.retryCount || 0,
                        isSubmitting: savedState.isSubmitting || false,
                        results: savedState.results || { score: 0, total: 0, percentage: 0, correctAnswers: 0 }
                    });
                    console.log('✅ Quiz state restored from saved data. Current question:', currentIndex + 1);
                } else {
                    console.log('No saved user state found, initializing fresh state');
                    this.setState({
                        currentQuestionIndex: 0,
                        totalQuestions: savedQuizzes.length,
                        quizTitle: savedQuizTitle || 'Smart Quiz',
                        quizzes: savedQuizzes,
                        studentAnswers: new Array(savedQuizzes.length).fill(-1),
                        answeredQuestions: 0,
                        showResults: false,
                        loading: false,
                        systemError: null,
                        retryCount: 0,
                        isSubmitting: false,
                        results: { score: 0, total: 0, percentage: 0, correctAnswers: 0 }
                    });
                    console.log('✅ Quiz initialized with fresh state');
                }
            } else {
                console.log('❌ No quiz data found');
                this.setState({
                    showResults: false
                });
            }
        } catch (error) {
            console.error('❌ Error restoring quiz state:', error);
            this.setState({
                showResults: false,
                systemError: `State restoration failed: ${error.message}`
            });
        }
    };

    /**
     * Handle answer selection
     */
    handleAnswerChange = (questionIndex, optionIndex) => {
        // Block answer selection during submission
        if (this.state.isSubmitting) {
            console.log('🚫 Answer selection blocked during submission');
            return;
        }
        
        const { studentAnswers, answeredQuestions, totalQuestions, currentQuestionIndex } = this.state;
        const wasUnanswered = studentAnswers[questionIndex] === -1;

        console.log('📝 Answer changed:', {
            questionIndex: questionIndex + 1,
            optionIndex,
            wasUnanswered,
            previousAnswers: answeredQuestions,
            currentQuestionIndex: currentQuestionIndex + 1
        });

        const newStudentAnswers = [...studentAnswers];
        newStudentAnswers[questionIndex] = optionIndex;

        const newAnsweredQuestions = wasUnanswered ? answeredQuestions + 1 : answeredQuestions;

        this.setState({
            studentAnswers: newStudentAnswers,
            answeredQuestions: newAnsweredQuestions
        }, () => {
            console.log('📝 State updated after answer:', {
                newAnsweredQuestions,
                totalQuestions,
                allAnswered: newAnsweredQuestions === totalQuestions,
                currentQuestionIndex: this.state.currentQuestionIndex + 1
            });

            // Check if this was the last question
            if (newAnsweredQuestions === totalQuestions) {
                console.log('🎯 All questions answered, submitting to system');
                this.submitToSystem();
            } else {
                console.log('➡️ Going to next question');
                this.goToNextQuestion();
            }
        });
    };

    /**
     * Go to next question
     */
    goToNextQuestion = () => {
        const { currentQuestionIndex, totalQuestions, studentAnswers } = this.state;

        console.log('🔄 Finding next question:', {
            current: currentQuestionIndex + 1,
            answers: studentAnswers.map((answer, index) => answer !== -1 ? `${index + 1}:✓` : `${index + 1}:○`).join(' ')
        });

        // Find next unanswered question
        let nextQuestionIndex = currentQuestionIndex + 1;
        while (nextQuestionIndex < totalQuestions && studentAnswers[nextQuestionIndex] !== -1) {
            nextQuestionIndex++;
        }

        // If no next unanswered question, go to first unanswered
        if (nextQuestionIndex >= totalQuestions) {
            nextQuestionIndex = studentAnswers.findIndex(answer => answer === -1);
            console.log('🔄 No next unanswered, going to first unanswered:', nextQuestionIndex !== -1 ? nextQuestionIndex + 1 : 'none found');

            // If all questions are answered (findIndex returns -1), stay on current question
            if (nextQuestionIndex === -1) {
                console.log('🎯 All questions answered, staying on current question');
                return; // Don't change anything
            }
        }

        if (nextQuestionIndex !== -1 && nextQuestionIndex !== currentQuestionIndex) {
            console.log('➡️ Moving to question:', nextQuestionIndex + 1);
            this.setState({ currentQuestionIndex: nextQuestionIndex }, () => {
                // Save state after changing question
                this.saveState();
            });
        } else {
            console.log('⚠️ No valid next question found or already at target question');
        }
    };

    /**
     * Submit answer to system
     */
    submitToSystem = () => {
        this.setState({ loading: true });

        // Block answer selection during submission
        this.setState({ isSubmitting: true });

        // Calculate results first
        this.calculateResults();

        // Wait for state to update, then submit
        setTimeout(() => {
            // Simulate async submission to system
            $_bx.answerSubmit().then(data => {
                console.log('Answer submitted to system:', data);
            }).catch(error => {
                console.error('Error submitting answer to system:', error);
                this.setState({ 
                    loading: false,
                    systemError: error.message || 'Failed to submit answer'
                });
                this.saveState();
            });
        }, 100); // Small delay to ensure state is updated
    };

    /**
     * Submit the quiz
     */
    submitQuiz = () => {
        // Calculate results first, then show results
        this.calculateResults();
        this.setState({ showResults: true }, () => {
            this.saveState();
        });
    };

    /**
     * Calculate quiz results
     */
    calculateResults = () => {
        const { studentAnswers, quizzes } = this.state;
        let correctAnswers = 0;
        const totalQuestions = quizzes.length;

        console.log('🧮 Calculating results:', {
            studentAnswers,
            quizzes: quizzes.map(q => ({ correctAnswer: q.correctAnswer })),
            totalQuestions
        });

        quizzes.forEach((quiz, index) => {
            const userAnswer = studentAnswers[index];
            const correctAnswer = quiz.correctAnswer;
            const isCorrect = userAnswer === correctAnswer;
            
            console.log(`Question ${index + 1}:`, {
                userAnswer,
                correctAnswer,
                isCorrect
            });
            
            if (isCorrect) {
                correctAnswers++;
            }
        });

        const percentage = Math.round((correctAnswers / totalQuestions) * 100);

        console.log('📊 Final calculation:', {
            correctAnswers,
            totalQuestions,
            percentage,
            score: `${correctAnswers}/${totalQuestions}`
        });

        this.setState({
            results: {
                score: `${correctAnswers}/${totalQuestions}`,
                total: totalQuestions,
                percentage: percentage,
                correctAnswers: correctAnswers
            }
        });
    };

    /**
     * Retry the quiz
     */
    retryQuiz = () => {
        const newRetryCount = (this.state.retryCount || 0) + 1;
        
        console.log('🔄 Retrying quiz:', {
            previousRetryCount: this.state.retryCount || 0,
            newRetryCount
        });
        
        this.setState({
            currentQuestionIndex: 0,
            studentAnswers: new Array(this.state.totalQuestions).fill(-1),
            answeredQuestions: 0,
            showResults: false,
            loading: false,
            systemError: null,
            retryCount: newRetryCount,
            isSubmitting: false,
            results: { score: 0, total: 0, percentage: 0, correctAnswers: 0 }
        });
        this.saveState();
    };

    /**
     * Render the quiz interface
     */
    render() {
        console.log('=== RENDER METHOD CALLED ===');

        try {
            const {
                currentQuestionIndex,
                studentAnswers,
                answeredQuestions,
                totalQuestions,
                quizTitle,
                quizzes,
                showResults,
                loading,
                systemError,
                results
            } = this.state;

            console.log('📊 Render state:', {
                currentQuestionIndex: currentQuestionIndex + 1, // 1-based for readability
                totalQuestions,
                answeredQuestions,
                quizzesLength: quizzes ? quizzes.length : 0,
                showResults,
                loading,
                systemError: !!systemError,
                answersStatus: studentAnswers ?
                    studentAnswers.map((answer, index) => answer !== -1 ? `${index + 1}:✓` : `${index + 1}:○`).join(' ') :
                    'no answers'
            });

            if (!quizzes || quizzes.length === 0) {
                console.log('No quizzes available, showing error');
                return (
                    <div className="view-container">
                        <div className="error-message">
                            {this.t('noQuizData')}
                        </div>
                    </div>
                );
            }

            if (showResults) {
                console.log('Showing results screen');
                return this.renderResults();
            }

            console.log('Showing quiz interface directly');
            return this.renderQuiz();
            
        } catch (error) {
            console.error('Error in render method:', error);
            return (
                <div className="view-container">
                    <div className="error-message">
                        Error in render method: {error.message}
                    </div>
                </div>
            );
        }
    }

    /**
     * Render quiz questions
     */
    renderQuiz = () => {
        const { currentQuestionIndex, studentAnswers, answeredQuestions, totalQuestions, quizzes, systemError, loading } = this.state;
        const currentQuiz = quizzes[currentQuestionIndex];

        return (
            <div className="view-container">
                <div className="quiz-header">
                    <h1 className="quiz-title">{this.state.quizTitle || 'Smart Quiz'}</h1>
                    <div className="progress-info">
                        {this.t('question')} {currentQuestionIndex + 1} {this.t('of')} {totalQuestions}
                    </div>
                    {this.shouldShowProgress() && (
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                            ></div>
                        </div>
                    )}
                </div>

                <div className="question-card">
                    <div className="question-header">
                        <span className="question-number">{currentQuestionIndex + 1}</span>
                        <div className="question-text">{currentQuiz.question}</div>
                    </div>
                    <div className="options-list">
                        {this.getShuffledOptions(currentQuestionIndex).map((option, shuffledIndex) => {
                            // Find original index of this option
                            const originalIndex = currentQuiz.options.findIndex(origOption => origOption.text === option.text);
                            
                            return (
                                <label 
                                    key={shuffledIndex} 
                                    className={`option-label ${studentAnswers[currentQuestionIndex] === originalIndex ? 'selected' : ''} ${this.state.isSubmitting ? 'disabled' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name={`question_${currentQuestionIndex}`}
                                        value={originalIndex}
                                        checked={studentAnswers[currentQuestionIndex] === originalIndex}
                                        onChange={() => this.handleAnswerChange(currentQuestionIndex, originalIndex)}
                                        className="option-input"
                                        disabled={this.state.isSubmitting}
                                    />
                                    <span className="option-text">{option.text}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Question Navigation */}
                {this.shouldShowQuestionNavigation() && (
                    <div className="question-navigation">
                    {quizzes.map((_, index) => {
                        const isCurrentQuestion = currentQuestionIndex === index;
                        const isAnswered = studentAnswers[index] !== -1;
                        const prevAnswered = index > 0 && studentAnswers[index - 1] !== -1;
                        const isFirst = index === 0;
                        const isAccessible = isCurrentQuestion || isAnswered || (prevAnswered && studentAnswers[index] === -1) || isFirst;

                        return (
                            <button
                                key={index}
                                className={`question-nav-btn ${isCurrentQuestion ? 'active' : ''} ${isAnswered ? 'answered' : ''} ${!isAccessible ? 'disabled' : ''}`}
                                disabled={!isAccessible}
                                onClick={
                                    isAccessible
                                        ? () => this.setState({ currentQuestionIndex: index }, () => this.saveState())
                                        : undefined
                                }
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                    </div>
                )}
                
                <div className="submit-section">
                    <div className="submit-info">
                        {answeredQuestions === totalQuestions ? 
                            this.t('allQuestionsAnswered') : 
                            `${this.t('pleaseAnswer')} (${answeredQuestions}/${totalQuestions} ${this.t('questionsCompleted')})`
                        }
                    </div>
                    
                    {/* System Error Display */}
                    {systemError && (
                        <div className="system-error">
                            <strong>System Error:</strong> {systemError}
                        </div>
                    )}
                    
                    {/* Loading State */}
                    {loading && (
                        <div className="loading-state">
                            <div className="loading-spinner"></div>
                            <span>Submitting to system...</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /**
     * Render results screen
     */
    renderResults = () => {
        const { results, quizzes, studentAnswers, retryCount } = this.state;

        console.log('🎯 Rendering results:', {
            results,
            studentAnswers,
            retryCount,
            quizzes: quizzes.map(q => ({ correctAnswer: q.correctAnswer }))
        });

        return (
            <div className="view-container">
                <div className="results-screen">
                    <h1 className="results-title">{this.t('quizResults')}</h1>
                    <div className="results-score">{results.score}</div>
                    <div className="results-percentage">{results.percentage}%</div>
                    {retryCount > 0 && (
                        <div className="retry-info">
                            Attempt {retryCount + 1}
                        </div>
                    )}
                    
                    {this.shouldShowFeedback() && (
                        <div className="results-details">
                        {quizzes.map((quiz, index) => {
                            const userAnswerIndex = studentAnswers[index];
                            const isCorrect = userAnswerIndex === quiz.correctAnswer;
                            const userAnswerText = userAnswerIndex !== -1 ? quiz.options[userAnswerIndex].text : this.t('noAnswer');
                            const correctAnswerText = quiz.options[quiz.correctAnswer].text;

                            return (
                                <div key={index} className={`question-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                                    <div className="question-result-title">
                                        <span className="result-icon">{isCorrect ? '✓' : '✗'}</span>
                                        {this.t('question')} {index + 1}
                                    </div>
                                    <div className="question-result-text">{quiz.question}</div>
                                    <div className="answer-info">
                                        <span className="answer-label">{this.t('yourAnswer')}:</span>
                                        <span className={`answer-text ${isCorrect ? 'correct' : 'user'}`}>
                                            {userAnswerText}
                                        </span>
                                        {!isCorrect && this.shouldShowCorrectAnswers() && (
                                            <>
                                                <br />
                                                <span className="answer-label">{this.t('correctAnswer')}:</span>
                                                <span className="answer-text correct">{correctAnswerText}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        </div>
                    )}

                    {this.shouldAllowRetry() && (
                        <button className="retry-button" onClick={this.retryQuiz}>
                            {this.t('retryQuiz')}
                        </button>
                    )}
                </div>
            </div>
        );
    }
}

// Render the View component to the DOM
render(<View />, document.querySelector("#root"));
