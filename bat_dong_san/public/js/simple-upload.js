

document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple upload JS loaded');
    
    const fileInput = document.getElementById('images');
    const fileCountSpan = document.getElementById('file-count');
    
    if (!fileInput) {
        console.error('File input not found');
        return;
    }

    let previewContainer = document.getElementById('image-preview');
    if (!previewContainer) {
        previewContainer = document.createElement('div');
        previewContainer.id = 'image-preview';
        previewContainer.className = 'mt-3';
        fileInput.parentNode.appendChild(previewContainer);
    }

    fileInput.style.display = 'block';
    fileInput.className = 'form-control';

    fileInput.addEventListener('change', function(e) {
        handleFiles(this.files);
    });

    const dropZone = fileInput.parentNode;
    dropZone.style.border = '2px dashed #dee2e6';
    dropZone.style.borderRadius = '0.375rem';
    dropZone.style.padding = '1rem';
    dropZone.style.textAlign = 'center';
    dropZone.style.backgroundColor = '#f8f9fa';
    dropZone.style.transition = 'all 0.3s ease';

    const dropText = document.createElement('div');
    dropText.innerHTML = `
        <i class="fas fa-cloud-upload-alt fa-2x text-primary mb-2"></i>
        <p class="mb-2">Kéo thả ảnh vào đây hoặc click để chọn</p>
        <small class="text-muted">Tối đa 5 ảnh, mỗi ảnh không quá 5MB</small>
    `;
    dropText.style.marginBottom = '1rem';
    fileInput.parentNode.insertBefore(dropText, fileInput);

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        dropZone.style.borderColor = '#0d6efd';
        dropZone.style.backgroundColor = '#e7f1ff';
    }
    
    function unhighlight(e) {
        dropZone.style.borderColor = '#dee2e6';
        dropZone.style.backgroundColor = '#f8f9fa';
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        fileInput.files = files;
        handleFiles(files);
    }
    
    function handleFiles(files) {
        console.log('Files selected:', files.length);

        previewContainer.innerHTML = '';

        if (fileCountSpan) {
            fileCountSpan.textContent = files.length;
        }
        
        if (files.length === 0) {
            return;
        }

        Array.from(files).forEach((file, index) => {
            if (index >= 5) {
                console.log('Max 5 files allowed');
                return;
            }

            if (!file.type.startsWith('image/')) {
                showError(`File "${file.name}" không phải là ảnh`);
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showError(`File "${file.name}" quá lớn (tối đa 5MB)`);
                return;
            }

            createPreview(file, index);
        });
    }
    
    function createPreview(file, index) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'image-preview-item d-inline-block position-relative me-2 mb-2';
            previewDiv.style.width = '120px';
            previewDiv.style.height = '120px';
            
            previewDiv.innerHTML = `
                <img src="${e.target.result}" 
                     alt="Preview ${index + 1}" 
                     style="width: 100%; height: 100%; object-fit: cover;" 
                     class="rounded border">
                <button type="button" 
                        class="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle" 
                        style="width: 25px; height: 25px; padding: 0; margin: -5px;"
                        onclick="removePreview(this, ${index})"
                        title="Xóa ảnh">
                    <i class="fas fa-times"></i>
                </button>
                <div class="position-absolute bottom-0 start-0 bg-dark text-white px-1 rounded-end" 
                     style="font-size: 10px;">
                    ${index + 1}
                </div>
            `;
            
            previewContainer.appendChild(previewDiv);
        };
        
        reader.onerror = function() {
            showError(`Không thể đọc file "${file.name}"`);
        };
        
        reader.readAsDataURL(file);
    }
    
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger alert-dismissible fade show mt-2';
        errorDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        previewContainer.appendChild(errorDiv);

        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    const descriptionInput = document.getElementById('description');
    const descriptionCount = document.getElementById('descriptionCount');
    
    if (descriptionInput && descriptionCount) {
        descriptionInput.addEventListener('input', function() {
            const count = this.value.length;
            descriptionCount.textContent = count;
            
            if (count > 2000) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
    }

    const priceInput = document.getElementById('price');
    const areaInput = document.getElementById('area');
    const priceDisplay = document.getElementById('priceDisplay');
    const pricePerSqm = document.getElementById('pricePerSqm');
    
    function calculatePrice() {
        const price = parseInt(priceInput.value) || 0;
        const area = parseInt(areaInput.value) || 0;

        if (price > 0) {
            const formatted = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(price);
            if (priceDisplay) priceDisplay.textContent = formatted;
        } else {
            if (priceDisplay) priceDisplay.textContent = '';
        }

        if (price > 0 && area > 0) {
            const pricePerSqmValue = Math.round(price / area);
            const formattedPerSqm = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(pricePerSqmValue);
            if (pricePerSqm) pricePerSqm.textContent = formattedPerSqm + '/m²';
        } else {
            if (pricePerSqm) pricePerSqm.textContent = '';
        }
    }
    
    if (priceInput) {
        priceInput.addEventListener('input', calculatePrice);
    }
    
    if (areaInput) {
        areaInput.addEventListener('input', calculatePrice);
    }

    const form = document.querySelector('.needs-validation');
    if (form) {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();

                const firstInvalid = form.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            
            form.classList.add('was-validated');
        }, false);
    }
});

function removePreview(button, index) {
    console.log('Removing preview at index:', index);
    
    const fileInput = document.getElementById('images');
    const fileCountSpan = document.getElementById('file-count');
    
    if (!fileInput) return;

    const dt = new DataTransfer();
    const files = Array.from(fileInput.files);
    
    files.forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    
    fileInput.files = dt.files;

    if (fileCountSpan) {
        fileCountSpan.textContent = dt.files.length;
    }

    button.closest('.image-preview-item').remove();

    const previews = document.querySelectorAll('.image-preview-item');
    previews.forEach((preview, newIndex) => {
        const badge = preview.querySelector('.position-absolute.bottom-0');
        if (badge) {
            badge.textContent = newIndex + 1;
        }
        
        const removeBtn = preview.querySelector('button');
        if (removeBtn) {
            removeBtn.setAttribute('onclick', `removePreview(this, ${newIndex})`);
        }
    });
    
    console.log('Files remaining:', dt.files.length);
}