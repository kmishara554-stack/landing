import './style.css'

// State
const state = {
  items: [
    { id: 1, description: 'Web Design Service', qty: 1, rate: 1500 }
  ],
  taxRate: 0
};

// DOM Elements
const app = {
  landing: document.getElementById('app'),
  editor: document.getElementById('invoice-editor'),
  itemsList: document.getElementById('items-list'),
  subtotalEl: document.getElementById('subtotal'),
  totalEl: document.getElementById('total-amount'),
  taxInput: document.getElementById('tax-rate'),
  logoInput: document.getElementById('logo-upload'),
  logoPreview: document.getElementById('logo-preview'),
  uploadPlaceholder: document.querySelector('.upload-placeholder'),
  dateInput: document.getElementById('invoice-date'),
  dueDateInput: document.getElementById('due-date')
};

// Initialization
function init() {
  setupEventListeners();
  renderItems();
  updateTotals();

  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  app.dateInput.value = today;

  // Due date + 30 days
  const due = new Date();
  due.setDate(due.getDate() + 30);
  app.dueDateInput.value = due.toISOString().split('T')[0];
}

// Event Listeners
function setupEventListeners() {
  // Navigation
  document.querySelector('.btn-primary.btn-lg').addEventListener('click', (e) => {
    e.preventDefault();
    showEditor();
  });

  document.querySelector('.nav-actions .btn-primary').addEventListener('click', (e) => {
    e.preventDefault();
    showEditor();
  });

  document.getElementById('back-to-home').addEventListener('click', hideEditor);

  document.getElementById('print-invoice').addEventListener('click', () => {
    window.print();
  });

  // Items
  document.getElementById('add-item-btn').addEventListener('click', addItem);

  // Tax
  app.taxInput.addEventListener('input', (e) => {
    state.taxRate = parseFloat(e.target.value) || 0;
    updateTotals();
  });

  // Logo Upload
  app.logoInput.addEventListener('change', handleLogoUpload);
}

// Actions
function showEditor() {
  app.editor.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function hideEditor() {
  app.editor.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

function addItem() {
  const newItem = {
    id: Date.now(),
    description: '',
    qty: 1,
    rate: 0
  };
  state.items.push(newItem);
  renderItems();
  updateTotals();
}

function removeItem(id) {
  state.items = state.items.filter(item => item.id !== id);
  renderItems();
  updateTotals();
}

function updateItem(id, field, value) {
  const item = state.items.find(i => i.id === id);
  if (item) {
    item[field] = value;
    renderItems(); // Re-render to update calculations
    updateTotals();

    // Restore focus (simple implementation)
    // In a real app, we'd use a more robust diffing or binding system
  }
}

function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      app.logoPreview.src = e.target.result;
      app.logoPreview.classList.remove('hidden');
      app.uploadPlaceholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }
}

// Rendering
function renderItems() {
  app.itemsList.innerHTML = '';

  state.items.forEach(item => {
    const amount = item.qty * item.rate;

    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <input type="text" value="${item.description}" placeholder="Description" data-id="${item.id}" data-field="description">
      <input type="number" value="${item.qty}" min="1" data-id="${item.id}" data-field="qty">
      <input type="number" value="${item.rate}" min="0" step="0.01" data-id="${item.id}" data-field="rate">
      <div class="col-amount">$${amount.toFixed(2)}</div>
      <button class="btn-remove" onclick="window.removeItem(${item.id})">×</button>
    `;

    // Add listeners to inputs
    row.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', (e) => {
        const field = e.target.dataset.field;
        const id = parseInt(e.target.dataset.id);
        let value = e.target.value;

        if (field === 'qty' || field === 'rate') {
          value = parseFloat(value) || 0;
        }

        // Update state directly without re-rendering everything to keep focus
        const item = state.items.find(i => i.id === id);
        if (item) {
          item[field] = value;
          // Update the amount cell specifically
          const newAmount = item.qty * item.rate;
          row.querySelector('.col-amount').textContent = `$${newAmount.toFixed(2)}`;
          updateTotals();
        }
      });
    });

    app.itemsList.appendChild(row);
  });
}

function updateTotals() {
  const subtotal = state.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
  const taxAmount = subtotal * (state.taxRate / 100);
  const total = subtotal + taxAmount;

  app.subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  app.totalEl.textContent = `$${total.toFixed(2)}`;
}

// Expose removeItem to window for inline onclick
window.removeItem = removeItem;

// Start
init();