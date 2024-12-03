import { BACKEND_URL } from "./config.js";
let availableTags = [];
// Initialize headers for API requests
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Accept", "application/json");
myHeaders.append("Authorization", `Bearer ${localStorage.getItem("accessToken")}+${localStorage.getItem("groupToken")}`);
//const predefinedTags = ["JavaScript", "CSS", "HTML", "React", "Node.js", "Backend", "Frontend"];
// Load data when DOM is ready
document.addEventListener("DOMContentLoaded", loadData);
document.getElementById("applyFilterButton").addEventListener("click", async function() {
  await loadData();
});
document.getElementById("clearFilterButton").addEventListener("click", async function() {
  clearFilters();
  await loadData();
});

document.getElementById("showCanvasButton").addEventListener("click",()=>{
  showFilterCanvas();
})
document.getElementById("hideCanvasButton").addEventListener("click",()=>{
  hideFilterCanvas();
})

document.getElementById("f-tag-input").addEventListener("keyup",(event)=>{
  for(let x of document.getElementById("f-dropdown-content").children) {
    if(x.innerHTML.trim().includes(event.target.value.trim()) || event.target.value.trim().length == 0) {
      x.style.display  = "block";
    }
    else {
      x.style.display = "none";
    }
  }
  if(event.key === "Enter") {
    let dataText = event.target.value.replaceAll(/\n/g,"");
    if(dataText.length && !getAllFilterTags().includes(event.target.value.trim()) && getAllAvailableFilterTag().includes(event.target.value.trim())) {
      addnewfilterTag(dataText);
      event.target.value = "";
      for(let x of document.getElementById("f-dropdown-content").children) {
        x.style.display = "block";
      }
    }
  }
})

document.getElementById("f-tag-input").addEventListener("focus",(event)=>{
  document.getElementById("f-dropdown-content").style.display = "block";
});

document.getElementById("f-tag-input").addEventListener("focusout",(event)=>{
  if(!Array.from(document.getElementById("f-dropdown-content").children).includes(event.relatedTarget)) {
    document.getElementById("f-dropdown-content").style.display = "none";
  }
});


// Function to load data and display it in the table
async function loadData() {
  console.log("loading data");
  let url = new URL(`${BACKEND_URL}/todo`);

  const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
  };
  
  //Get filter values
  const startDateFrom = document.getElementById("startDateFrom").value;
  const startDateTo = document.getElementById("startDateTo").value;
  const endDateFrom = document.getElementById("endDateFrom").value;
  const endDateTo = document.getElementById("endDateTo").value;
  const tagsDropdown = document.getElementById("filterTags");
  const selectedTags = getAllFilterTags();
  console.log("Selected Tags:", selectedTags);
  const selectedStatus = document.getElementById("filterStatus").value;
  const title = document.getElementById("filterTitle").value;

  // Add filter parameters to the URL
  if (startDateFrom) url.searchParams.append("startDateStart", formatDate(startDateFrom));
  if (startDateTo) url.searchParams.append("startDateEnd", formatDate(startDateTo));
  if (endDateFrom) url.searchParams.append("dueDateStart", formatDate(endDateFrom));
  if (endDateTo) url.searchParams.append("dueDateEnd", formatDate(endDateTo));
  if (selectedStatus) url.searchParams.append("status", selectedStatus);

  // Add selected tags to the URL
  if (selectedTags.length > 0) {
      url.searchParams.append("tags", selectedTags.join(","));
  }
console.log(url.href);
  // Add title to the URL if provided
  if (title) url.searchParams.append("title", title.trim());



  try {
      const response = await fetch(url, requestOptions);
      if (response.ok) {
          clearTable();
          const data = await response.json();
          data.forEach(item => addRowToTable(item)); // Add each item to the table
      } else {
          console.error("Failed to load data:", response.statusText);
      }
  } catch (error) {
      console.error("Error:", error);
  }
  console.log("data loaded")
}

