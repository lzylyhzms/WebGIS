import { Modify, Select } from "ol/interaction";
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";

export function createHistoryManager(map, layer, maxLength = 20) {
    const history = {
        undoStack: [],
        redoStack: [],
        maxLength
    };

    let selectedFeature = null;
    let originalGeometry = null;
    let select = null;
    let modify = null;

    function saveToHistory(type, data) {
        history.undoStack.push({ type, data });
        history.redoStack = [];
        if (history.undoStack.length > history.maxLength) {
            history.undoStack.shift();
        }
    }

    function createModifyInteraction() {
        const modify = new Modify({ source: layer.getSource() });

        modify.on("modifystart", (evt) => {
            const features = evt.features.getArray();
            selectedFeature = features[0];
            originalGeometry = selectedFeature?.getGeometry()?.clone();
        });

        modify.on("modifyend", () => {
            if (selectedFeature && originalGeometry) {
                saveToHistory("modify", {
                    feature: selectedFeature,
                    oldGeometry: originalGeometry,
                    newGeometry: selectedFeature.getGeometry().clone()
                });
            }
        });

        return modify;
    }

    function init() {
        select = new Select({
            layers: [layer],
            style: new Style({
                stroke: new Stroke({
                    color: "#0099ff",
                    width: 3
                }),
                fill: new Fill({
                    color: "rgba(0, 153, 255, 0.2)"
                }),
                image: new CircleStyle({
                    radius: 8,
                    fill: new Fill({ color: "#0099ff" }),
                    stroke: new Stroke({ color: "white", width: 2 })
                })
            })
        });
        modify = createModifyInteraction();
    }

    function start() {
        if (map && select && modify) {
            map.addInteraction(select);
            map.addInteraction(modify);
        }
    }

    function stop() {
        if (map) {
            if (select) map.removeInteraction(select);
            if (modify) map.removeInteraction(modify);
        }
        selectedFeature = null;
        originalGeometry = null;
    }

    function undo() {
        const action = history.undoStack.pop();
        if (action?.type === "modify") {
            action.data.feature.setGeometry(action.data.oldGeometry);
            history.redoStack.push(action);
        }
    }

    function redo() {
        const action = history.redoStack.pop();
        if (action?.type === "modify") {
            action.data.feature.setGeometry(action.data.newGeometry);
            history.undoStack.push(action);
        }
    }

    function getSelectedFeature() {
        return selectedFeature;
    }

    function clearSelection() {
        select?.getFeatures()?.clear();
        selectedFeature = null;
    }

    function destroy() {
        stop();
        history.undoStack = [];
        history.redoStack = [];
        select = null;
        modify = null;
    }

    // 🔑 暴露对象方法
    return {
        init,
        start,
        stop,
        undo,
        redo,
        getSelectedFeature,
        clearSelection,
        destroy
    };
}
