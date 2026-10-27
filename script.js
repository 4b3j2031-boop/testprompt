const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");

menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "開啟導覽選單" : "關閉導覽選單");
    siteNav.classList.toggle("is-open", !isExpanded);
});

siteNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "開啟導覽選單");
        siteNav.classList.remove("is-open");
    }
});

const showDate = new Date(2026, 11, 6);
const today = new Date();
today.setHours(0, 0, 0, 0);
document.getElementById("countdown").textContent = Math.max(
    0,
    Math.ceil((showDate.getTime() - today.getTime()) / 86400000)
);

const trackAudio = document.getElementById("track-audio");
const playButton = document.getElementById("play-button");
const playLabel = document.getElementById("play-label");
const seekBar = document.getElementById("seek-bar");
const elapsedLabel = document.getElementById("elapsed");
const durationLabel = document.getElementById("duration-label");
const trackDuration = document.getElementById("track-duration");
const playerMessage = document.getElementById("player-message");
const waveform = document.querySelector(".waveform");

const barHeights = [
    7, 11, 18, 13, 22, 9, 15, 27, 18, 12, 23, 9, 16, 29, 20, 12, 18, 25, 9, 15,
    22, 12, 28, 17, 10, 20, 25, 13, 19, 9, 26, 16, 11, 22, 29, 15, 8, 19, 24, 12,
    17, 27, 10, 21, 14, 25, 11, 18, 30, 13, 21, 9, 16, 24, 12, 19, 28, 14, 10, 22
];

barHeights.forEach((height) => {
    const bar = document.createElement("i");
    bar.style.height = `${height}px`;
    waveform.append(bar);
});

function formatTime(seconds) {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function setPlaying(isPlaying) {
    playButton.classList.toggle("is-playing", isPlaying);
    playButton.setAttribute("aria-pressed", String(isPlaying));
    playButton.setAttribute("aria-label", isPlaying ? "暫停試聽" : "播放試聽");
    playLabel.textContent = isPlaying ? "暫停試聽" : "播放試聽";
}

function updatePlayer() {
    const currentTime = trackAudio.currentTime || 0;
    const totalDuration = Number.isFinite(trackAudio.duration) ? trackAudio.duration : 0;
    if (totalDuration > 0) {
        seekBar.max = String(totalDuration);
        trackDuration.textContent = formatTime(totalDuration);
        durationLabel.textContent = formatTime(totalDuration);
    }

    const progress = totalDuration > 0 ? Math.min(100, (currentTime / totalDuration) * 100) : 0;
    seekBar.value = String(currentTime);
    seekBar.style.background = `linear-gradient(90deg, #a8caff 0%, #a8caff ${progress}%, rgba(175, 198, 228, .24) ${progress}%)`;
    elapsedLabel.textContent = formatTime(currentTime);
    waveform.querySelectorAll("i").forEach((bar, index) => {
        bar.classList.toggle("played", index / barHeights.length <= progress / 100);
    });
}

playButton.addEventListener("click", async () => {
    if (trackAudio.paused) {
        try {
            await trackAudio.play();
        } catch (error) {
            playerMessage.textContent = "無法播放音訊，請確認檔案存在且瀏覽器允許播放。";
            console.error("Unable to play the local Sudden Shower audio file.", error);
        }
        return;
    }

    trackAudio.pause();
});

seekBar.addEventListener("input", () => {
    if (!Number.isFinite(trackAudio.duration)) {
        return;
    }
    trackAudio.currentTime = Number(seekBar.value);
    updatePlayer();
});

trackAudio.addEventListener("loadedmetadata", updatePlayer);
trackAudio.addEventListener("timeupdate", updatePlayer);
trackAudio.addEventListener("play", () => {
    setPlaying(true);
    playerMessage.textContent = "正在播放《Sudden Shower》· ECLIPSE";
});
trackAudio.addEventListener("pause", () => {
    setPlaying(false);
    if (!trackAudio.ended) {
        playerMessage.textContent = "已暫停，可以拖曳進度繼續聆聽。";
    }
});
trackAudio.addEventListener("ended", () => {
    setPlaying(false);
    trackAudio.currentTime = 0;
    updatePlayer();
    playerMessage.textContent = "歌曲播放完畢。";
});
trackAudio.addEventListener("error", () => {
    setPlaying(false);
    playerMessage.textContent = "無法載入音訊檔，請確認 music 資料夾內的 MP3 檔案。";
    console.error("Unable to load the local Sudden Shower audio file.", trackAudio.error);
});

updatePlayer();
