<div align="center">
<img src="https://mutantsite.lovestoblog.com/files/2025/11/12/ebef87b3ce8b703be774828b9a514025.png" style="width:100px;" width="100"/>
<h2>Mutantcat LaTeX Reader</h2>
</div>

### 一、功能简介
- 专为 LaTeX 用户打造的在线编辑和预览工具，支持在线编辑模式、完整文档模式
- 功能分为"在线编辑"、"多窗口"、"文档转换"、"参考表"、"在线预览"五个主要板块
- 在线编辑：实时 LaTeX 渲染，支持快速工具栏（分数、根号、积分等），字体缩放调整，图片导出
- 多窗口：支持创建多个独立编辑窗口，拖拽排列，导入导出 MLATEX 格式文件
- 文档转换：将完整的 LaTeX 文档转换为 PDF，支持文本内容、URL 地址、Git 仓库三种输入方式，提供 pdflatex、xelatex、lualatex 三种编译引擎
- 参考表：完整的 LaTeX 语法参考文档，包含基础符号、分数、求和、希腊字母、运算符、括号、矩阵、特殊符号等8大类
- 在线预览：支持通过 URL 参数（base64/url）在线预览 LaTeX 内容，可嵌入其他网站，支持自定义字体大小和对齐方式，同时支持用户打开本地 tex 文件
- 完全响应式设计，同时适配桌面端和手机端使用体验

### 二、在线使用
- 官方地址：https://latexreader.mutantcat.org/
- 支持离线使用：可直接在浏览器打开本地 HTML 文件

#### 1. 在线编辑模式
- 输入 LaTeX 表达式，实时预览渲染结果
- 支持 100%-200% 缩放
- 一键保存为图片
- 快速工具栏：分数、根号、积分、求和、极限、希腊字母等

#### 2. 多窗口模式
- 创建多个窗口协同工作
- 支持拖拽重排和窗口管理
- 导出为 .mlatex JSON 文件保存工作进度
- 全部编辑/预览模式切换
- 临时预览功能
![多窗口模式](https://s2.loli.net/2025/11/12/WamSEFcjnOHYobQ.png)
![多窗口模式](https://s2.loli.net/2025/11/13/C7sIkWBqL38MvaP.png)

#### 3. 文档转换模式
- **三种输入方式**：
  - 文本内容：直接粘贴或输入完整的 LaTeX 文档
  - URL 地址：输入可访问的 .tex 文件链接
  - Git 仓库：从 GitHub 等仓库直接编译
- **三种编译引擎**：
  - pdflatex（默认）：标准引擎，速度快
  - xelatex：支持中文和 Unicode 字符
  - lualatex：现代引擎，功能强大
- **辅助功能**：
  - 加载示例文档
  - 上传本地 .tex 文件
  - 强制重新编译
  - 自定义下载文件名
- **API 服务器**：支持官方和备用服务器切换
- 温馨提示：API 编译服务有成本，请合理使用，禁止滥用

#### 4. 参考表模式
- 快速查阅 LaTeX 语法
- 支持折叠展开各类别
- 手机端自适应显示
- 包含8大类语法参考

#### 5. 在线预览模式
- **通过 URL 参数分享**：
  - Base64 编码：`?mode=quote&base64=编码内容`
  - 网络文件：`?mode=quote&url=文件链接`
- **自定义参数**：
  - `ui=none`：隐藏界面只显示内容
  - `fontsize=20`：自定义字体大小
  - `align=center`：设置对齐方式（left/center/right）
- **应用场景**：
  - 在自己的网站、博客、文档中嵌入 LaTeX 公式
  - 分享 LaTeX 内容给他人查看
  - 制作在线教学材料
![无UI模式](https://s2.loli.net/2025/11/12/qlRi3YcvCPheG4m.png)

#### 6. 移动端支持
- 底部 TabBar 快速切换模式
- 所有功能完美适配手机屏幕
- 多窗口模式在小屏幕设备上提示使用 PC 端

### 三、其他说明
- 请尊重他人贡献和私有财产，请勿滥用（刷流、攻击）公益API
- 如遇 bug 可及时提交 issue
- 欢迎提交 PR 贡献本项目
- 欢迎 Star 支持本项目

### 四、鸣谢
- https://github.com/aslushnikov/latex-online
- https://github.com/michael-brade/LaTeX.js
- https://www.jsdelivr.com/
- https://sm.ms/