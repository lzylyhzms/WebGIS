<script setup>
import {onMounted, ref} from "vue";
import {MousePosition} from "ol/control";
import {transform} from "ol/proj";
import {useMapStore} from "@/stores/map.js";

const mapStore = useMapStore();
const map = mapStore.getMap();

// 用来保存点击拾取的坐标
const clickedCoord = ref("");

const formatAxirs = (coordinate, format, precision = 4) => {
  const [lon, lat] = coordinate;
  return format
      .replace("{x}", lon.toFixed(precision))
      .replace("{y}", lat.toFixed(precision));
};

const location = new MousePosition({
  coordinateFormat: function (coordinate) {
    return formatAxirs(coordinate, "经度:{x} 纬度:{y}", 4)
  },
  projection: "EPSG:4326",
  className: "custom-mouse-position",
});


onMounted(()=>{
  if (map){
    map.addControl(location);

    // 点击事件：拾取坐标
    map.on("singleclick", (evt) => {
      // evt.coordinate 默认是 EPSG:3857，需要转 EPSG:4326
      const lonLat = transform(evt.coordinate, "EPSG:3857", "EPSG:4326");
      clickedCoord.value = formatAxirs(lonLat, "经度:{x} 纬度:{y}", 6);
      console.log("拾取坐标：", clickedCoord.value);
    });
  }
});
</script>

<template>
  <div class="picked-coord">
    点击拾取的坐标: {{ clickedCoord }}
  </div>
</template>

<style scoped>
:deep(.custom-mouse-position) {
  position: absolute;
  bottom: 10px;   /* 固定在地图左下角 */
  left: 10px;
  background: rgba(0, 0, 0, 0.6); /* 黑色半透明背景 */
  color: #fff;    /* 白色文字 */
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 6px;
  pointer-events: none; /* 避免挡住鼠标操作 */
}

.picked-coord {
  display: none;
  position: absolute;
  bottom: 40px;
  left: 10px;
  background: rgba(0, 128, 0, 0.7);
  color: #fff;
  padding: 4px 8px;
  border-radius: 6px;
}
</style>