import { defineStore } from 'pinia'

export const useLayerStore = defineStore('layerSet', {
    state: () => ({
        layerSet: [],   // 存放 ol/layer 实例数组
    }),

    getters: {
        layerCount: (state) => state.layerSet.length,
    },

    actions: {
        addLayer(layerInstance) {
            this.layerSet.push(layerInstance)
        },
        removeLayer(layerInstance) {
            this.layerSet = this.layerSet.filter(l => l !== layerInstance)
        },
        clearLayers() {
            this.layerSet = []
        },
        getLayers() {
            return this.layerSet
        },
    },
})
