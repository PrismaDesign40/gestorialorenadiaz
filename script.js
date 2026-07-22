/* =========================================================================
   GESTORÍA LORENA DÍAZ — script.js
   JavaScript puro, sin dependencias.
   ========================================================================= */
(() => {
  "use strict";

  /* -----------------------------------------------------------------------
     CONFIGURACIÓN — Editar estos valores con los datos reales del negocio.
     Número de WhatsApp en formato internacional, sin espacios ni símbolos.
  ----------------------------------------------------------------------- */
  const CONFIG = {
    whatsappNumber: "5493536577332",
    defaultMessage: "Hola, quisiera consultar por un trámite.",
  };

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Año dinámico en el footer ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: sombra al hacer scroll ---------- */
  const header = $("#header");
  const onScrollHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Menú móvil ---------- */
  const navToggle = $("#navToggle");
  const nav = $("#nav");
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.classList.toggle("is-active", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });
  // Cerrar el menú al elegir un link (útil en mobile)
  $$("#nav a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* ---------- Scroll reveal (fade up) con IntersectionObserver ---------- */
  const revealEls = $$("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.getAttribute("data-reveal-delay");
            if (delay) el.style.transitionDelay = `${delay}ms`;
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: si no hay soporte, mostrar todo directamente.
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Contador animado (cifras de ejemplo) ---------- */
  const counters = $$("[data-count]");
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute("data-count"), 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(eased * target).toLocaleString("es-ES");
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      const counterIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterIO.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach((c) => counterIO.observe(c));
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---------- Parallax sutil en la imagen del hero ---------- */
  const heroImg = $(".hero__img");
  if (heroImg && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const offset = window.scrollY * 0.15; // efecto muy sutil
            heroImg.style.transform = `translateY(${offset}px) scale(1.06)`;
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------- Acordeón de FAQ ---------- */
  $$(".accordion__item").forEach((item) => {
    const trigger = $(".accordion__trigger", item);
    const panel = $(".accordion__panel", item);

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      // Cerrar los demás ítems (acordeón exclusivo)
      $$(".accordion__item").forEach((other) => {
        if (other !== item) {
          other.classList.remove("is-open");
          $(".accordion__trigger", other).setAttribute("aria-expanded", "false");
          $(".accordion__panel", other).style.maxHeight = null;
        }
      });

      item.classList.toggle("is-open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = !isOpen ? `${panel.scrollHeight}px` : null;
    });
  });

  /* ---------- Botón "volver arriba" ---------- */
  const backToTop = $("#backToTop");
  window.addEventListener(
    "scroll",
    () => backToTop.classList.toggle("is-visible", window.scrollY > 500),
    { passive: true }
  );
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Enlaces de WhatsApp dinámicos ---------- */
  const buildWhatsappLink = (message) =>
    `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

  // Botón principal del hero y del CTA final usan el mensaje por defecto
  const heroWhatsapp = $("#heroWhatsapp");
  const ctaWhatsapp = $("#ctaWhatsapp");
  [heroWhatsapp, ctaWhatsapp].forEach((btn) => {
    if (btn) btn.setAttribute("href", buildWhatsappLink(CONFIG.defaultMessage));
  });

  // Botón "Consultar" de cada servicio: arma un mensaje específico
  $$("[data-service]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const service = link.getAttribute("data-service");
      const message = `Hola, quisiera consultar sobre: ${service}.`;
      window.open(buildWhatsappLink(message), "_blank", "noopener");
    });
  });

  /* ---------- Formulario de contacto → WhatsApp ---------- */
  const form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = $("#name").value.trim();
      const service = $("#service").value;
      const message = $("#message").value.trim();

      if (!name || !message) {
        // Validación simple, accesible, sin librerías externas
        const missing = !name ? $("#name") : $("#message");
        missing.focus();
        return;
      }

      const fullMessage =
        `Hola, soy ${name}. Quisiera consultar sobre: ${service}.\n\n${message}`;

      window.open(buildWhatsappLink(fullMessage), "_blank", "noopener");
      form.reset();
    });
  }

  /* ---------- Fallback de imágenes (por si alguna URL externa falla) ---------- */
  const FALLBACK_GRADIENTS = [
    ["#0b2545", "#16305a"],
    ["#123a68", "#c8a24a"],
    ["#0b2545", "#8a94a6"],
  ];
  const makeFallbackSVG = (index) => {
    const [c1, c2] = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/>
      </linearGradient></defs>
      <rect width='800' height='600' fill='url(#g)'/>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };
  $$("img[data-fallback]").forEach((img) => {
    img.addEventListener(
      "error",
      () => {
        img.src = makeFallbackSVG(Number(img.getAttribute("data-fallback")) || 0);
      },
      { once: true }
    );
  });
})();
