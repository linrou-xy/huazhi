/* =========================================================
   花知晓彩妆商城：公共交互脚本
   功能包括导航、轮播、筛选、商品弹窗、购物袋和提示消息
   ========================================================= */
(function () {
  "use strict";

  var activeItemName = "精选商品";

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupCart();
    setupModal();
    setupHomeSlider();
    setupProductFilters();
    setupRevealAnimation();
  });

  /* 移动端导航展开与收起 */
  function setupMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.textContent = isOpen ? "×" : "☰";
    });
  }

  /* 购物袋数量保存在浏览器本地，刷新页面后仍能显示 */
  function setupCart() {
    updateCartCount(readCartCount());

    document.addEventListener("click", function (event) {
      var addButton = event.target.closest("[data-add-cart], [data-modal-add]");
      if (!addButton) return;

      event.preventDefault();
      event.stopPropagation();
      var name = addButton.dataset.name || activeItemName;
      var nextCount = readCartCount() + 1;
      writeCartCount(nextCount);
      updateCartCount(nextCount);
      showToast("“" + name + "”已加入购物袋");
    });

    document.querySelectorAll("[data-cart-open]").forEach(function (button) {
      button.addEventListener("click", function () {
        var count = readCartCount();
        showToast(
          count
            ? "购物袋中共有 " + count + " 件商品"
            : "购物袋还是空的，去挑选心仪好物吧",
        );
      });
    });

    /* 会员页的领取按钮给出即时反馈，作为该页面的核心交互 */
    document.addEventListener("click", function (event) {
      var benefitButton = event.target.closest("[data-benefit-claim]");
      if (!benefitButton) return;
      var benefitName =
        benefitButton.dataset.name || activeItemName || "会员福利";
      showToast("“" + benefitName + "”领取成功，请在会员中心查看");
    });
  }

  function readCartCount() {
    try {
      return Number(localStorage.getItem("flowerKnowsCart")) || 0;
    } catch (error) {
      return Number(document.body.dataset.cartCount) || 0;
    }
  }

  function writeCartCount(count) {
    document.body.dataset.cartCount = String(count);
    try {
      localStorage.setItem("flowerKnowsCart", String(count));
    } catch (error) {
      /* file:// 环境不支持存储时，仍保留当前页面的计数 */
    }
  }

  function updateCartCount(count) {
    document.querySelectorAll("[data-cart-count]").forEach(function (element) {
      element.textContent = count;
    });
  }

  /* 商品、套餐和会员福利共用的详情弹窗 */
  function setupModal() {
    var modal = document.getElementById("detailModal");
    if (!modal) return;

    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-modal-open]");
      if (!trigger) return;

      var item = trigger.closest("[data-item]") || trigger;
      activeItemName = item.dataset.modalTitle || "精选商品";
      fillModal(item);
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    });

    modal.querySelectorAll("[data-modal-close]").forEach(function (button) {
      button.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && modal.classList.contains("open"))
        closeModal();
    });

    function closeModal() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    }
  }

  function fillModal(item) {
    var image = document.getElementById("modalImage");
    var title = document.getElementById("modalTitle");
    var text = document.getElementById("modalText");
    var price = document.getElementById("modalPrice");
    var list = document.getElementById("modalList");

    if (image) {
      image.src = item.dataset.modalImage || "images/giftset.svg";
      image.alt = item.dataset.modalTitle || "详情图片";
    }
    if (title) title.textContent = item.dataset.modalTitle || "精选内容";
    if (text) text.textContent = item.dataset.modalText || "";
    if (price) price.textContent = item.dataset.modalPrice || "";
    if (list) {
      list.innerHTML = "";
      (item.dataset.modalList || "")
        .split("|")
        .filter(Boolean)
        .forEach(function (value) {
          var li = document.createElement("li");
          li.textContent = value;
          list.appendChild(li);
        });
    }
  }

  /* 首页图片轮播：自动播放，并支持左右按钮、圆点和悬停暂停 */
  function setupHomeSlider() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) return;

    var slides = Array.prototype.slice.call(
      carousel.querySelectorAll("[data-carousel-slide]"),
    );
    var dots = Array.prototype.slice.call(
      carousel.querySelectorAll("[data-carousel-dot]"),
    );
    var previousButton = carousel.querySelector("[data-carousel-prev]");
    var nextButton = carousel.querySelector("[data-carousel-next]");
    var current = 0;
    var timer;

    /* 切换指定轮播图，并同步当前圆点和无障碍状态 */
    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        var isActive = slideIndex === current;
        slide.classList.toggle("active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    /* 重启 5 秒自动播放计时器 */
    function startAutoPlay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    /* 点击圆点直接切换到对应图片 */
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.carouselDot));
        startAutoPlay();
      });
    });

    /* 左右按钮按顺序切换轮播图 */
    if (previousButton) {
      previousButton.addEventListener("click", function () {
        showSlide(current - 1);
        startAutoPlay();
      });
    }
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(current + 1);
        startAutoPlay();
      });
    }

    /* 鼠标停在轮播图上时暂停，移出后继续播放 */
    carousel.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    carousel.addEventListener("mouseleave", startAutoPlay);

    showSlide(0);
    startAutoPlay();
  }

  /* 全部商品页：关键词搜索与分类筛选可以组合使用 */
  function setupProductFilters() {
    var search = document.getElementById("productSearch");
    var cards = Array.prototype.slice.call(
      document.querySelectorAll("[data-product-card]"),
    );
    if (!search || !cards.length) return;

    var filterButtons = Array.prototype.slice.call(
      document.querySelectorAll("[data-filter]"),
    );
    var emptyState = document.querySelector(".empty-state");
    var productCount = document.getElementById("productCount");
    var currentFilter = getInitialCategory();

    filterButtons.forEach(function (button) {
      button.classList.toggle(
        "active",
        button.dataset.filter === currentFilter,
      );
      button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;
        filterButtons.forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        applyFilter();
      });
    });

    search.addEventListener("input", applyFilter);
    applyFilter();

    function applyFilter() {
      var keyword = search.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var categoryMatch =
          currentFilter === "all" || card.dataset.category === currentFilter;
        var keywordMatch =
          !keyword ||
          (card.dataset.name || "").toLowerCase().indexOf(keyword) > -1;
        var show = categoryMatch && keywordMatch;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (emptyState) emptyState.hidden = visible !== 0;
      if (productCount) productCount.textContent = visible;
    }
  }

  function getInitialCategory() {
    try {
      var category = new URLSearchParams(window.location.search).get(
        "category",
      );
      return ["lip", "eye", "face", "gift"].indexOf(category) > -1
        ? category
        : "all";
    } catch (error) {
      return "all";
    }
  }

  /* 元素进入视口时播放轻量出现动画 */
  function setupRevealAnimation() {
    var elements = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (element) {
        element.classList.add("visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function showToast(message) {
    var toast = document.querySelector(".toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }
})();
