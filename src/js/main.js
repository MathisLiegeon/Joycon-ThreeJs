gsap.registerPlugin(ScrollTrigger);

//
//
//
//
// ===================================================== BUTTON DISCOVER ===================================================== //
const btnDiscover = document.querySelector(".btn-discover");

gsap.to(btnDiscover, {
  y: 500,
  opacity: 0,
  ease: "power2.Out",
  scrollTrigger: {
    trigger: btnDiscover,
    start: "top 50%",
    end: "bottom 30%",
    toggleActions: "play none none reverse",
    // markers : true,
    scrub: 0.5,
  },
});

btnDiscover.addEventListener("click", () => {
  window.scrollBy({
    top: 1700, // Descend d'une hauteur d'écran
    behavior: "smooth",
  });
});

//
//
//
//
// ===================================================== SMOOTH SCROLL ===================================================== //
let scrollTarget = window.scrollY;
let scrollPos = window.scrollY;

window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault(); // empêche le saut brut
    scrollTarget += e.deltaY * 1; // multiplier = intensité / sensation
    animateScroll();
  },
  { passive: false }
);

function animateScroll() {
  gsap.to(window, {
    scrollTo: scrollTarget,
    duration: 0.2, // durée de l’inertie
    ease: "power2.out", // easing "smooth"
    overwrite: "auto",
  });
}
