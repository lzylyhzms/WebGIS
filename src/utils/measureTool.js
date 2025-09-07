import { Overlay } from "ol";
import { getLength, getArea } from "ol/sphere";
import { Draw } from "ol/interaction";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Fill, Stroke, Style } from "ol/style";

export const createMeasureTool = (map) => {
    let measureTooltipElement;
    let measureTooltip;
    let draw;
    let sketch;

    // ================== 样式层 ==================
    const source = new VectorSource();
    const vectorLayer = new VectorLayer({
        source: source,
        style: new Style({
            fill: new Fill({ color: "rgba(255,255,255,0.2)" }),
            stroke: new Stroke({ color: "#ffcc33", width: 2 }),
        }),
    });
    map.addLayer(vectorLayer);

    // ================== 创建提示框 ==================
    const createMeasureTooltip = () => {
        if (measureTooltipElement) {
            measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement("div");
        measureTooltipElement.className = "ol-tooltip ol-tooltip-measure";

        measureTooltip = new Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: "bottom-center",
            stopEvent: false,
        });
        map.addOverlay(measureTooltip);
    };

    // ================== 格式化函数 ==================
    const formatLength = (line) => {
        const length = getLength(line);
        return length > 1000
            ? (Math.round((length / 1000) * 100) / 100) + " km"
            : (Math.round(length * 100) / 100) + " m";
    };

    const formatArea = (polygon) => {
        const area = getArea(polygon);
        return area > 1000000
            ? (Math.round((area / 1000000) * 100) / 100) + " km²"
            : area > 10000
                ? (Math.round((area / 10000) * 100) / 100) + " ha"
                : (Math.round(area * 100) / 100) + " m²";
    };

    // ================== 返回工具方法 ==================
    return {
        // 开始测距离
        startMeasureDistance() {
            this.stopMeasure();
            draw = new Draw({
                source: source,
                type: "LineString",
                style: new Style({
                    stroke: new Stroke({
                        color: "rgba(0,0,0,0.5)",
                        lineDash: [10, 10],
                        width: 2,
                    }),
                }),
            });
            createMeasureTooltip();

            draw.on("drawstart", (evt) => {
                sketch = evt.feature;
                sketch.getGeometry().on("change", (evt) => {
                    const geom = evt.target;
                    measureTooltipElement.innerHTML = formatLength(geom);
                    measureTooltip.setPosition(geom.getLastCoordinate());
                });
            });

            draw.on("drawend", () => {
                measureTooltipElement.className = "ol-tooltip ol-tooltip-static";
                measureTooltip.setOffset([0, -7]);
                sketch = null;
                createMeasureTooltip();
            });

            map.addInteraction(draw);
        },

        // 开始测面积
        startMeasureArea() {
            this.stopMeasure();
            draw = new Draw({
                source: source,
                type: "Polygon",
                style: new Style({
                    fill: new Fill({ color: "rgba(255,255,255,0.2)" }),
                    stroke: new Stroke({
                        color: "rgba(0,0,0,0.5)",
                        lineDash: [10, 10],
                        width: 2,
                    }),
                }),
            });
            createMeasureTooltip();

            draw.on("drawstart", (evt) => {
                sketch = evt.feature;
                sketch.getGeometry().on("change", (evt) => {
                    const geom = evt.target;
                    measureTooltipElement.innerHTML = formatArea(geom);
                    measureTooltip.setPosition(geom.getInteriorPoint().getCoordinates());
                });
            });

            draw.on("drawend", () => {
                measureTooltipElement.className = "ol-tooltip ol-tooltip-static";
                measureTooltip.setOffset([0, -7]);
                sketch = null;
                createMeasureTooltip();
            });

            map.addInteraction(draw);
        },

        // 停止测量
        stopMeasure() {
            if (draw) {
                map.removeInteraction(draw);
                draw = null;
            }
            if (measureTooltip) {
                map.removeOverlay(measureTooltip);
                measureTooltip = null;
            }
            if (measureTooltipElement && measureTooltipElement.parentNode) {
                measureTooltipElement.parentNode.removeChild(measureTooltipElement);
                measureTooltipElement = null;
            }
        },
    };
};
