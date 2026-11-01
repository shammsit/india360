
// Application Selection Popup

const applyNow = document.getElementById("applyNow");
const applyOverlay = document.getElementById("applyOverlay");
const closeModal = document.getElementById("closeModal");

// Open popup
applyNow.addEventListener("click", function(event) {
    event.preventDefault();

    applyOverlay.classList.add("active");

    document.body.style.overflow = "hidden";
});

// Close popup
function closeApplicationModal() {
    applyOverlay.classList.remove("active");

    document.body.style.overflow = "";
}

closeModal.addEventListener("click", closeApplicationModal);

// Close by clicking outside
applyOverlay.addEventListener("click", function(event) {
    if (event.target === applyOverlay) {
        closeApplicationModal();
    }
});

// Close using Escape
document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        closeApplicationModal();
    }
});
