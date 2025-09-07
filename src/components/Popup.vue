<script setup>
import {onBeforeUnmount, onMounted, ref, toRaw} from "vue";
import {Draw, Modify, Select} from "ol/interaction";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import Text from "ol/style/Text";
import {Collection} from "ol";
import {click} from "ol/events/condition";
import {createHistoryManager} from "@/utils/pickFeature.js";
import {useMapStore} from "@/stores/map.js";
import {useLayerStore} from "@/stores/layerset.js";

const mapStore = useMapStore();
const layerStore = useLayerStore();

const map = toRaw(mapStore.map)
const layerSet = layerStore.getLayers();

// const props = defineProps({
//   currentEditor: {
//     type: Object,
//     required: true
//   }
// });

const currentEditor={
  id:1,
  name:'Lzy',
  color:'blue'
}


const isDrawing = ref(false);
const drawType = ref("Point"); // 默认绘制点

// 找到 vector 图层
const vectorLayer = layerSet.find(l => l.get("id") === "vector");

// 工厂函数，根据类型返回 Draw
function createDraw(type) {
  if (type === "Point") {
    return new Draw({
      source: vectorLayer.getSource(),
      type: "Point",
      style: new Style({
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: "red" }),
          stroke: new Stroke({ color: "yellow", width: 3 })
        }),
        text: new Text({
          text: "绘制中...",
          offsetY: 20,
          font: "bold 14px Arial, sans-serif",
          fill: new Fill({ color: "#000" }),
          stroke: new Stroke({ color: "#fff", width: 2 })
        })
      })
    });
  } else if (type === "LineString") {
    return new Draw({
      source: vectorLayer.getSource(),
      type: "LineString",
      style: new Style({
        stroke: new Stroke({
          color: "#87ff36",
          width: 2,
          lineDash: [4, 4],
          lineCap: "round",
          lineJoin: "round"
        })
      })
    });
  } else if (type === "Polygon") {
    return new Draw({
      source: vectorLayer.getSource(),
      type: "Polygon",
      style: new Style({
        fill: new Fill({
          color: "rgba(255, 87, 51, 0.4)"
        }),
        stroke: new Stroke({
          color: "#ff5733",
          width: 2
        })
      })
    });
  }
}


let activeDraw = null;

// 切换绘制
function toggleDraw() {
  if (!isDrawing.value) {
    // 创建交互
    activeDraw = createDraw(drawType.value);

    // 通用事件
    activeDraw.on("drawend", evt => {
      const feature = evt.feature;
      feature.setProperties({
        id: Date.now(),
        editor: currentEditor.id,
        editorName: currentEditor.name,
        editorColor: currentEditor.color,
        createTime: new Date().toISOString()
      });
      console.log("绘制完成:", feature.getProperties());
    });

    map.addInteraction(activeDraw);

    if (!map.getAllLayers().find(l => l.get("id") === "vector")) {
      map.addLayer(vectorLayer);
    }
    isDrawing.value = true;
  } else {
    if (activeDraw) {
      activeDraw.finishDrawing();
      map.removeInteraction(activeDraw);
      activeDraw = null;
    }
    isDrawing.value = false;
  }
}

let historyManager;

onMounted(()=>{
  historyManager = createHistoryManager(map, layerSet.find(l=>l.get('id')==='vector'), 50);
  historyManager.init();
  historyManager.start();
});

onBeforeUnmount(() => {
  historyManager.destroy();
});

const isSelecting = ref(false);
const selectInfo = ref("选择要素");
function toggleSelect(){
  isSelecting.value = !isSelecting.value;
  if(isSelecting.value){
    //map.addInteraction(select);
    map.removeInteraction(select);
  }else{
    map.removeInteraction(select);
  }
  selectInfo.value = isSelecting.value ? "停止选择" : "选择要素";
  console.log(isSelecting.value);
}

function clearFeatures() {
  vectorLayer.getSource().clear();
  map.removeLayer(vectorLayer);
}


