import { BACKEND_URL } from "./config.js";

const doRegister = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const email = document.getElementsByName("email")[0].value
    const password = document.getElementsByName("password")[0].value
    const re_password = document.getElementsByName("re_password")[0].value
    
    if(password != re_password) {
        alert("Two set of password didn't match")
        return;
    }
    
    const raw = JSON.stringify({
        "email": `${email}`,
        "password": `${password}`
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const ret = (await fetch(`${BACKEND_URL}/user/register`, requestOptions));
        if(ret.ok) {
            window.location.replace("/");
        }
        else {
            alert("Error : " + (await ret.json()).reason);
        }
    }
    catch {
        alert("UnExpected Error occurred , please try again later");
    }
}

document.addEventListener("DOMContentLoaded",async ()=>{
    document.getElementById("registerButton").addEventListener("click",async ()=>{
        await doRegister();
    })
})