// Function to clear the table
function clearTable() {
  console.log("Clearing table");
  const tableBody = document.getElementById("main-table-body");
  while (tableBody.firstChild) {
      tableBody.removeChild(tableBody.firstChild);
  }
  console.log("Cleared table");
}

function clearFilters() {
  // Clear date filters
  document.getElementById("startDateFrom").value = "";
  document.getElementById("startDateTo").value = "";
  document.getElementById("endDateFrom").value = "";
  document.getElementById("endDateTo").value = "";

  document.getElementById("f-tag-container").replaceChildren();

  // Clear status and title filters
  document.getElementById("filterStatus").value = "";
  document.getElementById("filterTitle").value = "";
}

async function populateTags() {
  const tagsDropdown = document.getElementById("f-dropdown-content");
    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

        try {
            const response = await fetch(`${BACKEND_URL}/todo`, requestOptions); // Replace with your API endpoint
            if (response.ok) {
                const data = await response.json(); // Assume the API returns an array of objects

  // Extract unique tags
  const allTags = new Set();
  data.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
          item.tags.forEach(tag => allTags.add(tag));
      }
  });
  
  

  

  // Clear existing options
  tagsDropdown.innerHTML = "";

  if (allTags.size > 0) {
      // Populate with unique tags
      allTags.forEach(tag => {
          const option = document.createElement("a");
          // option.value = tag; // The value sent with the filter
          option.innerHTML = tag; // The displayed name
          option.setAttribute("tabindex","-1");
          tagsDropdown.appendChild(option);
      });
      for(let x of document.getElementById("f-dropdown-content").children) {
        x.addEventListener("click",(event)=>{
          document.getElementById("f-tag-input").value = "";
          if(!getAllFilterTags().includes(event.target.innerHTML.trim())) {
            addnewfilterTag(event.target.innerHTML.trim());
          }
          document.getElementById("f-dropdown-content").style.display = "none";
        });
      }

      availableTags = Array.from(allTags);

      

  }
  } else {
  console.error("Failed to fetch data:", response.statusText);
  }
  } catch (error) {
  console.error("Error fetching data:", error);
  }
}
    

// Function to add a row to the table for each item with editable fields
function addRowToTable(item) {
  const tableBody = document.getElementById("main-table-body");
  const row = tableBody.insertRow();

  const fields = ["title", "startDate","dueDate", "date", "tags", "status", "description"];

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
      cell.contentEditable="false";
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
    //addEventListener("event name",(event)=>{})
    
  });
  const deleteCell = row.insertCell();
  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Del";

  // Set up the onclick to call deleteData with the item's ID
  deleteButton.onclick = () => {
    deleteData(item._id);
    tableBody.removeChild(row); // Optionally remove row from UI on successful delete
  };

  deleteCell.appendChild(deleteButton);
  populateTags();
}
function deleteData(itemId) {

  const requestOptions = {
    method: "DELETE",
    headers: myHeaders,
    redirect: "follow"
  };

  // 😄

  fetch(`${BACKEND_URL}/todo/${itemId}`, requestOptions)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      return response.text();
    })
    .then(result => console.log("Delete successful:", result))
    .catch(error => console.error("Delete failed:", error));
  populateTags();
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
          const calculatedDays = calculateDaysUntil(newDate);
          parentNode.children[3].innerHTML = calculatedDays;
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
////////////////////////////////////////////////////RANDOM COLOR///////////////////////////////////////////////////////////////////
const tagColors = new Map();

function getRandomColor(tagName) {
  // ถ้ามีสีใน Map แล้ว ให้ใช้สีเดิม
  if (tagColors.has(tagName)) {
    return tagColors.get(tagName);
  }

  // สุ่มสีใหม่โดยใช้ hash จากชื่อแท็ก
  const hash = [...tagName].reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const randomColor = `hsl(${hash % 360}, 70%, 80%)`; // สร้างสีแบบ HSL

  // เก็บสีที่สุ่มไว้ใน Map
  tagColors.set(tagName, randomColor);

  return randomColor;
}

