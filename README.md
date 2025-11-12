<div align="center">
<img src="https://mutantsite.lovestoblog.com/files/2025/11/12/ebef87b3ce8b703be774828b9a514025.png" style="width:100px;" width="100"/>
<h2>Mutantcat LaTeX Reader</h2>
</div>

### 一、功能简介
- 专为 LaTeX 用户打造的在线编辑和预览工具
- 功能分为"编辑器"、"多窗口"、"参考表"、"在线预览"四个主要板块
- 编辑器：实时 LaTeX 渲染，支持快速工具栏（分数、根号、积分等），字体缩放调整，图片导出
- 多窗口：支持创建多个独立编辑窗口，拖拽排列，导入导出 MLATEX 格式文件
- 参考表：完整的 LaTeX 语法参考文档，包含基础符号、分数、求和、希腊字母、运算符、括号、矩阵、特殊符号等8大类
- 在线预览：支持通过 URL 参数（base64/url）在线预览 LaTeX 内容，可嵌入其他网站，支持自定义字体大小和对齐方式，同时支持用户打开本地tex文件
- 完全响应式设计，同时适配桌面端和手机端使用体验

### 二、在线使用
- 官方地址：https://latexreader.mutantcat.org/
- 支持离线使用：可直接在浏览器打开本地 HTML 文件
- 编辑器模式：输入 LaTeX 表达式，实时预览渲染结果，支持 100%-200% 缩放，一键保存为图片
- 多窗口模式：创建多个窗口协同工作，导出为 .mlatex JSON 文件保存工作进度，支持拖拽重排和窗口管理
![多窗口模式](https://s2.loli.net/2025/11/12/WamSEFcjnOHYobQ.png)
- 参考表模式：快速查阅 LaTeX 语法，支持折叠展开各类别，手机端自适应显示
- 在线预览模式：
  - 通过 URL 参数分享：`?mode=quote&base64=编码内容`
  - 通过网络文件加载：`?mode=quote&url=文件链接`
  - 支持 `ui=none` 隐藏界面只显示公式，`fontsize=20` 自定义字体，`align=center` 设置对齐
  - `ui=none` 时只显示公式或文档内容，非常方便在自己的网站、博客、文档中引入，当然我们支持您这样做
![无UI模式](https://s2.loli.net/2025/11/12/qlRi3YcvCPheG4m.png)
- 手机端使用底部 TabBar 快速切换模式，多窗口模式在手机上自动禁用

### 三、其他说明
- 如遇 bug 可及时提交 issue
- 欢迎提交 PR 贡献本项目
- 欢迎 Star 支持本项目

### 四、鸣谢
- https://github.com/michael-brade/LaTeX.js