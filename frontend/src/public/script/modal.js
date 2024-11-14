export const displayAlertModal = (title , message) => {
    document.getElementById("alertModal").classList.toggle("display-none");
    document.getElementById("alertTitle").innerHTML = title;
    document.getElementById("alertMessage").innerHTML = message;
} 

export const closeModal = () => {
    document.getElementById("alertModal").classList.toggle("display-none");
}