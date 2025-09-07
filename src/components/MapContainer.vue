<script setup>
import Map from "ol/Map";
import View from "ol/View";
import {ref, onMounted, onUnmounted, onBeforeMount} from "vue";
import {fromLonLat} from "ol/proj";
import {defaults as defaultControls, FullScreen, ScaleLine, ZoomSlider} from "ol/control";
import { useMapStore } from '@/stores/map'

const mapStore = useMapStore()

const mapContainer = ref(null);

const map = new Map({
  layers: [],
  controls: defaultControls().extend([
    new ScaleLine(),     // 比例尺
    //new FullScreen(),    // 全屏按钮
    new ZoomSlider()     // 缩放滑块
  ]),
  view:  new View({
    center: fromLonLat([116.40, 39.90]),     // 地图中心（默认坐标系是 EPSG:3857）
    zoom: 10,            // 缩放级别
    minZoom: 3,
    maxZoom: 19,
  }),
});

mapStore.setMap(map);

onBeforeMount(()=>{
  //mapStore.setMap(map);
});

onMounted(()=>{
  map.setTarget(mapContainer.value);
});

onUnmounted(()=>{
  if(map) {
    map.setTarget(null);   // 解绑 DOM
    mapStore.clearMap();   // 让全局状态置空
  }
});
</script>

<template>
  <div id="map" ref="mapContainer">
    <slot></slot>
  </div>
</template>

<style scoped>
html,
body {
  margin: 0;
  height: 100%;
  overflow: hidden;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
}
</style>
