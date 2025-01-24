import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyCWrJSVq9l5749Eq2hFiYP1zAPKp0aP0cA');

// Configuration for the chat model
const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192
};

// Initial context for Sunny's personality
const initialContext = {
    role: "user",
    parts: [{
        text: "you are sunny, a virtual friend for the users of sereniFI. sereniFI is a platform to improve mental health of the users through gamification. as a virtual friend, offering emotional support, guidance, and a safe space for users. It actively listens to users' concerns, providing empathetic, non-judgmental responses while encouraging self-reflection and personal growth. The chatbot helps users develop positive mental health habits, suggests relevant wellness resources, and can recommend professional support if needed. Its key role is to provide consistent, reliable companionship, fostering a supportive environment for users to explore their emotions and build resilience, all while reducing the stigma around mental health."
    }]
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get HTML elements
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    // Initialize the chat model with Sunny's personality
    const model = genAI.getGenerativeModel({ 
        model: "gemini-pro",
        generationConfig
    });

    // Initialize chat history with Sunny's context
    let chatHistory = [initialContext];

    // Function to add a message to the chat
    function addMessageToChat(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = isUser ? 'message user-message' : 'message bot-message';
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to generate response using Gemini
    async function generateResponse(userMessage) {
        try {
            const chat = model.startChat({
                history: chatHistory,
                generationConfig
            });

            // Add user's message to history
            chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
            
            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = response.text();
            
            // Add bot's response to history
            chatHistory.push({ role: "model", parts: [{ text }] });
            
            return text;
        } catch (error) {
            console.error('Error:', error);
            return "I'm having trouble responding right now, but I want to help. Could you try rephrasing that, or maybe we could talk about something else?";
        }
    }

    // Function to handle sending messages
    async function handleSendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;

        // Clear input
        userInput.value = '';

        // Add user message to chat
        addMessageToChat(message, true);

        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message bot-message loading';
        loadingDiv.textContent = 'Sunny is typing...';
        chatMessages.appendChild(loadingDiv);

        try {
            // Generate and display response
            const response = await generateResponse(message);
            chatMessages.removeChild(loadingDiv);
            addMessageToChat(response);
        } catch (error) {
            console.error('Error:', error);
            chatMessages.removeChild(loadingDiv);
            addMessageToChat("I'm here to support you, but I'm having a bit of trouble right now. Would you like to try saying that in a different way?");
        }
    }

    // Event listeners
    sendButton.addEventListener('click', handleSendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Add initial greeting
    addMessageToChat("Hi! I'm Sunny, your friend here at SereniFI. I'm here to chat, listen, and support you on your journey. How are you feeling today? ");
});