///////////////////////////////////////////////////////////////////TAG IN ROW /////////////////////////////////////////////////////////////////////////////
function renderTagsWithDropdown(cell, itemId, tags) {
  // ถ้า itemId ไม่ถูกต้องให้แสดงข้อผิดพลาดและหยุดการทำงาน
  if (!itemId) {
    console.error("Invalid itemId:", itemId);
    return;
  }

  cell.classList.add("tag-container1");

  // ล้างเนื้อหาปัจจุบันใน cell
  cell.innerHTML = "";

  // วนลูปสร้างแท็กจากรายการแท็กที่ส่งเข้ามา
  tags.forEach(tag => {
    const tagElement = document.createElement("span");
    tagElement.classList.add("tag");
    tagElement.innerText = tag;

    // กำหนดสีพื้นหลังให้แท็ก
    tagElement.style.backgroundColor = getRandomColor(tag);
    tagElement.style.color = "#000"; // สีข้อความให้เป็นสีดำ (อ่านง่าย)

    // ปุ่มลบแท็ก
    const removeButton = document.createElement("span");
    removeButton.classList.add("remove-tag");
    removeButton.innerText = "✕";
    removeButton.addEventListener("click", () => updateTagList(itemId, tag, "remove", cell));

    tagElement.appendChild(removeButton);
    cell.appendChild(tagElement);
  });

  // เพิ่มช่อง input สำหรับการเพิ่มแท็กใหม่พร้อม dropdown
  const addTagInput = document.createElement("input");
  addTagInput.placeholder = "Add or select tag";
  addTagInput.classList.add("input_tag");
  addTagInput.addEventListener("input", () => showTagDropdown(addTagInput, cell, itemId));
  addTagInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && addTagInput.value.trim()) {
      updateTagList(itemId, addTagInput.value.trim(), "add", cell);
      addTagInput.value = ""; // ล้างค่าใน input หลังจากเพิ่ม
      closeTagDropdown(cell);
    }
  });
  cell.appendChild(addTagInput);
}

// Function to show a dropdown with tag suggestions
// ฟังก์ชันสำหรับแสดง dropdown เพื่อแนะนำแท็กที่มีอยู่
function showTagDropdown(input, cell, itemId) {
  closeTagDropdown(cell); // ปิด dropdown ที่มีอยู่ก่อนหน้า

  // สร้าง dropdown สำหรับแนะนำแท็ก
  const dropdown = document.createElement("div");
  dropdown.classList.add("tag-dropdown");

  // กรองแท็กที่ยังไม่ได้ถูกเลือกใน cell นี้
  const filteredTags = availableTags.filter(tag => 
    tag.toLowerCase().includes(input.value.toLowerCase()) && 
    !Array.from(cell.querySelectorAll(".tag")).some(el => el.innerText === tag)
  );

  // แสดงรายการแท็กที่กรองได้ใน dropdown
  filteredTags.forEach(tag => {
    const dropdownItem = document.createElement("div");
    dropdownItem.classList.add("dropdown-item");
    dropdownItem.innerText = tag;
    dropdownItem.addEventListener("click", () => {
      updateTagList(itemId, tag, "add", cell);
      input.value = ""; // ล้างค่าใน input หลังจากเลือกแท็ก
      closeTagDropdown(cell);
    });
    dropdown.appendChild(dropdownItem);
  });

  cell.appendChild(dropdown);
}

// Function to close the tag dropdown
// ฟังก์ชันปิด dropdown ของแท็ก
function closeTagDropdown(cell) {
  const existingDropdown = cell.querySelector(".tag-dropdown");
  if (existingDropdown) {
    existingDropdown.remove();
  }
}

