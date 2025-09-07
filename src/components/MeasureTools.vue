<script setup>
import { createMeasureTool } from "../utils/measureTool.js";
import {useMapStore} from "@/stores/map.js";
import {onMounted, ref, toRaw} from "vue";

const mapStore = useMapStore();
const map = toRaw(mapStore.map)

let measureTool;

onMounted(() => {
  measureTool = createMeasureTool(map);
});
</script>

<template>
  <div class="measure-tool">
    <button @click="measureTool.startMeasureDistance()">测距离</button>
    <button @click="measureTool.startMeasureArea()">测面积</button>
    <button @click="measureTool.stopMeasure()">停止</button>
  </div>
</template>

<style scoped>
.measure-tool {
  position: absolute;
  top: 70px;
  left: 40px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

button {
  padding: 6px 12px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #66b1ff;
}

.ol-tooltip {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  padding: 4px 8px;
  white-space: nowrap;
  font-size: 12px;
  border-radius: 4px;
}

.ol-tooltip-measure {
  opacity: 0.7;
  font-weight: bold;
}

.ol-tooltip-static {
  background: #ffcc33;
  border: 1px solid white;
  color: black;
}
</style>
