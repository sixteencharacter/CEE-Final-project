import { BACKEND_URL } from "./config.js";

const doLogin = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "email": `${document.getElementsByName("email")[0].value}`,
        "password": `${document.getElementsByName("password")[0].value}`
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const ret = (await fetch(`${BACKEND_URL}/user/login`, requestOptions));
        if(ret.ok) {
            localStorage.setItem("accessToken",(await ret.json()).accessToken);
            window.location.replace("/group_select.html");
        }
        else {
            alert("Error : " + (await ret.json()).reason);
        }
    }
    catch {
        alert("Wrong password, please try again");
    }
}

document.addEventListener("DOMContentLoaded",async ()=>{
    document.getElementById("loginButton").addEventListener("click",async ()=>{
        await doLogin();
    })
})

