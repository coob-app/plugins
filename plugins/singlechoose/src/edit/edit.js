import { h, Component, render, createRef, Fragment } from "preact";
import { Trash2 } from "preact-feather/dist/icons/trash-2";
import { Edit3 } from "preact-feather/dist/icons/edit-3";
import { ArrowLeft } from "preact-feather/dist/icons/arrow-left";
import "./edit.css";

class Edit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            question: $_bx.get("question") || '',
            options: $_bx.get("options") || [],
            editingExplanationIndex: null, // Индекс редактируемого объяснения
            isMobile: window.innerWidth <= 600 // Определение мобильной версии
        };

        this.optionsBlockRef = createRef();
        this.lastOptionRef = createRef();
    }

    handleQuestionChange = (event) => {
        this.setState({ question: event.target.value });
    };

    handleOptionChange = (index, event) => {
        const options = [...this.state.options];
        options[index].text = event.target.value;
        this.setState({ options });
    };

    handleCorrectChange = (index) => {
        const options = this.state.options.map((option, idx) => ({
            ...option,
            isCorrect: idx === index
        }));
        this.setState({ options });
    };

    handleExplanationChange = (index, event) => {
        let { options } = this.state;

        if (index >= 0 && index < options.length) {
            const updatedOptions = [...options];
            updatedOptions[index].explanation = event.target.value;
            this.setState({ options: updatedOptions }, () => {
                console.log("Explanation updated:", updatedOptions[index].explanation);
            });
        } else {
            console.error("Invalid editingExplanationIndex or option not found.  " + index);
        }
    };

    toggleExplanationEditing = (index) => {
        const { options } = this.state;

        // Проверка, что индекс существует в массиве options
        if (index >= 0 && index < options.length) {
            this.setState(prevState => ({
                editingExplanationIndex: prevState.editingExplanationIndex === index ? null : index
            }));
        } else {

            console.error("Invalid index for editingExplanationIndex." + index);
        }
    };

    deleteOption = (index) => {
        this.setState(prevState => {
            const updatedOptions = prevState.options.filter((_, idx) => idx !== index);
            return {
                options: updatedOptions,
                // Сброс editingExplanationIndex, если он больше не актуален
                editingExplanationIndex: prevState.editingExplanationIndex === index ? null : prevState.editingExplanationIndex
            };
        });
    };

    addOption = () => {
        this.setState(
            {
                options: [...this.state.options, { text: '', isCorrect: false }]
            },
            () => {
                if (this.lastOptionRef.current) {
                    this.lastOptionRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }
        );
    };

    validateOptions() {
        const { options } = this.state;
        return options.every(option => option.text && option.text.trim().length > 0);
    }

    componentDidMount() {
        $_bx.onReady(() => {
            let userLanguage = $_bx.language() || "en";
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

            $_bx.event().on("before_save_state", (v) => {
                if (this.state.options.length === 0) {
                    $_bx.showErrorMessage(userMessages.addOption);
                    return;
                }

                if (this.state.options.filter((option) => option.isCorrect).length === 0) {
                    $_bx.showErrorMessage(userMessages.selectCorrect);
                    return;
                }

                if (this.state.options.filter((option) => option.isCorrect).length > 1) {
                    $_bx.showErrorMessage(userMessages.selectOnlyOne);
                    return;
                }

                if (this.state.options.length > 10) {
                    $_bx.showErrorMessage(userMessages.addAtMost);
                    return;
                }

                if (!this.validateOptions()) {
                    $_bx.showErrorMessage(userMessages.enterText);
                    return;
                }

                if (this.state.options.length === 1) {
                    $_bx.showErrorMessage(userMessages.addAtLeastTwo);
                    return;
                }

                v.state = this.state;
            });
        });
    }

    renderOption = (option, index) => {
        const isEditingExplanation = this.state.editingExplanationIndex === index;
        const isLastOption = index === this.state.options.length - 1;

        return (
            <div
                key={index}
                className="option-container"
                ref={isLastOption ? this.lastOptionRef : null}
            >
                {isEditingExplanation && this.state.isMobile ? (
                    <div className="explanation-edit-container">
                        <button
                            className="back-to-option"
                            onClick={() => this.toggleExplanationEditing(index)}
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                        <textarea
                            value={option.explanation || ''}
                            onChange={(event) => this.handleExplanationChange(index, event)}
                            className="bx-form-input explanation-textarea"
                            rows={4}
                            placeholder="Enter explanation"
                            style={{ width: '100%', maxWidth: '300px' }} // Adjust width for mobile
                        />
                    </div>
                ) : (
                    <Fragment>
                        <input
                            type="radio"
                            name="correctOption"
                            checked={option.isCorrect}
                            onChange={() => this.handleCorrectChange(index)}
                            className="option-radio"
                        />
                        <input
                            type="text"
                            value={option.text}
                            onChange={(event) => this.handleOptionChange(index, event)}
                            className="bx-form-input option-text"
                            placeholder="Enter option text"
                            style={{ width: 'auto', maxWidth: '300px' }} // Adjust width for mobile
                        />
                        {!this.state.isMobile && !option.isCorrect && (
                            <textarea
                                value={option.explanation || ''}
                                onChange={(event) => this.handleExplanationChange(index, event)}
                                className="bx-form-input option-explanation"
                                rows={2}
                                placeholder="Enter explanation"
                                style={{ width: 'auto', maxWidth: '300px' }} // Adjust width for desktop
                            />
                        )}
                        {this.state.isMobile && (
                            <button
                                className="edit-explanation"
                                onClick={() => this.toggleExplanationEditing(index)}
                            >
                                <Edit3 size={16} style={{ color: 'var(--bx-button-color)' }} />
                            </button>
                        )}
                        <button className="delete-option" onClick={() => this.deleteOption(index)}>
                            <Trash2 size={16} style={{ color: 'var(--bx-button-color)' }} />
                        </button>
                    </Fragment>
                )}
            </div>
        );
    };

    render() {
        return (
            <div>
                <label className="bx-form-label">Enter the question</label>
                <input
                    type="text"
                    className="bx-form-input"
                    value={this.state.question}
                    onChange={this.handleQuestionChange}
                />
                <div className="options-block-mr">
                    <label className="bx-form-label">Options ({this.state.options.length})</label>
                    <div className="options-block" ref={this.optionsBlockRef}>
                        {this.state.options.map(this.renderOption)}
                    </div>
                    <div className="add-option">
                        {this.state.options.length < 10 && (
                            <button className="bx-btn-blue" onClick={this.addOption}>Add Option</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

render(<Edit />, document.querySelector("#root"));