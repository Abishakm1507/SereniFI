// Music player state
let currentTrack = null;
let isPlaying = false;
let audio = new Audio();

// Music data
const tracks = [
    {
        title: "Lofi Study",
        artist: "FASSounds",
        duration: "2:32",
        url: "https://www.chosic.com/wp-content/uploads/2021/04/And-So-It-Begins-Inspired-By-Crush-Sometimes.mp3",
        cover: "https://images.pexels.com/photos/7130560/pexels-photo-7130560.jpeg"
    },
    {
        title: "Chill Lofi",
        artist: "Lofi_hour",
        duration: "2:18",
        url: "https://www.chosic.com/wp-content/uploads/2021/07/The-Epic-Hero-Epic-Cinematic-Keys-of-Moon-Music.mp3",
        cover: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg"
    },
    {
        title: "Lofi Hip Hop",
        artist: "FASSounds",
        duration: "2:00",
        url: "https://www.chosic.com/wp-content/uploads/2021/07/purrple-cat-equinox.mp3",
        cover: "https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg"
    },
    {
        title: "Calm Piano",
        artist: "SergeQuadrado",
        duration: "3:12",
        url: "https://www.chosic.com/wp-content/uploads/2021/04/April-Showers.mp3",
        cover: "https://images.pexels.com/photos/1631677/pexels-photo-1631677.jpeg"
    },
    {
        title: "Relaxing Lofi",
        artist: "Dream-Protocol",
        duration: "2:45",
        url: "https://www.chosic.com/wp-content/uploads/2021/07/Raindrops-on-window.mp3",
        cover: "https://images.pexels.com/photos/1366957/pexels-photo-1366957.jpeg"
    },
    {
        title: "Dreamy Beats",
        artist: "Lofi_hour",
        duration: "2:10",
        url: "https://cdn.pixabay.com/audio/2023/09/16/audio_7c03c85f0f.mp3",
        cover: "https://images.pexels.com/photos/1257860/pexels-photo-1257860.jpeg"
    },
    {
        title: "Meditation Ambient",
        artist: "Dream-Protocol",
        duration: "3:05",
        url: "https://cdn.pixabay.com/audio/2023/09/16/audio_8a41c45d06.mp3",
        cover: "https://images.pexels.com/photos/3560168/pexels-photo-3560168.jpeg"
    },
    {
        title: "Night City Lofi",
        artist: "FASSounds",
        duration: "2:55",
        url: "https://cdn.pixabay.com/audio/2023/09/24/audio_c3d02aa71d.mp3",
        cover: "https://images.pexels.com/photos/316902/pexels-photo-316902.jpeg"
    },
    {
        title: "Peaceful Piano",
        artist: "Dream-Protocol",
        duration: "2:30",
        url: "https://cdn.pixabay.com/audio/2023/09/16/audio_8a41c45d06.mp3",
        cover: "https://images.pexels.com/photos/164769/pexels-photo-164769.jpeg"
    },
    {
        title: "Rainy Day Lofi",
        artist: "Lofi_hour",
        duration: "2:22",
        url: "https://cdn.pixabay.com/audio/2023/09/16/audio_79c91c3b14.mp3",
        cover: "https://images.pexels.com/photos/1755683/pexels-photo-1755683.jpeg"
    }
];

// Initialize player
document.addEventListener('DOMContentLoaded', () => {
    initializePlayer();
    // Set initial volume
    audio.volume = 0.5;
    // Add error handling
    audio.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
        alert('Error playing this track. Please try another one.');
    });
});

