import axios from "axios";

const key = import.meta.env.VITE_API_KEY;


export async function searchPlace(query){
    if (!query) return;

    try {
        const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(query)}&output=json&key=${key}`;
        const res = await axios.get(url);

        console.log("Searching!")
        if (res.data.status === "1" && res.data.geocodes.length > 0) {
            const [lng, lat] = res.data.geocodes[0].location.split(",").map(Number);

            console.log("搜索结果:", lng, lat);
            return [lng,lat];
        } else {
            alert("未找到结果");
        }
    } catch (err) {
        console.error("搜索失败", err);
    }
}