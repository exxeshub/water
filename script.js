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

  // Mobile nav toggle
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const mobileNav = document.getElementById('mobileNav');
  if (mobileNavToggle && mobileNav) {
    mobileNavToggle.addEventListener('click', () => {
      const expanded = mobileNavToggle.getAttribute('aria-expanded') === 'true';
      mobileNavToggle.setAttribute('aria-expanded', String(!expanded));
      mobileNav.hidden = expanded;
      if (!expanded) mobileNav.querySelector('a')?.focus();
    });
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
  const sendOptions = document.getElementById('sendOptions');
  const emailOrderBtn = document.getElementById('emailOrderBtn');
  const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
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

  const buildOrderSummary = order => {
    return `Booking details:%0AName: ${order.name}%0APhone: ${order.phone}%0ALocation: ${order.location}%0ABuilding: ${order.building || 'N/A'}%0ANotes: ${order.notes || 'None'}%0ASelected liters: ${order.liters}L%0AQuantity: ${order.quantity}%0APayment: ${order.payment}%0AWater cost: ${order.waterPrice}%0ADelivery fee: ${order.deliveryFee}%0ATotal: ${order.total}`;
  };

  const getMailtoLink = order => {
    const subject = 'HOUSE OF MAJI booking';
    const body = decodeURIComponent(buildOrderSummary(order)).replace(/%0A/g, '\n');
    return `mailto:orders@houseofmajiwater.co.ke?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getWhatsappLink = order => {
    const body = buildOrderSummary(order);
    return `https://wa.me/254700000000?text=${body}`;
  };

  const sendOptionsVisible = visible => {
    if (sendOptions) {
      sendOptions.hidden = !visible;
    }
  };

  const buildOrderObject = () => {
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const locationSelect = document.getElementById('locationSelect');
    const buildingInput = document.getElementById('buildingInfo');
    const notesInput = document.getElementById('deliveryNotes');

    return {
      name: nameInput ? nameInput.value.trim() : '',
      phone: phoneInput ? phoneInput.value.trim() : '',
      location: locationSelect ? locationSelect.value : '',
      building: buildingInput ? buildingInput.value.trim() : '',
      notes: notesInput ? notesInput.value.trim() : '',
      liters: selectedLiters,
      quantity,
      payment: currentPaymentMethod,
      waterPrice: formatPrice(getWaterPrice()),
      deliveryFee: formatPrice(deliveryFee),
      total: formatPrice(getTotalPrice()),
    };
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

  if (emailOrderBtn) {
    emailOrderBtn.addEventListener('click', () => {
      const currentOrder = buildOrderObject();
      window.location.href = getMailtoLink(currentOrder);
    });
  }

  if (whatsappOrderBtn) {
    whatsappOrderBtn.addEventListener('click', () => {
      const currentOrder = buildOrderObject();
      window.open(getWhatsappLink(currentOrder), '_blank');
    });
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
      sendOptionsVisible(false);
      return;
    }

    const paymentMessage = currentPaymentMethod === 'cash'
      ? 'Pay cash to the rider when your order arrives.'
      : 'Complete M-Pesa payment to Paybill 345678 using your phone number as the account.';

    if (orderFeedback) {
      orderFeedback.className = 'order-feedback';
      orderFeedback.innerHTML = `Thanks ${name}! Your order for ${quantity} × ${selectedLiters}L water is ready. ${paymentMessage} Use the buttons below to send this booking by email or WhatsApp.`;
    }

    // Build order object and try server submit, fallback to client share
    const order = buildOrderObject();
    // Try POST to server endpoint (if available). This requires a hosting PHP endpoint at /send_order.php
    fetch('send_order.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    }).then(res => res.json()).then(data => {
      if (data && data.success) {
        if (orderFeedback) {
          orderFeedback.className = 'order-feedback';
          orderFeedback.textContent = 'Order submitted. We will contact you shortly.';
        }
        sendOptionsVisible(false);
        orderForm.reset();
        quantity = 1;
        if (qtyValue) qtyValue.textContent = quantity;
        updateSelection(5);
      } else {
        // fallback: show client-side options
        sendOptionsVisible(true);
      }
    }).catch(() => {
      sendOptionsVisible(true);
    }).finally(() => updatePrices());
  });

  updateSelection(5);
  updatePaymentInfo('mpesa');
});
