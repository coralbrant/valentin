// Customizable configuration
const config = {
    question: "Nicos <3<br>¿Te gustaría ser mi San Valentín?",
    successMessage: "¡Lo sabía! 😊",
    successGif: "https://farm4.static.flickr.com/3262/2720527056_ce94a0ffb4_o.gif",
    yesButtonGrowthRate: 1.9, // Yes button growth factor
    noButtonShrinkFactor: 0.9 // No button shrink factor
};

// Global variables
let noButtonClicks = 0;
let yesButtonSize = 1;
let noButtonScale = 1;
let noButtonInterval = null;

// DOM elements
const proposalSection = document.getElementById('proposal-section');
const successSection = document.getElementById('success-section');
const questionText = document.getElementById('question-text');
const successMessage = document.getElementById('success-message');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const successGif = document.getElementById('success-gif');
const notification = document.getElementById('notification');

// Load custom configuration from external file
function loadConfig() {
    fetch('config/config.json')
        .then(response => response.json())
        .then(data => {
            Object.assign(config, data);
            updateContent();
        })
        .catch(error => {
            console.log('Using default configuration');
            updateContent();
        });
}

// Update content with current configuration
function updateContent() {
    questionText.innerHTML = config.question;
    successMessage.textContent = config.successMessage;
    
    if (config.successGif) {
        successGif.src = config.successGif;
    }
}

// Move Yes button randomly around screen
function moveYesButton(centerButton = false) {
    yesBtn.style.position = 'fixed';
    
    // Get the REAL rendered size of the button (includes font size and padding)
    const rect = yesBtn.getBoundingClientRect();
    const btnWidth = rect.width;
    const btnHeight = rect.height;
    
    // Page boundaries in pixels
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;
    
    let newX, newY;
    
    if (centerButton || btnWidth >= pageWidth || btnHeight >= pageHeight) {
        // Center the button on the screen (can be negative if button > screen)
        newX = (pageWidth - btnWidth) / 2;
        newY = (pageHeight - btnHeight) / 2;
    } else {
        // Random position within valid area (button fits on screen)
        const maxX = pageWidth - btnWidth;
        const maxY = pageHeight - btnHeight;
        newX = Math.random() * maxX;
        newY = Math.random() * maxY;
    }
    
    yesBtn.style.left = newX + 'px';
    yesBtn.style.top = newY + 'px';
    
    // Add bounce animation
    yesBtn.style.animation = 'bounce 0.5s ease';
    setTimeout(() => {
        yesBtn.style.animation = '';
    }, 500);
}

// Move No button inside the Yes button
function moveNoInsideYes() {
    noBtn.style.position = 'fixed';
    
    const yesRect = yesBtn.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    const noWidth = noRect.width;
    const noHeight = noRect.height;
    
    // Random position inside the Yes button bounds
    const minX = yesRect.left;
    const minY = yesRect.top;
    const maxX = yesRect.right - noWidth;
    const maxY = yesRect.bottom - noHeight;
    
    let newX, newY;
    if (maxX > minX && maxY > minY) {
        newX = minX + Math.random() * (maxX - minX);
        newY = minY + Math.random() * (maxY - minY);
    } else {
        // If NO is bigger than SI, center on top of SI
        newX = yesRect.left + (yesRect.width - noWidth) / 2;
        newY = yesRect.top + (yesRect.height - noHeight) / 2;
    }
    
    noBtn.style.left = newX + 'px';
    noBtn.style.top = newY + 'px';
    noBtn.style.zIndex = '1001';
    
    // Apply transform with current scale (no rotation when inside)
    noBtn.style.transform = `scale(${noButtonScale})`;
}