function initializePlayer() {
    // Populate music grid
    const musicGrid = document.querySelector('.music-grid');
    musicGrid.innerHTML = ''; // Clear existing content
    
    tracks.forEach((track, index) => {
        const musicItem = document.createElement('div');
        musicItem.className = 'music-item';
        musicItem.innerHTML = `
            <div class="image-c">
                <img src="${track.cover}" alt="${track.title}">
                <button class="play-button" data-index="${index}"></button>
            </div>
            <div class="info">
                <h4>${track.title}</h4>
                <p class="artist-name">${track.artist}</p>
            </div>
        `;
        musicGrid.appendChild(musicItem);
    });

    // Set up play buttons
    const playButtons = document.querySelectorAll('.play-button');
    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.dataset.index);
            playTrack(index);
        });
    });

    // Set up main player controls
    const playPauseBtn = document.querySelector('.play-pause');
    const nextBtn = document.querySelector('.fa-step-forward').parentElement;
    const prevBtn = document.querySelector('.fa-step-backward').parentElement;
    const songBar = document.querySelector('.song-bar input');
    const volumeBar = document.querySelector('.volume-bar input');

    playPauseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        togglePlayPause();
    });

    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        playNext();
    });

    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        playPrevious();
    });

    songBar.addEventListener('input', updateProgress);
    volumeBar.addEventListener('input', updateVolume);

    // Audio event listeners
    audio.addEventListener('timeupdate', updateProgressBar);
    audio.addEventListener('ended', playNext);
    
    // Update Top Charts section
    updateTopCharts();
}

function updateTopCharts() {
    const topChartsContainer = document.querySelector('.latest-release-body');
    topChartsContainer.innerHTML = ''; // Clear existing content
    
    // Display top 5 tracks
    tracks.slice(0, 5).forEach((track, index) => {
        const entry = document.createElement('div');
        entry.className = 'latest-release-entry flex-space';
        entry.innerHTML = `
            <div class="latest-release-image">
                <img src="${track.cover}" alt="${track.title}">
            </div>
            <div class="latest-release-info">
                <p><b>${track.title}</b></p>
                <p class="latest-release-sub">${track.artist}</p>
            </div>
            <div class="latest-release-options">
                <i class="fa fa-sort-desc" aria-hidden="true"></i>
                <p class="latest-release-sub">${track.duration}</p>
            </div>
        `;
        
        // Add click event to play the track
        entry.addEventListener('click', () => playTrack(index));
        
        topChartsContainer.appendChild(entry);
    });
}

function playTrack(index) {
    if (currentTrack === index && isPlaying) {
        pauseTrack();
    } else {
        if (currentTrack !== index) {
            currentTrack = index;
            audio.src = tracks[index].url;
        }
        audio.play()
            .then(() => {
                isPlaying = true;
                updatePlayerInfo();
                updatePlayPauseIcon();
            })
            .catch(error => {
                console.error('Error playing track:', error);
                alert('Unable to play this track. Please try another one.');
            });
    }
}

function pauseTrack() {
    audio.pause();
    isPlaying = false;
    updatePlayPauseIcon();
}

function togglePlayPause() {
    if (currentTrack === null) {
        playTrack(0);
    } else if (isPlaying) {
        pauseTrack();
    } else {
        playTrack(currentTrack);
    }
}

function playNext() {
    const nextTrack = (currentTrack + 1) % tracks.length;
    playTrack(nextTrack);
}

function playPrevious() {
    const prevTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    playTrack(prevTrack);
}

function updateProgressBar() {
    const songBar = document.querySelector('.song-bar input');
    const currentTime = document.querySelector('.music-bar p:first-child');
    const duration = document.querySelector('.music-bar p:last-child');

    const current = formatTime(audio.currentTime);
    const total = formatTime(audio.duration);

    songBar.value = (audio.currentTime / audio.duration) * 100 || 0;
    currentTime.textContent = current;
    duration.textContent = total;
}

function updateProgress(e) {
    const time = (e.target.value / 100) * audio.duration;
    audio.currentTime = time;
}

function updateVolume(e) {
    audio.volume = e.target.value / 100;
}

function updatePlayerInfo() {
    const track = tracks[currentTrack];
    document.querySelector('.music-info-song-name').textContent = track.title;
    document.querySelector('.music-info-sub').textContent = track.artist;
    document.querySelector('.music-info-image img').src = track.cover;
}

function updatePlayPauseIcon() {
    const icon = document.querySelector('.play-pause i');
    icon.className = isPlaying ? 'fa fa-pause-circle-o' : 'fa fa-play-circle-o';
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
