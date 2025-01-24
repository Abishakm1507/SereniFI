// Post data structure
let posts = [];
let currentUserId = 1; // Simulating logged in user

class Post {
    constructor(userId, content, userName, userImage) {
        this.id = Date.now();
        this.userId = userId;
        this.content = content;
        this.userName = userName;
        this.userImage = userImage;
        this.likes = 0;
        this.comments = [];
        this.isLiked = false;
        this.timestamp = new Date().toLocaleString();
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const sendButton = document.querySelector('.input-section button');
    const thoughtInput = document.querySelector('.input-section input');

    sendButton.addEventListener('click', () => {
        if (thoughtInput.value.trim()) {
            createPost(thoughtInput.value);
            thoughtInput.value = '';
        }
    });
});

function createPost(content) {
    const post = new Post(
        currentUserId,
        content,
        'Current User',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi-uWmGZzXDkNitp5ZYQV8bFhr7wkKdvEHBw&s'
    );
    posts.unshift(post);
    displayPosts();
}

function displayPosts() {
    const feedSection = document.querySelector('.feed-section');
    const postsHTML = posts.map(post => `
        <div class="post" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${post.userImage}" alt="${post.userName}" class="post-avatar">
                <div class="post-info">
                    <h4>${post.userName}</h4>
                    <span class="timestamp">${post.timestamp}</span>
                </div>
            </div>
            <div class="post-content">
                ${post.content}
            </div>
            <div class="post-actions">
                <button class="like-btn ${post.isLiked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                    👍 ${post.likes} Likes
                </button>
                <button onclick="toggleComments(${post.id})">💬 Comments</button>
                <button onclick="sharePost(${post.id})">📤 Share</button>
            </div>
            <div class="comments-section" id="comments-${post.id}" style="display: none;">
                <div class="comments-list">
                    ${post.comments.map(comment => `
                        <div class="comment">
                            <img src="${comment.userImage}" alt="${comment.userName}" class="comment-avatar">
                            <div class="comment-content">
                                <strong>${comment.userName}</strong>
                                <p>${comment.text}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="add-comment">
                    <input type="text" placeholder="Add a comment..." id="comment-input-${post.id}">
                    <button onclick="addComment(${post.id})">Post</button>
                </div>
            </div>
        </div>
    `).join('');

    // Insert posts after the input section
    const inputSection = feedSection.querySelector('.input-section');
    const existingPosts = feedSection.querySelector('.posts-container');
    
    if (existingPosts) {
        existingPosts.innerHTML = postsHTML;
    } else {
        const postsContainer = document.createElement('div');
        postsContainer.className = 'posts-container';
        postsContainer.innerHTML = postsHTML;
        inputSection.insertAdjacentElement('afterend', postsContainer);
    }
}

function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
        displayPosts();
    }
}

function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
}

function addComment(postId) {
    const post = posts.find(p => p.id === postId);
    const input = document.getElementById(`comment-input-${postId}`);
    const commentText = input.value.trim();
    
    if (post && commentText) {
        post.comments.push({
            userId: currentUserId,
            userName: 'Current User',
            userImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi-uWmGZzXDkNitp5ZYQV8bFhr7wkKdvEHBw&s',
            text: commentText
        });
        input.value = '';
        displayPosts();
    }
}

function sharePost(postId) {
    // Simulating share functionality
    alert('Post shared successfully!');
}
