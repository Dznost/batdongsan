

document.addEventListener("DOMContentLoaded", function () {
  console.log("FilePond setup started");

  if (typeof FilePond === "undefined") {
    console.error("FilePond is not loaded");
    return;
  }

  try {
    FilePond.registerPlugin(
      FilePondPluginImagePreview,
      FilePondPluginImageResize,
      FilePondPluginFileValidateType,
      FilePondPluginFileValidateSize
    );
    console.log("FilePond plugins registered successfully");
  } catch (error) {
    console.error("Error registering FilePond plugins:", error);
    return;
  }

  const inputElement = document.querySelector("#images");

  if (inputElement) {

    const pond = FilePond.create(inputElement, {

      allowMultiple: true,
      maxFiles: 5,

      acceptedFileTypes: ["image/png", "image/jpeg", "image/jpg", "image/gif"],
      maxFileSize: "5MB",

      allowImagePreview: true,
      imagePreviewHeight: 170,
      imagePreviewMaxHeight: 256,

      allowImageResize: true,
      imageResizeTargetWidth: 800,
      imageResizeTargetHeight: 600,
      imageResizeMode: "contain",
      imageResizeUpscale: false,

      labelIdle: `
                <div class="filepond-drop-area">
                    <i class="fas fa-cloud-upload-alt fa-3x text-primary mb-3"></i>
                    <h6>Kéo thả ảnh vào đây hoặc <span class="filepond-label-action text-primary">Chọn file</span></h6>
                    <p class="text-muted mb-0">
                        Tối đa 5 ảnh, mỗi ảnh không quá 5MB<br>
                        Định dạng: JPG, PNG, GIF
                    </p>
                </div>
            `,
      labelInvalidField: "Trường chứa file không hợp lệ",
      labelFileWaitingForSize: "Đang tính toán kích thước",
      labelFileSizeNotAvailable: "Kích thước không khả dụng",
      labelFileLoading: "Đang tải",
      labelFileLoadError: "Lỗi khi tải file",
      labelFileProcessing: "Đang xử lý",
      labelFileProcessingComplete: "Xử lý hoàn tất",
      labelFileProcessingAborted: "Đã hủy xử lý",
      labelFileProcessingError: "Lỗi khi xử lý",
      labelFileProcessingRevertError: "Lỗi khi hoàn tác",
      labelFileRemoveError: "Lỗi khi xóa",
      labelTapToCancel: "nhấn để hủy",
      labelTapToRetry: "nhấn để thử lại",
      labelTapToUndo: "nhấn để hoàn tác",
      labelButtonRemoveItem: "Xóa",
      labelButtonAbortItemLoad: "Hủy",
      labelButtonRetryItemLoad: "Thử lại",
      labelButtonAbortItemProcessing: "Hủy",
      labelButtonUndoItemProcessing: "Hoàn tác",
      labelButtonRetryItemProcessing: "Thử lại",
      labelButtonProcessItem: "Tải lên",

      labelFileTypeNotAllowed: "File không đúng định dạng",
      fileValidateTypeLabelExpectedTypes:
        "Chỉ chấp nhận {allButLastType} hoặc {lastType}",
      fileValidateTypeLabelExpectedTypesMap: {
        "image/jpeg": "JPEG",
        "image/png": "PNG",
        "image/gif": "GIF",
      },

      labelMaxFileSizeExceeded: "File quá lớn",
      labelMaxFileSize: "Kích thước tối đa là {filesize}",

      labelMaxTotalFileSizeExceeded: "Tổng kích thước file vượt quá giới hạn",
      labelMaxTotalFileSize: "Tổng kích thước tối đa là {filesize}",

      stylePanelLayout: "compact",
      styleLoadIndicatorPosition: "center bottom",
      styleProgressIndicatorPosition: "right bottom",
      styleButtonRemoveItemPosition: "left bottom",
      styleButtonProcessItemPosition: "right bottom",

      credits: false,

      onaddfile: (error, file) => {
        if (error) {
          console.error("Error adding file:", error);
          return;
        }
        console.log("File added:", file.filename);
        updateFileCount();
      },

      onremovefile: (error, file) => {
        if (error) {
          console.error("Error removing file:", error);
          return;
        }
        console.log("File removed:", file.filename);
        updateFileCount();
      },

      onprocessfile: (error, file) => {
        if (error) {
          console.error("Error processing file:", error);
          return;
        }
        console.log("File processed:", file.filename);
      },

      onerror: (error) => {
        console.error("FilePond error:", error);
      },
    });

    function updateFileCount() {
      const files = pond.getFiles();
      const count = files.length;

      const countElement = document.querySelector("#file-count");
      if (countElement) {
        countElement.textContent = count;
      }

      console.log(`Current file count: ${count}`);
    }

    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", function (e) {
        const files = pond.getFiles();
        console.log("Form submitted with files:", files.length);

        if (files.length === 0) {

          console.log("No files selected, proceeding with form submission");
        } else {
          console.log(
            "Files ready for submission:",
            files.map((f) => f.filename)
          );
        }
      });
    }

    window.filePond = pond;

    console.log("FilePond initialized successfully");
  } else {
    console.error("File input element not found");
  }

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
