

document.addEventListener("DOMContentLoaded", function () {
  console.log("Create post JS loaded");

  const descriptionInput = document.getElementById("description");
  const descriptionCount = document.getElementById("descriptionCount");

  if (descriptionInput && descriptionCount) {
    descriptionInput.addEventListener("input", function () {
      const count = this.value.length;
      descriptionCount.textContent = count;

      if (count > 2000) {
        this.classList.add("is-invalid");
      } else {
        this.classList.remove("is-invalid");
      }
    });
  }

  const priceInput = document.getElementById("price");
  const areaInput = document.getElementById("area");
  const priceDisplay = document.getElementById("priceDisplay");
  const pricePerSqm = document.getElementById("pricePerSqm");

  function calculatePrice() {
    const price = parseInt(priceInput.value) || 0;
    const area = parseInt(areaInput.value) || 0;

    if (price > 0) {
      const formatted = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
      if (priceDisplay) priceDisplay.textContent = formatted;
    } else {
      if (priceDisplay) priceDisplay.textContent = "";
    }

    if (price > 0 && area > 0) {
      const pricePerSqmValue = Math.round(price / area);
      const formattedPerSqm = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(pricePerSqmValue);
      if (pricePerSqm) pricePerSqm.textContent = formattedPerSqm + "/m²";
    } else {
      if (pricePerSqm) pricePerSqm.textContent = "";
    }
  }

  if (priceInput) {
    priceInput.addEventListener("input", calculatePrice);
  }

  if (areaInput) {
    areaInput.addEventListener("input", calculatePrice);
  }
});

function previewImages(input) {
  console.log("previewImages called with:", input.files.length, "files");

  const preview = document.getElementById("image-preview");
  if (!preview) {
    console.error("Preview container not found");
    return;
  }

  preview.innerHTML = "";

  if (input.files && input.files.length > 0) {

    Array.from(input.files).forEach((file, index) => {
      console.log(`Processing file ${index + 1}:`, file.name);

      if (index >= 5) {
        console.log("Max 5 images reached, skipping file:", file.name);
        return; // Max 5 images
      }

      if (!file.type.startsWith("image/")) {
        console.error("Invalid file type:", file.type);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        console.error("File too large:", file.size);
        alert(`File ${file.name} quá lớn. Vui lòng chọn file nhỏ hơn 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = function (e) {
        console.log(`File ${index + 1} loaded successfully`);

        const div = document.createElement("div");
        div.className =
          "image-preview-item d-inline-block position-relative me-2 mb-2";
        div.setAttribute("data-index", index);

        div.innerHTML = `
                    <img src="${e.target.result}" 
                         alt="Preview ${index + 1}" 
                         style="width: 100px; height: 100px; object-fit: cover;" 
                         class="rounded border">
                    <button type="button" 
                            class="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle" 
                            style="width: 25px; height: 25px; padding: 0; margin: -5px;"
                            onclick="removeImage(this, ${index})"
                            title="Xóa ảnh">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="position-absolute bottom-0 start-0 bg-dark text-white px-1 rounded-end" 
                         style="font-size: 10px;">
                        ${index + 1}
                    </div>
                `;

        preview.appendChild(div);
        console.log(`Preview ${index + 1} added to DOM`);
      };

      reader.onerror = function (error) {
        console.error("Error reading file:", error);
        alert(`Lỗi khi đọc file ${file.name}`);
      };

      reader.readAsDataURL(file);
    });

    const fileCount = Math.min(input.files.length, 5);
    console.log(`Total files to preview: ${fileCount}`);

    setTimeout(() => {
      const infoDiv = document.createElement("div");
      infoDiv.className = "mt-2 text-muted small";
      infoDiv.innerHTML = `
                <i class="fas fa-info-circle me-1"></i>
                Đã chọn ${fileCount} ảnh${
        input.files.length > 5 ? " (chỉ hiển thị 5 ảnh đầu tiên)" : ""
      }
            `;
      preview.appendChild(infoDiv);
    }, 100);
  } else {
    console.log("No files selected");
  }
}

function removeImage(button, index) {
  console.log(`removeImage called for index: ${index}`);

  try {
    const input = document.getElementById("images");
    if (!input) {
      console.error("Images input not found");
      return;
    }

    const previewElement = button.closest(".image-preview-item");
    if (!previewElement) {
      console.error("Preview element not found");
      return;
    }

    const dt = new DataTransfer();
    const files = Array.from(input.files);

    console.log(`Original files count: ${files.length}`);

    files.forEach((file, i) => {
      if (i !== index) {
        dt.items.add(file);
        console.log(`Keeping file ${i}: ${file.name}`);
      } else {
        console.log(`Removing file ${i}: ${file.name}`);
      }
    });

    input.files = dt.files;
    console.log(`New files count: ${dt.files.length}`);

    previewElement.remove();

    if (dt.files.length > 0) {
      console.log("Refreshing previews...");
      previewImages(input);
    } else {
      console.log("No files left, clearing preview");
      const preview = document.getElementById("image-preview");
      if (preview) {
        preview.innerHTML = "";
      }
    }

    console.log(`Successfully removed image at index ${index}`);
  } catch (error) {
    console.error("Error removing image:", error);
    alert("Có lỗi xảy ra khi xóa ảnh");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const uploadArea = document.querySelector(".file-upload-area");
  const fileInput = document.getElementById("images");

  if (uploadArea && fileInput) {

    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, highlight, false);
    });

    ["dragleave", "drop"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, unhighlight, false);
    });

    uploadArea.addEventListener("drop", handleDrop, false);

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    function highlight(e) {
      uploadArea.classList.add("border-primary", "bg-light");
    }

    function unhighlight(e) {
      uploadArea.classList.remove("border-primary", "bg-light");
    }

    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;

      console.log("Files dropped:", files.length);

      fileInput.files = files;

      previewImages(fileInput);
    }
  }

  const form = document.querySelector(".needs-validation");

  if (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();

          const firstInvalid = form.querySelector(":invalid");
          if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }

        form.classList.add("was-validated");
      },
      false
    );
  }
});
