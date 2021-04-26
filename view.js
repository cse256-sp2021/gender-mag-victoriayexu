// ---- Define your dialogs  and panels here ----

// permission panel
let newEffPermPanel = define_new_effective_permissions(
  "neweffperm",
  true,
  null
);
// let chooseUser = define_new_user_select_field(
//   "usersel",
//   "Select User...",
//   (on_user_change = function (selected_user) {
//     $("#neweffperm").attr("username", selected_user);
//   })
// );

// user select box
// let chooseUser = define_new_user_select_field(
//   "chosenuser",
//   "Select User to View...",
//   function (selected_user) {
//     $("#neweffperm").attr("username", selected_user);
//   }
// );
// // file being viewed
// $("#neweffperm").attr("filepath", "/C/presentation_documents");
// // let chooseFile = "/C/presentation_documents";

// making panels show!!
$("#sidepanel").append(
  "Effective (True) Permissions for Folder: presentation_documents"
);
$("#sidepanel").append(chooseUser);
$("#sidepanel").append(newEffPermPanel);

// info explanation popup
let infoBox = define_new_dialog("infopopup", "Description");
// let fileinQuestion = path_to_file[chooseFile];
// let currentUser = all_users[chooseUser];

// let Explain = get_explanation_text(infoBox);

// let userAction = allow_user_action(
//   fileinQuestion,
//   selected_user,
//   permission_to_check,
//   (explain_why = true)
// );

// making the i's open
$(".perm_info").click(function () {
  // stuff that should happen on click goes here
  infoBox.dialog("open");
  console.log("clicked!");
  //   $("#neweffperm").attr("filepath");
  //   $("#usersel").attr("username");
});

// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
  let file_hash = get_full_path(file_obj);

  if (file_obj.is_folder) {
    let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`);

    // append children, if any:
    if (file_hash in parent_to_children) {
      let container_elem = $("<div class='folder_contents'></div>");
      folder_elem.append(container_elem);
      for (child_file of parent_to_children[file_hash]) {
        let child_elem = make_file_element(child_file);
        container_elem.append(child_elem);
      }
    }
    return folder_elem;
  } else {
    return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`);
  }
}

for (let root_file of root_files) {
  let file_elem = make_file_element(root_file);
  $("#filestructure").append(file_elem);
}

// make folder hierarchy into an accordion structure
$(".folder").accordion({
  collapsible: true,
  heightStyle: "content",
}); // TODO: start collapsed and check whether read permission exists before expanding?

// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$(".permbutton").click(function (e) {
  // Set the path and open dialog:
  let path = e.currentTarget.getAttribute("path");
  perm_dialog.attr("filepath", path);
  perm_dialog.dialog("open");
  //open_permissions_dialog(path)

  // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
  e.stopPropagation(); // don't propagate button click to element underneath it (e.g. folder accordion)
  // Emit a click for logging purposes:
  emitter.dispatchEvent(
    new CustomEvent("userEvent", {
      detail: new ClickEntry(
        ActionEnum.CLICK,
        e.clientX + window.pageXOffset,
        e.clientY + window.pageYOffset,
        e.target.id,
        new Date().getTime()
      ),
    })
  );
});

$(".permbutton").append("Edit Permissions");
console.log($(".permbutton"));

$("#perm-dialog-advanced-button").append("More...");
$("#adv_effective_tab_elem").append("Functioning Permissions");

("Replace all child object permissions with inheritable permissions from this object. When checked, all child objects will be assigned any inheritable permissions from the current object (See current object name above).");

// ---- Assign unique ids to everything that doesn't have an ID ----
$("#html-loc").find("*").uniqueId();
