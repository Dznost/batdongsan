

document.addEventListener("DOMContentLoaded", function () {

  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  const alerts = document.querySelectorAll(".alert");
  alerts.forEach((alert) => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });

  initFileUpload();

  initSearchForm();

  initImageGallery();
});

function initFileUpload() {
  const fileInput = document.getElementById("images");
  const uploadArea = document.querySelector(".file-upload-area");
  const previewContainer = document.getElementById("image-preview");

  if (!fileInput || !uploadArea) return;

  uploadArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", function (e) {
    e.preventDefault();
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", function (e) {
    e.preventDefault();
    uploadArea.classList.remove("dragover");

    const files = e.dataTransfer.files;
    handleFiles(files);
  });

  uploadArea.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    handleFiles(this.files);
  });

  function handleFiles(files) {
    if (files.length > 5) {
      alert("Chỉ được chọn tối đa 5 ảnh");
      return;
    }

    previewContainer.innerHTML = "";

    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith("image/")) {
        alert("Chỉ được chọn file ảnh");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = createImagePreview(e.target.result, index);
        previewContainer.appendChild(preview);
      };
      reader.readAsDataURL(file);
    });
  }

  function createImagePreview(src, index) {
    const div = document.createElement("div");
    div.className = "image-preview";
    div.innerHTML = `
            <img src="${src}" alt="Preview ${index + 1}">
            <button type="button" class="remove-image" onclick="removeImage(this)">
                <i class="fas fa-times"></i>
            </button>
        `;
    return div;
  }
}

function removeImageFromPreview(button) {
  const preview = button.closest(".image-preview");
  if (!preview) return;

  const fileInput = document.getElementById("images");
  if (!fileInput) return;

  const index = Array.from(preview.parentNode.children).indexOf(preview);

  const dt = new DataTransfer();
  const files = fileInput.files;

  for (let i = 0; i < files.length; i++) {
    if (i !== index) {
      dt.items.add(files[i]);
    }
  }

  fileInput.files = dt.files;

  preview.remove();
}

function initSearchForm() {
  const priceRange = document.getElementById("price-range");
  const areaRange = document.getElementById("area-range");

  if (priceRange) {
    priceRange.addEventListener("input", function () {
      const value = this.value;
      const output = document.getElementById("price-output");
      if (output) {
        output.textContent = formatPrice(value);
      }
    });
  }

  if (areaRange) {
    areaRange.addEventListener("input", function () {
      const value = this.value;
      const output = document.getElementById("area-output");
      if (output) {
        output.textContent = value + " m²";
      }
    });
  }
}

function formatPrice(price) {
  if (price >= 1000000000) {
    return (price / 1000000000).toFixed(1) + " tỷ";
  } else if (price >= 1000000) {
    return (price / 1000000).toFixed(0) + " triệu";
  } else if (price >= 1000) {
    return (price / 1000).toFixed(0) + " nghìn";
  }
  return price.toString();
}

function initImageGallery() {
  const galleryImages = document.querySelectorAll(".gallery-image");

  galleryImages.forEach((img) => {
    img.addEventListener("click", function () {
      const modal = document.getElementById("imageModal");
      const modalImg = document.getElementById("modalImage");

      if (modal && modalImg) {
        modalImg.src = this.src;
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
      }
    });
  });
}

function confirmDelete(message = "Bạn có chắc chắn muốn xóa?") {
  return confirm(message);
}

function setButtonLoading(button, loading = true) {
  if (loading) {
    button.disabled = true;
    const originalText = button.innerHTML;
    button.setAttribute("data-original-text", originalText);
    button.innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Đang xử lý...';
  } else {
    button.disabled = false;
    const originalText = button.getAttribute("data-original-text");
    if (originalText) {
      button.innerHTML = originalText;
    }
  }
}

function submitForm(form, callback) {
  const formData = new FormData(form);
  const submitButton = form.querySelector('button[type="submit"]');

  setButtonLoading(submitButton, true);

  fetch(form.action, {
    method: form.method,
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      setButtonLoading(submitButton, false);
      if (callback) callback(data);
    })
    .catch((error) => {
      setButtonLoading(submitButton, false);
      console.error("Error:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    });
}

const utils = {

  formatCurrency: function (amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  },

  formatDate: function (date) {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  },

  debounce: function (func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

window.RealEstateApp = {
  utils,
  confirmDelete,
  setButtonLoading,
  submitForm,
};

// Cập nhật số lượng thông báo
async function updateNotificationCount() {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;

    try {
        const response = await fetch('/notifications/unread-count');
        const data = await response.json();

        if (data.success) {
            const count = data.unreadCount;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Error updating notification count:', error);
    }
}

// Cập nhật số lượng thông báo mỗi 30 giây
if (document.querySelector('.notification-badge')) {
    updateNotificationCount();
    setInterval(updateNotificationCount, 30000);
}
