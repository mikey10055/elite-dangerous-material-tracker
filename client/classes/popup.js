export function showPopupMessage(message, duration = 5000) {
    // Ensure container exists
    let container = document.getElementById("popup-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "popup-container";
        document.body.appendChild(container);
    }

    // Create the popup element
    const popup = document.createElement("div");
    popup.classList.add("popup-message");
    popup.innerText = message;

    container.appendChild(popup);

    // Apply 'show' class for animation
    setTimeout(() => popup.classList.add("show"), 100);

    // Remove popup after duration
    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => popup.remove(), 500);
    }, duration);
}

// Example usage
showPopupMessage("Mission Updated: Proceed to designated waypoint.");
setTimeout(() => showPopupMessage("Incoming Transmission: New contract available."), 2000);
setTimeout(() => showPopupMessage("Warning: Ship integrity at 50%"), 4000);
