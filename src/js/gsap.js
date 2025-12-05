gsap.registerPlugin(ScrollTrigger);

const btnDiscover = document.querySelector(".btn-discover");

gsap.to(btnDiscover, {
    y : 500,
    opacity : 0,
    ease: "ease",
    scrollTrigger : {
        trigger : btnDiscover,
        start : "top 50%",
        end : "bottom 30%",
        toggleActions: "play none none reverse",
        // markers : true,
        scrub: 1,
    }
})

btnDiscover.addEventListener("click", () => {
    window.scrollBy({
        top: window.innerHeight, // Descend d'une hauteur d'écran
        behavior: "smooth"
    });
});