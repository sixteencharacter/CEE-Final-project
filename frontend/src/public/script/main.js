import { BACKEND_URL } from "./config.js"

const doLogout = () => {
    localStorage.clear();
    window.location.replace("/");
}

const doChangeGroup = () => {
    localStorage.removeItem("groupToken");
    window.location.replace("/group_select.html");
}

document.addEventListener("DOMContentLoaded",()=>{
    if(localStorage.getItem("accessToken") === null) {
        window.location.replace("/login.html")
    }
    else if(localStorage.getItem("groupToken") === null) {
        window.location.replace("/group_select.html")
    }

    document.getElementById("logoutBtn").addEventListener("click",()=>{
        doLogout();
    })

    document.getElementById("doChangeGroupBtn").addEventListener("click",()=>{
        doChangeGroup();
    })

})