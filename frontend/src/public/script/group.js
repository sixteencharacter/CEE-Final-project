import { BACKEND_URL } from "./config.js";
import { closeModal, displayAlertModal } from "./modal.js";

const doLogout = () => {
    localStorage.clear();
    window.location.replace("/login.html");
}

const dojoinGroup = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${localStorage.getItem("accessToken")}`)

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
        if (ret.ok) {
            localStorage.setItem("groupToken", (await ret.json()).groupToken);
            window.location.replace("/");
        }
        else {
            displayAlertModal("Error", (await ret.json()).reason);
        }
    }
    catch {
        displayAlertModal("Error", "Unexpected Error occurred, please try again");
    }
}


document.addEventListener("DOMContentLoaded", async () => {

    if (localStorage.getItem("accessToken") === null) {
        window.location.replace("/login.html")
    }

    document.getElementById("joinButton").addEventListener("click", async () => {
        await dojoinGroup();
    })

    closeModal();

    document.getElementsByClassName("close-btn")[0].addEventListener("click", () => {
        closeModal();
    })

    document.getElementsByClassName("close-modal")[0].addEventListener("click", () => {
        closeModal();
    })

    document.getElementById("logoutButton").addEventListener("click", () => {
        doLogout();
    })
})

