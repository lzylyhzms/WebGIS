<script setup>
import MapContainer from "@/components/MapContainer.vue";
import Layers from "@/components/Layers.vue";
import Controls from "@/components/Controls.vue";
import MeasureTools from "@/components/MeasureTools.vue";
import SearchBar from "@/components/SearchBar.vue";
import Popup from "@/components/Popup.vue";
</script>

<template>
  <MapContainer>
    <Layers></Layers>
    <Controls></Controls>
    <MeasureTools></MeasureTools>
    <SearchBar></SearchBar>
    <Popup></Popup>
  </MapContainer>
</template>

<style scoped>

</style>
