using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AccountLoginController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly UserManager<AspNetUser> _userManager;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<AccountLoginController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IStringLocalizer<UserController> _userController;
        public AccountLoginController(EIMDBContext context, UserManager<AspNetUser> userManager, 
            IHostingEnvironment hostingEnvironment, IStringLocalizer<AccountLoginController> stringLocalizer, 
            IStringLocalizer<SharedResources> sharedResources, IStringLocalizer<UserController> userController)
        {
            _userManager = userManager;
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _sharedResources = sharedResources;
            _stringLocalizer = stringLocalizer;
            _userController = userController;
        }

        [Breadcrumb("ViewData.CrumbUserInfo", AreaName = "Admin", FromAction = "Index", FromController = typeof(DashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbUserInfo"] = "Thông tin người dùng";
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> ChangePassword([FromBody]AccountLoginModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            var us = await _context.Users.FirstOrDefaultAsync(x => x.Id == obj.Id);
            if (us != null)
            {
                var checkPassword = await _userManager.CheckPasswordAsync(us, obj.PasswordOld);
                if (checkPassword)
                {
                    string code = await _userManager.GeneratePasswordResetTokenAsync(us);
                    var result = await _userManager.ResetPasswordAsync(us, code, obj.PasswordNew);
                    if (result.Succeeded)
                    {
                        var a = await _context.SaveChangesAsync();
                        msg.Title = _stringLocalizer["ACL_MSG_UPDATE_PASS_SUCCESS"];
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = _stringLocalizer["ACL_MSG_ERR_UPDATE_PASS"];
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = _stringLocalizer["ACL_MSG_OLD_PASS_INCORRECT"];
                }
            }
            else
            {
                msg.Error = true;
                msg.Title = _stringLocalizer["ACL_MSG_USER_NOT_EXIST"];
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<IActionResult> ChangeImage(AccountLoginModel obj, IFormFile image)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var us = await _context.Users.FirstOrDefaultAsync(x => x.Id == obj.Id);
                if (us != null)
                {
                    if (image != null && image.Length > 0)
                    {
                        var url = string.Empty;
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\images");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = Path.GetFileName(image.FileName);
                        fileName = Path.GetFileNameWithoutExtension(fileName)
                         + "_"
                         + Guid.NewGuid().ToString().Substring(0, 8)
                         + Path.GetExtension(fileName);
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await image.CopyToAsync(stream);
                        }
                        url = "/uploads/images/" + fileName;
                        us.Picture = url;
                        var result = await _context.SaveChangesAsync();
                        msg.Title = _stringLocalizer["ACL_MSG_UPDATE_AVATAR_SUCCESS"];
                    }
                }
                else
                {
                    msg.Title = _stringLocalizer["ACL_MSG_USER_NOT_EXIST"];
                    msg.Error = true;
                }
            }
            catch (Exception ex)
            {
                msg.Title = _stringLocalizer["ACL_MSG_UPDATE_AVATAR_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<object> GetItem()
        {
            try
            {
                var Id = ESEIM.AppContext.UserId;
                var user = await _context.Users.SingleAsync(x => x.Id == Id);
                List<BranchRef> listBranchRef = new List<BranchRef>();
                var groupBranchRefByApp = _context.AdUserInGroups.Include(i => i.Application).Where(x => x.UserId == user.Id).GroupBy(g => g.Application);
                if (groupBranchRefByApp.Any())
                {
                    foreach (var app in groupBranchRefByApp)
                    {
                        var firstApp = app.First();
                        if (!string.IsNullOrEmpty(firstApp.BranchReference))
                        {
                            if (firstApp.BranchReference == "b_000")
                            {
                                var branchRef = new BranchRef();
                                branchRef.AppCode = app.Key.ApplicationCode;
                                branchRef.AppName = app.Key.Title;
                                branchRef.BranchCode = "000";
                                branchRef.BranchName = "All Branch";
                                // Add to list
                                listBranchRef.Add(branchRef);
                            }
                            else
                            {
                                var listBranchCode = firstApp.BranchReference.Split(',').ToList();
                                var listBranch = _context.AdOrganizations.Where(x => x.OrgGroup.HasValue && x.OrgGroup.Value == 2 && listBranchCode.Any(y => y == x.OrgAddonCode)).OrderBy(o => o.OrgCode).ToList();
                                if (listBranch.Count > 0)
                                {
                                    foreach (var br in listBranch)
                                    {
                                        var branchRef = new BranchRef();
                                        branchRef.AppCode = app.Key.ApplicationCode;
                                        branchRef.AppName = app.Key.Title;
                                        branchRef.BranchCode = br.OrgCode;
                                        branchRef.BranchName = br.OrgName;
                                        // Add to list
                                        listBranchRef.Add(branchRef);
                                    }
                                }
                            }
                        }
                    }
                }
                var mainGroup = await _context.AdUserInGroups.Where(x => x.IsMain && x.UserId == user.Id).ToListAsync();
                var role = await _context.UserRoles.Where(x => x.UserId == user.Id).ToListAsync();
                var temp = new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.PhoneNumber,
                    user.OfficeNumber,
                    user.FamilyName,
                    user.GivenName,
                    user.MiddleName,
                    user.EmployeeCode,
                    user.BranchId,
                    BranchName = user?.Branch == null ? null : string.Format(user?.Branch?.OrgCode + " - " + user?.Branch?.OrgName),
                    user.DepartmentId,
                    GroupUserCode = mainGroup.Any() ? mainGroup.Select(x => x.GroupUserCode).ToArray() : null,
                    //ProfitCenterId = mainProfitCenter?.GroupUserCode,
                    ApplicationCode = mainGroup.Any() ? mainGroup[0]?.ApplicationCode : null,
                    user.Active,
                    user.Description,
                    user.UserType,
                    user.IsExceeded,
                    user.Note,
                    //user.Reason,
                    user.ConcurrencyStamp,
                    RoleId = role.Any() ? role[0].RoleId : null,
                    BranchReference = listBranchRef,
                    user.Picture,
                    user.TypeStaff,
                    //user.TypeWork,
                    user.Area,
                    user.RoleCombination,
                    user.ShiftList,
                    user.SignImage,
                    user.LeadersOfUser
                };
                return Json(temp);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
            }
        }
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_userController.GetAllStrings().Select(x => new { x.Name, x.Value }))
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
    public class AccountLoginModel
    {
        public string Id { get; set; }
        public string PasswordOld { get; set; }
        public string PasswordNew { get; set; }
        public string InputPasswordNew { get; set; }
    }
}