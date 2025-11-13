// Mutantcat LaTeX Reader - 主应用程序
(function() {
    'use strict';

    // 应用状态
    const AppState = {
        currentMode: 'editor',
        editorFontSize: 100,
        windows: {},
        windowZIndex: 1,
        nextWindowId: 1
    };

    // 工具函数
    const Utils = {
        // 获取 URL 参数
        getUrlParams() {
            const params = {};
            const queryString = window.location.search.substring(1);
            const pairs = queryString.split('&');
            
            for (let pair of pairs) {
                const [key, value] = pair.split('=');
                if (key) {
                    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
                }
            }
            return params;
        },

        // 设置 URL 参数
        setUrlParam(key, value) {
            const url = new URL(window.location);
            url.searchParams.set(key, value);
            window.history.pushState({}, '', url);
        },

        // Base64 编码
        encodeBase64(str) {
            return btoa(unescape(encodeURIComponent(str)));
        },

        // Base64 解码
        decodeBase64(str) {
            try {
                return decodeURIComponent(escape(atob(str)));
            } catch (e) {
                console.error('Base64 解码失败:', e);
                return '';
            }
        },

        // 渲染 LaTeX
        renderLatex(text, container, options = {}) {
            try {
                container.innerHTML = '';
                
                const generator = new latexjs.HtmlGenerator({ 
                    hyphenate: false 
                });
                
                const parsed = latexjs.parse(text, { generator: generator });
                
                // 添加样式和脚本
                if (!document.querySelector('#latex-styles')) {
                    const styles = generator.stylesAndScripts("https://cdn.jsdelivr.net/npm/latex.js@0.12.4/dist/");
                    // const styles = generator.stylesAndScripts("//latexreader.mutantcat.org/latax_base");
                    styles.id = 'latex-styles';
                    document.head.appendChild(styles);
                }
                
                // 添加渲染结果
                const fragment = parsed.domFragment();
                container.appendChild(fragment);
                
                // 应用字体大小
                if (options.fontSize) {
                    container.style.fontSize = options.fontSize + 'px';
                }
                
                // 应用对齐方式
                if (options.align) {
                    container.className = container.className.replace(/align-\w+/g, '');
                    container.classList.add('align-' + options.align);
                }
                
                return true;
            } catch (error) {
                console.error('LaTeX 渲染错误:', error);
                container.innerHTML = '<div class="layui-text" style="color: red;">渲染错误: ' + error.message + '</div>';
                return false;
            }
        }
    };

    // 编辑器模式
    const EditorMode = {
        init() {
            const input = document.getElementById('latex-input');
            const output = document.getElementById('latex-output');
            const zoomIn = document.getElementById('zoom-in');
            const zoomOut = document.getElementById('zoom-out');
            const saveImage = document.getElementById('save-image');
            const fontSizeDisplay = document.getElementById('font-size-display');
            
            // 检查 URL 参数，加载外部数据
            this.loadExternalData(input);
            
            // 实时渲染
            let renderTimeout;
            input.addEventListener('input', () => {
                clearTimeout(renderTimeout);
                renderTimeout = setTimeout(() => {
                    this.render();
                }, 500);
            });
            
            // 缩放功能
            zoomIn.addEventListener('click', () => {
                AppState.editorFontSize = Math.min(200, AppState.editorFontSize + 10);
                this.updateFontSize();
            });
            
            zoomOut.addEventListener('click', () => {
                AppState.editorFontSize = Math.max(50, AppState.editorFontSize - 10);
                this.updateFontSize();
            });
            
            // 保存图片功能
            saveImage.addEventListener('click', () => {
                this.saveAsImage();
            });
            
            // 快捷工具按钮
            document.querySelectorAll('.quick-tools button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const latex = btn.getAttribute('data-latex');
                    if (latex) {
                        input.value += ' ' + latex + ' ';
                        input.focus();
                        this.render();
                    }
                });
            });
            
            // 初始渲染
            this.render();
        },

        loadExternalData(input) {
            const params = Utils.getUrlParams();
            
            // 优先检查 base64 参数
            if (params.base64) {
                const decoded = Utils.decodeBase64(params.base64);
                if (decoded) {
                    input.value = decoded;
                    return;
                }
            }
            
            // 其次检查 url 参数
            if (params.url) {
                fetch(params.url)
                    .then(response => response.text())
                    .then(text => {
                        input.value = text;
                        this.render();
                    })
                    .catch(error => {
                        console.error('加载 URL 失败:', error);
                        // 失败时使用默认示例
                        input.value = 'The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$ and Einstein\'s famous equation is $E=mc^2$. For calculus, we have $\\int_0^\\infty e^{-x^2}dx = \\frac{\\sqrt{\\pi}}{2}$.';
                    });
                return;
            }
            
            // 使用默认示例
            input.value = 'The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$ and Einstein\'s famous equation is $E=mc^2$. For calculus, we have $\\int_0^\\infty e^{-x^2}dx = \\frac{\\sqrt{\\pi}}{2}$.';
        },

        render() {
            const input = document.getElementById('latex-input');
            const output = document.getElementById('latex-output');
            
            Utils.renderLatex(input.value, output, {
                fontSize: AppState.editorFontSize / 100 * 16
            });
        },

        updateFontSize() {
            const output = document.getElementById('latex-output');
            const fontSizeDisplay = document.getElementById('font-size-display');
            
            output.style.fontSize = (AppState.editorFontSize / 100 * 16) + 'px';
            fontSizeDisplay.textContent = AppState.editorFontSize + '%';
        },

        saveAsImage() {
            const output = document.getElementById('latex-output');
            
            layui.use('layer', function() {
                const layer = layui.layer;
                const loadingIndex = layer.load(2, { shade: 0.3 });
                
                html2canvas(output, {
                    backgroundColor: '#ffffff',
                    scale: 2
                }).then(canvas => {
                    layer.close(loadingIndex);
                    
                    // 下载图片
                    const link = document.createElement('a');
                    link.download = 'latex-' + Date.now() + '.png';
                    link.href = canvas.toDataURL();
                    link.click();
                    
                    layer.msg('图片已保存');
                }).catch(err => {
                    layer.close(loadingIndex);
                    layer.msg('保存失败: ' + err.message);
                });
            });
        }
    };

    // 多窗口模式
    const WindowMode = {
        tempPreviewMode: false,
        tempPreviewStates: {},

        // 检查并修正窗口位置，确保不超出边界
        constrainWindowPosition(windowDiv) {
            const container = document.getElementById('windows-container');
            const containerRect = container.getBoundingClientRect();
            
            const windowWidth = windowDiv.offsetWidth;
            const windowHeight = windowDiv.offsetHeight;
            
            let left = parseInt(windowDiv.style.left) || 0;
            let top = parseInt(windowDiv.style.top) || 0;
            
            // 计算可用空间（减去头部高度60px和工具栏高度）
            const maxLeft = containerRect.width - windowWidth;
            const maxTop = containerRect.height - windowHeight;
            
            // 至少保留50px可见，以便用户可以拖动回来
            const minVisible = 50;
            
            // 限制左边界（至少显示50px）
            if (left < minVisible - windowWidth) {
                left = minVisible - windowWidth;
            }
            
            // 限制右边界（至少显示50px）
            if (left > containerRect.width - minVisible) {
                left = containerRect.width - minVisible;
            }
            
            // 限制上边界（标题栏必须可见）
            if (top < 0) {
                top = 0;
            }
            
            // 限制下边界（至少显示标题栏，约40px）
            if (top > containerRect.height - 40) {
                top = Math.max(0, containerRect.height - 40);
            }
            
            windowDiv.style.left = left + 'px';
            windowDiv.style.top = top + 'px';
        },

        // 检查并修正窗口大小
        constrainWindowSize(windowDiv) {
            const container = document.getElementById('windows-container');
            const containerRect = container.getBoundingClientRect();
            
            let width = parseInt(windowDiv.style.width) || 400;
            let height = parseInt(windowDiv.style.height) || 300;
            
            // 最小尺寸
            const minWidth = 300;
            const minHeight = 200;
            
            // 最大尺寸（容器尺寸）
            const maxWidth = containerRect.width;
            const maxHeight = containerRect.height;
            
            width = Math.max(minWidth, Math.min(width, maxWidth));
            height = Math.max(minHeight, Math.min(height, maxHeight));
            
            windowDiv.style.width = width + 'px';
            windowDiv.style.height = height + 'px';
        },

        init() {
            document.getElementById('new-window-btn').addEventListener('click', () => {
                this.createWindow();
            });
            
            document.getElementById('export-mlatex').addEventListener('click', () => {
                this.exportMLatex();
            });
            
            document.getElementById('import-mlatex').addEventListener('click', () => {
                this.importMLatex();
            });

            document.getElementById('all-edit-btn').addEventListener('click', () => {
                this.switchAllWindows('editor');
            });

            document.getElementById('all-preview-btn').addEventListener('click', () => {
                this.switchAllWindows('preview');
            });

            document.getElementById('temp-preview-btn').addEventListener('click', () => {
                this.toggleTempPreview();
            });

            // 监听窗口大小变化，重新校正所有窗口位置
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.constrainAllWindows();
                }, 100);
            });
        },

        // 校正所有窗口位置和大小
        constrainAllWindows() {
            Object.keys(AppState.windows).forEach(windowId => {
                const windowDiv = document.getElementById(windowId);
                if (windowDiv) {
                    this.constrainWindowSize(windowDiv);
                    this.constrainWindowPosition(windowDiv);
                }
            });
        },

        switchAllWindows(mode) {
            Object.keys(AppState.windows).forEach(windowId => {
                const windowDiv = document.getElementById(windowId);
                if (!windowDiv) return;

                const tabs = windowDiv.querySelectorAll('.window-tab');
                const editor = windowDiv.querySelector('.window-editor');
                const preview = windowDiv.querySelector('.window-preview');

                tabs.forEach(tab => {
                    if (tab.getAttribute('data-tab') === mode) {
                        tab.classList.add('active');
                    } else {
                        tab.classList.remove('active');
                    }
                });

                if (mode === 'editor') {
                    editor.style.display = 'block';
                    preview.style.display = 'none';
                } else {
                    editor.style.display = 'none';
                    preview.style.display = 'block';
                    Utils.renderLatex(editor.value, preview);
                }
            });
        },

        toggleTempPreview() {
            const btn = document.getElementById('temp-preview-btn');
            const icon = btn.querySelector('.layui-icon');

            if (!this.tempPreviewMode) {
                // 进入临时预览模式
                this.tempPreviewMode = true;
                icon.className = 'layui-icon layui-icon-eye';
                btn.innerHTML = '<i class="layui-icon layui-icon-eye"></i> 临时预览';
                btn.classList.add('active');
                btn.classList.remove('layui-btn-primary');

                // 保存当前状态
                this.tempPreviewStates = {};
                Object.keys(AppState.windows).forEach(windowId => {
                    const windowDiv = document.getElementById(windowId);
                    if (!windowDiv) return;

                    const editor = windowDiv.querySelector('.window-editor');
                    const preview = windowDiv.querySelector('.window-preview');
                    
                    // 记录当前显示状态
                    this.tempPreviewStates[windowId] = {
                        isPreview: preview.style.display !== 'none'
                    };
                });

                // 切换到全部预览
                this.switchAllWindows('preview');
            } else {
                // 退出临时预览模式
                this.tempPreviewMode = false;
                icon.className = 'layui-icon layui-icon-close-fill';
                btn.innerHTML = '<i class="layui-icon layui-icon-close-fill"></i> 临时预览';
                btn.classList.remove('active');

                // 恢复之前的状态
                Object.keys(AppState.windows).forEach(windowId => {
                    const windowDiv = document.getElementById(windowId);
                    if (!windowDiv || !this.tempPreviewStates[windowId]) return;

                    const tabs = windowDiv.querySelectorAll('.window-tab');
                    const editor = windowDiv.querySelector('.window-editor');
                    const preview = windowDiv.querySelector('.window-preview');
                    const wasPreview = this.tempPreviewStates[windowId].isPreview;

                    tabs.forEach(tab => {
                        const tabName = tab.getAttribute('data-tab');
                        if ((wasPreview && tabName === 'preview') || (!wasPreview && tabName === 'editor')) {
                            tab.classList.add('active');
                        } else {
                            tab.classList.remove('active');
                        }
                    });

                    if (wasPreview) {
                        editor.style.display = 'none';
                        preview.style.display = 'block';
                    } else {
                        editor.style.display = 'block';
                        preview.style.display = 'none';
                    }
                });

                this.tempPreviewStates = {};
            }
        },

        createWindow(data = null) {
            const windowId = 'window-' + AppState.nextWindowId++;
            const container = document.getElementById('windows-container');
            
            // 检查窗口名称是否重复
            let windowName = data?.name || '窗口 ' + Object.keys(AppState.windows).length;
            let counter = 1;
            while (Object.values(AppState.windows).some(w => w.name === windowName)) {
                windowName = (data?.name || '窗口 ') + ' (' + counter++ + ')';
            }
            
            const windowDiv = document.createElement('div');
            windowDiv.className = 'latex-window';
            windowDiv.id = windowId;
            
            // 设置初始位置和大小
            windowDiv.style.left = (data?.x || 50 + Object.keys(AppState.windows).length * 30) + 'px';
            windowDiv.style.top = (data?.y || 50 + Object.keys(AppState.windows).length * 30) + 'px';
            windowDiv.style.width = (data?.width || 400) + 'px';
            windowDiv.style.height = (data?.height || 300) + 'px';
            windowDiv.style.zIndex = ++AppState.windowZIndex;
            
            windowDiv.innerHTML = `
                <div class="window-header">
                    <div class="window-title">
                        <input type="text" value="${windowName}" maxlength="50">
                    </div>
                    <div class="window-controls">
                        <button class="layui-btn layui-btn-xs layui-btn-danger close-btn">
                            <i class="layui-icon layui-icon-close"></i>
                        </button>
                    </div>
                </div>
                <div class="window-content">
                    <div class="window-tabs">
                        <div class="window-tab active" data-tab="editor">编辑</div>
                        <div class="window-tab" data-tab="preview">预览</div>
                    </div>
                    <div class="window-tab-content">
                        <textarea class="window-editor" placeholder="输入 LaTeX 代码...">${data?.latex || ''}</textarea>
                        <div class="window-preview" style="display: none;"></div>
                    </div>
                </div>
                <div class="window-resize-handle"></div>
            `;
            
            container.appendChild(windowDiv);
            
            // 修正位置和大小，确保在可见范围内
            this.constrainWindowSize(windowDiv);
            this.constrainWindowPosition(windowDiv);
            
            // 保存窗口状态
            AppState.windows[windowId] = {
                id: windowId,
                name: windowName,
                element: windowDiv,
                latex: data?.latex || ''
            };
            
            // 绑定事件
            this.bindWindowEvents(windowId);
            
            // 设置为活动窗口
            this.setActiveWindow(windowId);
            
            return windowId;
        },

        bindWindowEvents(windowId) {
            const windowDiv = document.getElementById(windowId);
            const header = windowDiv.querySelector('.window-header');
            const closeBtn = windowDiv.querySelector('.close-btn');
            const resizeHandle = windowDiv.querySelector('.window-resize-handle');
            const editor = windowDiv.querySelector('.window-editor');
            const preview = windowDiv.querySelector('.window-preview');
            const tabs = windowDiv.querySelectorAll('.window-tab');
            const nameInput = windowDiv.querySelector('.window-title input');
            
            // 保存 this 引用
            const self = this;
            
            // 点击窗口设置为活动状态
            windowDiv.addEventListener('mousedown', () => {
                this.setActiveWindow(windowId);
            });
            
            // 拖动窗口
            let isDragging = false;
            let dragStartX, dragStartY, windowStartX, windowStartY;
            
            header.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'INPUT') return;
                
                isDragging = true;
                dragStartX = e.clientX;
                dragStartY = e.clientY;
                windowStartX = parseInt(windowDiv.style.left);
                windowStartY = parseInt(windowDiv.style.top);
                
                header.classList.add('dragging');
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (isDragging && AppState.windows[windowId]) {
                    const dx = e.clientX - dragStartX;
                    const dy = e.clientY - dragStartY;
                    windowDiv.style.left = (windowStartX + dx) + 'px';
                    windowDiv.style.top = (windowStartY + dy) + 'px';
                }
            });
            
            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    header.classList.remove('dragging');
                    // 检查并修正窗口位置
                    self.constrainWindowPosition(windowDiv);
                }
            });
            
            // 调整窗口大小
            let isResizing = false;
            let resizeStartX, resizeStartY, windowStartWidth, windowStartHeight;
            
            resizeHandle.addEventListener('mousedown', (e) => {
                isResizing = true;
                resizeStartX = e.clientX;
                resizeStartY = e.clientY;
                windowStartWidth = windowDiv.offsetWidth;
                windowStartHeight = windowDiv.offsetHeight;
                e.stopPropagation();
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (isResizing && AppState.windows[windowId]) {
                    const dx = e.clientX - resizeStartX;
                    const dy = e.clientY - resizeStartY;
                    const newWidth = Math.max(300, windowStartWidth + dx);
                    const newHeight = Math.max(200, windowStartHeight + dy);
                    windowDiv.style.width = newWidth + 'px';
                    windowDiv.style.height = newHeight + 'px';
                }
            });
            
            document.addEventListener('mouseup', () => {
                if (isResizing) {
                    isResizing = false;
                    // 检查并修正窗口大小和位置
                    self.constrainWindowSize(windowDiv);
                    self.constrainWindowPosition(windowDiv);
                }
            });
            
            // 关闭窗口
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeWindow(windowId);
            });
            
            // 标签页切换
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabName = tab.getAttribute('data-tab');
                    
                    tabs.forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    if (tabName === 'editor') {
                        editor.style.display = 'block';
                        preview.style.display = 'none';
                    } else {
                        editor.style.display = 'none';
                        preview.style.display = 'block';
                        // 渲染预览
                        Utils.renderLatex(editor.value, preview);
                    }
                });
            });
            
            // 编辑器内容变化
            editor.addEventListener('input', () => {
                AppState.windows[windowId].latex = editor.value;
            });
            
            // 名称变化
            nameInput.addEventListener('input', (e) => {
                const newName = e.target.value.trim();
                // 检查重复
                const isDuplicate = Object.values(AppState.windows).some(
                    w => w.id !== windowId && w.name === newName
                );
                
                if (isDuplicate) {
                    layui.use('layer', function() {
                        layui.layer.msg('窗口名称重复');
                    });
                    e.target.value = AppState.windows[windowId].name;
                } else {
                    AppState.windows[windowId].name = newName;
                }
            });
        },

        setActiveWindow(windowId) {
            const windowDiv = document.getElementById(windowId);
            if (!windowDiv) return;
            
            // 移除所有活动状态
            document.querySelectorAll('.latex-window').forEach(w => {
                w.classList.remove('active');
            });
            
            // 设置新的活动窗口
            windowDiv.classList.add('active');
            windowDiv.style.zIndex = ++AppState.windowZIndex;
        },

        closeWindow(windowId) {
            const windowDiv = document.getElementById(windowId);
            if (windowDiv) {
                windowDiv.remove();
            }
            delete AppState.windows[windowId];
        },

        exportMLatex() {
            const data = {
                version: '1.0',
                windows: []
            };
            
            Object.values(AppState.windows).forEach(window => {
                const element = window.element;
                data.windows.push({
                    name: window.name,
                    x: parseInt(element.style.left),
                    y: parseInt(element.style.top),
                    width: parseInt(element.style.width),
                    height: parseInt(element.style.height),
                    latex: window.latex
                });
            });
            
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'latex-windows-' + Date.now() + '.mlatex';
            link.click();
            
            URL.revokeObjectURL(url);
            
            layui.use('layer', function() {
                layui.layer.msg('导出成功');
            });
        },

        importMLatex() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.mlatex,application/json';
            
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        
                        // 清空现有窗口
                        Object.keys(AppState.windows).forEach(id => {
                            this.closeWindow(id);
                        });
                        
                        // 创建新窗口
                        data.windows.forEach(windowData => {
                            this.createWindow(windowData);
                        });
                        
                        layui.use('layer', function() {
                            layui.layer.msg('导入成功');
                        });
                    } catch (error) {
                        layui.use('layer', function() {
                            layui.layer.msg('导入失败: ' + error.message);
                        });
                    }
                };
                reader.readAsText(file);
            });
            
            input.click();
        }
    };

    // 文档转换模式
    const ConverterMode = {
        init() {
            const form = document.getElementById('converter-form');
            const convertBtn = document.getElementById('convert-btn');
            const loadSampleBtn = document.getElementById('load-sample');
            const uploadTexBtn = document.getElementById('upload-tex');
            const texFileInput = document.getElementById('tex-file-input');
            
            // 编译模式切换
            layui.use('form', function() {
                const layuiForm = layui.form;
                
                layuiForm.on('radio(compile-mode)', function(data) {
                    // 这个事件可能不会触发，所以我们用change事件
                });
                
                // 监听下载复选框
                layuiForm.on('checkbox(download)', function(data) {
                    const downloadNameArea = document.getElementById('download-name-area');
                    if (data.elem.checked) {
                        downloadNameArea.style.display = '';
                    } else {
                        downloadNameArea.style.display = 'none';
                    }
                });
            });
            
            // 手动监听编译模式变化
            const modeRadios = document.querySelectorAll('input[name="compile-mode"]');
            modeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.switchCompileMode(e.target.value);
                });
            });
            
            // 监听下载复选框
            const downloadCheckbox = document.querySelector('input[name="download"]');
            if (downloadCheckbox) {
                downloadCheckbox.addEventListener('change', (e) => {
                    const downloadNameArea = document.getElementById('download-name-area');
                    if (e.target.checked) {
                        downloadNameArea.style.display = '';
                    } else {
                        downloadNameArea.style.display = 'none';
                    }
                });
            }
            
            // 加载示例文档
            loadSampleBtn.addEventListener('click', () => {
                this.loadSampleDocument();
            });
            
            // 上传 .tex 文件
            uploadTexBtn.addEventListener('click', () => {
                texFileInput.click();
            });
            
            texFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        document.getElementById('latex-content').value = event.target.result;
                        layui.use('layer', function() {
                            layui.layer.msg('文件加载成功');
                        });
                    };
                    reader.readAsText(file);
                }
            });
            
            // 生成 PDF
            convertBtn.addEventListener('click', () => {
                this.convertToPDF();
            });
        },
        
        switchCompileMode(mode) {
            const textArea = document.getElementById('text-input-area');
            const urlArea = document.getElementById('url-input-area');
            const gitArea = document.getElementById('git-input-area');
            const gitTargetArea = document.getElementById('git-target-area');
            
            // 隐藏所有区域
            textArea.style.display = 'none';
            urlArea.style.display = 'none';
            gitArea.style.display = 'none';
            gitTargetArea.style.display = 'none';
            
            // 显示对应区域（使用空字符串让 CSS 样式生效）
            if (mode === 'text') {
                textArea.style.display = '';
            } else if (mode === 'url') {
                urlArea.style.display = '';
            } else if (mode === 'git') {
                gitArea.style.display = '';
                gitTargetArea.style.display = '';
            }
        },
        
        loadSampleDocument() {
            const sample = `\\documentclass[]{article}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{amssymb,amsmath}
\\usepackage[a4paper]{geometry}

\\title{Sample LaTeX Document}
\\author{LaTeX Reader}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}

This is a sample LaTeX document that demonstrates basic formatting.

\\section{Mathematical Formulas}

Einstein's famous equation:
\\[ E=mc^2 \\]

The quadratic formula:
\\[ x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a} \\]

A calculus example:
\\[ \\int_0^\\infty e^{-x^2}dx = \\frac{\\sqrt{\\pi}}{2} \\]

\\section{Lists}

\\begin{itemize}
    \\item First item
    \\item Second item
    \\item Third item
\\end{itemize}

\\section{Conclusion}

This is the end of the sample document.

\\end{document}`;
            
            document.getElementById('latex-content').value = sample;
            layui.use('layer', function() {
                layui.layer.msg('示例文档已加载');
            });
        },
        
        convertToPDF() {
            layui.use('layer', function() {
                const layer = layui.layer;
                
                // 先显示确认提示
                layer.confirm('API 编译服务有一定成本，请合理使用，禁止滥用！<br>您确定要继续生成 PDF 吗？', {
                    icon: 3,
                    title: '温馨提示',
                    btn: ['确定生成', '取消'],
                    closeBtn: 1
                }, function(confirmIndex) {
                    // 用户点击确定后，关闭确认框并继续执行
                    layer.close(confirmIndex);
                    
                    // 获取表单数据
                    const mode = document.querySelector('input[name="compile-mode"]:checked').value;
                    const apiServer = document.querySelector('select[name="api-server"]').value;
                    const command = document.querySelector('select[name="command"]').value;
                    const force = document.querySelector('input[name="force"]').checked;
                    const download = document.querySelector('input[name="download"]').checked;
                    const downloadName = document.querySelector('input[name="download-name"]').value || 'output.pdf';
                    
                    // 构建 API URL
                    let apiUrl = apiServer;
                    const params = new URLSearchParams();
                    
                    // 根据模式添加参数
                    if (mode === 'text') {
                        const content = document.getElementById('latex-content').value.trim();
                        if (!content) {
                            layer.msg('请输入 LaTeX 内容');
                            return;
                        }
                        params.append('text', content);
                    } else if (mode === 'url') {
                        const url = document.querySelector('input[name="url"]').value.trim();
                        if (!url) {
                            layer.msg('请输入文档 URL');
                            return;
                        }
                        params.append('url', url);
                    } else if (mode === 'git') {
                        const git = document.querySelector('input[name="git"]').value.trim();
                        const target = document.querySelector('input[name="target"]').value.trim();
                        if (!git || !target) {
                            layer.msg('请输入 Git 仓库地址和目标文件');
                            return;
                        }
                        params.append('git', git);
                        params.append('target', target);
                    }
                    
                    // 添加编译引擎
                    if (command !== 'pdflatex') {
                        params.append('command', command);
                    }
                    
                    // 添加强制编译
                    if (force) {
                        params.append('force', 'true');
                    }
                    
                    // 添加下载参数
                    if (download) {
                        params.append('download', downloadName);
                    }
                    
                    // 完整 URL
                    const fullUrl = apiUrl + '?' + params.toString();
                    
                    // 显示提示信息
                    layer.msg('正在新标签页中打开编译服务...', { 
                        icon: 16,
                        time: 2000 
                    });
                    
                    // 直接在新窗口打开完整的 API URL
                    // 浏览器会自动处理 PDF 的显示或下载
                    window.open(fullUrl, '_blank');
                });
            });
        }
    };

    // 网站引入模式
    const QuoteMode = {
        init() {
            const encodeInput = document.getElementById('encode-input');
            const encodeOutput = document.getElementById('encode-output');
            const encodeBtn = document.getElementById('encode-btn');
            const copyUrlBtn = document.getElementById('copy-url-btn');
            const localFileInput = document.getElementById('local-file-input');
            
            // Base64 编码
            encodeBtn.addEventListener('click', () => {
                const text = encodeInput.value;
                if (!text) {
                    layui.use('layer', function() {
                        layui.layer.msg('请输入 LaTeX 内容');
                    });
                    return;
                }
                
                const encoded = Utils.encodeBase64(text);
                encodeOutput.value = encoded;
            });
            
            // 复制完整 URL
            copyUrlBtn.addEventListener('click', () => {
                const encoded = encodeOutput.value;
                if (!encoded) {
                    layui.use('layer', function() {
                        layui.layer.msg('请先生成 Base64 编码');
                    });
                    return;
                }
                
                const url = window.location.origin + window.location.pathname + 
                           '?mode=quote&base64=' + encoded;
                
                // 复制到剪贴板
                navigator.clipboard.writeText(url).then(() => {
                    layui.use('layer', function() {
                        layui.layer.msg('URL 已复制到剪贴板');
                    });
                }).catch(() => {
                    // 备用方法
                    const textarea = document.createElement('textarea');
                    textarea.value = url;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    
                    layui.use('layer', function() {
                        layui.layer.msg('URL 已复制到剪贴板');
                    });
                });
            });

            // 本地文件上传处理
            localFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const content = event.target.result;
                    
                    // 自动编码为 Base64
                    const encoded = Utils.encodeBase64(content);
                    
                    // 构建 URL
                    const url = window.location.origin + window.location.pathname + 
                               '?mode=quote&base64=' + encoded;
                    
                    // 打开新页面展示
                    window.open(url, '_blank');
                    
                    layui.use('layer', function() {
                        layui.layer.msg('已在新标签页中打开预览');
                    });
                };
                reader.readAsText(file);
            });
            
            // 检查 URL 参数
            this.checkUrlParams();
        },

        checkUrlParams() {
            const params = Utils.getUrlParams();
            const quoteDisplay = document.getElementById('quote-display');
            const quoteHelp = document.querySelector('.quote-help');
            
            let hasContent = false;
            let latexContent = '';
            
            // 检查 base64 参数
            if (params.base64) {
                latexContent = Utils.decodeBase64(params.base64);
                hasContent = true;
            }
            
            // 检查 url 参数
            if (params.url) {
                fetch(params.url)
                    .then(response => response.text())
                    .then(text => {
                        latexContent = text;
                        this.displayContent(latexContent, params);
                    })
                    .catch(error => {
                        layui.use('layer', function() {
                            layui.layer.msg('加载 URL 失败: ' + error.message);
                        });
                    });
                hasContent = true;
            }
            
            if (hasContent && params.base64) {
                this.displayContent(latexContent, params);
            }
            
            // 检查 ui 参数 - 必须在有内容的情况下才隐藏 UI
            if (params.ui === 'none' && hasContent) {
                document.body.classList.add('ui-hidden');
                // 将 quote-display 移到 body 的直接子元素
                if (quoteDisplay) {
                    document.body.appendChild(quoteDisplay);
                }
            }
            
            // 显示或隐藏帮助
            if (hasContent) {
                if (quoteHelp) quoteHelp.style.display = 'none';
                if (quoteDisplay) quoteDisplay.style.display = 'block';
            } else {
                if (quoteHelp) quoteHelp.style.display = 'block';
                if (quoteDisplay) quoteDisplay.style.display = 'none';
            }
        },

        displayContent(latex, params) {
            const quoteDisplay = document.getElementById('quote-display');
            
            const options = {};
            
            // 字体大小
            if (params.fontsize) {
                options.fontSize = parseInt(params.fontsize);
            }
            
            // 对齐方式
            if (params.align && ['left', 'center', 'right'].includes(params.align)) {
                options.align = params.align;
            }
            
            Utils.renderLatex(latex, quoteDisplay, options);
        }
    };

    // 主应用
    const App = {
        init() {
            layui.use(['element', 'layer', 'form'], () => {
                const element = layui.element;
                
                // 初始化各个模式
                EditorMode.init();
                WindowMode.init();
                ConverterMode.init();
                QuoteMode.init();
                
                // PC 版导航切换
                const navItems = document.querySelectorAll('#main-nav .layui-nav-item');
                navItems.forEach(item => {
                    item.addEventListener('click', () => {
                        const mode = item.getAttribute('data-mode');
                        this.switchMode(mode);
                    });
                });
                
                // 手机版 TabBar 导航切换
                const mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
                mobileTabBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const mode = btn.getAttribute('data-mode');
                        this.switchMode(mode);
                    });
                });
                
                // 检查 URL 参数初始化模式
                const params = Utils.getUrlParams();
                
                // 如果携带了 base64 或 url 参数但没有指定 mode，默认进入编辑器模式
                if ((params.base64 || params.url) && !params.mode) {
                    this.switchMode('editor');
                } else if (params.mode) {
                    this.switchMode(params.mode);
                }
            });
        },

        switchMode(mode) {
            AppState.currentMode = mode;
            
            // 更新 PC 版导航
            const navItems = document.querySelectorAll('#main-nav .layui-nav-item');
            navItems.forEach(item => {
                if (item.getAttribute('data-mode') === mode) {
                    item.classList.add('layui-this');
                } else {
                    item.classList.remove('layui-this');
                }
            });
            
            // 更新手机版导航
            const mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
            mobileTabBtns.forEach(btn => {
                if (btn.getAttribute('data-mode') === mode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // 显示对应的模式容器
            document.getElementById('editor-mode').style.display = 
                mode === 'editor' ? 'block' : 'none';
            document.getElementById('window-mode').style.display = 
                mode === 'window' ? 'block' : 'none';
            document.getElementById('converter-mode').style.display = 
                mode === 'converter' ? 'block' : 'none';
            document.getElementById('reference-mode').style.display = 
                mode === 'reference' ? 'block' : 'none';
            document.getElementById('quote-mode').style.display = 
                mode === 'quote' ? 'block' : 'none';
            
            // 更新 URL 参数
            Utils.setUrlParam('mode', mode);
        }
    };

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }

})();
