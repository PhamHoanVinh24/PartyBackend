using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using III.Admin.Controllers;
using System.Collections.Generic;

namespace ESEIM.Controllers
{
    [Area("Admin")]
    public class SetCompanyMenuAppController : BaseController
    {

        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly AppSettings _appSettings;
        private readonly IUploadService _upload;


        public class JTableModelSetCompanyMenuApp : JTableModel
        {
            public string MenuCaption { get; set; }
            public string Title { get; set; }
            public string Action { get; set; }
            public string Pin { get; set; }
        }
        public SetCompanyMenuAppController(EIMDBContext context, IUploadService upload, ILogger<SetCompanyMenuAppController> logger, IOptions<AppSettings> appSettings, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {

            _context = context;
            _logger = logger;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
            _appSettings = appSettings.Value;
            _upload = upload;
        }

        public IActionResult Index()
        {
            return View("Index");
        }

        [HttpPost]
        public JsonResult JTable([FromBody]JTableModelSetCompanyMenuApp jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            if (string.IsNullOrEmpty(jTablePara.MenuCaption) && string.IsNullOrEmpty(jTablePara.Title) && string.IsNullOrEmpty(jTablePara.Action) && string.IsNullOrEmpty(jTablePara.Pin))
            {
                var query = from a in _context.SetCompanyMenus
                            where !a.IsDeleted
                            select new SetCompanyMenuModel
                            {
                                Id = a.Id,
                                MenuCaption = a.MenuCaption,
                                Title = a.Title,
                                MenuParent = a.MenuParent,
                                Note = a.Note,
                                Action = a.Action,
                                Pin = a.Pin,
                                Priority = a.Priority,
                                CreatedBy = a.CreatedBy,
                                CreatedTime = a.CreatedTime,
                            };
                var data = query.OrderBy(x => x.Priority).AsNoTracking();
                var listFirst = data as IList<SetCompanyMenuModel> ?? data.ToList();

                var result = new List<SetCompanyMenuModel>();
                foreach (var func in listFirst.Where(x => string.IsNullOrEmpty(x.MenuParent)).OrderBy(x => x.Priority))
                {
                    var listChild = GetFunctionChild(listFirst, func.MenuCaption, ". . . ");

                    var function = new SetCompanyMenuModel();
                    function.Id = func.Id;
                    function.MenuCaption = func.MenuCaption;
                    function.Title = (listChild.Count > 0 ? "<i class='fa fa-folder-open icon-state-warning'></i> " : "<i class='fa fa-folder text-info'></i> ") + func.Title;
                    function.MenuParent = func.MenuParent;
                    function.Note = func.Note;
                    function.Action = func.Action;
                    function.Pin = func.Pin;
                    function.Priority = func.Priority;
                    function.CreatedBy = func.CreatedBy;
                    function.CreatedTime = func.CreatedTime;
                    result.Add(function);
                    if (listChild.Count > 0) result = result.Concat(listChild).ToList();
                }
                var count = result.Count();
                var res = result.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(res, jTablePara.Draw, count, "Id", "MenuCaption", "Title", "MenuParent", "Note", "Action", "Pin", "Priority", "CreatedBy", "CreatedTime");
                return Json(jdata);
            }
            else
            {
                var query = _context.SetCompanyMenus
                            .Where(p => !p.IsDeleted
                                    && (string.IsNullOrEmpty(jTablePara.MenuCaption) || p.MenuCaption.ToLower().Contains(jTablePara.MenuCaption.ToLower()))
                                    && (string.IsNullOrEmpty(jTablePara.Title) || p.Title.ToLower().Contains(jTablePara.Title.ToLower()))
                                    && (string.IsNullOrEmpty(jTablePara.Action) || p.Action.ToLower().Contains(jTablePara.Action.ToLower()))
                                    && (string.IsNullOrEmpty(jTablePara.Pin) || p.Pin == jTablePara.Pin)
                                    )
                            .OrderBy(x => x.Priority)
                            .Select(x => new { x.Id, x.MenuCaption, x.Title, x.MenuParent, x.Note, x.Action, x.Pin, x.Priority, x.CreatedBy, x.CreatedTime })
                            .AsNoTracking();
                var count = query.Count();

                var data = query
                    .Skip(intBeginFor)
                    .Take(jTablePara.Length).AsNoTracking()
                    .ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "MenuCaption", "Title", "MenuParent", "Note", "Action", "Pin", "Priority", "CreatedBy", "CreatedTime");
                return Json(jdata);
            }
        }
        [NonAction]
        private List<SetCompanyMenuModel> GetFunctionChild(IList<SetCompanyMenuModel> listParent, string parentCode, string level)
        {
            var result = new List<SetCompanyMenuModel>();
            var query = from a in listParent
                        where a.MenuParent == parentCode
                        orderby a.Priority
                        select new SetCompanyMenuModel
                        {
                            Id = a.Id,
                            MenuCaption = a.MenuCaption,
                            Title = a.Title,
                            MenuParent = a.MenuParent,
                            Note = a.Note,
                            Action = a.Action,
                            Pin = a.Pin,
                            Priority = a.Priority,
                            CreatedBy = a.CreatedBy,
                            CreatedTime = a.CreatedTime,
                        };

            var listFirst = query as IList<SetCompanyMenuModel> ?? query.ToList();
            foreach (var item in listFirst)
            {
                var destination = GetFunctionChild(listParent, item.MenuCaption, ". . . " + level);
                item.Title = level + (destination.Count > 0 ? "<i class='fa fa-folder-open icon-state-warning'></i> " : "<i class='fa fa-folder text-info'></i> ") + item.Title;
                result.Add(item);
                if (destination.Count > 0) result = result.Concat(destination).ToList();
            }
            return result;
        }


