import { BACKEND_URL } from "./config.js";
import { closeModal, displayAlertModal } from "./modal.js";

const doRegister = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const email = document.getElementsByName("email")[0].value
    const password = document.getElementsByName("password")[0].value
    const re_password = document.getElementsByName("re_password")[0].value

    if (password != re_password) {
        displayAlertModal("Error", "Password didn't match , please try again");
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
        if (ret.ok) {
            window.location.replace("/login.html");
        }
        else {
            displayAlertModal("Error", (await ret.json()).reason);
        }
    }
    catch {
        displayAlertModal("Error", "UnExpected Error occurred , please try again later");
    }
}

document.addEventListener("DOMContentLoaded", async () => {

    document.getElementById("registerButton").addEventListener("click", async () => {
        await doRegister();
    })

    closeModal();

    document.getElementsByClassName("close-btn")[0].addEventListener("click", () => {
        closeModal();
    })

    document.getElementsByClassName("close-modal")[0].addEventListener("click", () => {
        closeModal();
    })

})



