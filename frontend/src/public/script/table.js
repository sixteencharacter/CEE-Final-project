// Initialize headers for API requests
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Accept", "application/json");
myHeaders.append("Authorization", `Bearer ${localStorage.getItem("accessToken")}+${localStorage.getItem("groupToken")}`);
const predefinedTags = ["JavaScript", "CSS", "HTML", "React", "Node.js", "Backend", "Frontend"];
// Load data when DOM is ready
document.addEventListener("DOMContentLoaded", loadData);

// Function to load data and display it in the table
async function loadData() {
  try {
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };
    const response = await fetch("http://localhost:3222/todo", requestOptions);
    if (response.ok) {
      const data = await response.json();
      data.forEach(item => addRowToTable(item)); // Add each item to the table
    } else {
      console.error("Failed to load data:", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Function to add a row to the table for each item with editable fields
function addRowToTable(item) {
  const tableBody = document.getElementById("main-table-body");
  const row = tableBody.insertRow();

  const fields = ["title", "dueDate", "date", "startDate", "tags", "status", "description"];

  fields.forEach(field => {
    const cell = row.insertCell();
    cell.contentEditable = field !== "tags"; // Tags are handled separately

    // Handle tags as a special case
    if (field === "tags") {
      renderTagsWithDropdown(cell, item._id, item.tags);
    }
    else if(field == "date"){
      // console.log(item["dueDate"]);
      var text = convertDateToISO(item["dueDate"]);
      cell.innerText = calculateDaysUntil(text);
      
    }
    else if(field === "dueDate" || field === "startDate"){
      cell.innerText = item[field] || "";
      makeDateEditable(cell, item._id, field,item[field]);
      
    }
    else if (field === "status") {
      renderStatusDropdown(cell, item._id, item.status);
    }
    else {
      cell.innerText = item[field] || ""; // Default to empty if null
      cell.addEventListener("blur", () => handleEdit(item._id, field, cell.innerText));
    }
    addEventListener("event name",(event)=>{})
    
  });
}

function makeDateEditable(cell, itemId, field, text) {
  // Save the original date in case no change is made
  const originalDate = text;

  function showDateInput(event) {
    // Create a date input element
    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = convertDateToISO(originalDate); // Set value in ISO format

    // Function to save the new date or revert if unchanged
    async function saveDateChange(parentNode) {
      const newDate = dateInput.value;

      if (newDate) {
        cell.innerText = formatDate(newDate); // Update display in DD/MM/YYYY format
        await handleEdit(itemId, field, formatDate(newDate)); // Save updated date to server
        if(field == "dueDate"){
            parentNode.children[2].innerHTML = calculateDaysUntil(newDate);
        }
        
      } else {
        cell.innerText = originalDate; // Revert if no new date selected
      }
      
      cell.addEventListener("click", showDateInput); // Re-enable click after editing
    }

    // Get parent node
    const parentNode = event.target.parentNode;

    // Attach event listener for date change without calling the function immediately
    dateInput.addEventListener("change", () => saveDateChange(parentNode));

    // Replace cell content with date input and focus on it
    cell.innerText = "";
    cell.appendChild(dateInput);
    dateInput.focus();

    // Remove the click event to prevent multiple listeners
    cell.removeEventListener("click", showDateInput);
  }

  // Attach the showDateInput function as the click event handler
  cell.addEventListener("click", showDateInput);
}
function renderTagsWithDropdown(cell, itemId, tags) {
  if (!itemId) {
    console.error("Invalid itemId:", itemId);
    return;
  }
  
  cell.innerHTML = ""; // Clear current cell content

  tags.forEach(tag => {
    const tagElement = document.createElement("span");
    tagElement.classList.add("tag");
    tagElement.innerText = tag;

    const removeButton = document.createElement("span");
    removeButton.classList.add("remove-tag");
    removeButton.innerText = "✕";
    removeButton.addEventListener("click", () => updateTagList(itemId, tag, "remove", cell));

    tagElement.appendChild(removeButton);
    cell.appendChild(tagElement);
  });

  // Add an input field with dropdown for adding new tags
  const addTagInput = document.createElement("input");
  addTagInput.placeholder = "Add or select tag";
  addTagInput.addEventListener("input", () => showTagDropdown(addTagInput, cell, itemId));
  addTagInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && addTagInput.value.trim()) {
      updateTagList(itemId, addTagInput.value.trim(), "add", cell);
      addTagInput.value = ""; // Clear input after adding
      closeTagDropdown(cell);
    }
  });
  cell.appendChild(addTagInput);
}

