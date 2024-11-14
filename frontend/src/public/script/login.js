import { BACKEND_URL } from "./config.js";
import { closeModal, displayAlertModal } from "./modal.js";

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
            displayAlertModal("Error",(await ret.json()).reason);
        }
    }
    catch {
        displayAlertModal("Error","Wrong password , please try again");
    }
}

document.addEventListener("DOMContentLoaded",async ()=>{

    if(localStorage.getItem("accessToken") != null) {
        window.location.replace("/")
    }

    document.getElementById("loginButton").addEventListener("click",async ()=>{
        await doLogin();
    })

    closeModal();

    document.getElementsByClassName("close-btn")[0].addEventListener("click",()=>{
        closeModal();
    })

    document.getElementsByClassName("close-modal")[0].addEventListener("click",()=>{
        closeModal();
    })

})

