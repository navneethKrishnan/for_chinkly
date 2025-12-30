// State Management
const stages = ['stage-heart', 'stage-cards', 'stage-gift', 'stage-coupon', 'stage-moments', 'stage-greeting'];
let currentStageIndex = 0;

// AUDIO LOGIC
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-toggle');
let isPlaying = false;

function toggleMusic() {
    if (isPlaying) {
        music.pause();
        musicBtn.innerText = '🔇';
    } else {
        music.play();
        musicBtn.innerText = '🎵';
    }
    isPlaying = !isPlaying;
}

musicBtn.addEventListener('click', toggleMusic);

// Try to auto-play on first user interaction (since browsers block direct auto-play)
document.body.addEventListener('click', () => {
    if (!isPlaying) {
        music.volume = 0.5;
        music.play().then(() => {
            isPlaying = true;
            musicBtn.innerText = '🎵';
        }).catch(e => console.log("Audio play blocked", e));
    }
}, { once: true }); // Only try once

function nextStage() {
    const currentInfo = stages[currentStageIndex];
    const currentEl = document.getElementById(currentInfo);

    // Fade out
    currentEl.classList.remove('active');

    // Wait for transition
    setTimeout(() => {
        currentEl.style.display = 'none';

        currentStageIndex++;
        if (currentStageIndex < stages.length) {
            const nextInfo = stages[currentStageIndex];
            const nextEl = document.getElementById(nextInfo);
            nextEl.style.display = 'flex';
            // Slight delay to allow display:flex to apply before opacity transition
            setTimeout(() => {
                nextEl.classList.add('active');

                // Init specific stage logic if needed
                if (nextInfo === 'stage-cards') initCards();
                if (nextInfo === 'stage-moments') initMoments();
            }, 50);
        }
    }, 500);
}

// STAGE 1: HEART HOLD LOGIC
const heartCircle = document.querySelector('.heart-circle');
const progressRing = document.querySelector('.progress-ring');
const radius = progressRing.r.baseVal.value;
const circumference = radius * 2 * Math.PI;

progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
progressRing.style.strokeDashoffset = circumference;

let holdTimer;
let progress = 0;
let isHolding = false;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;
}

function startHolding() {
    isHolding = true;
    clearInterval(holdTimer);
    holdTimer = setInterval(() => {
        if (progress < 100) {
            progress += 2; // Speed of fill
            setProgress(progress);
        } else {
            successHold();
        }
    }, 20);
}

function stopHolding() {
    isHolding = false;
    clearInterval(holdTimer);
    // Optional: Reset if released? Or keep progress? Let's reset for difficulty
    const resetTimer = setInterval(() => {
        if (!isHolding && progress > 0) {
            progress -= 5;
            setProgress(progress);
        } else {
            clearInterval(resetTimer);
        }
    }, 10);
}

function successHold() {
    clearInterval(holdTimer);
    isHolding = false;
    // Trigger Success Animation?
    heartCircle.style.transform = "scale(1.2)";
    setTimeout(() => {
        nextStage(); // GO TO CARDS
    }, 500);
}

// Touch/Mouse Events for Heart
heartCircle.addEventListener('mousedown', startHolding);
heartCircle.addEventListener('mouseup', stopHolding);
heartCircle.addEventListener('mouseleave', stopHolding);
heartCircle.addEventListener('touchstart', (e) => { e.preventDefault(); startHolding(); });
heartCircle.addEventListener('touchend', stopHolding);


// STAGE 2: CARDS LOGIC
function initCards() {
    const stackContainer = document.getElementById('cards-stack');
    const cardContents = [
        "Remember when...? 💭",
        "That funny joke! 😂",
        "Our late night calls 🌙"
    ];

    // Create cards securely
    stackContainer.innerHTML = ''; // Clear previous if any
    cardContents.forEach((text, i) => {
        const card = document.createElement('div');
        card.className = 'stack-card';
        card.innerText = text;
        card.style.zIndex = cardContents.length - i;

        // Random slight rotation for messy stack look
        const rot = (Math.random() * 10) - 5;
        card.style.transform = `rotate(${rot}deg)`;

        card.addEventListener('click', () => {
            // Fly out animation
            card.style.transform = `translate(200px, -50px) rotate(45deg)`;
            card.style.opacity = '0';
            setTimeout(() => {
                card.remove();
                if (stackContainer.children.length === 0) {
                    setTimeout(nextStage, 500); // GO TO GIFT
                }
            }, 300);
        });

        stackContainer.appendChild(card);
    });
}

