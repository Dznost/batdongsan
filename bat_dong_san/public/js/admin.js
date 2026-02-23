

function makeRequest(url, method = "GET", data = null) {
  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  return fetch(url, options)
    .then((response) => response.json())
    .catch((error) => {
      console.error("Error:", error);
      throw error;
    });
}

function showLoading(button) {
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  button.disabled = true;
  return originalText;
}

function hideLoading(button, originalText) {
  button.innerHTML = originalText;
  button.disabled = false;
}

function showToast(message, type = "success") {

  const toast = document.createElement("div");
  toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  toast.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 5000);
}

window.approvePost = function (postId) {
  if (confirm("Bạn có chắc chắn muốn duyệt tin đăng này?")) {
    makeRequest(`/admin/posts/${postId}/approve`, "POST")
      .then((data) => {
        if (data.success) {
          showToast(data.message, "success");
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(data.message || "Có lỗi xảy ra", "danger");
        }
      })
      .catch((error) => {
        showToast("Có lỗi xảy ra khi duyệt tin đăng", "danger");
      });
  }
};

window.rejectPost = function (postId) {
  if (confirm("Bạn có chắc chắn muốn từ chối tin đăng này?")) {
    makeRequest(`/admin/posts/${postId}/reject`, "POST")
      .then((data) => {
        if (data.success) {
          showToast(data.message, "warning");
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(data.message || "Có lỗi xảy ra", "danger");
        }
      })
      .catch((error) => {
        showToast("Có lỗi xảy ra khi từ chối tin đăng", "danger");
      });
  }
};

window.deletePost = function (postId) {
  if (
    confirm(
      "Bạn có chắc chắn muốn xóa tin đăng này? Hành động này không thể hoàn tác."
    )
  ) {
    makeRequest(`/admin/posts/${postId}`, "DELETE")
      .then((data) => {
        if (data.success) {
          showToast(data.message, "success");
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(data.message || "Có lỗi xảy ra", "danger");
        }
      })
      .catch((error) => {
        showToast("Có lỗi xảy ra khi xóa tin đăng", "danger");
      });
  }
};

window.activateUser = function (userId) {
  if (confirm("Bạn có chắc chắn muốn kích hoạt tài khoản này?")) {
    makeRequest(`/admin/users/${userId}/activate`, "POST")
      .then((data) => {
        if (data.success) {
          showToast(data.message, "success");
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(data.message || "Có lỗi xảy ra", "danger");
        }
      })
      .catch((error) => {
        showToast("Có lỗi xảy ra khi kích hoạt tài khoản", "danger");
      });
  }
};

window.deactivateUser = function (userId) {
  if (confirm("Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?")) {
    makeRequest(`/admin/users/${userId}/deactivate`, "POST")
      .then((data) => {
        if (data.success) {
          showToast(data.message, "warning");
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(data.message || "Có lỗi xảy ra", "danger");
        }
      })
      .catch((error) => {
        showToast("Có lỗi xảy ra khi vô hiệu hóa tài khoản", "danger");
      });
  }
};

window.makeAdmin = function (userId) {
  if (confirm("Bạn có chắc chắn muốn cấp quyền admin cho người dùng này?")) {
    makeRequest(`/admin/users/${userId}/make-admin`, "POST")
      .then((data) => {
        if (data.success) {
          showToast(data.message, "success");
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(data.message || "Có lỗi xảy ra", "danger");
        }
      })
      .catch((error) => {
        showToast("Có lỗi xảy ra khi cấp quyền admin", "danger");
      });
  }
};

window.removeAdmin = function (userId) {
  if (
    confirm("Bạn có chắc chắn muốn thu hồi quyền admin của người dùng này?")
  ) {
    makeRequest(`/admin/users/${userId}/remove-admin`, "POST")
      .then((data) => {
        if (data.success) {
          showToast(data.message, "info");
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(data.message || "Có lỗi xảy ra", "danger");
        }
      })
      .catch((error) => {
        showToast("Có lỗi xảy ra khi thu hồi quyền admin", "danger");
      });
  }
};

window.deleteUser = function (userId) {
  if (
    confirm(
      "Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác và sẽ xóa tất cả tin đăng của họ."
    )
  ) {
    makeRequest(`/admin/users/${userId}`, "DELETE")
      .then((data) => {
        if (data.success) {
          showToast(data.message, "success");
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(data.message || "Có lỗi xảy ra", "danger");
        }
      })
      .catch((error) => {
        showToast("Có lỗi xảy ra khi xóa người dùng", "danger");
      });
  }
};

window.activateCategory = function (categoryId) {
  if (confirm("Bạn có chắc chắn muốn kích hoạt danh mục này?")) {
    makeRequest(`/admin/categories/${categoryId}/activate`, "POST")
      .then((data) => {
        if (data.success) {
          showToast(data.message, "success");
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(data.message || "Có lỗi xảy ra", "danger");
        }
      })
      .catch((error) => {
        showToast("Có lỗi xảy ra khi kích hoạt danh mục", "danger");
      });
  }
};

window.deactivateCategory = function (categoryId) {
  if (confirm("Bạn có chắc chắn muốn vô hiệu hóa danh mục này?")) {
    makeRequest(`/admin/categories/${categoryId}/deactivate`, "POST")
      .then((data) => {
        if (data.success) {
          showToast(data.message, "warning");
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(data.message || "Có lỗi xảy ra", "danger");
        }
      })
      .catch((error) => {
        showToast("Có lỗi xảy ra khi vô hiệu hóa danh mục", "danger");
      });
  }
};

window.deleteCategory = function (categoryId, categoryName) {
  if (
    confirm(
      `Bạn có chắc chắn muốn xóa danh mục "${categoryName}"? Hành động này không thể hoàn tác.`
    )
  ) {
    makeRequest(`/admin/categories/${categoryId}`, "DELETE")
      .then((data) => {
        if (data.success) {
          showToast(data.message, "success");
          setTimeout(() => location.reload(), 1000);
        } else {
          showToast(data.message || "Có lỗi xảy ra", "danger");
        }
      })
      .catch((error) => {
        showToast("Có lỗi xảy ra khi xóa danh mục", "danger");
      });
  }
};

window.editCategory = function (id, name, description) {
  document.getElementById("editCategoryId").value = id;
  document.getElementById("editCategoryName").value = name;
  document.getElementById("editCategoryDescription").value = description || "";

  const modal = new bootstrap.Modal(
    document.getElementById("editCategoryModal")
  );
  modal.show();
};

document.addEventListener("DOMContentLoaded", function () {

  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)";
    });
  });

  const alerts = document.querySelectorAll(".alert");
  alerts.forEach((alert) => {
    setTimeout(() => {
      if (alert.parentNode) {
        alert.classList.remove("show");
        setTimeout(() => {
          if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
          }
        }, 150);
      }
    }, 5000);
  });

  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", function () {
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        showLoading(submitBtn);
      }
    });
  });
});

window.formatPrice = function (price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

window.formatDate = function (date) {
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
