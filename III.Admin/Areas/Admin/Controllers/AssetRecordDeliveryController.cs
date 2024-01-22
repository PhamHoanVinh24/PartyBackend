using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Domain.Enums;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class AssetRecordDeliveryController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IWorkflowService _workflowService;
        private readonly IStringLocalizer<AssetCancelController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public AssetRecordDeliveryController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment,
             IStringLocalizer<AssetCancelController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources,
             IWorkflowService workflowService)
        {
            _hostingEnvironment = hostingEnvironment;
            _context = context;
            _upload = upload;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _workflowService = workflowService;
        }
        [Breadcrumb("ViewData.CrumbAssetCancle", AreaName = "Admin", FromAction = "Index", FromController = typeof(MaintenAssetHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuAsset"] = _sharedResources["COM_CRUMB_ASSET_OPERATION"];
            ViewData["CrumbMaintenHome"] = _sharedResources["COM_CRUMB_MAINTEN_ASSET_HOME"];
            ViewData["CrumbAssetCancle"] = _sharedResources["Xuất tài sản"];
            return View();
        }

        #region Record Delivery Header
        [HttpPost]
        public object JTable([FromBody]JTableRecordDelivery jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var listCommon = _context.CommonSettings.Select(x => new { x.CodeSet, x.ValueSet });
            var query = from a in _context.RecordDeliveryHeaders.Where(x => !x.IsDeleted)
                         select new
                         {
                             a.ID,
                             a.DeliveryCode,
                             a.Title,
                             a.DeliveryType,
                             a.ReceiverName,
                             a.DeliverCode,
                             a.Note,
                             a.Status
                         };
            int count = query.Count();
            var data = query.AsQueryable().Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "ID", "DeliveryCode", "Title", 
                "DeliveryType", "ReceiverName", "Note", "Status", "DeliverCode");
            return Json(jdata);
        }
        #endregion

        #region Record Delivery Detail
        [HttpPost]
        public object JTableDetail([FromBody]JTableRecordDelivery jTablePara)
        {
            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = (from a in _context.AssetRecordDeliveryDetails
                         join b in _context.RecordDeliveryHeaders on a.DeliveryCode equals b.DeliveryCode
                         let packs = _context.AssetRecordsPacks.Where(x => x.PackCode.Equals(a.RecordCode)).OrderByDescending(x => x.ID)
                         where b.IsDeleted == false
                         select new
                         {
                             a.ID,
                             a.RecordCode,
                             RecordName = packs.Any() ? packs.FirstOrDefault().PackName : "",
                             b.DeliveryCode,
                             b.Title,
                             b.DeliveryType,
                             b.Status,
                             b.DeliverCode,
                             b.ReceiverName
                         }).OrderByDescending(x => x.ID);
            int count = query.Count();
            var data = query.AsQueryable().Skip(intBegin).Take(jTablePara.Length);
            var jdata = JTableHelper.JObjectTable(data.ToList(), jTablePara.Draw, count, "ID", "DeliveryCode", "Title",
                "DeliveryType", "ReceiverName", "Note", "Status", "DeliverCode", "RecordName");
            return Json(jdata);
        }

        [HttpPost]
        public JsonResult InsertRecordDeliveryDetail([FromBody] ModelDetail obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                if(obj.ListPack.Where(x => !string.IsNullOrEmpty(x.PackCode)).Count() == 0)
                {
                    msg.Error = true;
                    msg.Title = "Vui lòng chọn tài sản xuất";
                    return Json(msg);
                }

                var listDetail = new List<AssetRecordDeliveryDetail>();

                var packs = _context.AssetRecordsPacks.Where(x => !x.IsDeleted).ToList();

                foreach(var item in obj.ListPack.Where(x => !string.IsNullOrEmpty(x.PackCode)))
                {
                    if(!listDetail.Any(x => x.RecordCode.Equals(item.PackCode)))
                    {
                        var detail = new AssetRecordDeliveryDetail
                        {
                            DeliveryCode = obj.DeliveryCode,
                            RecordCode = item.PackCode
                        };
                        listDetail.Add(detail);
                        _context.AssetRecordDeliveryDetails.Add(detail);

                        var pack = _context.AssetRecordsPacks.FirstOrDefault(x => x.PackCode.Equals(item.PackCode) && !x.IsDeleted);
                        if (pack != null)
                        {
                            pack.IsDeleted = true;

                            _context.AssetRecordsPacks.Update(pack);

                            var childs = GetSubTreeRecordsPack(packs, pack.PackCode, new List<TreeView>(), 0);
                            foreach(var child in childs)
                            {
                                if (!listDetail.Any(x => x.RecordCode.Equals(child.Code)))
                                {
                                    var childDetail = new AssetRecordDeliveryDetail
                                    {
                                        DeliveryCode = obj.DeliveryCode,
                                        RecordCode = child.Code
                                    };
                                    listDetail.Add(childDetail);
                                    _context.AssetRecordDeliveryDetails.Add(childDetail);

                                    var childpack = _context.AssetRecordsPacks.FirstOrDefault(x => x.PackCode.Equals(child.Code) && !x.IsDeleted);
                                    if(childpack != null)
                                    {
                                        childpack.IsDeleted = true;

                                        _context.AssetRecordsPacks.Update(childpack);
                                    }
                                }
                            }
                        }
                    }
                }

                _context.SaveChanges();
                msg.Title = "Xuất tài sản thành công";
            }
            catch (Exception ex)
            {
                msg.Error = false;
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }
            return Json(msg);
        }

        private List<TreeView> GetSubTreeRecordsPack(List<AssetRecordsPack> data, string catParent, List<TreeView> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = (catParent == null)
                ? data.Where(x => string.IsNullOrEmpty(x.PackParent) && x.IsDeleted == false).OrderBy(x => x.PackName).ToList()
                : data.Where(x => x.PackParent == catParent && x.IsDeleted == false).OrderBy(x => x.PackName).ToList();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.ID,
                    Code = item.PackCode,
                    Title = item.PackName,
                    ParentCode = item.PackParent,
                    Level = tab,
                    HasChild = data.Any(x => x.PackParent.Equals(item.PackCode))
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeRecordsPack(data, item.PackCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }

        [HttpPost]
        public JsonResult DeleteDetail(int id)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var detail = _context.AssetRecordDeliveryDetails.FirstOrDefault(x => x.ID == id);
                if (detail != null)
                {
                    var packs = _context.AssetRecordsPacks.Where(x => !x.IsDeleted && x.PackCode.Equals(detail.RecordCode)).OrderByDescending(x => x.ID);
                    if (packs.Any())
                    {
                        var pack = packs.FirstOrDefault();
                        if (pack != null)
                        {
                            pack.IsDeleted = false;
                            pack.PackLevel = "0";
                            pack.PackParent = "";
                            pack.PackZoneLocation = "";
                            pack.PackHierarchyPath = pack.PackCode;
                            _context.AssetRecordsPacks.Update(pack);
                        }
                    }

                    _context.AssetRecordDeliveryDetails.Remove(detail);
                    _context.SaveChanges();
                    msg.Title = "Xoá thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy hồ sơ";
                }
            }
            catch (Exception ex)
            {
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Error = true;
            }
            return Json(msg);
        }
        #endregion

        #region Model
        public class JTableRecordDelivery : JTableModel
        {

        }
       public class ModelDetail
        {
            public ModelDetail()
            {
                ListPack = new List<PackModel>();
            }
            public List<PackModel> ListPack { get; set; }
            public string DeliveryCode { get; set; }
        }
        public class PackModel
        {
            public string PackName { get; set; }
            public string PackCode { get; set; }
            public string PackParent { get; set; }
            public string PackParentName { get; set; }
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
