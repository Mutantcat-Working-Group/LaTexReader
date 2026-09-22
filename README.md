<div align="center">
<img src="https://mutantsite.lovestoblog.com/files/2025/11/12/ebef87b3ce8b703be774828b9a514025.png" style="width:100px;" width="100"/>
<h2>Mutantcat LaTeX Reader</h2>
</div>

### 一、产品概述

- 专为 LaTeX 用户打造的在线编辑与预览工具，浏览器打开即用，无需安装环境。
- 功能分为在线编辑、多窗口、文档转换、参考表、在线预览五个板块，覆盖「写公式」到「编译文档」的完整链路。
- 纯前端单页应用，支持离线使用，也可直接打开本地 HTML 文件运行。

核心价值：写公式不用再等本地 TeX 环境，粘贴、敲键、出图一步完成，还能把整篇文档在线编译成 PDF。

### 二、软件界面

多窗口模式：

![多窗口模式](https://s2.loli.net/2025/11/12/WamSEFcjnOHYobQ.png)

无 UI 嵌入模式：

![无UI模式](https://s2.loli.net/2025/11/12/qlRi3YcvCPheG4m.png)

### 三、功能说明

#### 在线编辑

- 实时 LaTeX 渲染，左侧输入右侧出结果。
- 快速工具栏：分数、根号、积分、求和、极限、希腊字母等一键插入。
- 字体 100%-200% 缩放调整，一键保存为图片。

#### 多窗口

- 创建多个独立编辑窗口协同工作，支持拖拽排列与窗口管理。
- 工作进度可导出为 `.mlatex` JSON 文件，随时导入继续。
- 支持编辑/预览模式切换与临时预览。

#### 文档转换

- 把完整 LaTeX 文档编译为 PDF，三种输入方式：直接粘贴文本、填写 `.tex` 文件 URL、从 Git 仓库拉取。
- 三种编译引擎可选：`pdflatex`（默认，速度快）、`xelatex`（支持中文与 Unicode）、`lualatex`（现代引擎）。
- 辅助功能：加载示例文档、上传本地 `.tex`、强制重新编译、自定义下载文件名、官方与备用 API 服务器切换。

#### 参考表

- 完整 LaTeX 语法参考，涵盖基础符号、分数、求和、希腊字母、运算符、括号、矩阵、特殊符号 8 大类。
- 分类折叠展开，手机端自适应。

#### 在线预览

- 通过 URL 参数在线预览 LaTeX 内容，可嵌入其他网站：
	- Base64 编码：`?mode=quote&base64=编码内容`
	- 网络文件：`?mode=quote&url=文件链接`
- 自定义参数：`ui=none` 隐藏界面只显示内容、`fontsize=20` 字体大小、`align=center` 对齐方式。
- 支持打开本地 `.tex` 文件预览。

#### 移动端

- 底部 TabBar 快速切换模式，所有功能适配手机屏幕；多窗口模式在小屏设备上提示使用 PC 端。

### 四、安装与下载

在线使用（官方地址）：https://latexreader.mutantcat.org/

也从 [Releases](https://github.com/Mutantcat-Working-Group/LaTexReader/releases) 下载 `LaTexReader-1.0.20260920.tar.gz`，解压后本地静态服务器托管或直接用浏览器打开 HTML 即可离线使用，另附 `checksums.txt` 供校验。纯前端项目，Pages、Vercel 等任意静态托管都能部署。版本号使用纯日期递增（如 `1.0.20260920`），推送同族标签（`v` 前缀可选）后，GitHub Actions 会自动打包并发布 Release。

### 五、快速上手

1. 打开在线地址或本地部署好的页面，默认进入在线编辑模式。
2. 输入 `\frac{a}{b}` 之类的表达式，右侧实时出渲染结果，用工具栏插入复杂结构。
3. 点保存把公式导出为图片，用于笔记或文档。
4. 切换到文档转换模式，粘贴完整 `.tex` 或填仓库地址，选 `xelatex` 编译含中文的文档。
5. 查到语法去参考表翻类目；要把公式嵌进自己网站，用 `?mode=quote&base64=...` 加 `ui=none` 参数引用。

### 六、其他说明

- API 编译服务有成本，请合理使用，禁止滥用（刷流、攻击）公益 API。
- 如遇 bug 可及时提交 issue，欢迎提交 PR，欢迎 Star 支持本项目。

### 七、鸣谢

- [latex-online](https://github.com/aslushnikov/latex-online)
- [LaTeX.js](https://github.com/michael-brade/LaTeX.js)
- [jsDelivr](https://www.jsdelivr.com/)
- [sm.ms](https://sm.ms)

本项目基于 Apache-2.0 协议开源。
