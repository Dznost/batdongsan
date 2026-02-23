

document.addEventListener('DOMContentLoaded', function() {
    console.log('TinyMCE setup started');

    if (typeof tinymce === 'undefined') {
        console.error('TinyMCE is not loaded');
        return;
    }

    tinymce.init({
        selector: '#description',
        height: 350,
        menubar: false,

        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'table', 'help', 'wordcount', 'emoticons'
        ],

        toolbar: 'undo redo | blocks fontsize | ' +
                'bold italic underline strikethrough | forecolor backcolor | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent | ' +
                'link table emoticons | ' +
                'removeformat code help',

        content_style: `
            body { 
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
                font-size: 14px;
                line-height: 1.6;
                color: #333;
                padding: 10px;
            }
            p { margin-bottom: 10px; }
            ul, ol { padding-left: 20px; }
            blockquote { 
                border-left: 4px solid #0d6efd; 
                padding-left: 15px; 
                margin: 15px 0; 
                font-style: italic; 
            }
        `,

        placeholder: 'Mô tả chi tiết về bất động sản:\n\n• Vị trí: Gần trường học, bệnh viện, chợ...\n• Tiện ích: Thang máy, bảo vệ 24/7, hồ bơi...\n• Đặc điểm nổi bật: View đẹp, thoáng mát, an ninh...\n• Pháp lý: Sổ hồng riêng, không tranh chấp...',

        language: 'vi',

        branding: false,
        resize: true,
        statusbar: true,
        elementpath: false,

        max_chars: 2000,

        block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Preformatted=pre; Blockquote=blockquote',

        fontsize_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt',

        setup: function (editor) {
            console.log('TinyMCE editor setup');

            editor.on('keyup paste input', function () {
                updateCharacterCount(editor);
            });

            editor.on('change', function () {
                editor.save();
                updateCharacterCount(editor);
            });

            editor.on('init', function () {
                console.log('TinyMCE editor initialized');
                editor.save();
                updateCharacterCount(editor);

                setTimeout(() => {
                    editor.focus();
                }, 100);
            });

            editor.ui.registry.addButton('realestate_template', {
                text: 'Mẫu BĐS',
                tooltip: 'Chèn mẫu mô tả bất động sản',
                onAction: function () {
                    const template = `
<h3>🏠 Thông tin bất động sản</h3>
<p><strong>📍 Vị trí:</strong></p>
<ul>
<li>Gần trường học, bệnh viện</li>
<li>Thuận tiện di chuyển</li>
<li>Khu vực an ninh</li>
</ul>

<p><strong>🏢 Tiện ích:</strong></p>
<ul>
<li>Thang máy hiện đại</li>
<li>Bảo vệ 24/7</li>
<li>Chỗ đậu xe</li>
</ul>

<p><strong>✨ Đặc điểm nổi bật:</strong></p>
<ul>
<li>Thiết kế hiện đại</li>
<li>Ánh sáng tự nhiên</li>
<li>Thoáng mát</li>
</ul>

<p><strong>📋 Pháp lý:</strong></p>
<ul>
<li>Sổ hồng riêng</li>
<li>Không tranh chấp</li>
<li>Sẵn sàng giao dịch</li>
</ul>
                    `;
                    editor.insertContent(template);
                }
            });

            const toolbar = editor.settings.toolbar;
            editor.settings.toolbar = toolbar + ' | realestate_template';
        },

        language_url: 'https://cdn.jsdelivr.net/npm/tinymce-i18n@23.10.9/langs6/vi.js',

        valid_elements: 'p,br,strong,b,em,i,u,strike,h1,h2,h3,h4,h5,h6,ul,ol,li,blockquote,a[href],table,thead,tbody,tr,th,td',

        paste_as_text: false,
        paste_auto_cleanup_on_paste: true,
        paste_remove_styles: false,
        paste_remove_styles_if_webkit: false,

        link_default_target: '_blank',
        link_assume_external_targets: true,

        table_default_attributes: {
            class: 'table table-bordered'
        },

        images_upload_handler: function (blobInfo, success, failure) {
            failure('Image upload is disabled. Please use the image upload section below.');
        }
    });

    function updateCharacterCount(editor) {
        const content = editor.getContent({format: 'text'});
        const count = content.length;
        const countElement = document.getElementById('descriptionCount');
        
        if (countElement) {
            countElement.textContent = count;
        }

        const editorContainer = editor.getContainer();
        if (editorContainer) {
            if (count > 2000) {
                editorContainer.style.borderColor = '#dc3545';
            } else if (count < 50) {
                editorContainer.style.borderColor = '#ffc107';
            } else {
                editorContainer.style.borderColor = '#198754';
            }
        }
        
        console.log(`Description character count: ${count}/2000`);
    }

    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            console.log('Form submission - syncing TinyMCE content');

            tinymce.triggerSave();

            const description = document.getElementById('description').value;
            const textContent = description.replace(/<[^>]*>/g, '').trim();
            
            console.log('Description length:', textContent.length);

            if (textContent.length < 50) {
                e.preventDefault();
                alert('Mô tả phải có ít nhất 50 ký tự (không tính thẻ HTML).');

                const editor = tinymce.get('description');
                if (editor) {
                    editor.focus();
                }
                return false;
            }
            
            if (textContent.length > 2000) {
                e.preventDefault();
                alert('Mô tả không được vượt quá 2000 ký tự (không tính thẻ HTML).');

                const editor = tinymce.get('description');
                if (editor) {
                    editor.focus();
                }
                return false;
            }
            
            console.log('Description validation passed');
        });
    }
    
    console.log('TinyMCE setup completed');
});
