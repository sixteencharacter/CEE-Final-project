import { BACKEND_URL } from "./config.js"

document.addEventListener("DOMContentLoaded",()=>{
    if(localStorage.getItem("accessToken")) {
        window.location.replace("/login.html")
    }
})