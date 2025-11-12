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
            
            // 设置默认示例
            input.value = 'The quadratic formula is $x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$ and Einstein\'s famous equation is $E=mc^2$. For calculus, we have $\\int_0^\\infty e^{-x^2}dx = \\frac{\\sqrt{\\pi}}{2}$.';
            
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

    // 网站引入模式
    const QuoteMode = {
        init() {
            const encodeInput = document.getElementById('encode-input');
            const encodeOutput = document.getElementById('encode-output');
            const encodeBtn = document.getElementById('encode-btn');
            const copyUrlBtn = document.getElementById('copy-url-btn');
            
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
            
            // 检查 ui 参数
            if (params.ui === 'none' && hasContent) {
                document.body.classList.add('ui-hidden');
            }
            
            // 显示或隐藏帮助
            if (hasContent) {
                quoteHelp.style.display = 'none';
                quoteDisplay.style.display = 'block';
            } else {
                quoteHelp.style.display = 'block';
                quoteDisplay.style.display = 'none';
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
                QuoteMode.init();
                
                // 导航切换
                const navItems = document.querySelectorAll('#main-nav .layui-nav-item');
                navItems.forEach(item => {
                    item.addEventListener('click', () => {
                        const mode = item.getAttribute('data-mode');
                        this.switchMode(mode);
                    });
                });
                
                // 检查 URL 参数初始化模式
                const params = Utils.getUrlParams();
                if (params.mode) {
                    this.switchMode(params.mode);
                }
            });
        },

        switchMode(mode) {
            AppState.currentMode = mode;
            
            // 更新导航
            const navItems = document.querySelectorAll('#main-nav .layui-nav-item');
            navItems.forEach(item => {
                if (item.getAttribute('data-mode') === mode) {
                    item.classList.add('layui-this');
                } else {
                    item.classList.remove('layui-this');
                }
            });
            
            // 显示对应的模式容器
            document.getElementById('editor-mode').style.display = 
                mode === 'editor' ? 'block' : 'none';
            document.getElementById('window-mode').style.display = 
                mode === 'window' ? 'block' : 'none';
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
