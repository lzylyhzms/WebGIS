# ol-vue-pinia

# 🌍 WebGIS 可视化平台

基于 **Vue 3 + Pinia + OpenLayers (OL)** 的 WebGIS 应用，支持浏览多个地图图层源、绘制与编辑空间要素，并可导出数据。适合作为 GIS 学习与 Web 地图开发的示例项目。

## ✨ 功能特性

- 🔀 **多图层管理**
    - 支持切换不同地图底图（OSM、卫星图、矢量图等）
    - 图层开关、透明度调节

- 📝 **绘制与编辑**
    - 点、线、面等几何要素绘制
    - 节点编辑、移动、删除功能
    - 样式自定义（颜色、线型、填充）

- 📤 **数据导出**
    - 支持将绘制的要素导出为 GeoJSON
    - 可结合第三方 GIS 软件进行分析

- 🗂 **状态管理**
    - 使用 Pinia 进行全局状态管理
    - 保证图层状态、绘制状态的响应式更新

---

## 🛠 技术栈

- [Vue 3](https://vuejs.org/) - 前端框架
- [Pinia](https://pinia.vuejs.org/) - 状态管理
- [OpenLayers](https://openlayers.org/) - 地图渲染与 GIS 功能
- [Axios](https://axios-http.com/) - 网络请求（可扩展调用地图服务）
- [Vite](https://vitejs.dev/) - 构建工具

---


## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
