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
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const qtyValue = document.getElementById('qtyValue');
  const waterPriceLabel = document.getElementById('waterPrice');
  const deliveryFeeLabel = document.getElementById('deliveryFee');
  const orderTotalLabel = document.getElementById('orderTotal');
  const customLitersInput = document.getElementById('customLiters');
  const litersButtons = document.querySelectorAll('.liters-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');
  const paymentInfo = document.getElementById('paymentInfo');
  const orderFeedback = document.getElementById('orderFeedback');

  const basePrices = {
    5: 150,
    10: 260,
    20: 480,
    50: 1100,
  };
  const deliveryFee = 100;
  let selectedLiters = 5;
  let quantity = 1;

  const formatPrice = value => `KSh ${value.toLocaleString('en-KE')}`;

  const updateSelection = liters => {
    selectedLiters = Number(liters) || 0;
    litersButtons.forEach(button => {
      button.classList.toggle('active', button.dataset.liters === String(liters));
    });
    galleryCards.forEach(card => {
      card.classList.toggle('active', card.dataset.liters === String(liters));
    });
    if (customLitersInput && customLitersInput.value) {
      litersButtons.forEach(button => button.classList.remove('active'));
      galleryCards.forEach(card => card.classList.remove('active'));
    }
    updatePrices();
  };

  const getWaterPrice = () => {
    if (!selectedLiters || selectedLiters < 1) {
      return 0;
    }
    if (basePrices[selectedLiters]) {
      return basePrices[selectedLiters] * quantity;
    }
    return Math.round(selectedLiters * 28 * quantity);
  };

  const updatePrices = () => {
    const waterPrice = getWaterPrice();
    waterPriceLabel.textContent = formatPrice(waterPrice);
    deliveryFeeLabel.textContent = formatPrice(deliveryFee);
    orderTotalLabel.textContent = formatPrice(waterPrice + deliveryFee);
  };

  const setPaymentInfo = paymentMethod => {
    if (paymentMethod === 'cash') {
      paymentInfo.textContent = 'Pay cash when your water is delivered anywhere in Nairobi.';
    } else {
      paymentInfo.innerHTML = 'Use M-Pesa Paybill <strong>345678</strong> with your phone number as account.';
    }
  };

  qtyMinus.addEventListener('click', () => {
    if (quantity > 1) {
      quantity -= 1;
      qtyValue.textContent = quantity;
      updatePrices();
    }
  });

  qtyPlus.addEventListener('click', () => {
    quantity += 1;
    qtyValue.textContent = quantity;
    updatePrices();
  });

  litersButtons.forEach(button => {
    button.addEventListener('click', () => {
      customLitersInput.value = '';
      updateSelection(button.dataset.liters);
    });
  });

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const liters = card.dataset.liters;
      if (liters) {
        customLitersInput.value = '';
        updateSelection(liters);
      }
    });
  });

  customLitersInput.addEventListener('input', event => {
    const value = Number(event.target.value);
    if (value > 0) {
      selectedLiters = value;
      litersButtons.forEach(button => button.classList.remove('active'));
      galleryCards.forEach(card => card.classList.remove('active'));
      updatePrices();
    }
  });

  document.querySelectorAll('input[name="payment"]').forEach(input => {
    input.addEventListener('change', event => setPaymentInfo(event.target.value));
  });

  orderForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const location = document.getElementById('locationSelect').value;

    if (!name || !phone || !location) {
      orderFeedback.className = 'order-feedback error';
      orderFeedback.textContent = 'Please fill in your name, phone, and location to place your order.';
      return;
    }

    orderFeedback.className = 'order-feedback';
    orderFeedback.textContent = `Thanks ${name}! Your order for ${quantity} × ${selectedLiters}L water is ready. We will contact you at ${phone} and deliver to ${location}.`;
    orderForm.reset();
    quantity = 1;
    qtyValue.textContent = quantity;
    updateSelection(5);
    setPaymentInfo('mpesa');
  });

  updateSelection(5);
  setPaymentInfo('mpesa');
});
