// JavaScript는 필요한 인터랙션을 보조하는 용도로만 최소한으로 사용
// JavaScript가 비활성화되어도 주요 콘텐츠, 내비게이션, FAQ는 사용 가능

document.documentElement.classList.add("js-enabled");

// 스크롤 시 요소가 나타나는 애니메이션
const revealTargets = document.querySelectorAll(
  "main > section .title, main > section > .container > h2, .question-container, .benefit-cards > ul > li, .student-profile, .process_card, .instructor-card, .faq-item",
);

if ("IntersectionObserver" in window) {
  revealTargets.forEach(element => element.classList.add("js-reveal"));

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -32px" },
  );

  revealTargets.forEach(element => revealObserver.observe(element));
}

// 헤더 내부 링크의 활성 상태를 클릭/스크롤 위치에 맞춰 동기화
const navLinks = [...document.querySelectorAll(".renew-header .nav-link")];
const sectionLinks = navLinks
  .map(link => {
    const selector = link.getAttribute("href");
    if (!selector?.startsWith("#")) return null;
    const section = document.querySelector(selector);
    return section ? { link, section } : null;
  })
  .filter(Boolean);

function setActiveNav(targetLink) {
  navLinks.forEach(link => {
    const active = link === targetLink;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

sectionLinks.forEach(({ link }) => {
  link.addEventListener("click", () => setActiveNav(link));
});

let navTicking = false;
function syncNavigationWithScroll() {
  if (!sectionLinks.length) return;

  const headerHeight = document.querySelector(".renew-header")?.offsetHeight ?? 0;
  const checkPoint = window.scrollY + headerHeight + Math.min(window.innerHeight * 0.28, 220);
  let current = sectionLinks[0];

  sectionLinks.forEach(item => {
    if (item.section.offsetTop <= checkPoint) current = item;
  });

  setActiveNav(current.link);
}

window.addEventListener(
  "scroll",
  () => {
    if (navTicking) return;
    navTicking = true;
    window.requestAnimationFrame(() => {
      syncNavigationWithScroll();
      navTicking = false;
    });
  },
  { passive: true },
);
window.addEventListener("resize", syncNavigationWithScroll);
syncNavigationWithScroll();

// 모바일 메뉴에서 항목을 선택하면 열려 있는 메뉴를 닫음
const menuToggle = document.querySelector("#menu-toggle");
navLinks.forEach(link => {
  link.addEventListener("click", () => {
    if (menuToggle) menuToggle.checked = false;
  });
});

// 커리큘럼 슬라이더
const sliderTrack = document.querySelector(".slidercontainer > li");
const curriculumSlides = sliderTrack ? [...sliderTrack.querySelectorAll(":scope > .slider")] : [];
const prevButton = document.querySelector(".slider-button.prev");
const nextButton = document.querySelector(".slider-button.next");
const progress = document.querySelector(".progress");
const progressSteps = [...document.querySelectorAll(".progress > li")];
let currentSlide = 0;

function updateCurriculumSlider() {
  if (!sliderTrack || !curriculumSlides.length) return;

  const step = 100 / curriculumSlides.length;
  sliderTrack.style.transform = `translate3d(-${currentSlide * step}%, 0, 0)`;

  progressSteps.forEach((stepElement, index) => {
    stepElement.classList.toggle("active", index <= currentSlide);
  });

  if (progress && curriculumSlides.length > 1) {
    const progressPercent = (currentSlide / (curriculumSlides.length - 1)) * 100;
    progress.style.setProperty("--curriculum-progress", `calc((100% - 30px) * ${progressPercent / 100})`);
  }

  if (prevButton) prevButton.disabled = currentSlide === 0;
  if (nextButton) nextButton.disabled = currentSlide === curriculumSlides.length - 1;
}

function moveSlider(direction) {
  currentSlide = Math.min(
    Math.max(currentSlide + direction, 0),
    Math.max(curriculumSlides.length - 1, 0),
  );
  updateCurriculumSlider();
}

prevButton?.addEventListener("click", () => moveSlider(-1));
nextButton?.addEventListener("click", () => moveSlider(1));
updateCurriculumSlider();

// FAQ는 HTML details/summary를 사용하며, 한 항목을 열면 나머지는 닫아 읽기 쉽게 유지
const faqItems = [...document.querySelectorAll(".faq-item")];
faqItems.forEach(item => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    faqItems.forEach(other => {
      if (other !== item) other.open = false;
    });
  });
});
