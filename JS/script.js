let category; // Declare category as a global variable

// Function to execute after the DOM has loaded
document.addEventListener("DOMContentLoaded", function() {
    // Add event listener to the "Start Quiz" button
    const startQuizBtn = document.getElementById("start-quiz-btn");
    if (startQuizBtn) {
        startQuizBtn.addEventListener("click", startQuiz);
    }

    // Add event listener to the "Proceed to Quiz" button
    const proceedQuizBtn = document.getElementById("proceed-quiz-btn");
    if (proceedQuizBtn) {
        proceedQuizBtn.addEventListener("click", submitName);
    }

    // Fetch questions if on the quiz_questions.html page
    if (window.location.pathname.includes("quiz_questions.html")) {
        fetchQuestions();
    }

    // Retrieve the full name from localStorage
    const fullName = localStorage.getItem("fullName");
    if (fullName) {
        const firstName = fullName.split(" ")[0]; // Get the first name
        const userNameElement = document.getElementById("user-name");
        if (userNameElement) {
            userNameElement.textContent = `Welcome ${firstName}`; // Display the first name
        }
    }

    // Display score and message if on the score.html page
    const scoreElement = document.getElementById('score');
    const messageElement = document.getElementById('message');
    if (scoreElement && messageElement) {
        const urlParams = new URLSearchParams(window.location.search);
        const score = urlParams.get('score');
        scoreElement.textContent = score;

        // Retrieve the subject (category) from the URL parameters
        const subject = urlParams.get('category');
        console.log("Retrieved subject: ", subject); // Debug statement

        // Retrieve the full name from localStorage
        const fullName = localStorage.getItem("fullName");
        const firstName = fullName ? fullName.split(" ")[0] : ''; // Get the first name

        // Customize message based on user's score
        if (score >= 70) {
            messageElement.innerHTML = `
                <h3 class="winnernote">Dear ${firstName},</h3>
                <p class="winnernote">Congratulations! You have successfully completed the <b>OVTech IQ Test</b> on ${subject}. We are thrilled to inform you that you achieved an outstanding score of ${score}% on the test. Your dedication to learning and your exceptional performance are truly commendable.</p>
                <p class="winnernote">We hope this experience has been both enriching and enjoyable for you. Your commitment to expanding your knowledge and challenging yourself is truly inspiring. Keep up the great work!</p>
                <p class="winnernote">Once again, congratulations on your impressive success. We look forward to seeing you tackle more challenges and achieve even greater heights in the future.</p>
                <p class="winnernote">Best regards,</p>
                <h4 class="winnernote">Badru Olumide David</h4>
                <h5 id="ceo">CEO/Manager</h5>
                <br>
                <p>Click <a id="retakebtn" href="user.html">here</a> to take another test or try another subject.</p>
            `;
        } else {
            messageElement.innerHTML = `
                <h3>Sorry ${firstName}, you did not pass the <b>OVTech IQ Test</b> on ${subject}.</h3>
                <p>Click <a id="retakebtn" href="user.html">here</a> to retake the test or try another subject.</p>
            `;
        }
    }
});

// Function to handle form submission
function submitName(event) {
    event.preventDefault(); // Prevent default form submission behavior

    const fullName = document.getElementById("fullname").value.trim();
    if (fullName) {
        localStorage.setItem("fullName", fullName); // Store the full name in localStorage
        window.location.href = "./HTML/user.html"; // Redirect to user page
    } else {
        alert("Please enter your full name."); // Show alert if full name is empty
    }
}

// Function to handle quiz start
function startQuiz() {
    category = document.getElementById("category-select").value; // Assign value to global category variable
    console.log("Selected category: ", category); // Debug statement
    let categoryId;
    switch (category) {
        case "Science: Mathematics":
            categoryId = 19;
            break;
        case "Entertainment: Video Games":
            categoryId = 15;
            break;
        case "Sports":
            categoryId = 21;
            break;
        case "History":
            categoryId = 23;
            break;
        case "Entertainment: Books":
            categoryId = 10;
            break;
        case "Entertainment: Music":
            categoryId = 12;
            break;
        case "Entertainment: Cartoon & Animations":
            categoryId = 32;
            break;
        case "Geography":
            categoryId = 22;
            break;
        default:
            categoryId = 9; // Default category (General Knowledge)
            break;
    }
    // Redirect to the quiz page with the selected category as a URL parameter
    window.location.href = `quiz_questions.html?category=${categoryId}&subject=${category}`;
}

// Function to fetch questions based on category
function fetchQuestions() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category');

    // Make an API call to fetch questions based on the category ID
    const apiUrl = `https://opentdb.com/api.php?amount=10&category=${categoryId}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Process the fetched questions and display them on the page
            displayQuestions(data.results);
            hideLoadingMessage(); // Hide the loading message
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            hideLoadingMessage(); // Hide the loading message on error
        });
}

// Function to display questions on the page
function displayQuestions(questions) {
    const questionContainer = document.getElementById('question-container');
    questionContainer.style.display = 'block'; // Show the question container
    questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.dataset.correctAnswer = question.correct_answer; // Store correct answer in dataset
        questionElement.innerHTML = `
            <p class="question-text">${index + 1}. ${question.question}</p>
            <ul class="options">
                ${question.incorrect_answers.map(option => `
                    <li>
                        <input type="radio" id="option-${index}-${option}" name="question-${index}" value="${option}">
                        <label for="option-${index}-${option}">${option}</label>
                    </li>
                `).join('')}
                <li>
                    <input type="radio" id="option-${index}-${question.correct_answer}" name="question-${index}" value="${question.correct_answer}">
                    <label for="option-${index}-${question.correct_answer}">${question.correct_answer}</label>
                </li>
            </ul>
        `;
        questionContainer.appendChild(questionElement);
    });

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit Quiz';
    submitButton.addEventListener('click', submitQuiz);
    questionContainer.appendChild(submitButton);

    // Start the countdown timer once the questions are displayed
    startTimer();
}

// Function to submit the quiz
function submitQuiz() {
    const questions = document.querySelectorAll('.question');
    let correctAnswers = 0;
    questions.forEach((question, index) => {
        const selectedOption = document.querySelector(`input[name="question-${index}"]:checked`);
        if (selectedOption && selectedOption.value === question.dataset.correctAnswer) {
            correctAnswers++;
        }
    });
    const totalQuestions = questions.length;
    const score = (correctAnswers / totalQuestions) * 100;

    // Retrieve the subject (category) from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');

    // Redirect to the score page with the score and subject as URL parameters
    window.location.href = `score.html?score=${score}&category=${subject}`;
}

// Function to hide the loading message
function hideLoadingMessage() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
}

// Function to start the countdown timer
function startTimer() {
    const timerElement = document.getElementById('timer');
    let timeRemaining = 300; // 10 minutes in seconds

    const intervalId = setInterval(() => {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerElement.textContent = `Time Remaining: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeRemaining > 0) {
            timeRemaining--;
        } else {
            clearInterval(intervalId);
            submitQuiz(); // Automatically submit the quiz when time runs out
        }
    }, 1000);
}