// Function to add or remove a tag and update the server without reloading the table
// ฟังก์ชันสำหรับเพิ่มหรือลบแท็กและอัปเดตข้อมูลในเซิร์ฟเวอร์โดยไม่ต้องโหลดตารางใหม่
async function updateTagList(itemId, tag, action, cell) {
  try {
    // เรียกข้อมูล item เพื่อให้แน่ใจว่า field `tags` มีอยู่
    const response = await fetch(`${BACKEND_URL}/todo/${itemId}`, {
      method: "GET",
      headers: myHeaders
    });
    const item = await response.json();

    // ตรวจสอบว่าฟิลด์ tags มีรูปแบบที่ถูกต้อง
    if (!item.tags || !Array.isArray(item.tags)) {
      console.error("Invalid tags format for item:", item);
      populateTags();
      return;
    }

    // ตรวจสอบการดำเนินการเพิ่มหรือเอาออก
    console.log(item.tags);
    let updatedTags;
    if (action === "add") {
      if (item.tags.includes(tag)) {
        console.warn(`Tag "${tag}" is already in the list.`);
        return; // ถ้าแท็กมีอยู่แล้ว ไม่ทำอะไร
      }
      updatedTags = [...item.tags, tag]; // เพิ่มแท็กใหม่
    } else if (action === "remove") {
      updatedTags = item.tags.filter(t => t !== tag); // ลบแท็กที่ตรงกัน
    }

    // ส่งคำขอเพื่ออัปเดตข้อมูลแท็กบนเซิร์ฟเวอร์
    await handleEdit(itemId, "tags", updatedTags); 
    
    // แสดงผลแท็กใหม่ใน cell
    renderTagsWithDropdown(cell, itemId, updatedTags); 
    populateTags();
  } catch (error) {
    console.error(`Error ${action === "add" ? "adding" : "removing"} tag:`, error);
  }
}


////////////////////////////////////STATUS////////////////////////////////////////////////////////