// Move No button randomly around screen, avoiding Yes button
function moveNoButton() {
    noBtn.style.position = 'fixed';
    
    const yesRect = yesBtn.getBoundingClientRect();
    const noBtnRect = noBtn.getBoundingClientRect();
    const noBtnWidth = noBtnRect.width;
    const noBtnHeight = noBtnRect.height;
    
    // Ensure button stays fully visible with margin
    const margin = 20;
    const minDistance = window.innerWidth < 480 ? 60 : 80;
    
    let tries = 0;
    let maxTries = 100;
    let found = false;
    let newX, newY;
    
    // Find a position that doesn't collide with Yes button and stays visible
    while (!found && tries < maxTries) {
        const maxX = window.innerWidth - noBtnWidth - margin;
        const maxY = window.innerHeight - noBtnHeight - margin;
        
        newX = Math.random() * (maxX - margin) + margin;
        newY = Math.random() * (maxY - margin) + margin;
        
        const testRect = {
            left: newX,
            right: newX + noBtnWidth,
            top: newY,
            bottom: newY + noBtnHeight
        };
        
        // Check collision with Yes button with minimum distance
        if (
            testRect.right < yesRect.left - minDistance ||
            testRect.left > yesRect.right + minDistance ||
            testRect.bottom < yesRect.top - minDistance ||
            testRect.top > yesRect.bottom + minDistance
        ) {
            found = true;
        }
        tries++;
    }
    
    noBtn.style.left = newX + 'px';
    noBtn.style.top = newY + 'px';
    
    // Add bounce animation and random rotation
    noBtn.style.animation = 'bounce 0.5s ease';
    setTimeout(() => {
        noBtn.style.animation = '';
    }, 500);
    const rotation = (Math.random() - 0.5) * 20;
    noBtn.style.transform = `scale(${noButtonScale}) rotate(${rotation}deg)`;
}

// Make Yes button grow by increasing font size and padding directly
function growYesButton() {
    yesButtonSize *= config.yesButtonGrowthRate;
    
    // Grow font size and padding directly (no transform scale)
    const baseFontSize = 30; // base font size in px
    const basePaddingV = 28; // base vertical padding
    const basePaddingH = 75; // base horizontal padding
    
    const newFontSize = baseFontSize * yesButtonSize;
    const newPaddingV = basePaddingV * yesButtonSize;
    const newPaddingH = basePaddingH * yesButtonSize;
    
    yesBtn.style.fontSize = newFontSize + 'px';
    yesBtn.style.padding = newPaddingV + 'px ' + newPaddingH + 'px';
    yesBtn.style.transform = 'none';
    
    const intensity = Math.min(255, 107 + (noButtonClicks * 20));
    yesBtn.style.background = `linear-gradient(45deg, #ff${intensity.toString(16)}9d, #ff8fab)`;
    yesBtn.style.boxShadow = `0 8px 25px rgba(255, 107, 157, 0.8), 0 0 20px rgba(255, 107, 157, 0.5)`;
    
    // On 5th click center it, otherwise random position
    const shouldCenter = noButtonClicks === 5;
    
    // Use requestAnimationFrame to ensure the browser has rendered the new size
    requestAnimationFrame(() => {
        moveYesButton(shouldCenter);
    });
}

// Shrink No button each time it's clicked
function shrinkNoButton() {
    // On 5th click, hide the button completely
    if (noButtonClicks === 5) {
        noBtn.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        noBtn.style.opacity = '0';
        noBtn.style.transform = 'scale(0)';
        setTimeout(() => {
            noBtn.style.display = 'none';
        }, 300);
        return;
    }

    // Shrink by factor on each click (before 5th)
    noButtonScale *= config.noButtonShrinkFactor;
    noBtn.style.transform = `scale(${noButtonScale})`;
    noBtn.style.fontSize = `${30 * noButtonScale}px`;
}

// Handle Yes button click - show success screen
function handleYesClick() {
    proposalSection.classList.add('hidden');
    document.querySelector('.buttons-container').classList.add('hide-buttons');
    noBtn.style.display = 'none';
    successSection.classList.remove('hidden');
    createConfetti();
    playSuccessSound();
}

