<script setup>
import { inject, ref } from "vue";
import {Style, Stroke, Fill, Circle as CircleStyle, Icon} from "ol/style";
import { fromLonLat } from "ol/proj";
import {Feature} from "ol";
import {Point} from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {searchPlace} from '../utils/gaodeSearch.js';
import {useMapStore} from "@/stores/map.js";
import {useLayerStore} from "@/stores/layerset.js";

const mapStore = useMapStore();
const layerStore = useLayerStore();

const map = mapStore.getMap();
const layerSet = layerStore.getLayers();

const keyword = ref("");
const lon = ref("");
const lat = ref("");

// 找到矢量图层
const vectorLayer = layerSet.find(l => l.get("id") === "vector");

// 高亮样式
const highlightStyle = new Style({
  image: new CircleStyle({
    radius: 8,
    fill: new Fill({ color: "yellow" }),
    stroke: new Stroke({ color: "red", width: 2 })
  })
});

// 根据属性搜索
async function searchByAttr() {
  const features = vectorLayer.getSource().getFeatures();
  const found = features.find(f => f.get("name")?.includes(keyword.value));
  if (found) {
    found.setStyle(highlightStyle);
    map.getView().fit(found.getGeometry().getExtent(), {duration: 800});
  } else {
    const result = await searchPlace(keyword.value);
    if (result) {
      [lon.value, lat.value] = result;
      searchByCoords();
    } else {
      //alert("未找到匹配要素");
    }
  }
}

let markerLayer;

// 根据经纬度定位
function searchByCoords() {
  if (!lon.value || !lat.value) return;
  const coords = fromLonLat([parseFloat(lon.value), parseFloat(lat.value)]);
  map.getView().animate({ center: coords, zoom: 14, duration: 1000 });

  const marker = new Feature({
    geometry: new Point(coords)
  });

  marker.setStyle(
      new Style({
        image: new Icon({
          src: "https://cdn.mapmarker.io/api/v1/pin?text=A&size=40&hoffset=1",
          anchor: [0.5, 1]
        })
      })
  );

  if (!markerLayer) {
    markerLayer = new VectorLayer({
      source: new VectorSource()
    });
    map.addLayer(markerLayer);
  } else {
    markerLayer.getSource().clear();
  }

  markerLayer.getSource().addFeature(marker);
}

</script>

<template>
  <div class="search-bar">
    <div>
      <input v-model="keyword" @keydown.enter="searchByAttr" placeholder="输入名称搜索"/>
      <button @click="searchByAttr">搜索</button>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  z-index: 10;
  position: absolute;
  top: 5px;
  left: 40px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.search-bar input {
  margin: 2px;
  padding: 4px 6px;
  font-size: 14px;
}

.search-bar button {
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  background: #409eff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.search-bar button:hover {
  background: #66b1ff;
}
</style>