// Function to show a dropdown with tag suggestions
function showTagDropdown(input, cell, itemId) {
  closeTagDropdown(cell); // Close any existing dropdown

  const dropdown = document.createElement("div");
  dropdown.classList.add("tag-dropdown");

  const filteredTags = predefinedTags.filter(tag => 
    tag.toLowerCase().includes(input.value.toLowerCase()) && 
    !Array.from(cell.querySelectorAll(".tag")).some(el => el.innerText === tag)
  );

  filteredTags.forEach(tag => {
    const dropdownItem = document.createElement("div");
    dropdownItem.classList.add("dropdown-item");
    dropdownItem.innerText = tag;
    dropdownItem.addEventListener("click", () => {
      updateTagList(itemId, tag, "add", cell);
      input.value = ""; // Clear input
      closeTagDropdown(cell);
    });
    dropdown.appendChild(dropdownItem);
  });

  cell.appendChild(dropdown);
}

// Function to close the tag dropdown
function closeTagDropdown(cell) {
  const existingDropdown = cell.querySelector(".tag-dropdown");
  if (existingDropdown) {
    existingDropdown.remove();
  }
}

// Function to add or remove a tag and update the server without reloading the table
async function updateTagList(itemId, tag, action, cell) {
  try {
    // Fetch the item to ensure `tags` field exists
    const response = await fetch(`http://localhost:3222/todo/${itemId}`, {
      method: "GET",
      headers: myHeaders
    });
    const item = await response.json();

    if (!item.tags || !Array.isArray(item.tags)) {
      console.error("Invalid tags format for item:", item);
      return;
    }

    const updatedTags = action === "add" ? [...item.tags, tag] : item.tags.filter(t => t !== tag);
    await handleEdit(itemId, "tags", updatedTags); // Update tags on server
    renderTagsWithDropdown(cell, itemId, updatedTags); // Re-render tags in the cell
  } catch (error) {
    console.error(`Error ${action === "add" ? "adding" : "removing"} tag:`, error);
  }
}

function renderStatusDropdown(cell, itemId, currentStatus) {
  const statusOptions = ["Scheduled", "In_progress", "Completed"];
  const select = document.createElement("select");

  statusOptions.forEach(status => {
    const option = document.createElement("option");
    option.value = status;
    option.text = status;
    if (status === currentStatus) option.selected = true;
    select.appendChild(option);
  });

  select.addEventListener("change", () => handleEdit(itemId, "status", select.value));
  cell.appendChild(select);
}
/////////////////////////////////////////////////////คำนวนเวลาที่เหลือ/////////////////////////////////////////////////////
// Utility function to format dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return `${("0" + date.getDate()).slice(-2)}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
}

function convertDateToISO(dateString) {
  // แยกวันที่ (วัน, เดือน, ปี) จากรูปแบบ DD/MM/YYYY
  const [day, month, year] = dateString.split("/");

  // คืนค่าวันที่ในรูปแบบ YYYY-MM-DD
  return `${year}-${("0" + month).slice(-2)}-${("0" + day).slice(-2)}`;
}

function calculateDaysUntil(dateString) {
  // แปลงวันที่ที่กำหนดเป็นวัตถุ Date
  const targetDate = new Date(dateString);
  console.log(targetDate);
  
  // วันที่ปัจจุบัน
  const currentDate = new Date();
  
  // คำนวณความแตกต่างในเวลา (มิลลิวินาที)
  const differenceInTime = targetDate - currentDate;
  
  // คำนวณจำนวนวันจากมิลลิวินาที (1 วัน = 24 ชั่วโมง * 60 นาที * 60 วินาที * 1000 มิลลิวินาที)
  const daysRemaining = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));
  
  return daysRemaining;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////การแก้ไขข้อมูล////////////////////////////////////////
