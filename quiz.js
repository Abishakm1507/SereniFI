// Import Gemini API
import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai';

// Initialize Gemini API with the key from environment
const API_KEY = 'AIzaSyCWrJSVq9l5749Eq2hFiYP1zAPKp0aP0cA';
const genAI = new GoogleGenerativeAI(API_KEY);

// Quiz state
let currentQuiz = null;
let currentQuestion = 0;
let score = 0;

// Mood-based prompts for generating questions
const moodPrompts = {
    happy: "Generate 5 positive psychology quiz questions that help maintain and enhance a happy mood. Each question should have 4 options with one correct answer. Format as JSON array with objects containing: question, options array, and correctAnswer index.",
    sad: "Generate 5 supportive and uplifting quiz questions focused on managing and improving sad emotions. Each question should have 4 options with one correct answer. Format as JSON array with objects containing: question, options array, and correctAnswer index.",
    angry: "Generate 5 quiz questions about anger management and emotional regulation. Each question should have 4 options with one correct answer. Format as JSON array with objects containing: question, options array, and correctAnswer index.",
    anxious: "Generate 5 quiz questions about anxiety management and coping strategies. Each question should have 4 options with one correct answer. Format as JSON array with objects containing: question, options array, and correctAnswer index.",
    stressed: "Generate 5 quiz questions about stress management and relaxation techniques. Each question should have 4 options with one correct answer. Format as JSON array with objects containing: question, options array, and correctAnswer index."
};

// Function to show loading state
function showLoading() {
    const quizModal = document.getElementById('quiz-modal');
    const quizContent = document.getElementById('quiz-content');
    quizModal.style.display = 'flex';
    quizContent.innerHTML = `
        <div class="quiz-loading">
            <div class="loading-spinner"></div>
            <p>Generating your personalized quiz...</p>
        </div>
    `;
}

// Make functions globally accessible
window.generateQuiz = async function(mood) {
    try {
        showLoading();
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = moodPrompts[mood] || moodPrompts.happy;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        try {
            currentQuiz = JSON.parse(text);
        } catch (parseError) {
            console.error('Error parsing quiz JSON:', parseError);
            // Fallback to a simpler format if JSON parsing fails
            currentQuiz = [
                {
                    question: "What's a good way to manage your current mood?",
                    options: [
                        "Take deep breaths",
                        "Ignore the feeling",
                        "Get angry at yourself",
                        "Stay isolated"
                    ],
                    correctAnswer: 0
                }
            ];
        }
        
        currentQuestion = 0;
        score = 0;
        showQuiz();
    } catch (error) {
        console.error('Error generating quiz:', error);
        const quizContent = document.getElementById('quiz-content');
        quizContent.innerHTML = `
            <div class="quiz-error">
                <p>Sorry, we couldn't generate your quiz right now. Please try again.</p>
                <button class="quiz-close-btn" onclick="closeQuiz()">Close</button>
            </div>
        `;
    }
};

// Function to show quiz modal
window.showQuiz = function() {
    if (!currentQuiz || currentQuestion >= currentQuiz.length) {
        showResults();
        return;
    }

    const question = currentQuiz[currentQuestion];
    const quizModal = document.getElementById('quiz-modal');
    const quizContent = document.getElementById('quiz-content');

    quizContent.innerHTML = `
        <div class="quiz-progress">Question ${currentQuestion + 1}/${currentQuiz.length}</div>
        <div class="quiz-question">${question.question}</div>
        <div class="quiz-options">
            ${question.options.map((option, index) => `
                <button class="quiz-option" onclick="checkAnswer(${index})" data-index="${index}">
                    ${option}
                </button>
            `).join('')}
        </div>
    `;

    quizModal.style.display = 'flex';
};

// Function to check answer
window.checkAnswer = function(selectedIndex) {
    const question = currentQuiz[currentQuestion];
    const options = document.querySelectorAll('.quiz-option');
    
    // Prevent multiple clicks
    options.forEach(option => {
        option.disabled = true;
        option.style.pointerEvents = 'none';
    });
    
    if (selectedIndex === question.correctAnswer) {
        options[selectedIndex].classList.add('correct');
        score++;
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[question.correctAnswer].classList.add('correct');
    }

    setTimeout(() => {
        currentQuestion++;
        showQuiz();
    }, 1500);
};

// Function to show results
window.showResults = function() {
    const quizContent = document.getElementById('quiz-content');
    const percentage = Math.round((score / currentQuiz.length) * 100);
    
    quizContent.innerHTML = `
        <div class="quiz-results">
            <h2>Quiz Complete!</h2>
            <div class="score-circle">
                <div class="score-number">${percentage}%</div>
            </div>
            <p>You got ${score} out of ${currentQuiz.length} questions correct</p>
            <button class="quiz-close-btn" onclick="closeQuiz()">Close</button>
        </div>
    `;

    // Save quiz result to localStorage
    const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
    quizHistory.push({
        date: new Date().toISOString(),
        score: percentage,
        totalQuestions: currentQuiz.length,
        correctAnswers: score
    });
    localStorage.setItem('quizHistory', JSON.stringify(quizHistory));
};

// Function to close quiz
window.closeQuiz = function() {
    const quizModal = document.getElementById('quiz-modal');
    quizModal.style.display = 'none';
    currentQuiz = null;
    
    // Reset selected mood
    document.querySelectorAll('.emoji-item').forEach(emoji => {
        emoji.style.background = '';
    });
    document.getElementById('take-test-btn').style.display = 'none';
};

// Initialize quiz functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing quiz functionality');
    // Remove existing event listeners
    const emojiItems = document.querySelectorAll('.emoji-item');
    emojiItems.forEach(item => {
        const newItem = item.cloneNode(true);
        item.parentNode.replaceChild(newItem, item);
    });

    // Add new event listeners
    document.querySelectorAll('.emoji-item').forEach(item => {
        item.addEventListener('click', (event) => {
            console.log('Emoji clicked');
            const mood = event.currentTarget.getAttribute('data-mood');
            if (mood) {
                console.log('Generating quiz for mood:', mood);
                generateQuiz(mood.toLowerCase());
            }
        });
    });

    // Add click outside modal to close
    document.getElementById('quiz-modal').addEventListener('click', (event) => {
        if (event.target.id === 'quiz-modal') {
            closeQuiz();
        }
    });
});
