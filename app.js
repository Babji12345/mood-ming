const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve the frontend from the server
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MoodMingle Chat</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #007bff;
                    color: white;
                }
                header {
                    background-color: #003f7f;
                    color: white;
                    padding: 1em;
                    text-align: center;
                }
                header h1 {
                    margin: 0;
                    font-size: 2em;
                }
                nav ul {
                    list-style-type: none;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                }
                nav ul li {
                    margin: 0 1em;
                }
                nav ul li a {
                    color: white;
                    text-decoration: none;
                    font-weight: bold;
                }
                section {
                    margin: 2em auto;
                    padding: 1em;
                    background-color: #003f7f;
                    border-radius: 8px;
                    max-width: 600px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                h2 {
                    margin-top: 0;
                }
                #chat-box {
                    max-height: 300px;
                    overflow-y: auto;
                    background-color: #e5e5e5;
                    padding: 10px;
                    color: #333;
                    border-radius: 8px;
                }
                #chat-input-area {
                    display: flex;
                    margin-top: 1em;
                }
                #chat-input {
                    flex: 1;
                    padding: 0.75em;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                    margin-right: 0.5em;
                    color: #333;
                }
                #chat-input-area button {
                    padding: 0.75em 1.5em;
                    background-color: #00aaff;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                }
                #typing-status {
                    margin-top: 10px;
                    color: #ddd;
                }
            </style>
        </head>
        <body>
            <header>
                <h1>MoodMingle</h1>
                <nav>
                    <ul>
                        <li><a href="#feed">Emotion Feed</a></li>
                        <li><a href="#matchmaking">Mood Matchmaking</a></li>
                        <li><a href="#chat">Chat</a></li>
                        <li><a href="#mood-tracking">Mood Tracking</a></li>
                    </ul>
                </nav>
            </header>
        
            <section id="chat">
                <h2>Chat Room</h2>
                <div id="chat-box"></div>
                <div id="chat-input-area">
                    <input type="text" id="chat-input" placeholder="Type a message...">
                    <button id="send-message">Send</button>
                </div>
                <div id="typing-status"></div>
            </section>
        
            <script src="/socket.io/socket.io.js"></script>
            <script>
                const socket = io();
        
                const username = prompt('Enter your username:');
                socket.emit('join', username);
        
                socket.on('receiveMessage', (message) => {
                    displayMessage(message);
                });
        
                document.getElementById('send-message').addEventListener('click', function() {
                    const chatInput = document.getElementById('chat-input').value;
                    if (chatInput) {
                        const messageData = {
                            sender: username,
                            receiver: 'everyone',
                            content: chatInput,
                        };
                        socket.emit('sendMessage', messageData);
                        displayMessage(messageData);
                        document.getElementById('chat-input').value = ''; // Clear input
                    }
                });
        
                socket.on('typingStatus', (data) => {
                    showTypingIndicator(data);
                });
        
                document.getElementById('chat-input').addEventListener('input', function() {
                    socket.emit('typing', { username });
                });
        
                function showTypingIndicator(data) {
                    const typingStatus = document.getElementById('typing-status');
                    typingStatus.textContent = \`\${data.username} is typing...\`;
                    setTimeout(() => {
                        typingStatus.textContent = '';
                    }, 1000);
                }
        
                function displayMessage(message) {
                    const chatBox = document.getElementById('chat-box');
                    const chatDiv = document.createElement('div');
                    chatDiv.textContent = \`\${message.sender}: \${message.content}\`;
                    chatBox.appendChild(chatDiv);
                    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the bottom
                }
            </script>
        </body>
        </html>
    `);
});

// Handle user connection
io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('join', (username) => {
        socket.username = username;
        io.emit('userStatus', { username, status: 'online' });
    });

    socket.on('disconnect', () => {
        const username = socket.username;
        io.emit('userStatus', { username, status: 'offline' });
        console.log('User disconnected');
    });

    socket.on('sendMessage', (data) => {
        io.emit('receiveMessage', data);
    });

    socket.on('typing', (data) => {
        io.emit('typingStatus', data);
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