// Handle No button click - make it harder to click
function handleNoClick() {
    noButtonClicks++;
    
    // FIRST: Clear any existing interval to stop auto-movement
    if (noButtonInterval) {
        clearInterval(noButtonInterval);
        noButtonInterval = null;
    }
    
    shrinkNoButton();
    
    // Wait for shrink to take effect, then grow YES
    setTimeout(() => {
        growYesButton();
        
        // Wait for YES to move, then position NO inside SI
        setTimeout(() => {
            moveNoInsideYes();
            
            // AFTER positioning NO inside SI, start the 1.7s timer
            noButtonInterval = setInterval(() => {
                if (!successSection.classList.contains('hidden')) {
                    clearInterval(noButtonInterval);
                    return;
                }
                if (noBtn.style.display !== 'none') {
                    moveNoButton();
                }
            }, 1700);
        }, 100);
    }, 50);
    
    // Show notification message
    const noMessages = [
        "¿Eso fue un no… o un 'convénceme'? 🤨",
        "Incluye risas garantizadas 😂",
        "Plan fino, ambiente elegante y cero estrés ✨",
        "Última oferta antes de que se buguee la página 😏",
        "Algo me dice que vas a decir que sí 😏"
    ];
    
    if (noButtonClicks <= noMessages.length) {
        showNotification(noMessages[noButtonClicks - 1]);
    }
}

// Create falling confetti animation
function createConfetti() {
    const colors = ['#ff6b9d', '#ff8fab', '#ffb6c1', '#ff69b4', '#ff1493'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        
        document.body.appendChild(confetti);
        
        // Falling animation
        const animation = confetti.animate([
            { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 3000 + 2000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        animation.onfinish = () => {
            document.body.removeChild(confetti);
        };
    }
}

// Play success sound (optional)
function playSuccessSound() {
    // Add audio file here if desired
    // const audio = new Audio('config/success.mp3');
    // audio.play().catch(e => console.log('Audio not available'));
}

// Show notification message at top
function showNotification(message) {
    notification.textContent = message;
    notification.classList.remove('hidden');
    notification.style.animation = 'slideDown 0.5s ease';
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
    }
`;
document.head.appendChild(style);

// Event listeners
yesBtn.addEventListener('click', handleYesClick);
noBtn.addEventListener('click', handleNoClick);

// Add touch support for better mobile experience
yesBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    yesBtn.style.opacity = '0.9';
});

yesBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    yesBtn.style.opacity = '1';
    handleYesClick();
});

noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    noBtn.style.transform = `scale(${noButtonScale * 1.05})`;
});

noBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    noBtn.style.transform = `scale(${noButtonScale})`;
    handleNoClick();
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    
    // Add entrance animation
    proposalSection.style.opacity = '0';
    proposalSection.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        proposalSection.style.transition = 'all 0.5s ease';
        proposalSection.style.opacity = '1';
        proposalSection.style.transform = 'translateY(0)';
    }, 100);
});

// Prevent buttons from being selected with keyboard
noBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
    }
});

yesBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
    }
});

// Add dramatic hover effect to Yes button
yesBtn.addEventListener('mouseenter', () => {
    yesBtn.style.opacity = '0.9';
});

yesBtn.addEventListener('mouseleave', () => {
    yesBtn.style.opacity = '1';
});

// Ensure buttons stay visible when window is resized
window.addEventListener('resize', () => {
    if (yesBtn.style.position === 'fixed') {
        const yesRect = yesBtn.getBoundingClientRect();
        if (yesRect.right < 0 || yesRect.left > window.innerWidth || 
            yesRect.bottom < 0 || yesRect.top > window.innerHeight) {
            moveYesButton();
        }
    }
    
    if (noBtn.style.position === 'fixed') {
        const noRect = noBtn.getBoundingClientRect();
        if (noRect.right < 0 || noRect.left > window.innerWidth || 
            noRect.bottom < 0 || noRect.top > window.innerHeight) {
            moveNoButton();
        }
    }
});

// Change success GIF on load
if (successGif) {
    successGif.src = "https://media1.tenor.com/m/Q00qNDfVO-cAAAAd/pucca-garu.gif";
} 
