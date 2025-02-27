console.log("lets write some js");

let currentAudio = null;    // Stores the currently playing audio
let currentTrack = null;    // Stores the name of the currently playing track
let songs = [];             // Stores the list of songs
let currentSongIndex = 0;   // Keeps track of the current song index
let isPlaying = false;      // Indicates if the audio is playing

async function getSongs() {
    try {
        let response = await fetch("http://127.0.0.1:3000/songs/");
        let text = await response.text();
        let div = document.createElement("div");
        div.innerHTML = text;
        
        let as = div.getElementsByTagName("a");
        let songList = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songList.push(decodeURIComponent(element.href.split("/").pop()));
            }
        }
        return songList;
    } catch (error) {
        console.error("Failed to fetch songs:", error);
        return [];
    }
}

function updateSongTime() {
    if (currentAudio) {
        const currentTime = currentAudio.currentTime;
        const duration = currentAudio.duration;
        const timeElement = document.querySelector(".song-time");
        const circle = document.querySelector(".circle");
        const seekbar = document.querySelector(".seekbar");

        if (timeElement) {
            timeElement.textContent = `${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')} / ${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`;
        }

        // Update the circle position and fill it with white as the song progresses
        if (circle && seekbar) {
            const progressPercent = (currentTime / duration) * 100;
            circle.style.left = `calc(${progressPercent}% - 10px)`; // Move circle based on progress
            seekbar.style.background = `linear-gradient(to right, white ${progressPercent}%, #ccc ${progressPercent}%)`; // Fill the seekbar
        }
    }
}

function playMusic(track) {
    let path = "/songs/" + encodeURIComponent(track);
    console.log("Attempting to play:", path);

    if (currentAudio && currentTrack === track) {
        currentAudio.pause();
        isPlaying = false;
        currentAudio = null;
        currentTrack = null;
    } else {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        currentAudio = new Audio(path);
        currentAudio.play().catch(error => {
            console.error("Error playing the track:", error);
        });
        isPlaying = true;
        currentTrack = track;

        currentAudio.addEventListener("timeupdate", updateSongTime);
        currentAudio.addEventListener("ended", playNextSong);
    }
    updatePlayButton();
}

function updatePlayButton() {
    const playButton = document.getElementById("playBtn");
    playButton.textContent = isPlaying ? "⏸️" : "▶️";
}

function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playMusic(songs[currentSongIndex]);
}

function playPreviousSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playMusic(songs[currentSongIndex]);
}

async function main() {
    songs = await getSongs();
    let songUL = document.querySelector(".songList ul");

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img src="music.svg">
            <div class="info">
                <div class="song-info">${song}</div>
                <div>Riya</div>
            </div>
            <div class="play">
                <span>Play Now</span>
                <img src="play.svg">
            </div>
        </li>`;
    }

    document.querySelectorAll(".songList li").forEach((e, index) => {
        e.addEventListener("click", () => {
            currentSongIndex = index;
            let trackName = e.querySelector(".song-info").innerText.trim();
            playMusic(trackName);
        });
    });

    document.querySelector("#playBtn").addEventListener("click", () => {
        if (currentAudio) {
            if (isPlaying) {
                currentAudio.pause();
                isPlaying = false;
            } else {
                currentAudio.play();
                isPlaying = true;
            }
        } else if (songs.length > 0) {
            playMusic(songs[currentSongIndex]);
        }
        updatePlayButton();
    });

    document.querySelector("#nextBtn").addEventListener("click", playNextSong);
    document.querySelector("#backBtn").addEventListener("click", playPreviousSong);
}
let isDragging = false;

function updateSongTime() {
    if (currentAudio && !isDragging) { // Only update when not dragging
        const currentTime = currentAudio.currentTime;
        const duration = currentAudio.duration;
        const timeElement = document.querySelector(".song-time");
        const circle = document.querySelector(".circle");
        const seekbar = document.querySelector(".seekbar");

        if (timeElement) {
            timeElement.textContent = `${Math.floor(currentTime / 60)}:${Math.floor(currentTime % 60).toString().padStart(2, '0')} / ${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`;
        }

        if (circle && seekbar) {
            const progressPercent = (currentTime / duration) * 100;
            circle.style.left = `calc(${progressPercent}% - 10px)`;
            seekbar.style.background = `linear-gradient(to right, white ${progressPercent}%, #ccc ${progressPercent}%)`;
        }
    }
}

// Add drag functionality to the circle
function enableDrag() {
    const circle = document.querySelector(".circle");
    const seekbar = document.querySelector(".seekbar");

    let seekbarRect, seekbarWidth;

    circle.addEventListener("mousedown", (e) => {
        isDragging = true;
        seekbarRect = seekbar.getBoundingClientRect();
        seekbarWidth = seekbarRect.width;
        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", stopDrag);
    });

    function onDrag(e) {
        if (isDragging && currentAudio) {
            const offsetX = e.clientX - seekbarRect.left;
            const clampedOffsetX = Math.max(0, Math.min(offsetX, seekbarWidth)); // Clamp within seekbar width
            const progressPercent = (clampedOffsetX / seekbarWidth) * 100;
            const newTime = (progressPercent / 100) * currentAudio.duration;

            circle.style.left = `calc(${progressPercent}% - 10px)`;
            seekbar.style.background = `linear-gradient(to right, white ${progressPercent}%, #ccc ${progressPercent}%)`;
            
            // Update audio current time without playing
            currentAudio.currentTime = newTime;
            updateSongTime();
        }
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener("mousemove", onDrag);
        document.removeEventListener("mouseup", stopDrag);
    }
}



main();
enableDrag();