const modify = new Modify({
  //features:new Collection(vectorLayer.getSource().getFeatures()),
  source:vectorLayer.getSource(),
});

// Modify 事件
modify.on('modifystart', (evt) => {
  // 开始修改
  console.log('开始编辑要素');
});

modify.on('modifyend', (evt) => {
  // 修改完成
  const features = evt.features.getArray();
  features.forEach(feature => {
    // 更新要素属性
    feature.set('lastModifiedBy', currentEditor.id);
    feature.set('lastModifiedAt', new Date().toISOString());
  });
});

// Select 交互（点击选中要素）
const select = new Select({
  condition: click,
  layers: [vectorLayer]
});
//map.addInteraction(select);

// 弹窗状态 & 绑定要素
const showEditor = ref(false);
const selectedFeature = ref(null);
const editableProps = ref({
  name: "",
  description: ""
});


select.on("select", evt => {
  const feature = evt.selected[0];
  if (feature) {
    selectedFeature.value = feature;

    // 取出要素已有属性，显示在表单里
    editableProps.value = {
      name: feature.get("name") || "",
      description: feature.get("description") || ""
    };

    showEditor.value = true;
  } else {
    showEditor.value = false;
    selectedFeature.value = null;
  }
});

// 保存属性修改
function saveProps() {
  if (selectedFeature.value) {
    selectedFeature.value.set("name", editableProps.value.name);
    selectedFeature.value.set("description", editableProps.value.description);
    selectedFeature.value.set("lastModifiedBy", currentEditor.id);
    selectedFeature.value.set("lastModifiedAt", new Date().toISOString());
  }
  showEditor.value = false;
  //map.removeInteraction(select);
}

const isModify = ref(false);
const modifyInfo = ref("修改要素");
function toggleModify(){
  if (!isModify.value){
    modifyInfo.value = "停止修改"
    map.addInteraction(modify);
    isModify.value = true;
  }
  else {
    modifyInfo.value = "修改要素"
    map.removeInteraction(modify);
    isModify.value = false;
  }
}

function exportFeatures(){

}
</script>

<template>
  <div class="draw">
    <select v-model="drawType" class="draw-select">
      <option value="Point">点</option>
      <option value="LineString">线</option>
      <option value="Polygon">面</option>
    </select>
    <button @click="toggleDraw">
      {{ isDrawing ? "停止绘制" : "开始绘制" }}
    </button>
  </div>
  <div class="draw" id="extra">
    <button @click="toggleSelect">{{selectInfo}}</button>
    <button @click="clearFeatures">清除要素</button>
  </div>

  <div class="draw" id="extra-modify">
    <button @click="toggleModify">{{modifyInfo}}</button>
    <button @click="exportFeatures">导出要素</button>
  </div>



  <div id="edition-control">
    <!-- 属性编辑弹窗 -->
    <div v-if="showEditor" class="editor">
      <h3>编辑属性</h3>
      <label>
        名称：
        <input v-model="editableProps.name" />
      </label>
      <br />
      <label>
        描述：
        <input v-model="editableProps.description" />
      </label>
      <br />
      <button @click="saveProps">保存</button>
      <button @click="showEditor=false">取消</button>
    </div>
  </div>
</template>

<style scoped>
.draw {
  position: absolute;
  top: 60px;
  right: 10px;
  display: flex;
  gap: 10px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.draw select{
  width: 80px;
}

#extra{
  top: 115px;
}

#extra-modify{
  top: 170px;
}

.draw button {
  padding: 6px 12px;
  border: none;
  border-radius: 5px;
  background: #409eff;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.draw button:hover {
  background: #66b1ff;
}

.draw button:active {
  background: #3a8ee6;
}

.editor {
  z-index: 999;
  position: absolute;
  top: 240px;
  right: 10px;
  padding: 12px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.editor input {
  margin: 4px 0;
}

.draw-select {
  padding: 6px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #fff;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.draw-select:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64,158,255,0.3);
}

.draw-select:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64,158,255,0.2);
}

</style>
