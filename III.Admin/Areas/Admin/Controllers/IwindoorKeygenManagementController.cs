using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
//using SautinSoft;
using ESEIM.Models;
using ESEIM.Utils;
using SmartBreadcrumbs.Attributes;
using Microsoft.Extensions.Localization;
using FTU.Utils.HelperNet;
using Newtonsoft.Json.Linq;
//using III.Domain.Models;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class IwindoorKeygenManagementController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<IwindoorKeygenManagementController> _stringLocalizer;
        private readonly IStringLocalizer<CrawlerMenuController> _stringLocalizerCRAW;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;
        private readonly IStringLocalizer<IwindoorKeygenManagementController> _sharedResourcesBm;
        private readonly IHostingEnvironment _hostingEnvironment;
        public readonly string module_name = "COMMENT";
        public string path_upload_file = "";
        public string repos_code = "";
        public string cat_code = "";
        public int host_type = 1;
        public IwindoorKeygenManagementController(EIMDBContext context, IStringLocalizer<IwindoorKeygenManagementController> stringLocalizer,
            IStringLocalizer<CrawlerMenuController> stringLocalizerCRAW,
            IStringLocalizer<IwindoorKeygenManagementController> sharedResourcesBm,
            IHostingEnvironment hostingEnvironment, IUploadService upload,
            IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _stringLocalizerCRAW = stringLocalizerCRAW;
            _sharedResourcesBm = sharedResourcesBm;
            _sharedResources = sharedResources;
            _hostingEnvironment = hostingEnvironment;
            _upload = upload;
            var obj = (EDMSCatRepoSetting)_upload.GetPathByModule(module_name).Object;
            repos_code = obj.ReposCode;
            cat_code = obj.CatCode;
            if (obj.Path == "")
            {
                host_type = 1;
                path_upload_file = obj.FolderId;
            }
            else
            {
                host_type = 0;
                path_upload_file = obj.Path;
            }
        }

        [Breadcrumb("ViewData.CrumbBotManagement", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbBotManagement"] = _sharedResources["COM_CRUMB_KEYGEN"]/*"Quản lý iwindoor"*/;
            return View();
        }
        #region JTable
        [HttpPost]
        public object JTable([FromBody] JTableModel jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.IwindoorKeygenManagements
                        select new
                        {
                            a.Id,
                            a.ComputerName,
                            a.MacCode,
                            a.CreatedTime,
                            a.HardDriveCode,
                            a.Status,
                        };

            var count = query.Count();
            var data = query.Skip(intBegin).Take(jTablePara.Length).ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ComputerName", "MacCode", "CreatedTime", "HardDriveCode", "Status");
            return Json(jdata);
        }
        [HttpPost]
        public object Edit([FromBody] IwindoorKeygenManagement data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var item = _context.IwindoorKeygenManagements.FirstOrDefault(x => x.Id == data.Id);
                if (item != null)
                {
                    /*item. = ESEIM.AppContext.UserName;
                    item.UpdatedTime = DateTime.Now;*/
                    item.ComputerName = data.ComputerName;
                    item.MacCode = data.MacCode;
                    item.Status = data.Status;

                    _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"]);
                    return Json(msg);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_UPDATE_FAIL"]);
                msg.Object = ex;
                return Json(msg);
            }
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.IwindoorKeygenManagements.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["LMS_COURSE_LBL_COURSE_NOT_EXIST"];
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    //data.IsDeleted = true;
                    //data.DeletedBy = User.Identity.Name;
                    _context.IwindoorKeygenManagements.Remove(data);
                    _context.SaveChanges();
                    msg.Title = _sharedResources["Xóa thành công"];//LMS_MSG_DELETE_SUCCESS
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return Json(msg);
            }
        }

        #endregion
        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
                .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}