import {GeoJSON} from "ol/format";
//import { saveAs } from "file-saver";

const geoJSONFormat = new GeoJSON();

function readGeoJSON(geoJSON,options={}){
    //GeoJSON 对象转换为 OpenLayers 要素
    const readOptions = {
        dataProjection: options.dataProjection || 'EPSG:4326',
        featureProjection: options.featureProjection || 'EPSG:3857'
    };

    return geoJSONFormat.readFeatures(geoJSON, readOptions);
}

function writeGeoJSON(features, options = {}){
    //OpenLayers 要素转换为 GeoJSON 对象
    const writeOptions = {
        dataProjection: options.dataProjection || 'EPSG:4326',
        featureProjection: options.featureProjection || 'EPSG:3857',
        rightHanded: options.rightHanded !== undefined ? options.rightHanded : true,
        decimals: options.decimals || 6
    };

    if (Array.isArray(features)) {
        return geoJSONFormat.writeFeaturesObject(features, writeOptions);
    } else {
        return geoJSONFormat.writeFeatureObject(features, writeOptions);
    }
}

async function loadFromURL(url, options = {}){
    //从 URL 加载 GeoJSON 数据
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`加载 GeoJSON 失败: ${response.status} ${response.statusText}`);
        }

        const geoJSON = await response.json();
        return readGeoJSON(geoJSON, options);
    } catch (error) {
        console.error('加载 GeoJSON 数据出错:', error);
        throw error;
    }
}

function parseFromString(geoJSONString, options = {}){
    //从字符串解析 GeoJSON 数据
    try {
        const geoJSON = JSON.parse(geoJSONString);
        return readGeoJSON(geoJSON, options);
    } catch (error) {
        console.error('解析 GeoJSON 字符串出错:', error);
        throw error;
    }
}

function extractCoordinates(geoJSON){
    //提取 GeoJSON 中的坐标数据
    const coordinates = [];

    // 提取不同类型几何图形的坐标
    const extractFromGeometry = (geometry) => {
        if (!geometry || !geometry.type || !geometry.coordinates) {
            return;
        }

        switch (geometry.type) {
            case 'Point':
                coordinates.push(geometry.coordinates);
                break;
            case 'LineString':
            case 'MultiPoint':
                coordinates.push(...geometry.coordinates);
                break;
            case 'Polygon':
            case 'MultiLineString':
                geometry.coordinates.forEach(line => {
                    coordinates.push(...line);
                });
                break;
            case 'MultiPolygon':
                geometry.coordinates.forEach(polygon => {
                    polygon.forEach(ring => {
                        coordinates.push(...ring);
                    });
                });
                break;
            case 'GeometryCollection':
                if (geometry.geometries) {
                    geometry.geometries.forEach(geom => {
                        extractFromGeometry(geom);
                    });
                }
                break;
        }
    };

    // 处理不同类型的 GeoJSON
    if (geoJSON.type === 'Feature' && geoJSON.geometry) {
        extractFromGeometry(geoJSON.geometry);
    } else if (geoJSON.type === 'FeatureCollection' && geoJSON.features) {
        geoJSON.features.forEach(feature => {
            if (feature.geometry) {
                extractFromGeometry(feature.geometry);
            }
        });
    } else if (geoJSON.type && geoJSON.coordinates) {
        // 直接是几何对象
        extractFromGeometry(geoJSON);
    }

    return coordinates;
}

function mergeGeoJSON(geoJSONArray){
    //合并多个 GeoJSON 对象
    const mergedFeatures = [];

    geoJSONArray.forEach(geoJSON => {
        // 处理 FeatureCollection
        if (geoJSON.type === 'FeatureCollection' && geoJSON.features) {
            mergedFeatures.push(...geoJSON.features);
        }
        // 处理单个 Feature
        else if (geoJSON.type === 'Feature') {
            mergedFeatures.push(geoJSON);
        }
        // 处理几何对象，将其转换为 Feature
        else if (geoJSON.type && geoJSON.coordinates) {
            mergedFeatures.push({
                type: 'Feature',
                geometry: geoJSON,
                properties: {}
            });
        }
    });

    return {
        type: 'FeatureCollection',
        features: mergedFeatures
    };
}

