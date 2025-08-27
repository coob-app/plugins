import { h, Component, render } from "preact";
import "./view.css";

class View extends Component {
    constructor() {
        super();
        const question = $_bx.get("question") || '';
        let options = $_bx.get("options") || [];
        let answer = $_bx.get("answer");

        // Add an id field to each option to preserve the original index
        options = options.map((option, index) => ({ ...option, id: index }));

        if (answer === null || answer === undefined || answer === "") {
            options = this.shuffleArray(options);
        }

        if (!$_bx.isCorrect()) {
            answer = null;
            options = this.shuffleArray(options);
        }

        this.state = {
            question,
            options,
            answer,
        };
    }

    // Function to shuffle the array while preserving the original index
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    handleOptionSelect = (index) => {
        this.setState({ answer: index });
    };

    renderOptions() {
        return this.state.options.map((option, index) => (
            <div key={index} className="option-view">
                <input
                    type="radio"
                    name="answer"
                    className="option-radio"
                    checked={this.state.answer === option.id} // Check against original index (id)
                    onChange={() => this.handleOptionSelect(option.id)} // Send original index (id)
                />
                <span
                    className="option-text"
                    onClick={() => this.handleOptionSelect(option.id)} // Send original index (id)
                >
                    {option.text}
                </span>
            </div>
        ));
    }

    componentDidMount() {
        // Sync local state with global component state
        $_bx.event().on("before_submit", (v) => {
            if (this.state.answer === null || this.state.answer === undefined || this.state.answer === "" || this.state.answer < 0) {
                $_bx.showErrorMessage("Error: Please select an option to continue.");
                return;
            }
            v.state.answer = this.state.answer;
        });
    }

    render() {
        return (
            <div className="view-container" style={{ fontSize: '16px' }}>
                <h1 className="question-title">{this.state.question}</h1>
                <div className="options-container">
                    {this.renderOptions()}
                </div>
            </div>
        );
    }
}

render(<View />, document.querySelector("#root"));