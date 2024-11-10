const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Accept", "application/json");
myHeaders.append("Authorization", `Bearer ${localStorage.getItem("accessToken")}+${localStorage.getItem("groupToken")}`);

document.addEventListener("DOMContentLoaded", loadData);

async function loadData() {
  try {
    const response = await fetch("http://localhost:3222/todo");
    if (response.ok) {
      const data = await response.json();
      data.forEach(item => addRowToTable(item));
    } else {
      console.error("Failed to load data:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to add a new row with editable cells
function addRowToTable(item) {
  const tableBody = document.getElementById("main-table-body");
  const row = tableBody.insertRow();

  // Editable fields
  const fields = ["title", "date", "dueDate", "startDate", "tags", "status", "description"];
  
  fields.forEach(field => {
    const cell = row.insertCell();
    cell.contentEditable = true;
    cell.innerText = item[field] || ""; // Default to empty string if null
    cell.addEventListener("blur", () => handleEdit(item._id, field, cell.innerText));
  });
}

// Function to handle inline edits
async function handleEdit(id, field, value) {
  const raw = JSON.stringify({ [field]: value });
  
  const requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch(`http://localhost:3222/todo/${id}`, requestOptions);
    if (response.ok) {
      console.log(`Updated ${field} to ${value}`);
    } else {
      console.error("Update failed:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Event listener for the "Add" button to add new entries
document.getElementById("Add_todo").addEventListener("click", async () => {
  const titleadd = document.getElementById("add-title").querySelector("input").value;
  const dueDateInput = document.querySelector("#add-due-date input[type='date']").value;
  const startDateInput = document.querySelector("#add-start-date input[type='date']").value;
  const tagsadd = document.getElementById("name-to-add").value;
  const statusadd = document.getElementById("status").value;
  const descriptionadd = document.getElementById("add-description").querySelector("input").value;

  const formattedDueDate = formatDate(dueDateInput);
  const formattedStartDate = formatDate(startDateInput);

  const raw = JSON.stringify({
    title: titleadd,
    description: descriptionadd,
    dueDate: formattedDueDate,
    startDate: formattedStartDate,
    tags: [tagsadd],
    status: statusadd,
    group: localStorage.getItem("groupToken")
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  try {
    const response = await fetch("http://localhost:3222/todo", requestOptions);
    if (response.ok) {
      const result = await response.json();
      addRowToTable(result);
      clearInputFields();
    } else {
      console.error("Failed to post data:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${("0" + (date.getMonth() + 1)).slice(-2)}/${
      ("0" + date.getDate()).slice(-2)
    }/${date.getFullYear()}`;
}

function clearInputFields() {
  document.querySelector("#add-title input").value = "";
  document.querySelector("#add-due-date input[type='date']").value = "";
  document.querySelector("#add-start-date input[type='date']").value = "";
  document.getElementById("name-to-add").value = "0";
  document.getElementById("status").value = "0";
  document.getElementById("add-description").value = "";
}
