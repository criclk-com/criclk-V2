/**
 * Mobile Helper Script for Cricket Streaming
 * This script helps mobile devices play streams in desktop mode
 */

// Detect if running on a mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Only run if this is a mobile device
if (isMobile) {
    document.addEventListener('DOMContentLoaded', function() {
        // Force desktop viewport
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            viewportMeta.content = 'width=1024, initial-scale=1.0, maximum-scale=1.0, user-scalable=0';
        }
        
        // Add desktop mode class to html
        document.documentElement.classList.add('desktop-mode');
        
        // Function to handle player iframe creation
        function setupMobilePlayer() {
            // Find any player containers
            const playerContainers = document.querySelectorAll('.player-wrapper, .player-container, .iframe-container');
            
            playerContainers.forEach(container => {
                // Add desktop mode class
                container.classList.add('desktop-mode-player');
                
                // Find any iframes within the container
                const iframe = container.querySelector('iframe');
                if (iframe) {
                    // Make sure sandbox includes necessary permissions
                    // Note: We need to maintain sandbox for security, but ensure it has all needed permissions
                    if (iframe.hasAttribute('sandbox')) {
                        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-presentation');
                    }
                    
                    // Add fullscreen capability
                    iframe.setAttribute('allowfullscreen', 'true');
                    iframe.setAttribute('allow', 'fullscreen; encrypted-media');
                }
            });
            
            // Add fullscreen button for iOS
            if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                addFullscreenButton();
            }
        }
        
        // Function to add a fullscreen button (especially for iOS)
        function addFullscreenButton() {
            const playerContainers = document.querySelectorAll('.player-wrapper, .player-container');
            
            playerContainers.forEach(container => {
                // Check if container already has a fullscreen button
                if (!container.querySelector('.mobile-fullscreen-btn')) {
                    // Create fullscreen button
                    const fullscreenBtn = document.createElement('button');
                    fullscreenBtn.className = 'mobile-fullscreen-btn';
                    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                    fullscreenBtn.setAttribute('aria-label', 'Fullscreen');
                    
                    // Position the button
                    fullscreenBtn.style.position = 'absolute';
                    fullscreenBtn.style.bottom = '15px';
                    fullscreenBtn.style.right = '15px';
                    fullscreenBtn.style.zIndex = '100';
                    fullscreenBtn.style.backgroundColor = 'rgba(0,0,0,0.6)';
                    fullscreenBtn.style.color = 'white';
                    fullscreenBtn.style.border = 'none';
                    fullscreenBtn.style.borderRadius = '5px';
                    fullscreenBtn.style.padding = '8px 12px';
                    fullscreenBtn.style.cursor = 'pointer';
                    
                    // Add click event
                    fullscreenBtn.addEventListener('click', function() {
                        toggleFullscreen(container);
                    });
                    
                    // Add button to container
                    container.appendChild(fullscreenBtn);
                }
            });
        }
        
        // Function to toggle fullscreen
        function toggleFullscreen(element) {
            if (!document.fullscreenElement) {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullscreen) { /* Safari */
                    element.webkitRequestFullscreen();
                } else if (element.msRequestFullscreen) { /* IE11 */
                    element.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) { /* Safari */
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) { /* IE11 */
                    document.msExitFullscreen();
                }
            }
        }
        
        // Run setup immediately
        setupMobilePlayer();
        
        // Also run after any AJAX content might load
        setTimeout(setupMobilePlayer, 1000);
        setTimeout(setupMobilePlayer, 3000);
        
        // Handle player elements that might be added dynamically
        // Using MutationObserver to detect when new player elements are added
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    setupMobilePlayer();
                }
            });
        });
        
        // Start observing body for dynamic content changes
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Fix iOS and Android specific issues
        
        // iOS: Fix autoplay issues
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            // iOS requires user interaction before media can play
            document.addEventListener('touchstart', function() {
                // This empty handler helps enable autoplay on first touch
            }, { once: true });
        }
        
        // Android: Fix specific video rendering issues
        if (/Android/i.test(navigator.userAgent)) {
            // Add hardware acceleration
            document.body.style.transform = 'translateZ(0)';
            
            // Prevent pinch-zoom on Android
            document.addEventListener('touchmove', function(e) {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
        }
    });
    
    // Force desktop-like behavior for iframe loading
    window.addEventListener('load', function() {
        // Find all iframes and ensure they have correct attributes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            if (iframe.hasAttribute('sandbox')) {
                iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-presentation');
            }
        });
    });
}
