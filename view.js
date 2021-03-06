// ---- Define your dialogs  and panels here ----

// permission panel
var permisPrefix = "neweffperm";
let newEffPermPanel = define_new_effective_permissions(
  "neweffperm",
  true,
  null
);

// user select box
let chooseUser = define_new_user_select_field(
  "chosenuser",
  "Select User to View...",
  (on_user_change = function (selected_user) {
    // $("#neweffperm").attr("filepath", "/C/presentation_documents");
    $("#neweffperm").attr("username", selected_user);
  })
);
// file being viewed
// $("#neweffperm").attr("filepath", "/C/presentation_documents");

// file select box?
// let chooseFile = define_new_user_select_field(
//   "chosefile",
//   "Select File...",
//   (on_user_change = function (selected_file) {
//     $("#neweffperm").attr("filepath", selected_file);
//   })
// );

// making panels show!!
$("#sidepanel").append(
  "Check the Resulting (Applied) Permissions for a Folder: "
);
$("#sidepanel").append(
  "Choose file to view by clicking on its 'Check File' button, then pick which user's permissions to check for below."
);
$("#sidepanel").append(chooseUser);
// $("#sidepanel").append(chooseFile);
$("#sidepanel").append(newEffPermPanel);

// info explanation popup
let infoBox = define_new_dialog("infopopup", "Permission Description");
let chooseFile = "/C/presentation_documents";

let fileinQuestionObj = path_to_file[chooseFile];
let currentUserObj = all_users[$("#neweffperm").attr("username")];

let actionAllowedness = allow_user_action(
  fileinQuestionObj,
  currentUserObj,
  true,
  (explain_why = true)
);

let Explain = get_explanation_text(actionAllowedness);

// making the i's open
$(".perm_info").click(function () {
  // stuff that should happen on click goes here
  infoBox.dialog("open");
  console.log("clicked!");
  //   $("#neweffperm").attr("filepath");
  //   $("#usersel").attr("username");
  $("#infopopup").text(Explain);
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
                <button class="ui-button ui-widget ui-corner-all filecheckbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span> Check File <span>
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

// text edits
$(".permbutton").append("Edit Permissions");
console.log($(".permbutton"));

$(".filecheckbutton").click(function (e) {
  let path = e.currentTarget.getAttribute("path");
  $("#neweffperm").attr("filepath", path);
  $("#panel_filepath").text(`${$("#neweffperm").attr("filepath")}`);
  console.log(path);
  console.log("registered as: " + $("#neweffperm").attr("filepath"));
});

$("#ui-id-2").append(" Summary");
$("#perm-dialog-advanced-button").text("Edit Permission Details");
$("#perm-dialog-advanced-button").css("color", "light-blue");
$("#ui-id-5").text("Detailed Permissions");
$("#adv_effective_tab_elem").text("See Resulting (Applied) Permissions");
$("#perm_entry_change_user").text("Select User...");
$("#adv_perm_inheritance_label").append(
  " (This means the parent object's permissions will be applied to this current object, too)"
);
$("#adv_perm_replace_child_permissions_label").append(
  " (This means that all child objects will get any inheritable permissions from the current object above. NOTE: 'deny' permissions OVERRIDE 'allow' permissions)"
);
$("#adv_effective_user_select").text("Select User...");

$("#permdialog_advanced_explantion_text").text(
  "TIP: Click 'Edit Permission Details' to control specific permissions."
);

// ---- Assign unique ids to everything that doesn't have an ID ----
$("#html-loc").find("*").uniqueId();
