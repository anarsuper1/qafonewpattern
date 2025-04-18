import { image_question, result } from './data.js';

let answ = image_question;
let answer_questions = result;

let incorrect_answers = [];

const questions = [];
const inputMin = document.querySelector('.min');
const inputMax = document.querySelector(".max");
const inputCount = document.querySelector(".input-count");
const homePage = document.querySelector('.home');
const questionPage = document.querySelector('.quiz');
const startBtn = document.querySelector("#start");

const inputElement = document.querySelector('.max');
    
inputElement.value = answ.length;
console.log(answ);

startBtn.addEventListener('click', () => {
    homePage.classList.add('hide');
    questionPage.classList.remove('hide');
    document.getElementById('question').classList.remove('hide');
    incorrect_answers = [];

    localStorage.removeItem("incorrects");
    let random_number = randomNumber();
    
    questions.length = 0; // Reset questions array

    for (let k = 0; k < random_number.length; k++) {
        let i = random_number[k];
        let count = answer_questions[i].length;
        let answer = [];

        for (let j = 0; j < count; j++) {
            let copied_answers = [];
            
            for (let m = 0; m < count + 1; m++) {
                let new_answer = {};
                if (m !== j) {
                    new_answer['text'] = answ[i][m];
                    new_answer['correct'] = answer_questions[i][m-1];
                    new_answer['originalIndex'] = m-1;
                    copied_answers.push(new_answer);
                }
            }
            answer.push(copied_answers);
            copied_answers = [];
        }

        questions.push({
            question: answ[i][0],
            answers: answer[0]
        });
    }
  
    startQuiz();
});

// Линейный конгруэнтный генератор для создания случайных чисел
function linearCongruentialGenerator(seed, a, c, m) {
    return (a * seed + c) % m;
}

function randomNumber() {
    let start = parseFloat(inputMin.value);
    let finish = parseFloat(inputMax.value);
    let count_question = parseFloat(inputCount.value);
    let res = [];
    let seed = Date.now();

    while (res.length < count_question) {
        let rand = linearCongruentialGenerator(seed, 1664525, 1013904223, 4294967296);
        seed = rand;
        let scaledRand = Math.floor((rand / 4294967296) * (finish - start)) + start;

        if (!res.includes(scaledRand)) {
            res.push(scaledRand);
        }
    }

    return res;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-buttons");
const nextButton = document.getElementById("next-btn");
const backButton = document.getElementById("back-btn");

let currentQuestionIndex = 0;
let score = 0;
let userAnswers = []; // Array to store user's selected answers

function startQuiz() {
    document.getElementById('incorrect').classList.add('hide');
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = Array(questions.length).fill(null); // Reset user's selected answers
    nextButton.innerHTML = "Next";
    backButton.innerHTML = "Back";
    showQuestion();
}

function addImage(element, container) {
    if (element.includes('output_imagess')) {
        const image = document.createElement('img');
        image.setAttribute('src', element);
        image.classList.add('pidr');
        container.appendChild(image);
    } else {
        container.textContent = element; // Add text if it's not an image
    }
}

function removeImages() {
    // Remove images from the question and answer containers
    const images = document.querySelectorAll('.pidr');
    images.forEach(img => img.remove());
}

function showQuestion() {
    resetState();
    removeImages(); // Remove images before showing the next question

    let currentQuestion = questions[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;

    // Clear the content of the question container
    questionElement.innerHTML = questionNo + ".  ";

    // Check if the question contains an image
    if (currentQuestion.question.includes('output_imagess')) {
        addImage(currentQuestion.question, document.getElementById('q'));
    } else {
        // If it's not an image, add the text content
        questionElement.textContent = questionNo + ".  " + currentQuestion.question;
    }

    const shuffledAnswers = shuffle([...currentQuestion.answers]);

    shuffledAnswers.forEach((answer, index) => {
        const button = document.createElement("button");
        button.classList.add("btn");
        addImage(answer.text, button);
        answerButtons.appendChild(button);

        if (answer.correct) {
            button.dataset.correct = answer.correct;
        }
        button.addEventListener("click", () => selectAnswer(index, shuffledAnswers));
    });

    // If user has already answered this question, select the answer button
    const selectedAnswerOriginalIndex = userAnswers[currentQuestionIndex];
    if (selectedAnswerOriginalIndex !== null && selectedAnswerOriginalIndex !== undefined) {
        let selectedAnswer = shuffledAnswers.find(answer => answer.originalIndex === selectedAnswerOriginalIndex);
        if (selectedAnswer) {
            const selectedIndex = shuffledAnswers.indexOf(selectedAnswer);
            const selectedBtn = answerButtons.children[selectedIndex];
            selectedBtn.classList.add("selected");
            currentQuestion.answers[selectedIndex].selected = true;
        }
    }

    // Highlight the correct answer
    const correctAnswer = shuffledAnswers.find(answer => answer.correct);
    if (correctAnswer) {
        const correctIndex = shuffledAnswers.indexOf(correctAnswer);
        const correctBtn = answerButtons.children[correctIndex];
        correctBtn.classList.add("correct-answer");
    }
}

function resetState() {
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function selectAnswer(selectedAnswerIndex, shuffledAnswers) {
    const selectedAnswer = shuffledAnswers[selectedAnswerIndex];
    userAnswers[currentQuestionIndex] = selectedAnswer.originalIndex;
    
    const selectedBtn = answerButtons.children[selectedAnswerIndex];
    const prevSelectedBtn = answerButtons.querySelector(".selected");
    const checkbox = document.querySelector('.checkbox-inline input[type="checkbox"]');

    if (prevSelectedBtn) {
        prevSelectedBtn.classList.remove("selected");
    }
    selectedBtn.classList.add("selected");
    
    const isCorrect = selectedBtn.dataset.correct === "true";
    if (isCorrect) {
        if (checkbox.checked) {
            selectedBtn.classList.add("correct");
        }
        score++;
    } else if (checkbox.checked && !isCorrect) {
        selectedBtn.classList.add("incorrect");
    } if(!isCorrect){
        incorrect_answers.push(questions[currentQuestionIndex])
    }

    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true" && checkbox.checked) {
            button.classList.add("correct");
        }
        if (checkbox.checked){
            button.disabled = true;
        }
    });
    nextButton.style.display = "block";
    backButton.style.display = "block";
}

