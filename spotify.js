console.log("lets write some js");

let currentSong = new Audio();

// Function to fetch songs
async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songs/");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("%20")[1]);
        }
    }
    return songs;
}

// Function to play a selected song
const playMusic = (track) => {
    let audio = new Audio("/songs/" + track);
    audio.play();
    currentSong = audio; // Store the current playing audio
};

// Main function to load the songs and add event listeners
async function main() {
    let songs = await getSongs();
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];

    // Loop through the songs and add them to the list
    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img src="music.svg">
                <div class="info">
                    <div> ${song.replaceAll("%20", " ")} </div>
                    <div>Riya</div>
                </div>
                <div class="play">
                    <span>Play Now</span>
                    <img src="play.svg">
                </div>
            </li>`;
    }

    // Add event listeners for each song's play button
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.querySelector(".play").addEventListener("click", () => {
            const songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            playMusic(songName);
        });
    });
}

// Start the main function to populate songs
main();
