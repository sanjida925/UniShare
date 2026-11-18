// add-item.js - Add Item page: form fields, image preview, validation, saving

var imageData = "";   // holds the uploaded image (as text) until the form is submitted

// ---------- ADD ITEM PAGE ----------
function setupAddItem() {
  var user = getCurrentUser();
  if (user === null) {
    document.getElementById("addForm").style.display = "none";
    showMsg("loginNotice", 'Please <a href="login.html">login</a> or <a href="register.html">register</a> before posting an item.', "error");
    return;
  }
  var options = '<option value="">Select category</option>';
  for (var i = 0; i < categories.length; i++) { options += '<option>' + categories[i] + '</option>'; }
  document.getElementById("itemCategory").innerHTML = options;
  // pre-fill from the logged-in student's profile
  document.getElementById("itemUniversity").value = user.university;
  document.getElementById("itemDept").value = user.department;
  document.getElementById("contactName").value = user.fullName;
  document.getElementById("email").value = user.email;
}

// Show / hide price boxes depending on Donate / Rent / Sell
function updateTypeFields() {
  var type = document.getElementById("itemType").value;
  document.getElementById("donateNotice").style.display = (type === "Donate") ? "block" : "none";
  document.getElementById("rentFields").style.display = (type === "Rent") ? "block" : "none";
  document.getElementById("sellFields").style.display = (type === "Sell") ? "block" : "none";
}

// Image preview before submission (FileReader turns the file into text we can show and save)
function previewImage() {
  var input = document.getElementById("itemImage");
  var file = input.files[0];
  var preview = document.getElementById("imgPreview");
  if (!file) { imageData = ""; preview.style.display = "none"; return; }
  if (file.type.indexOf("image/") !== 0 || file.size > 500000) {
    showMsg("formMsg", "Error: choose an image file smaller than 500 KB.", "error");
    input.value = ""; imageData = ""; preview.style.display = "none";
    return;
  }
  var reader = new FileReader();
  reader.onload = function (e) {
    imageData = e.target.result;
    preview.src = imageData;
    preview.style.display = "block";
    showMsg("formMsg", "", "");
  };
  reader.readAsDataURL(file);
}

function submitListing() {
  var user = getCurrentUser();
  var type = val("itemType");
  var title = val("itemName"), category = val("itemCategory"), desc = val("itemDesc"), cond = val("itemCondition");
  var uni = val("itemUniversity"), dept = val("itemDept"), name = val("contactName");
  var teams = val("teamsId"), phone = val("phone"), email = val("email");
  var price = 0, rate = null, unit = "", minDur = "", deposit = 0;

  // ----- validation: stop at the first problem -----
  if (user === null) { showMsg("formMsg", "Error: please login first.", "error"); return; }
  if (title === "") { showMsg("formMsg", "Error: item name is required.", "error"); return; }
  if (category === "") { showMsg("formMsg", "Error: select a category.", "error"); return; }
  if (type === "") { showMsg("formMsg", "Error: choose Donate, Rent or Sell.", "error"); return; }
  if (desc === "") { showMsg("formMsg", "Error: description is required.", "error"); return; }
  if (cond === "") { showMsg("formMsg", "Error: select the item condition.", "error"); return; }
  if (uni === "" || dept === "" || name === "") { showMsg("formMsg", "Error: university, department and contact name are required.", "error"); return; }

  if (type === "Sell") {
    price = Number(val("sellPrice"));
    if (isNaN(price) || price <= 0) { showMsg("formMsg", "Error: enter a selling price greater than 0.", "error"); return; }
  }
  if (type === "Rent") {
    rate = Number(val("rentPrice"));
    if (isNaN(rate) || rate <= 0) { showMsg("formMsg", "Error: enter a rental price greater than 0.", "error"); return; }
    unit = val("rentUnit");
    minDur = val("minDuration");
    deposit = Number(val("deposit")) || 0;
  }
  if (teams === "" && phone === "" && email === "") { showMsg("formMsg", "Error: give at least one contact method (Teams, phone or email).", "error"); return; }
  if (email !== "" && email.indexOf("@") === -1) { showMsg("formMsg", "Error: email must contain @.", "error"); return; }
  if (phone !== "" && phone.length < 7) { showMsg("formMsg", "Error: phone number is too short.", "error"); return; }

  // ----- build the listing object and save it -----
  var list = getListings();
  var item = {
    id: nextId(list), title: title, category: category, type: type, description: desc, condition: cond,
    price: price, rentalRate: rate, rentalUnit: unit, minDuration: minDur, deposit: deposit,
    image: imageData || "📦", university: uni, department: dept, listerName: name,
    teamsId: teams, phone: phone, email: email, ownerEmail: user.email,
    availability: "Available", datePosted: today()
  };
  list.push(item);
  try { saveListings(list); }
  catch (e) { showMsg("formMsg", "Error: browser storage is full. Use a smaller image.", "error"); return; }

  clearListingForm();
  showMsg("formMsg", '✔ Listing posted! <a href="item-details.html?id=' + item.id + '">View it</a> or go to your <a href="dashboard.html">Dashboard</a>.', "success");
}

function clearListingForm() {
  var ids = ["itemName", "itemCategory", "itemType", "itemDesc", "itemCondition", "itemUniversity", "itemDept", "contactName",
    "teamsId", "phone", "email", "sellPrice", "rentPrice", "minDuration", "deposit", "itemImage"];
  for (var i = 0; i < ids.length; i++) { document.getElementById(ids[i]).value = ""; }
  imageData = "";
  document.getElementById("imgPreview").style.display = "none";
  updateTypeFields();
  showMsg("formMsg", "", "");
}