function showScore() {
    resetState();
    questionElement.innerHTML = `You scored ${score} out of ${questions.length}!`;
    nextButton.innerHTML = "Play Again";
    backButton.innerHTML = 'Show incorrect';
    nextButton.style.display = "block";
    localStorage.setItem("incorrects", JSON.stringify(incorrect_answers));
    removeImages();
}

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showScore();
    }
}

function handleBackButton() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions.length) {
        handleNextButton();
    } else {
        startQuiz();
    } if (currentQuestionIndex === questions.length - 1) {
        nextButton.innerHTML = "Finish";
    }
});
backButton.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
        handleBackButton();
        nextButton.innerHTML = "Next";
    } if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('incorrect').classList.remove('hide');
        document.getElementById('btn').classList.add('hide');
        showAllQuestions(incorrect_answers);
    }
});

let currentQuestionindex = 0;
const questionsContainer = document.getElementById('questions-container');
const showIncorrectAnswersButton = document.getElementById('show-incorrect-answers');

showIncorrectAnswersButton.addEventListener('click', () => {
    questionPage.classList.remove('hide');
    homePage.classList.remove('hide');
    questionsContainer.classList.add('hide');
    showIncorrectAnswersButton.classList.add('hide');
    document.getElementById('btn').classList.remove('hide');
    questionPage.classList.add('hide');
    location.reload();

    startQuiz();
});

function showAllQuestions(incorrect_answers) {
    document.getElementById('question').classList.add('hide');

    resetState();
    removeImages(); // Remove images before showing the next question

    for (let i = 0; i < incorrect_answers.length; i++) {
        currentQuestionindex = i;
        let currentQuestion = incorrect_answers[currentQuestionindex];
        let questionNo = currentQuestionindex + 1;

        const questionContainerElement = document.createElement('div');
        questionContainerElement.classList.add('question-container');
        questionContainerElement.innerHTML = questionNo + ". " + "<br>";

        if (currentQuestion.question.includes('output_imagess')) {
            addImage(currentQuestion.question, document.getElementById('questions-container'));
        } else {
            questionContainerElement.innerHTML = questionNo + ". " + currentQuestion.question + "<br>";
        }

        const shuffledAnswers = shuffle([...currentQuestion.answers]);

        shuffledAnswers.forEach((answer, index) => {
            const button = document.createElement("button");
            button.classList.add("btn");
            addImage(answer.text, button);
            questionContainerElement.appendChild(button);

            if (answer.correct) {
                button.dataset.correct = answer.correct;
            }

            button.addEventListener("click", () => selectAnswer(index, shuffledAnswers));
        });

        const selectedAnswerOriginalIndex = userAnswers[currentQuestionindex];
        if (selectedAnswerOriginalIndex !== null && selectedAnswerOriginalIndex !== undefined) {
            let selectedAnswer = shuffledAnswers.find(answer => answer.originalIndex === selectedAnswerOriginalIndex);
            if (selectedAnswer) {
                const selectedIndex = shuffledAnswers.indexOf(selectedAnswer);
                const selectedBtn = questionContainerElement.children[selectedIndex + 1];
                selectedBtn.classList.add("incorrect");
                currentQuestion.answers[selectedIndex].selected = false;
            }
        }

        const correctAnswer = shuffledAnswers.find(answer => answer.correct);
        const correctIndex = shuffledAnswers.indexOf(correctAnswer);
        const correctBtn = questionContainerElement.children[correctIndex + 1];
        correctBtn.classList.add("correct");

        questionsContainer.appendChild(questionContainerElement);
    }
}
