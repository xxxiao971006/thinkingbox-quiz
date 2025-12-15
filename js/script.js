const QUESTION_COUNT = 5;
const TIME_PER_QUESTION = 15;

let questions = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = TIME_PER_QUESTION;

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const progressBar = document.getElementById("progressBar");
const counterEl = document.getElementById("counter");
const timerEl = document.getElementById("timer");
const resultEl = document.getElementById("result");
const scoreEl = document.getElementById("score");
const imageEl = document.getElementById("questionImage");
const celebrationEl = document.getElementById("celebration");
const quizContent = document.getElementById("quizContent");
const quizHeader = document.getElementById("quizHeader");

startBtn.onclick = () => {
    startScreen.classList.add("hidden");
    quizContent.classList.remove("hidden");
    quizHeader.classList.remove("hidden");

    nextBtn.classList.add("hidden");

    if (questions.length) {
        showQuestion();
    } else {
        fetchQuestions();
    }
};

function fetchQuestions() {
    fetch(`https://opentdb.com/api.php?amount=${QUESTION_COUNT}&category=11&difficulty=medium&type=multiple`)
        .then(res => res.json())
        .then(data => {
            questions = data.results.map((q, index) => ({
                type: "text",
                question: decodeHTML(q.question),
                answers: [...q.incorrect_answers, q.correct_answer]
                    .map(decodeHTML)
                    .sort(() => Math.random() - 0.5), // shuffle the answers
                correct: decodeHTML(q.correct_answer),
                image: null
            }));

            // Additional image-based question
            questions.push({
                type: "image",
                question: "Which movie is this poster from?",
                answers: [
                    "Inception",
                    "Interstellar",
                    "Avatar",
                    "The Matrix"
                ],
                correct: "Interstellar",
                image: "public/gargantua1.jpg"
            });

            showQuestion();
        });
}

function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function startTimer() {
    const q = questions[currentIndex];

    timerEl.textContent = `${timeLeft}s`;
    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `${timeLeft}s`;
        if (timeLeft <= 5) {
            timerEl.classList.add("warning");
        } else {
            timerEl.classList.remove("warning");
        }

        if (timeLeft <= 0) {
            clearInterval(timer);
            feedbackEl.textContent = `Time’s up!  \nCorrect answer: ${q.correct}`;
            document.querySelectorAll(".option").forEach(b => {
                b.disabled = true;
                b.classList.add("disabled-hover");
            });
            timerEl.classList.remove("warning");
            nextBtn.classList.remove("hidden");
            nextBtn.onclick = nextQuestion;
        }
    }, 1000);
}

function nextQuestion() {
    currentIndex++;
    currentIndex < questions.length ? showQuestion() : showResults();
}

function showQuestion() {
    quizContent.classList.remove("quiz-content");
    void quizContent.offsetWidth; // force reflow
    quizContent.classList.add("quiz-content");

    clearInterval(timer);
    timeLeft = TIME_PER_QUESTION;
    timerEl.classList.remove("warning");
    startTimer();

    const q = questions[currentIndex];
    questionEl.textContent = q.question;
    optionsEl.innerHTML = "";
    feedbackEl.textContent = "";
    nextBtn.classList.add("hidden");

    counterEl.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
    progressBar.style.width = `${(currentIndex / questions.length) * 100}%`;

    if (q.image) {
        imageEl.src = q.image;
        imageEl.classList.remove("hidden");
    } else {
        imageEl.classList.add("hidden");
        imageEl.src = "";
    }

    q.answers.forEach(answer => {
        const btn = document.createElement("button");
        btn.className = "option";
        btn.textContent = answer;
        btn.onclick = () => selectAnswer(btn, answer);
        optionsEl.appendChild(btn);
    });
}

function selectAnswer(button, answer) {
    clearInterval(timer);
    const q = questions[currentIndex];

    timerEl.classList.remove("warning");
    document.querySelectorAll(".option").forEach(b => {
        b.disabled = true;
        b.classList.add("disabled-hover");
    });

    if (answer === q.correct) {
        button.classList.add("correct");
        feedbackEl.textContent = "Correct!";
        score++;
    } else {
        button.classList.add("incorrect");
        feedbackEl.textContent = `Incorrect. \nCorrect answer: ${q.correct}`;
    }
    nextBtn.classList.remove("hidden");
    nextBtn.onclick = nextQuestion;
}


function showResults() {    
    feedbackEl.textContent = "";
    counterEl.textContent = "";
    optionsEl.innerHTML = "";
    imageEl.src = "";

    timerEl.classList.add("hidden");
    quizContent.classList.add("hidden");
    nextBtn.classList.add("hidden");
    imageEl.classList.add("hidden");

    resultEl.classList.remove("hidden");
    scoreEl.textContent = `You scored ${score} out of ${questions.length}`;
    progressBar.style.width = "100%";

    celebrate(); // 🎉 
}


function celebrate() {
    celebrationEl.classList.remove("hidden");

    const emojis = ["🎉", "🎊", "✨", "🥳"];
    const colors = ["#facc15", "#22c55e", "#3b82f6", "#ec4899"];
    const count = 80;

    for (let i = 0; i < count; i++) {
        const isEmoji = Math.random() > 0.3;

        const particle = document.createElement("span");

        if (isEmoji) {
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.fontSize = (Math.random() * 1.5 + 1) + "rem"; // 1-2.5rem
        } else {
            particle.style.width = particle.style.height = (Math.random() * 6 + 4) + "px"; // 4-10px
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.borderRadius = "50%";
        }

        particle.style.position = "absolute";
        particle.style.left = Math.random() * 100 + "vw";
        particle.style.bottom = "-10vh";
        particle.style.animationDuration = Math.random() * 2 + 3 + "s";
        particle.style.transform = `rotate(${Math.random() * 360}deg)`;
        particle.style.pointerEvents = "none";

        celebrationEl.appendChild(particle);

        setTimeout(() => {
            particle.remove();
        }, 5000);
    }

    setTimeout(() => {
        celebrationEl.classList.add("hidden");
    }, 4500);
}
