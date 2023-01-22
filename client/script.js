// Import SVG
import bot from './assets/bot.svg';
import user from './assets/user.svg';

// DOM
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');


// Loader Function
let loadInterval;

function loader(element) {
    element.textContent = '';

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300)
};

// Typing Text Function
function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
};

// Generate Unique ID
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

// Chat Stripe
function chatStripe(isAi, value, uniqueId) {
    return (
    `
        <div class="wrapper ${isAi && 'ai'}">
         <div class="chat">
          <div class="profile">
           <img
             src=${isAi ? bot : user}
             alt="${isAi ? 'bot' : 'user'}"
           />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
         </div>
        </div>
    `
    )
}



// AI Generated Message
const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    // User's Chat Stripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
    form.reset();

    // Bot's Chat Stripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);

    loader(messageDiv);

    // Fetch data from server
    const response = await fetch('https://dott-bot.onrender.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
});