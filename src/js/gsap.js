gsap.registerPlugin(ScrollTrigger);

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
    top: 3700, // Descend d'une hauteur d'écran
    behavior: "smooth",
  });
});
