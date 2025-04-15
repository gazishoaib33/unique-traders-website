// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('nav ul');
    
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
});

// Product view details button
document.addEventListener('DOMContentLoaded', function() {
    const viewButtons = document.querySelectorAll('.cart-btn');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productTitle = this.closest('.product-card').querySelector('.product-title').textContent;
            alert(`You clicked on ${productTitle}. In a full implementation, this would take you to the product detail page.`);
        });
    });
});