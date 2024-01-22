window.addEventListener('click', function (e) {
    if (!document.getElementById('addCategoryDiv').contains(e.target)) {
        newCategory_Close();
    }
    if (!document.getElementById('category_').contains(e.target)) {
        newCategory_Close();
    }
});
function showBtnEdit(id, tagId) {
    var btnEdit = document.getElementById('btnEdit_' + id + '_' + tagId);
    var btnPermission = document.getElementById('btnPermission_' + id + "_" + tagId);
    btnEdit.style.zIndex = 2;
    btnPermission.style.zIndex = 2;
}
function hideBtnEdit(id, tagId) {
    var btnEdit = document.getElementById('btnEdit_' + id + '_' + tagId);
    var btnPermission = document.getElementById('btnPermission_' + id + "_" + tagId);
    btnEdit.style.zIndex = -1;
    btnPermission.style.zIndex = -1;
}
function addCategory() {
    var element = document.getElementById("addCategoryBox");
    var element2 = document.getElementById("addCategory");

    element.classList.remove("disable");
    element2.classList.add("disable");

    document.getElementById('addCateroryTitle').focus();
}
function newCategory_Close() {
    var element = document.getElementById("addCategoryBox");
    var element2 = document.getElementById("addCategory");

    element.classList.add("disable");
    element2.classList.remove("disable");
}
function newTag_Close(id) {
    var element = document.getElementById("new-tag_" + id);
    var element2 = document.getElementById("btn-add_" + id);
    var element3 = document.getElementById(id);
    element.classList.add("disable");
    element2.classList.add("disable");
    element3.classList.remove("disable");
}
function newTag_Show(id) {
    var element = document.getElementById("new-tag_" + id);
    var element2 = document.getElementById("btn-add_" + id);
    var element3 = document.getElementById(id);
    element.classList.remove("disable");
    element2.classList.remove("disable");
    element3.classList.add("disable");

    document.getElementById("textarea_" + id).focus();
}
function follow(id, follow) {
    var category = document.getElementById('followicon_' + id);
    if (follow == true) {
        category.classList.remove("disable");
    }
    else {
        category.classList.add("disable");
    }
}