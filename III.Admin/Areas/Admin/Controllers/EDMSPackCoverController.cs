using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EDMSPackCoverController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<EDMSPackCoverController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public EDMSPackCoverController(EIMDBContext context, IHostingEnvironment hostingEnvironment, IStringLocalizer<EDMSPackCoverController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbPackCover", AreaName = "Admin", FromAction = "Index", FromController = typeof(WarehouseDigitalHomeController))]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_MENU_CENTER"];
            ViewData["CrumbWHDHome"] = _sharedResources["COM_CRUMB_WH_DIGITAL_HOME"];
            ViewData["CrumbPackCover"] = _sharedResources["COM_CRUMB_PACK_COVER"];
            return View();
        }

        #region ObjectPackCover
        [HttpPost]
        public object JTablePack([FromBody]JTableModelPack jTablePara)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

                var list = _context.ObjectiverPackCovers.Where(x => !x.IsDeleted &&
                                                                    (string.IsNullOrEmpty(jTablePara.Name) || x.Name.ToLower().Contains(jTablePara.Name.ToLower())) &&
                                                                    (fromDate == null || x.CreatedTime >= fromDate) &&
                                                                    (toDate == null || x.CreatedTime <= toDate))
                                                        .Select(p => new
                                                        {
                                                            p.Id,
                                                            p.ObjPackCode,
                                                            p.Name,
                                                            p.SpecSize,
                                                            p.Weight,
                                                            p.Unit,
                                                            CreatedBy = _context.Users.First(i => i.Active && i.UserName.Equals(p.CreatedBy)).GivenName ?? "",
                                                            CreatedTime = p.CreatedTime.ToString("dd/MM/yyyy"),
                                                        });
                var count = list.Count();
                var data = list.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "ObjPackCode", "Name", "SpecSize", "Weight", "Unit", "CreatedBy", "CreatedTime");
                return Json(jdata);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetListPack()
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var list = _context.ObjectiverPackCovers.Where(x => !x.IsDeleted);
                return Json(list);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object InsertPack([FromBody]ObjectiverPackCover data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var check = _context.ObjectiverPackCovers.FirstOrDefault(x => x.ObjPackCode == data.ObjPackCode && !x.IsDeleted);
                if (check == null)
                {
                    data.CreatedBy = ESEIM.AppContext.UserName;
                    data.CreatedTime = DateTime.Now;

                    _context.ObjectiverPackCovers.Add(data);
                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_ADD_SUCCESS"], "");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["Mã đã tồn tại"], "");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object GetItemPack(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var check = _context.ObjectiverPackCovers.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
                if (check != null)
                {
                    msg.Object = check;
                    msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"], "");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["Mã không tồn tại"], "");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object UpdatePack([FromBody]ObjectiverPackCover data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var check = _context.ObjectiverPackCovers.FirstOrDefault(x => x.ObjPackCode == data.ObjPackCode && !x.IsDeleted);
                if (check != null)
                {
                    check.Name = data.Name;
                    check.ParentCode = data.ParentCode;
                    check.SpecSize = data.SpecSize;
                    check.Weight = data.Weight;
                    check.Unit = data.Unit;
                    check.Description = data.Description;
                    check.Located = data.Located;

                    check.UpdatedBy = ESEIM.AppContext.UserName;
                    check.UpdatedTime = DateTime.Now;

                    _context.ObjectiverPackCovers.Update(check);
                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_UPDATE_SUCCESS"], "");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["Mã không tồn tại"], "");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
        }

        [HttpPost]
        public object DeletePack(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var check = _context.ObjectiverPackCovers.FirstOrDefault(x => x.Id == id && !x.IsDeleted);
                if (check != null)
                {
                    check.IsDeleted = true;
                    check.DeletedBy = ESEIM.AppContext.UserName;
                    check.DeletedTime = DateTime.Now;
                    _context.ObjectiverPackCovers.Update(check);

                    var edmsFilePackCovers = _context.EDMSFilePackCovers.Where(x => !x.IsDeleted && !string.IsNullOrEmpty(x.ObjPackCode) && x.ObjPackCode.Equals(check.ObjPackCode)).ToList();

                    edmsFilePackCovers.ForEach(x =>
                    {
                        x.IsDeleted = true;
                        x.DeletedBy = User.Identity.Name;
                        x.DeletedTime = DateTime.Now;
                    });

                    _context.EDMSFilePackCovers.UpdateRange(edmsFilePackCovers);
                    _context.SaveChanges();

                    msg.Title = String.Format(_sharedResources["COM_DELETE_SUCCESS"], "");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["Mã không tồn tại"], "");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = _sharedResources["COM_MSG_ERR"];
                msg.Object = ex;
            }
            return Json(msg);
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

        #region Model
        public class JTableModelPack : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Name { get; set; }
        }
        #endregion
    }
}