// STAGE 3: GIFT LOGIC
document.getElementById('gift-box-trigger').addEventListener('click', () => {
    // Open lid animation
    document.querySelector('.lid').style.transform = 'translateY(-40px) rotate(-10deg)';
    setTimeout(() => {
        nextStage(); // GO TO COUPON
    }, 800);
});

// STAGE 4: COUPON LOGIC
document.getElementById('coupon-trigger').addEventListener('click', () => {
    nextStage(); // GO TO MOMENTS
});

// BACKGROUND HEARTS
function createHearts() {
    const container = document.getElementById('floating-hearts');
    const heartCount = 20;
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.className = 'float-heart';
        heart.innerText = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = (Math.random() * 2 + 1) + 'rem';
        heart.style.animationDuration = (Math.random() * 10 + 10) + 's'; // 10-20s slow
        heart.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(heart);
    }
}
createHearts(); // Init background

// STAGE 5: MOMENTS LOGIC (STACKED)
function initMoments() {
    const list = document.getElementById('gallery-list');

    // Real images from project folder
    const images = [
        "20250118_130051.jpg",
        "20250118_130055.jpg",
        "20250118_131507.jpg",
        "20250122_182445.jpg",
        "20250511_140558.jpg",
        "20250609_185119.jpg",
        "20250706_154925.jpg",
        "20250706_154959.jpg",
        "DSC6021.JPG",
        "_DSC6021.JPG",
        "IMG_20241111_184837.jpg",
        "20250912_122210.jpg",
        "20250912_132703.jpg",
        "20250912_134659.jpg",
        "Snapchat-145212049.jpg"
    ];

    list.innerHTML = '';

    // Reverse for Z-Index stacking (first in array is bottom, last is top)
    // Wait, usually first array item is first to be seen?
    // If we stack, HTML append order: last appended is on top usually (unless z-index).
    // Let's explicitly control Z-index. 
    // We want the Start of the array to be the TOP card.

    let activeCards = images.length;

    images.forEach((imgSrc, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-item';

        // Z-Index: 0th item = Highest Z (max - 0)
        div.style.zIndex = images.length - index;

        // Use Image tag
        const img = document.createElement('img');
        img.src = imgSrc;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '2px';
        img.style.pointerEvents = 'none';
        div.appendChild(img);

        // Random rotation for messy stack
        const randomRot = Math.random() * 10 - 5;
        div.style.transform = `rotate(${randomRot}deg)`;

        // Interaction: Click Top Card
        div.addEventListener('click', () => {
            // Only allow clicking the top-most visible card?
            // Since they are stacked, pointer events will hit the top one anyway.

            // Random direction
            const dir = Math.random() > 0.5 ? 'fade-right' : 'fade-left';
            div.classList.add(dir); // Animates out

            setTimeout(() => {
                div.style.display = 'none';
                activeCards--;
                if (activeCards === 0) {
                    revealSurprise();
                }
            }, 800);
        });

        list.appendChild(div);
    });

    // Secret Button (Hidden initially)
    const btn = document.createElement('button');
    btn.className = 'next-btn mystery-btn';
    btn.innerHTML = "Click to see your surprise ✨";
    btn.addEventListener('click', () => {
        nextStage();
    });

    list.appendChild(btn);

    function revealSurprise() {
        btn.classList.add('visible');
    }
}

// STAGE 6: GREETING CARD LOGIC
const greetingCard = document.getElementById('greeting-card');
greetingCard.addEventListener('click', () => {
    greetingCard.classList.toggle('open');
});




