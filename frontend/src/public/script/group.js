import { BACKEND_URL } from "./config.js";

const dojoinGroup = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization",`Bearer ${localStorage.getItem("accessToken")}`)

    const raw = JSON.stringify({
        "groupCode": `${document.getElementsByName("groupCode")[0].value}`,
        "groupPassword": `${document.getElementsByName("groupPassword")[0].value}`
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const ret = (await fetch(`${BACKEND_URL}/group/join`, requestOptions));
        if(ret.ok) {
            localStorage.setItem("groupToken",(await ret.json()).groupToken);
            window.location.replace("/");
        }
        else {
            alert("Error : " + (await ret.json()).reason);
        }
    }
    catch {
        alert("Unexpected Error occurred, please try again");
    }
}

document.addEventListener("DOMContentLoaded",async ()=>{
    document.getElementById("joinButton").addEventListener("click",async ()=>{
        await dojoinGroup();
    })
})

