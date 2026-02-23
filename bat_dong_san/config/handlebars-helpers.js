

module.exports = {
  eq: function (a, b) {
    return a === b;
  },

  neq: function (a, b) {
    return a !== b;
  },

  gt: function (a, b) {
    return a > b;
  },

  lt: function (a, b) {
    return a < b;
  },

  formatCurrency: function (amount) {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  },

  formatPrice: function (price) {
    if (!price) return "0";
    if (price >= 1000000000) {
      return (price / 1000000000).toFixed(1) + " tỷ";
    } else if (price >= 1000000) {
      return (price / 1000000).toFixed(0) + " triệu";
    } else if (price >= 1000) {
      return (price / 1000).toFixed(0) + " nghìn";
    }
    return price.toString();
  },

  formatDate: function (date) {
    if (!date) return "";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  },

  formatDateTime: function (date) {
    if (!date) return "";
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  },

  truncate: function (text, length) {
    if (!text) return "";
    if (text.length <= length) return text;
    return text.substring(0, length) + "...";
  },


  firstImage: function (images) {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return "/images/no-image.jpg";
    }
    return images[0];
  },

  hasItems: function (array) {
    return Array.isArray(array) && array.length > 0;
  },

  length: function (array) {
    if (!Array.isArray(array)) return 0;
    return array.length;
  },

  add: function (a, b) {
    return a + b;
  },

  subtract: function (a, b) {
    return a - b;
  },

  multiply: function (a, b) {
    return a * b;
  },


  isAdmin: function (user) {
    return user && user.role === "admin";
  },

  isOwner: function (post, user) {
    if (!post || !user) return false;
    return post.userId && post.userId.toString() === user._id.toString();
  },

  getStatusBadge: function (isApproved) {
    if (isApproved === true) return "badge-success";
    if (isApproved === false) return "badge-danger";
    return "badge-warning";
  },

  getStatusText: function (isApproved) {
    if (isApproved === true) return "Đã duyệt";
    if (isApproved === false) return "Từ chối";
    return "Chờ duyệt";
  },

  pagination: function (currentPage, totalPages, options) {
    let result = "";
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (currentPage > 1) {
      result += `<li class="page-item">
                <a class="page-link" href="?page=${currentPage - 1}">Trước</a>
            </li>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      const activeClass = i === currentPage ? "active" : "";
      result += `<li class="page-item ${activeClass}">
                <a class="page-link" href="?page=${i}">${i}</a>
            </li>`;
    }

    if (currentPage < totalPages) {
      result += `<li class="page-item">
                <a class="page-link" href="?page=${currentPage + 1}">Sau</a>
            </li>`;
    }

    return result;
  },

  json: function (context) {
    return JSON.stringify(context, null, 2);
  },

  times: function (n, options) {
    let result = "";
    for (let i = 0; i < n; i++) {
      result += options.fn({ index: i });
    }
    return result;
  },

  split: function (str, delimiter) {
    if (!str) return [];
    return str.split(delimiter);
  },


  timeAgo: function (date) {
    if (!date) return "";

    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Vừa xong";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return new Date(date).toLocaleDateString("vi-VN");
    }
  },

  range: function (start, end) {
    const result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  },
};
