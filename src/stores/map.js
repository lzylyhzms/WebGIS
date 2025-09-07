import { defineStore } from 'pinia'
import {shallowRef} from "vue";

export const useMapStore = defineStore('map', {
    state: () => ({
        map: shallowRef(null),           // 存放 ol/Map 实例
    }),
    getters: {
        isReady: (state) => !!state.map,
    },
    actions: {
        setMap(mapInstance) {
            this.map = mapInstance
        },
        getMap() {
            return this.map
        },
        clearMap() {
            this.map = null
        },
    },
})
