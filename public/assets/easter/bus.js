// busParade.js

// bussecret word detection
let buskeys = [];
const bussecret = "ava";

document.addEventListener("keydown", (e) => {
  buskeys.push(e.key.toLowerCase());
  buskeys = buskeys.slice(-bussecret.length);

  if (buskeys.join("") === bussecret) {
    startBusParade();
    // Optional: redirect (uncomment if needed)
    // window.location.href = "https://admin.skyhawk-cap.org/";
  }
});

function startBusParade() {
  lockUserInteraction();

  // Prevent multiple starts
  if (document.getElementById("busAudio")) return;

  // Ensure body exists
  if (!document.body) return setTimeout(startBusParade, 100);

  // --- Style body ---
  document.body.style.margin = "0";
  document.body.style.height = "100vh";
  document.body.style.overflow = "hidden";
  document.body.style.position = "relative";
  document.body.style.background = "white";

  // --- Create audio ---
  const audio = document.createElement("audio");
  audio.id = "busAudio";
  audio.src = "https://skyhawk-cap.org/assets/easter/WheelsontheBus.mp3";
  audio.currentTime = 28;
  audio.autoplay = true;
  audio.loop = false;
  document.body.appendChild(audio);

  // --- Bus SVG template ---
  const BUS_SVG = `
<svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M859.8 449.4H706.6l-30.4-37.1 30.4-46.2v-54c0-21.3-17.4-38.8-38.8-38.8H122.7c-21.3 0-38.8 17.4-38.8 38.8v316.6c0 21.3 17.4 38.8 38.8 38.8h813.6V525.9c0-42.3-34.2-76.5-76.5-76.5z" fill="#FFB819"></path><path d="M83.9 315.8h622.7v29.1H83.9zM706.6 512.9H131.7c-8 0-14.5-6.5-14.5-14.5s6.5-14.5 14.5-14.5h574.9c8 0 14.5 6.5 14.5 14.5s-6.5 14.5-14.5 14.5zM706.6 556.2H131.7c-8 0-14.5-6.5-14.5-14.5s6.5-14.5 14.5-14.5h574.9c8 0 14.5 6.5 14.5 14.5s-6.5 14.5-14.5 14.5zM131.7 674.2c0 7.5-6.1 13.6-13.6 13.6H72.9c-7.5 0-13.6-6.1-13.6-13.6v-35.4c0-7.5 6.1-13.6 13.6-13.6h45.2c7.5 0 13.6 6.1 13.6 13.6v35.4zM961.7 674.2c0 7.5-6.1 13.6-13.6 13.6h-39.3c-7.5 0-13.6-6.1-13.6-13.6v-35.4c0-7.5 6.1-13.6 13.6-13.6h39.3c7.5 0 13.6 6.1 13.6 13.6v35.4z" fill="#333E48"></path><path d="M823.8 667.5c0-54-43.8-97.9-97.8-97.9s-97.8 43.8-97.8 97.9h195.6z" fill=""></path><path d="M725.9 667.5m-82.8 0a82.8 82.8 0 1 0 165.6 0 82.8 82.8 0 1 0-165.6 0Z" fill="#333E48"></path><path d="M725.9 667.5m-38 0a38 38 0 1 0 76 0 38 38 0 1 0-76 0Z" fill="#D1D3D3"></path><path d="M363.9 667.5c0-54-43.8-97.9-97.8-97.9s-97.8 43.8-97.8 97.9h195.6z" fill=""></path><path d="M266.1 667.5m-82.8 0a82.8 82.8 0 1 0 165.6 0 82.8 82.8 0 1 0-165.6 0Z" fill="#333E48"></path><path d="M266.1 667.5m-38 0a38 38 0 1 0 76 0 38 38 0 1 0-76 0Z" fill="#D1D3D3"></path><path d="M258.1 439.7c0 5.3-4.4 9.7-9.7 9.7h-107c-5.3 0-9.7-4.4-9.7-9.7v-63.9c0-5.3 4.4-9.7 9.7-9.7h107c5.3 0 9.7 4.4 9.7 9.7v63.9zM424.2 439.7c0 5.3-4.4 9.7-9.7 9.7h-107c-5.3 0-9.7-4.4-9.7-9.7v-63.9c0-5.3 4.4-9.7 9.7-9.7h107c5.3 0 9.7 4.4 9.7 9.7v63.9z" fill="#00B3E3"></path><path d="M414.5 366.2h-107c-5.3 0-9.7 4.4-9.7 9.7v16.5c0-5.3 4.4-9.7 9.7-9.7h107c5.3 0 9.7 4.4 9.7 9.7v-16.5c0-5.4-4.4-9.7-9.7-9.7z" fill=""></path><path d="M590.3 657.9c0 5.3-4.4 9.7-9.7 9.7h-107c-5.3 0-9.7-4.4-9.7-9.7v-282c0-5.3 4.4-9.7 9.7-9.7h107c5.3 0 9.7 4.4 9.7 9.7v282z" fill="#D68231"></path><path d="M580.6 366.2h-107c-5.3 0-9.7 4.4-9.7 9.7v16.5c0-5.3 4.4-9.7 9.7-9.7h107c5.3 0 9.7 4.4 9.7 9.7v-16.5c0-5.4-4.3-9.7-9.7-9.7z" fill=""></path><path d="M706.6 449.4h-66.8c-5.3 0-9.7-4.4-9.7-9.7v-63.9c0-5.3 4.4-9.7 9.7-9.7h66.8v83.3z" fill="#00B3E3"></path><path d="M248.4 366.2h-107c-5.3 0-9.7 4.4-9.7 9.7v16.5c0-5.3 4.4-9.7 9.7-9.7h107c5.3 0 9.7 4.4 9.7 9.7v-16.5c0-5.4-4.4-9.7-9.7-9.7zM639.8 366.2c-5.3 0-9.7 4.4-9.7 9.7v16.5c0-5.3 4.4-9.7 9.7-9.7h66.8v-16.5h-66.8z" fill=""></path><path d="M504.7 586.9c-8 0-14.5-6.5-14.5-14.5v-51.7c0-8 6.5-14.5 14.5-14.5s14.5 6.5 14.5 14.5v51.7c0 8-6.5 14.5-14.5 14.5zM549.6 586.9c-8 0-14.5-6.5-14.5-14.5v-51.7c0-8 6.5-14.5 14.5-14.5s14.5 6.5 14.5 14.5v51.7c0 8-6.5 14.5-14.5 14.5zM504.7 478.6c-8 0-14.5-6.5-14.5-14.5v-51.7c0-8 6.5-14.5 14.5-14.5s14.5 6.5 14.5 14.5V464c0 8.1-6.5 14.6-14.5 14.6zM549.6 478.6c-8 0-14.5-6.5-14.5-14.5v-51.7c0-8 6.5-14.5 14.5-14.5s14.5 6.5 14.5 14.5V464c0 8.1-6.5 14.6-14.5 14.6z" fill="#FFFFFF"></path><path d="M866.9 578.1h69.4v47.1h-69.4z" fill="#00B3E3"></path><path d="M877.9 625.2h-16c-3.7 0-6.8-3-6.8-6.8v-33.6c0-3.7 3-6.8 6.8-6.8h16v47.2z" fill="#FFFFFF"></path></g></svg>`;

  const songEndTime = 3 * 60 + 20; // 3:20

  // --- Spawn first bus ---
  spawnBus(BUS_SVG);

  // --- Spawn buses every 15s until 3:20 ---
  const interval = setInterval(() => {
    if (audio.currentTime >= songEndTime) {
      clearInterval(interval);
      audio.pause();
      unlockUserInteraction();
    } else {
      spawnBus(BUS_SVG);
    }
  }, 15000);
}

