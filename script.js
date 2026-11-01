
// Dynamic copyright year

document.getElementById("year").textContent =
    new Date().getFullYear();


// State Dropdown

const stateDropdown = document.getElementById("stateDropdown");
const stateBtn = document.getElementById("stateBtn");

stateBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    const isOpen = stateDropdown.classList.toggle("active");

    stateBtn.setAttribute("aria-expanded", isOpen);

});


// Close dropdown when clicking outside

document.addEventListener("click", function (event) {

    if (!stateDropdown.contains(event.target)) {

        stateDropdown.classList.remove("active");

        stateBtn.setAttribute("aria-expanded", "false");

    }

});


// Close dropdown using Escape key

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        stateDropdown.classList.remove("active");

        stateBtn.setAttribute("aria-expanded", "false");

        stateBtn.focus();

    }

});


// Close dropdown after selecting a location

document.querySelectorAll(".dropdown-list a").forEach(link => {

    link.addEventListener("click", function () {

        stateDropdown.classList.remove("active");

        stateBtn.setAttribute("aria-expanded", "false");

    });

});
