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
    {
      threshold: 0.12,
      rootMargin: "0px 0px -32px",
    },
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

    if (active) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

sectionLinks.forEach(({ link }) => {
  link.addEventListener("click", () => {
    setActiveNav(link);
  });
});

let navTicking = false;

function syncNavigationWithScroll() {
  if (!sectionLinks.length) return;

  const headerHeight = document.querySelector(".renew-header")?.offsetHeight ?? 0;

  const checkPoint = window.scrollY + headerHeight + Math.min(window.innerHeight * 0.28, 220);

  let current = sectionLinks[0];

  sectionLinks.forEach(item => {
    if (item.section.offsetTop <= checkPoint) {
      current = item;
    }
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
  {
    passive: true,
  },
);

window.addEventListener("resize", syncNavigationWithScroll);

syncNavigationWithScroll();

// 모바일 메뉴에서 항목을 선택하면 열려 있는 메뉴를 닫음
const menuToggle = document.querySelector("#menu-toggle");

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    if (menuToggle) {
      menuToggle.checked = false;
    }
  });
});

// Swiper 기반 커리큘럼 슬라이더
const progress = document.querySelector(".progress");
const progressSteps = [...document.querySelectorAll(".progress > li")];

function updateCurriculumProgress(swiper) {
  if (!swiper) return;

  const lastIndex = swiper.slides.length - 1;
  const activeIndex = swiper.activeIndex;

  const progressRatio = lastIndex > 0 ? activeIndex / lastIndex : 0;

  progress?.style.setProperty("--curriculum-progress", progressRatio);

  progressSteps.forEach((stepElement, index) => {
    stepElement.classList.toggle("active", index <= activeIndex);
    stepElement.classList.toggle("current", index === activeIndex);
  });
}

if (typeof Swiper !== "undefined" && document.querySelector(".curriculum-swiper")) {
  new Swiper(".curriculum-swiper", {
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 500,

    keyboard: {
      enabled: true,
    },

    navigation: {
      prevEl: ".slider-button.prev",
      nextEl: ".slider-button.next",
    },

    on: {
      init(swiper) {
        updateCurriculumProgress(swiper);
      },

      slideChange(swiper) {
        updateCurriculumProgress(swiper);
      },
    },
  });
}

// FAQ 열기 / 닫기 애니메이션
// 각 질문은 독립적으로 동작하며 다른 질문을 열어도 기존 답변은 닫히지 않음
const faqItems = [...document.querySelectorAll(".faq-item")];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

faqItems.forEach(item => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  if (!question || !answer) return;

  let animation = null;
  let isClosing = false;
  let isOpening = false;

  question.addEventListener("click", event => {
    event.preventDefault();

    // 모션 최소화 설정이 켜져 있으면 즉시 열고 닫기
    if (prefersReducedMotion) {
      item.open = !item.open;
      return;
    }

    // 닫히는 중이거나 닫혀 있는 경우 열기
    if (isClosing || !item.open) {
      openFaq();
      return;
    }

    // 열리는 중이거나 이미 열려 있는 경우 닫기
    if (isOpening || item.open) {
      closeFaq();
    }
  });

  function openFaq() {
    animation?.cancel();

    isClosing = false;
    isOpening = true;

    const startHeight = `${question.offsetHeight}px`;

    // 답변의 높이를 계산할 수 있도록 open 활성화
    item.open = true;
    item.style.height = startHeight;
    item.style.overflow = "hidden";

    const endHeight = `${question.offsetHeight + answer.offsetHeight}px`;

    animation = item.animate(
      {
        height: [startHeight, endHeight],
      },
      {
        duration: 380,
        easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
    );

    animation.onfinish = () => {
      finishFaqAnimation(true);
    };

    animation.oncancel = () => {
      isOpening = false;
    };
  }

  function closeFaq() {
    animation?.cancel();

    isClosing = true;
    isOpening = false;

    const startHeight = `${item.offsetHeight}px`;
    const endHeight = `${question.offsetHeight}px`;

    item.style.height = startHeight;
    item.style.overflow = "hidden";

    animation = item.animate(
      {
        height: [startHeight, endHeight],
      },
      {
        duration: 340,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    );

    animation.onfinish = () => {
      finishFaqAnimation(false);
    };

    animation.oncancel = () => {
      isClosing = false;
    };
  }

  function finishFaqAnimation(open) {
    item.open = open;

    item.style.height = "";
    item.style.overflow = "";

    animation = null;
    isClosing = false;
    isOpening = false;
  }
});
