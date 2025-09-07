<script setup>
import {onBeforeMount, onMounted, ref} from "vue";
import TileLayer from "ol/layer/Tile";
import LayerGroup from "ol/layer/Group";
import {OSM, XYZ} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import {LineString, Point, Polygon} from "ol/geom";
import {Feature} from "ol";
import {fromLonLat} from "ol/proj";
import Text from "ol/style/Text";
import {useMapStore} from "@/stores/map.js";
import {useLayerStore} from "@/stores/layerset.js";

const mapStore = useMapStore();
const layerStore = useLayerStore();

const map = mapStore.getMap();
const layerSet = layerStore.getLayers();

// 定义状态：当前激活的图层类型
const activeLayer = ref("osm");

const osmSource = new OSM();
const osmLayer = new TileLayer({
  source:osmSource,
  //  图层属性
  visible: true,    // 是否可见
  opacity: 1,       // 透明度
  zIndex: 0,        // 图层层级
});

osmLayer.set('id','osm');


const tk = "5f49f9b6c9a9484eabe2d4375e6569b0";
new LayerGroup({ //layers集合
  layers: [
    new TileLayer({
      source: new XYZ({
        url: `http://t2.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${tk}`
      })
    }),
    new TileLayer({
      source: new XYZ({
        url: `http://t2.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=${tk}`
      })
    })
  ]
});
const gaode = new XYZ({
  url: "https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
  // 版权信息
  attributions: '© 高德地图'
});

const tdtVec = new XYZ({
  url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=${tk}`
});

const tdtImg = new XYZ({
  url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=${tk}`
});

const tdtCia = new XYZ({
  url: `http://t{0-7}.tianditu.gov.cn/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=${tk}`
});


// 创建点 Feature
const pointFeature = new Feature({
  geometry: new Point(fromLonLat([116.397428, 39.90923])), // 北京坐标 (经度, 纬度) - 注意要投影
  name: "北京天安门",
  editorColor: "red"
});

// 创建线 Feature
const lineFeature = new Feature({
  geometry: new LineString([fromLonLat([116.397, 39.908]),
    fromLonLat([116.398, 39.909])]),
  name: "测试线",
  editorColor: "red"
});

// 创建面 Feature
const polygonFeature = new Feature({
  geometry: new Polygon([[
    fromLonLat([116.397, 39.908]),
    fromLonLat([116.398, 39.909]),
    fromLonLat([116.399, 39.908]),
    fromLonLat([116.397, 39.908])  // 闭合多边形
  ]]),
  name: "测试面",
  editorColor: "red"
});

const vectorLayer = new VectorLayer({
  source:new VectorSource(),
  zIndex: 1,
  style:function (feature){
    return new Style({
      // 点样式
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: feature.get('editorColor') }),
        stroke: new Stroke({ color: 'white', width: 2 })
      }),
      // 文本样式
      text: new Text({
        text: feature.get('name'),
        offsetY: 15,
        font: '12px Arial',
        fill: new Fill({ color: '#333' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      }),
      // 线条样式（用于线要素）
      stroke: new Stroke({
        color: '#87ff36',            // 线条颜色
        width: 2,                    // 线条宽度
        lineDash: [4, 4],           // 虚线样式 [实线长度, 间隔长度]
        lineCap: 'round',           // 线条端点样式：butt/round/square
        lineJoin: 'round'           // 线条连接处样式：miter/round/bevel
      }),

      // 填充样式（用于面要素）
      fill: new Fill({
        color: 'rgba(255, 87, 51, 0.4)' // 填充颜色（支持透明度）
      }),
    });
  }
});
// 添加到 source
vectorLayer.getSource().addFeature(pointFeature);
vectorLayer.getSource().addFeature(lineFeature);
vectorLayer.getSource().addFeature(polygonFeature);
vectorLayer.set('id','vector');


let baseLayer, overlayLayer;

onBeforeMount(()=>{
  layerStore.addLayer(osmLayer);
  osmLayer.setOpacity(0.6);
  layerStore.addLayer(vectorLayer);
});

onMounted(()=>{
  if(map){
    baseLayer = osmLayer;
    map.addLayer(baseLayer);
    console.log("init success");
  }
});


// 切换函数
function switchLayer(type) {
  if (!map || !baseLayer) return;

  //初始灰色，点击加入

  if (type === "osm") {
    baseLayer.setSource(osmSource);
    //map.addLayer(vectorLayer);
    if (overlayLayer) {
      map.removeLayer(overlayLayer);
      overlayLayer = null;
    }
  } else if (type === "vec") {
    baseLayer.setSource(tdtVec);
    if (overlayLayer) {
      map.removeLayer(overlayLayer);
      overlayLayer = null;
    }
  } else if (type === "img") {
    baseLayer.setSource(tdtImg);
    if (overlayLayer) {
      map.removeLayer(overlayLayer);
      overlayLayer = null;
    }
    overlayLayer = new TileLayer({ source: tdtCia });
    map.addLayer(overlayLayer);
  }else if (type === "gaode") {
    baseLayer.setSource(gaode);
    if (overlayLayer) {
      map.removeLayer(overlayLayer);
      overlayLayer = null;
    }
  }

  // 更新当前激活图层
  activeLayer.value = type;
}



</script>

<template>
  <div class="layer-switcher">
    <button @click="switchLayer('osm')" :class="{ active: activeLayer === 'osm' }">OSM</button>
    <button @click="switchLayer('vec')" :class="{ active: activeLayer === 'vec' }">矢量</button>
    <button @click="switchLayer('img')" :class="{ active: activeLayer === 'img' }">影像+路网</button>
    <button @click="switchLayer('gaode')" :class="{ active: activeLayer === 'gaode' }">高德</button>
  </div>
</template>

<style scoped>
.layer-switcher{
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 6px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  display: flex;
  gap: 6px;
  z-index: 999;
}

.layer-switcher button {
  cursor: pointer;
  border: none;
  background: #2d3a4b;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}
.layer-switcher button:hover {
  background: #1565c0;
}
.layer-switcher button.active {
  background-color: #409eff; /* 蓝色 */
}
</style>