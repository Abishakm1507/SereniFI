// Initial user profile data
let userProfile = {
    firstName: 'Lily',
    lastName: 'James',
    email: 'lilyjames@gmail.com',
    address: '33062 Zboncak Isle',
    city: 'Mehrab',
    state: 'Bozorgi',
    contact: '58077.79',
    avatar: '/assets/profile.jpg'
};

// Function to update profile data
function updateProfile(event) {
    event.preventDefault();
    
    // Get form values
    userProfile = {
        firstName: document.getElementById('firstname').value || userProfile.firstName,
        lastName: document.getElementById('lastname').value || userProfile.lastName,
        email: document.getElementById('email').value || userProfile.email,
        address: document.getElementById('address').value || userProfile.address,
        city: document.getElementById('city').value || userProfile.city,
        state: document.getElementById('state').value || userProfile.state,
        contact: document.getElementById('contact').value || userProfile.contact,
        avatar: userProfile.avatar
    };

    // Update profile display across the site
    updateProfileDisplay();
    
    // Save to localStorage for persistence
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Show success message
    alert('Profile updated successfully!');
}

// Function to load profile data
function loadProfile() {
    // Try to get saved profile from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
    }
    
    // Fill form fields with current data
    document.getElementById('firstname').value = userProfile.firstName;
    document.getElementById('lastname').value = userProfile.lastName;
    document.getElementById('email').value = userProfile.email;
    document.getElementById('address').value = userProfile.address;
    document.getElementById('city').value = userProfile.city;
    document.getElementById('state').value = userProfile.state;
    document.getElementById('contact').value = userProfile.contact;
    
    // Update profile display
    updateProfileDisplay();
}

// Function to update profile display across the site
function updateProfileDisplay() {
    // Update header profile name
    const headerName = document.querySelector('h1');
    if (headerName) {
        headerName.textContent = `Hello, ${userProfile.firstName}!`;
    }
    
    // Update all profile images
    const profileImages = document.querySelectorAll('.profile-pic img, .profile-avatar img');
    profileImages.forEach(img => {
        img.src = userProfile.avatar;
        img.alt = `${userProfile.firstName} ${userProfile.lastName}`;
    });
}

// Function to handle profile picture change
function handleProfilePictureChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            userProfile.avatar = e.target.result;
            updateProfileDisplay();
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
        };
        reader.readAsDataURL(file);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load saved profile data
    loadProfile();
    
    // Add form submit handler
    const form = document.querySelector('form');
    form.addEventListener('submit', updateProfile);
    
    // Add profile picture change handler
    const editIcon = document.querySelector('.edit-icon');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', handleProfilePictureChange);
    document.body.appendChild(fileInput);
    
    editIcon.addEventListener('click', () => fileInput.click());
    
    // Add cancel button handler
    const cancelButton = document.querySelector('.btn-cancel');
    cancelButton.addEventListener('click', () => {
        loadProfile(); // Reset form to saved values
    });
});