function spawnBus(svg) {
  const bus = document.createElement("div");
  bus.style.position = "fixed";
bus.style.bottom = "50px";
bus.style.left = "-250px";
bus.style.width = "250px";
bus.style.zIndex = "99999";

  bus.innerHTML = svg;
  document.body.appendChild(bus);

  let pos = -250;
  const speed = 3;

  function move() {
    pos += speed;
    bus.style.left = pos + "px";
    if (pos < window.innerWidth + 250) {
      requestAnimationFrame(move);
    } else {
      bus.remove();
    }
  }
  move();
}

function lockUserInteraction() {
  // Prevent mouse / touch interactions
  document.documentElement.style.pointerEvents = "none";
  document.body.style.pointerEvents = "none";

  // Prevent text selection
  document.documentElement.style.userSelect = "none";
  document.body.style.userSelect = "none";

  // Prevent scrolling
  document.body.style.overflow = "hidden";

  // Prevent keyboard interactions except our listener
  document.addEventListener("keydown", preventKeys, true);
}

function unlockUserInteraction() {
  document.documentElement.style.pointerEvents = "";
  document.body.style.pointerEvents = "";
  document.documentElement.style.userSelect = "";
  document.body.style.userSelect = "";
  document.body.style.overflow = "";

  document.removeEventListener("keydown", preventKeys, true);
}

function preventKeys(e) {
  // Allow devtools keys if you want (optional)
  const allowed = ["f12", "escape"];
  if (!allowed.includes(e.key.toLowerCase())) {
    e.preventDefault();
    e.stopPropagation();
  }
}