async function handleEdit(id, field, value) {
  console.log()
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////การเพื่มข้อมูล//////////////////////////////////////////////////////////////
document.getElementById("Add_todo").addEventListener("click", async () => {
  const title = document.getElementById("add-title").querySelector("input").value;
  const dueDate = document.querySelector("#add-date input[type='date']").value;
  
  const startDate = document.querySelector("#add-start-date input[type='date']").value;
  const tags = Array.from(document.querySelectorAll("#tag-container .tag")).map(tag => tag.innerText); // Collect all tags
  const status = document.getElementById("status").value;
  const description = document.getElementById("add-description").querySelector("input").value;

  const raw = JSON.stringify({
    title,
    description,
    dueDate: formatDate(dueDate),
    startDate: formatDate(startDate),
    tags,
    status,
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



// Function to clear input fields after adding a new item
function clearInputFields() {
  document.querySelector("#add-title input").value = "";
  document.querySelector("#add-date input[type='date']").value = "";
  document.querySelector("#add-start-date input[type='date']").value = "";
  document.getElementById("tag-container").innerHTML = '<input type="text" id="tag-input" placeholder="Add a tag and press Enter" />';
  document.getElementById("status").value = "0";
  document.getElementById("add-description").value = "";
}









// Array ของแท็กที่มีอยู่
const availableTags = ["JavaScript", "CSS", "HTML", "React", "Node.js"];
let selectedTags = []; // Array สำหรับเก็บแท็กที่ถูกเลือก

document.addEventListener("DOMContentLoaded", () => {
  const tagContainer = document.getElementById("tag-container");
  const tagInput = document.getElementById("tag-input");
  const tagList = document.getElementById("tag-list");

  // อัปเดต dropdown list ของแท็กที่มีอยู่
  updateTagDropdown();

  // เมื่อผู้ใช้กด Enter เพื่อเพิ่มแท็กใหม่
  tagInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput.value);
      tagInput.value = ""; // ล้างค่าใน input หลังจากเพิ่มแท็ก
    }
  });

  // เมื่อพิมพ์เพื่อแสดงและกรองแท็ก
  tagInput.addEventListener("input", handleTagInput);

  // คลิกภายนอกเพื่อปิด dropdown
  document.addEventListener("click", (e) => {
    if (!tagContainer.contains(e.target)) {
      tagList.style.display = "none";
    }
  });

  function updateTagDropdown() {
    tagList.innerHTML = "";
    availableTags.forEach((tag) => {
      const tagItem = document.createElement("div");
      tagItem.classList.add("tag-item");
      tagItem.innerText = tag;
      tagItem.addEventListener("click", () => {
        addTag(tag);
        tagInput.value = "";
      });
      tagList.appendChild(tagItem);
    });
    tagList.style.display = "block";
  }

  function handleTagInput() {
    const query = tagInput.value.toLowerCase();
    const filteredTags = availableTags.filter((tag) => tag.toLowerCase().includes(query));
    tagList.innerHTML = "";
    filteredTags.forEach((tag) => {
      const tagItem = document.createElement("div");
      tagItem.classList.add("tag-item");
      tagItem.innerText = tag;
      tagItem.addEventListener("click", () => {
        addTag(tag);
        tagInput.value = "";
      });
      tagList.appendChild(tagItem);
    });
    tagList.style.display = "block";
  }

  function addTag(tag) {
    if (tag && !selectedTags.includes(tag)) {
      selectedTags.push(tag);
      if (!availableTags.includes(tag)) {
        availableTags.push(tag); // เพิ่มแท็กใหม่ใน availableTags หากเป็นแท็กใหม่
      }
      renderTags();
      updateTagsInDatabase(); // อัปเดตในฐานข้อมูลหลังเพิ่มแท็กใหม่
    }
  }

  function removeTag(tag) {
    selectedTags = selectedTags.filter((t) => t !== tag);
    renderTags();
    updateTagsInDatabase(); // อัปเดตในฐานข้อมูลหลังลบแท็ก
  }

  function renderTags() {
    const existingTags = Array.from(tagContainer.querySelectorAll(".tag"));
    existingTags.forEach((tagElement) => tagElement.remove());

    selectedTags.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.classList.add("tag");
      tagElement.innerText = tag;

      // ปุ่มลบแท็ก
      const removeButton = document.createElement("span");
      removeButton.classList.add("remove-tag");
      removeButton.innerText = "✕";
      removeButton.addEventListener("click", () => removeTag(tag));

      tagElement.appendChild(removeButton);
      tagContainer.insertBefore(tagElement, tagInput);
    });
  }

  // ฟังก์ชันเพื่ออัปเดตแท็กในฐานข้อมูลโดยใช้ handleEdit
  function updateTagsInDatabase() {
    const itemId = "PUT_ITEM_ID_HERE"; // แทนที่ด้วย ID ของ item
    handleEdit(itemId, "tags", selectedTags);
  }
});