function filterByProperties(geoJSON, filterFn){
    //根据属性过滤 GeoJSON 特征
    if (geoJSON.type !== 'FeatureCollection' || !geoJSON.features) {
        return geoJSON;
    }

    const filteredFeatures = geoJSON.features.filter(feature => {
        return filterFn(feature.properties || {});
    });

    return {
        type: 'FeatureCollection',
        features: filteredFeatures
    };
}

function countFeatures(geoJSON){
    //计算 GeoJSON 中的要素数量
    const counts = {
        total: 0,
        point: 0,
        lineString: 0,
        polygon: 0,
        other: 0
    };

    // 没有要素或格式不正确
    if (!geoJSON || typeof geoJSON !== 'object') {
        return counts;
    }

    // 处理 FeatureCollection
    if (geoJSON.type === 'FeatureCollection' && Array.isArray(geoJSON.features)) {
        counts.total = geoJSON.features.length;

        geoJSON.features.forEach(feature => {
            if (feature.geometry && feature.geometry.type) {
                const type = feature.geometry.type.toLowerCase();

                if (type === 'point' || type === 'multipoint') {
                    counts.point++;
                } else if (type === 'linestring' || type === 'multilinestring') {
                    counts.lineString++;
                } else if (type === 'polygon' || type === 'multipolygon') {
                    counts.polygon++;
                } else {
                    counts.other++;
                }
            } else {
                counts.other++;
            }
        });
    }
    // 处理单个 Feature
    else if (geoJSON.type === 'Feature' && geoJSON.geometry) {
        counts.total = 1;

        const type = geoJSON.geometry.type.toLowerCase();
        if (type === 'point' || type === 'multipoint') {
            counts.point = 1;
        } else if (type === 'linestring' || type === 'multilinestring') {
            counts.lineString = 1;
        } else if (type === 'polygon' || type === 'multipolygon') {
            counts.polygon = 1;
        } else {
            counts.other = 1;
        }
    }

    return counts;
}

function simplifyGeometry(geoJSON, tolerance = 0.00001){
    //简化 GeoJSON 几何图形（减少点的数量）
    // 转换为 OpenLayers 要素
    const features = readGeoJSON(geoJSON);

    // 对每个要素进行简化
    features.forEach(feature => {
        const geometry = feature.getGeometry();
        if (geometry) {
            const simplifiedGeometry = geometry.simplify(tolerance);
            feature.setGeometry(simplifiedGeometry);
        }
    });

    // 转回 GeoJSON
    return writeGeoJSON(features);
}

// 导出 GeoJSON
function exportGeoJSON(vectorLayer) {
    const features = vectorLayer.getSource().getFeatures();
    const geojson = new GeoJSON().writeFeatures(features, {
        featureProjection: "EPSG:3857"
    });
    const blob = new Blob([geojson], { type: "application/json;charset=utf-8" });
    saveAs(blob, "features.geojson");
}

export function originExportGeoJSON(vectorLayer) {
    const features = vectorLayer.getSource().getFeatures();
    const geojson = new GeoJSON().writeFeatures(features, {
        featureProjection: "EPSG:3857"
    });
    const blob = new Blob([geojson], { type: "application/json;charset=utf-8" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "features.geojson";
    link.click();
    URL.revokeObjectURL(url);
}

export function originExportFeature(features) {
    const geojson = new GeoJSON().writeFeatures(features, {
        featureProjection: "EPSG:3857"
    });
    const blob = new Blob([geojson], { type: "application/json;charset=utf-8" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "features.geojson";
    link.click();
    URL.revokeObjectURL(url);
}