function renderStatusDropdown(cell, itemId, currentStatus) {
  const statusOptions = [["Scheduled","scheduled"], ["In progress","in_progress"], ["Completed","completed"]];
  const select = document.createElement("select");
  select.classList.add("status1");

  statusOptions.forEach(status => {
    const option = document.createElement("option");
    option.value = status[1];
    option.text = status[0];
    if (status[1] === currentStatus) option.selected = true;
    select.appendChild(option);
  });

  // อัปเดตสีของเซลล์ตามสถานะ
  function updateCellStyle(cell,status) {
    cell.classList.remove(
      "table-status-scheduled",
      "table-status-in-progress",
      "table-status-completed"
    );
    if (status === "scheduled") {
      select.classList.add(`table-status-scheduled`);
    } else if (status === "in_progress") {
      select.classList.add(`table-status-in-progress`);
    } else if (status === "completed") {
      select.classList.add(`table-status-completed`);
    }
  }

  // ตั้งค่าเริ่มต้น
  updateCellStyle(select,currentStatus);

  select.addEventListener("change", (event) => {
    handleEdit(itemId, "status", event.target.value);
    updateCellStyle(event.target,event.target.value); // อัปเดตสีเมื่อเปลี่ยนสถานะ
  });

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
    if(id === "PUT_ITEM_ID_HERE") return;
    const response = await fetch(`${BACKEND_URL}/todo/${id}`, requestOptions);
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
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".date-input-container").forEach((container) => {
    container.addEventListener("click", (event) => {
      
      const dateInput = container.querySelector("input[type='date']"); // Select the date input inside the container
      if (dateInput) {
        
        dateInput.focus(); // Focus the input to open the calendar
        dateInput.showPicker();
      }
    });
  });
});
////////////////////////////////////////////////การเพื่มข้อมูล//////////////////////////////////////////////////////////////
document.getElementById("Add_todo").addEventListener("click", async () => {
  const title = document.getElementById("add-title").querySelector("input").value;
  const dueDate = document.querySelector("#add-date input[type='date']").value;
  
  const startDate = document.querySelector("#add-start-date input[type='date']").value;
  const removeTagTrailing = new RegExp("\\n.*✕");
  const tags = Array.from(document.querySelectorAll("#tag-container .tag")).map(tag => tag.innerText.replace(removeTagTrailing,"")); // Collect all tags
  console.log("tags processed",tags);
  const status = document.getElementById("status").value;
  const description = document.getElementById("add-description").querySelector("textarea").value;

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
    const response = await fetch(`${BACKEND_URL}/todo`, requestOptions);
    if (response.ok) {
      const result = await response.json();
      addRowToTable(result);
      clearInputFields();
      assignListenterOnInput();
      attachCalendarIconListeners();
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
  document.getElementById("status").value = "scheduled";
  document.querySelector("#add-description textarea").value = "";
}
// Add event listener to calendar icons for dynamically created DOM
function attachCalendarIconListeners() {
  document.querySelectorAll(".date-input-container").forEach((container) => {
    container.addEventListener("click", (event) => {
      const dateInput = container.querySelector("#add-start-date input[type='date']");
      if (dateInput) {
        dateInput.focus();
      }
    });
  });
}





  // Array ของแท็กที่มีอยู่
  //populateTags();
  //let availableTags = console.log(Array.from(allTags));
  

    
  
  let selectedTags = []; // Array สำหรับเก็บแท็กที่ถูกเลือก
 
  document.addEventListener("DOMContentLoaded", () => {
    const tagContainer = document.getElementById("tag-container");
    const tagInput = document.getElementById("tag-input");
    const tagList = document.getElementById("tag-list");

    // อัปเดต dropdown list ของแท็กที่มีอยู่
    tagInput.addEventListener("focus", updateTagDropdown); // แสดงเมื่อคลิก
    tagInput.addEventListener("input", handleTagInput); // กรองแท็กขณะพิมพ์
    //updateTagDropdown();

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
      // ล้างรายการแท็กเก่าใน Dropdown
      tagList.innerHTML = "";
    
      // วนลูปสร้างแท็กจาก availableTags
      
      try {
        availableTags.forEach((tag) => {
          const tagItem = document.createElement("div");
          tagItem.classList.add("tag-item"); // เพิ่มคลาสสำหรับการตกแต่ง
          tagItem.innerText = tag;
      
          // คลิกที่แท็กเพื่อเพิ่มใน selectedTags
          tagItem.addEventListener("click", () => {
            addTag(tag); // เพิ่มแท็กลงใน selectedTags
            tagInput.value = ""; // ล้างค่าช่องกรอกหลังเลือก
            tagList.style.display = "none"; // ซ่อน Dropdown หลังเลือกแท็ก
          });
      
          // เพิ่มแท็กเข้า Dropdown
          tagList.appendChild(tagItem);
        });
        updateTagsInDatabase();
      
        // แสดง Dropdown
        tagList.style.display = "block";
      }
      catch(e) {
        console.log(e);
      }
    }
    

    function handleTagInput() {
      const query = tagInput.value.toLowerCase();
      const filteredTags = (availableTags ?? Array.from([])).filter((tag) =>
        tag.toLowerCase().includes(query)
      );
    
      // ล้างรายการแท็กเก่า
      tagList.innerHTML = "";
    
      // วนลูปสร้างแท็กที่กรองได้
      filteredTags.forEach((tag) => {
        const tagItem = document.createElement("div");
        tagItem.classList.add("tag-item");
        tagItem.innerText = tag;
    
        // คลิกที่แท็กเพื่อเพิ่ม
        tagItem.addEventListener("click", () => {
          addTag(tag); // เพิ่มแท็ก
          tagInput.value = ""; // ล้างค่าช่องกรอก
          tagList.style.display = "none"; // ซ่อน Dropdown
        });
    
        // เพิ่มแท็กที่กรองเข้า Dropdown
        tagList.appendChild(tagItem);
      });
    
      // แสดง Dropdown
      tagList.style.display = "block";
    }
    

    function addTag(tag) {
      if (tag && !selectedTags.includes(tag)) {
        selectedTags.push(tag);
        if (!(availableTags ?? []).includes(tag)) {
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

  function showFilterCanvas() {
    document.getElementById("filterWrapper").style.display = "flex";
    document.getElementById("showCanvasButton").style.display = "none";
  }

  function hideFilterCanvas() {
    document.getElementById("filterWrapper").style.display = "none";
    document.getElementById("showCanvasButton").style.display = "block";
  }

  function addnewfilterTag(tagName) {
    let newTag = document.createElement("span");
    newTag.className = "tag"
    newTag.innerHTML = tagName;
    let closeButton = document.createElement("span")
    closeButton.className = "remove-tag";
    closeButton.innerHTML = "✕";
    newTag.appendChild(closeButton);
    closeButton.addEventListener("click",(event)=>{
      event.target.parentNode.remove();
    });
    document.getElementById("f-tag-container").appendChild(newTag);
  }
  
  function  getAllFilterTags() {
    let tagContainer = document.getElementById("f-tag-container");
    let s = new Set();
    for(let x of tagContainer.children) {
      s.add(x.innerHTML.replace(/<.*>.*<\/.*>/,"").trim());
    }
    return Array.from(s);
  }

  function getAllAvailableFilterTag() {
    let tagSelector = document.getElementById("f-dropdown-content");
    let ret = [];
    for(let x of tagSelector.children) {
      ret.push(x.innerHTML.trim());
      
    }
    
    
    return ret;
  }
  
  function getAllAvailableFilterTag2() {
    let tagSelector = document.getElementById("f-dropdown-content");
    let ret = [];
    for(let x of tagSelector.children) {
      ret.push(x.innerHTML.trim());
      
    }
    return ret;
  }

  function assignListenterOnInput() {

    selectedTags = [];

    const tagContainer = document.getElementById("tag-container");
    const tagInput = document.getElementById("tag-input");
    const tagList = document.getElementById("tag-list");

    // อัปเดต dropdown list ของแท็กที่มีอยู่
    tagInput.addEventListener("focus", updateTagDropdown); // แสดงเมื่อคลิก
    tagInput.addEventListener("input", handleTagInput); // กรองแท็กขณะพิมพ์
    //updateTagDropdown();

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
      // ล้างรายการแท็กเก่าใน Dropdown
      tagList.innerHTML = "";
    
      // วนลูปสร้างแท็กจาก availableTags
      
      try {
        availableTags.forEach((tag) => {
          const tagItem = document.createElement("div");
          tagItem.classList.add("tag-item"); // เพิ่มคลาสสำหรับการตกแต่ง
          tagItem.innerText = tag;
      
          // คลิกที่แท็กเพื่อเพิ่มใน selectedTags
          tagItem.addEventListener("click", () => {
            addTag(tag); // เพิ่มแท็กลงใน selectedTags
            tagInput.value = ""; // ล้างค่าช่องกรอกหลังเลือก
            tagList.style.display = "none"; // ซ่อน Dropdown หลังเลือกแท็ก
          });
      
          // เพิ่มแท็กเข้า Dropdown
          tagList.appendChild(tagItem);
        });
        updateTagsInDatabase();
      
        // แสดง Dropdown
        tagList.style.display = "block";
      }
      catch(e) {
        console.log(e);
      }
    }
    

    function handleTagInput() {
      const query = tagInput.value.toLowerCase();
      const filteredTags = (availableTags ?? Array.from([])).filter((tag) =>
        tag.toLowerCase().includes(query)
      );
    
      // ล้างรายการแท็กเก่า
      tagList.innerHTML = "";
    
      // วนลูปสร้างแท็กที่กรองได้
      filteredTags.forEach((tag) => {
        const tagItem = document.createElement("div");
        tagItem.classList.add("tag-item");
        tagItem.innerText = tag;
    
        // คลิกที่แท็กเพื่อเพิ่ม
        tagItem.addEventListener("click", () => {
          addTag(tag); // เพิ่มแท็ก
          tagInput.value = ""; // ล้างค่าช่องกรอก
          tagList.style.display = "none"; // ซ่อน Dropdown
        });
    
        // เพิ่มแท็กที่กรองเข้า Dropdown
        tagList.appendChild(tagItem);
      });
    
      // แสดง Dropdown
      tagList.style.display = "block";
    }
    

    function addTag(tag) {
      if (tag && !selectedTags.includes(tag)) {
        selectedTags.push(tag);
        if (!(availableTags ?? []).includes(tag)) {
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
  }