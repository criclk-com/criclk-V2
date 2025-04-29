document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
      hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
      });
    }
    
    // Close mobile menu when clicking a nav link
    const navItems = document.querySelectorAll('.nav-links li a');
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        if (hamburger.classList.contains('active')) {
          hamburger.classList.remove('active');
          navLinks.classList.remove('active');
        }
      });
    });
    
    // Image Slider Functionality
    const sliderContainer = document.querySelector('.slider-container');
    
    if (sliderContainer) {
      const slides = document.querySelectorAll('.slide');
      const dots = document.querySelectorAll('.dot');
      const prevBtn = document.querySelector('.prev');
      const nextBtn = document.querySelector('.next');
      
      let currentSlide = 0;
      let slideInterval;
      
      // Initialize the slider
      function startSlider() {
        slideInterval = setInterval(nextSlide, 10000);
      }
      
      // Stop the slider
      function stopSlider() {
        clearInterval(slideInterval);
      }
      
      // Show a specific slide
      function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
      }
      
      // Go to next slide
      function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
      }
      
      // Go to previous slide
      function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
      }
      
      // Event listeners for dots
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          stopSlider();
          showSlide(index);
          startSlider();
        });
      });
      
      // Event listeners for next/prev buttons
      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          stopSlider();
          prevSlide();
          startSlider();
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          stopSlider();
          nextSlide();
          startSlider();
        });
      }
      
      // Pause slider on hover
      sliderContainer.addEventListener('mouseenter', stopSlider);
      sliderContainer.addEventListener('mouseleave', startSlider);
      
      // Start the slider
      startSlider();
    }
  });