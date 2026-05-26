window.addEventListener('load', function () {
  const loader = document.getElementById('pageLoader');
  if (loader) {
    loader.classList.add('loader-hidden');
    setTimeout(() => loader.remove(), 450);
  }

  const navLinks = document.querySelectorAll('.top-nav a, .footer-links a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 720) {
        document.activeElement.blur();
      }
    });
  });

  const orderForm = document.getElementById('orderForm');
  if (!orderForm) {
    return;
  }

  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const qtyValue = document.getElementById('qtyValue');
  const waterPriceLabel = document.getElementById('waterPrice');
  const deliveryFeeLabel = document.getElementById('deliveryFee');
  const orderTotalLabel = document.getElementById('orderTotal');
  const customLitersInput = document.getElementById('customLiters');
  const litersButtons = Array.from(document.querySelectorAll('.liters-btn'));
  const galleryCards = Array.from(document.querySelectorAll('.gallery-card'));
  const paymentInfo = document.getElementById('paymentInfo');
  const copyPaymentDetailsBtn = document.getElementById('copyPaymentDetails');
  const orderFeedback = document.getElementById('orderFeedback');
  const paymentInputs = Array.from(document.querySelectorAll('input[name="payment"]'));

  const basePrices = {
    5: 150,
    10: 260,
    20: 480,
    50: 1100,
  };
  const deliveryFee = 100;
  let selectedLiters = 5;
  let quantity = 1;
  let currentPaymentMethod = 'mpesa';

  const formatPrice = value => `KSh ${value.toLocaleString('en-KE')}`;

  const normalizeLiters = value => {
    const liters = Number(value);
    if (!Number.isFinite(liters) || liters < 1) {
      return 0;
    }
    return Math.round(liters);
  };

  const getWaterPrice = () => {
    if (!selectedLiters) {
      return 0;
    }
    if (basePrices[selectedLiters]) {
      return basePrices[selectedLiters] * quantity;
    }
    return Math.round(selectedLiters * 28 * quantity);
  };

  const getTotalPrice = () => getWaterPrice() + deliveryFee;

  const buildPaymentText = paymentMethod => {
    if (paymentMethod === 'cash') {
      return 'Pay cash on delivery. Please have the exact amount ready when your order arrives.';
    }
    return `Use M-Pesa Paybill <strong>345678</strong> with your phone number as account. Amount due: ${formatPrice(getTotalPrice())}.`;
  };

  const updatePaymentInfo = paymentMethod => {
    currentPaymentMethod = paymentMethod;
    if (!paymentInfo) {
      return;
    }
    paymentInfo.innerHTML = `<div class="payment-copy-text">${buildPaymentText(paymentMethod)}</div>`;
    if (copyPaymentDetailsBtn) {
      copyPaymentDetailsBtn.hidden = paymentMethod !== 'mpesa';
    }
  };

  const updatePrices = () => {
    const waterPrice = getWaterPrice();
    if (waterPriceLabel) {
      waterPriceLabel.textContent = formatPrice(waterPrice);
    }
    if (deliveryFeeLabel) {
      deliveryFeeLabel.textContent = formatPrice(deliveryFee);
    }
    if (orderTotalLabel) {
      orderTotalLabel.textContent = formatPrice(waterPrice + deliveryFee);
    }
    updatePaymentInfo(currentPaymentMethod);
  };

  const copyPaymentDetails = () => {
    if (!copyPaymentDetailsBtn) {
      return;
    }
    const phoneInput = document.getElementById('customerPhone');
    const customerPhone = phoneInput ? phoneInput.value.trim() : '';
    const amount = formatPrice(getTotalPrice());
    const details = `M-Pesa Paybill: 345678\nAccount: ${customerPhone || 'your phone number'}\nAmount: ${amount}`;

    const showCopySuccess = () => {
      if (orderFeedback) {
        orderFeedback.className = 'order-feedback';
        orderFeedback.textContent = 'Payment details copied to clipboard. Paste them in M-Pesa to complete payment.';
      }
    };

    const fallbackCopy = fallbackText => {
      const textarea = document.createElement('textarea');
      textarea.value = fallbackText;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showCopySuccess();
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(details).then(showCopySuccess).catch(() => fallbackCopy(details));
    } else {
      fallbackCopy(details);
    }
  };

  const updateSelection = liters => {
    selectedLiters = normalizeLiters(liters) || 0;
    litersButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.liters === String(selectedLiters));
    });
    galleryCards.forEach(card => {
      card.classList.toggle('active', card.dataset.liters === String(selectedLiters));
    });
    if (customLitersInput && customLitersInput.value) {
      litersButtons.forEach(button => button.classList.remove('active'));
      galleryCards.forEach(card => card.classList.remove('active'));
    }
    updatePrices();
  };

  if (qtyMinus) {
    qtyMinus.addEventListener('click', () => {
      if (quantity > 1) {
        quantity -= 1;
        if (qtyValue) {
          qtyValue.textContent = quantity;
        }
        updatePrices();
      }
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener('click', () => {
      quantity += 1;
      if (qtyValue) {
        qtyValue.textContent = quantity;
      }
      updatePrices();
    });
  }

  litersButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (customLitersInput) {
        customLitersInput.value = '';
      }
      updateSelection(button.dataset.liters);
    });
  });

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const liters = card.dataset.liters;
      if (liters) {
        if (customLitersInput) {
          customLitersInput.value = '';
        }
        updateSelection(liters);
      }
    });
  });

  if (customLitersInput) {
    customLitersInput.addEventListener('input', event => {
      const value = normalizeLiters(event.target.value);
      if (value > 0) {
        selectedLiters = value;
        litersButtons.forEach(button => button.classList.remove('active'));
        galleryCards.forEach(card => card.classList.remove('active'));
        updatePrices();
      } else {
        updatePrices();
      }
    });
  }

  paymentInputs.forEach(input => {
    input.addEventListener('change', event => {
      updatePaymentInfo(event.target.value);
      updatePrices();
    });
  });

  if (copyPaymentDetailsBtn) {
    copyPaymentDetailsBtn.addEventListener('click', copyPaymentDetails);
  }

  orderForm.addEventListener('submit', event => {
    event.preventDefault();
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const locationSelect = document.getElementById('locationSelect');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const location = locationSelect ? locationSelect.value : '';

    if (!name || !phone || !location) {
      if (orderFeedback) {
        orderFeedback.className = 'order-feedback error';
        orderFeedback.textContent = 'Please fill in your name, phone, and location to place your order.';
      }
      return;
    }

    const paymentMessage = currentPaymentMethod === 'cash'
      ? 'Pay cash to the rider when your order arrives.'
      : 'Complete M-Pesa payment to Paybill 345678 using your phone number as the account.';

    if (orderFeedback) {
      orderFeedback.className = 'order-feedback';
      orderFeedback.innerHTML = `Thanks ${name}! Your order for ${quantity} × ${selectedLiters}L water is ready. ${paymentMessage}`;
    }

    orderForm.reset();
    quantity = 1;
    if (qtyValue) {
      qtyValue.textContent = quantity;
    }
    updateSelection(5);
    updatePaymentInfo('mpesa');
  });

  updateSelection(5);
  updatePaymentInfo('mpesa');
});