        //--------------------------------thêm mới---------------------------   
        [HttpPost]
        public JsonResult Insert([FromBody]SetCompanyMenu obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.SetCompanyMenus.FirstOrDefault(x => !x.IsDeleted && x.MenuCaption == obj.MenuCaption);
                if (data == null)
                {
                    if (!string.IsNullOrEmpty(obj.MenuParent))
                    {
                        var parent = _context.SetCompanyMenus.AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.MenuCaption == obj.MenuParent);
                        if (parent == null)
                        {
                            msg.Title = String.Format(CommonUtil.ResourceValue("Danh mục cha đã bị xóa"));
                            return Json(msg);
                        }
                        else if (parent != null && parent.Pin != obj.Pin)
                        {
                            msg.Title = String.Format(CommonUtil.ResourceValue("PIN của cha và của con không được khác nhau"));
                            return Json(msg);
                        }
                    }

                    SetCompanyMenu objNew = new SetCompanyMenu();
                    objNew.MenuCaption = obj.MenuCaption;
                    objNew.Title = obj.Title;
                    objNew.MenuParent = obj.MenuParent;
                    objNew.Note = obj.Note;
                    objNew.Action = obj.Action;
                    objNew.Pin = obj.Pin;
                    objNew.Priority = obj.Priority;
                    objNew.CreatedBy = ESEIM.AppContext.UserName;
                    objNew.CreatedTime = DateTime.Now;

                    _context.SetCompanyMenus.Add(objNew);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_ADD_SUCCESS"), CommonUtil.ResourceValue("Danh mục"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi đã tồn tại")); //"Không tồn tại dữ liệu!";
                }
            }
            catch
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        //----------------------------------------------Sửa-------------------------------
        [HttpPost]
        public JsonResult Update([FromBody]SetCompanyMenu obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.SetCompanyMenus.FirstOrDefault(x => !x.IsDeleted && x.MenuCaption == obj.MenuCaption);
                if (data != null)
                {
                    if (!string.IsNullOrEmpty(obj.MenuParent))
                    {
                        var parent = _context.SetCompanyMenus.AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.MenuCaption == obj.MenuParent);
                        if (parent == null)
                        {
                            msg.Title = String.Format(CommonUtil.ResourceValue("Danh mục cha đã bị xóa"));
                            return Json(msg);
                        }
                        else if (parent != null && parent.Pin != obj.Pin)
                        {
                            msg.Title = String.Format(CommonUtil.ResourceValue("PIN của cha và của con không được khác nhau"));
                            return Json(msg);
                        }
                    }

                    //data.MenuCaption = obj.MenuCaption;
                    data.Title = obj.Title;
                    data.MenuParent = obj.MenuParent;
                    data.Note = obj.Note;
                    data.Action = obj.Action;
                    data.Pin = obj.Pin;
                    data.Priority = obj.Priority;
                    data.UpdatedBy = ESEIM.AppContext.UserName;
                    data.UpdatedTime = DateTime.Now;

                    _context.SetCompanyMenus.Update(data);
                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_SUCCESS"), CommonUtil.ResourceValue("Danh mục"));
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi không tồn tại hoặc đã bị xóa")); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_UPDATE_FAILED"), CommonUtil.ResourceValue("Danh mục"));
            }
            return Json(msg);
        }


        //----------------------------------------------Xóa-------------------------------
        [HttpPost]
        public JsonResult Delete(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.SetCompanyMenus.FirstOrDefault(x => !x.IsDeleted && x.Id == Id);
                if (data != null)
                {
                    var chkHasChild = _context.SetCompanyMenus.AsNoTracking().Any(x => !x.IsDeleted && x.MenuParent == data.MenuCaption);
                    if (!chkHasChild)
                    {
                        data.IsDeleted = true;
                        data.DeletedBy = ESEIM.AppContext.UserName;
                        data.DeletedTime = DateTime.Now;

                        _context.SetCompanyMenus.Update(data);
                        _context.SaveChanges();
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_DELETE_SUCCESS"), CommonUtil.ResourceValue("Danh mục"));
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("Xóa con hoặc bỏ quan hệ cha con trước khi xóa cha"));
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi không tồn tại hoặc đã bị xóa"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi xóa dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }


        //----------------------------------------------Get info-------------------------------
        [HttpPost]
        public List<TreeView> GetTreeData([FromBody]TempSub obj)
        {
            //if (obj.IdI == null && obj.IdS == null)
            //{
            //    return null;
            //}
            if (obj.IdI == null)
            {
                var data = _context.SetCompanyMenus.Where(x => !x.IsDeleted && (string.IsNullOrEmpty(obj.Pin) || x.Pin == obj.Pin)).OrderBy(x => x.Priority).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeView>(), 0);
                return dataOrder;
            }
            else
            {
                var item = _context.SetCompanyMenus.Where(x => x.Id == obj.IdI[0]).FirstOrDefault();

                var data = _context.SetCompanyMenus.OrderBy(x => x.Priority).Where(x => !x.IsDeleted && x.Pin == item.Pin && (x.MenuCaption != item.MenuCaption && x.MenuParent != item.MenuCaption)).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeView>(), 0);
                return dataOrder;
            }
        }

        private List<TreeView> GetSubTreeData(List<SetCompanyMenu> data, string parentCode, List<TreeView> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = parentCode == null
                ? data.Where(x => string.IsNullOrEmpty(x.MenuParent)).OrderBy(x => x.Priority).ToList()
                : data.Where(x => x.MenuParent == parentCode).OrderBy(x => x.Priority).ToList();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.Id,
                    Code = item.MenuCaption,
                    Title = item.Title,
                    Level = tab,
                    HasChild = data.Any(x => x.MenuParent == item.MenuCaption)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.MenuCaption, lstCategories, tab + 1);
            }
            return lstCategories;
        }


        [HttpPost]
        public JsonResult GetItem(int Id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.SetCompanyMenus.AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.Id == Id);
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("Bản ghi không tồn tại hoặc đã bị xóa")); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult GetListMenuParent(string menuCaption)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if (string.IsNullOrEmpty(menuCaption))
                {
                    var data = _context.SetCompanyMenus.Where(x => !x.IsDeleted)
                                                    .OrderBy(x => x.Priority)
                                                    .Select(x => new { Code = x.MenuCaption, Name = x.Title });
                    if (data != null)
                    {
                        msg.Object = data;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE")); //"Không tồn tại dữ liệu!";
                    }
                }
                else
                {
                    List<SetCompanyMenu> listExcept = new List<SetCompanyMenu>();
                    var current = _context.SetCompanyMenus.AsNoTracking().FirstOrDefault(x => !x.IsDeleted && x.MenuCaption == menuCaption);
                    listExcept.Add(current);
                    var listTreeChildrent = FuncGetTreeChildrent(menuCaption);
                    listExcept.AddRange(listTreeChildrent);

                    var data = _context.SetCompanyMenus.Where(x => !x.IsDeleted && listExcept.All(y => y.MenuCaption != x.MenuCaption))
                                                        .OrderBy(x => x.Priority)
                                                        .Select(x => new { Code = x.MenuCaption, Name = x.Title });
                    if (data != null)
                    {
                        msg.Object = data;
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE")); //"Không tồn tại dữ liệu!";
                    }
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult GetListPin()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CommonSettings.Where(x => !x.IsDeleted && x.Group == "PIN_COMPANY").Select(x => new { Code = x.CodeSet, Name = x.ValueSet });
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS_FILE")); //"Không tồn tại dữ liệu!";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("Có lỗi khi lấy dữ liệu")); //"Có lỗi khi lấy dữ liệu!"; 
            }
            return Json(msg);
        }

        [NonAction]
        public List<SetCompanyMenu> FuncGetTreeChildrent(string menuCaption)
        {
            List<SetCompanyMenu> rs = new List<SetCompanyMenu>();
            if (!string.IsNullOrEmpty(menuCaption))
            {
                var listChild = _context.SetCompanyMenus.Where(x => !x.IsDeleted && x.MenuParent == menuCaption).AsNoTracking().ToList();
                rs.AddRange(listChild);
                foreach (var item in rs)
                {
                    var listGrandChildrent = FuncGetTreeChildrent(item.MenuCaption);
                    rs.AddRange(listGrandChildrent);
                }
            }
            return rs;
        }


    }
    public class SetCompanyMenuModel
    {
        public int Id { get; set; }
        public string MenuCaption { get; set; }
        public string Title { get; set; }
        public string MenuParent { get; set; }
        public string Note { get; set; }
        public string Action { get; set; }
        public string Pin { get; set; }
        public int Priority { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }
    }
}