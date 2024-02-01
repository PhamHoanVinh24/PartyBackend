using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using III.Admin.Controllers;
using Lucene.Net.Search;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Syncfusion.EJ2.Linq;
using System;
using System.Globalization;
using System.Linq;
using ESEIM.Models;
using Microsoft.AspNetCore.Authorization;
using static III.Admin.Controllers.MobileProductController;
using III.Domain.Enums;
using III.Domain.Common;
using System.Collections.Generic;
using Xfinium.Pdf.Forms;
using Microsoft.AspNetCore.Http;
using static III.Admin.Controllers.MobileLoginController;
using Syncfusion.EJ2.Spreadsheet;
using DocumentFormat.OpenXml.InkML;
using OpenXmlPowerTools;
using DocumentFormat.OpenXml.Bibliography;
using System.Text;
using static Dropbox.Api.Files.SearchMatchType;
using PdfSharp.Charting;
using Microsoft.EntityFrameworkCore;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class UserJoinPartyController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IStringLocalizer<SharedResources> _sharedResources;


        public UserJoinPartyController(EIMDBContext context, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.UserJoinParty", AreaName = "Admin", FromAction = "Index", FromController = typeof(SaleWareHouseHomeController))]
        [AllowAnonymous]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuStore"] = _sharedResources["COM_CRUMB_MENU_STORE"];
            ViewData["CrumbSaleWHHome"] = _sharedResources["COM_CRUMB_SALE_WH"];
            ViewData["UserJoinParty"] = "Hồ sơ gia nhập đảng";
            return View();
        }
        public class JTableModelFile : JTableModel
        {
            public string FromDate { get; set; }
            public string ToDate { get; set; }
        }

        [HttpPost]
        public object JTable2([FromBody] JTableModelFile jTablePara)
        {
            try
            {
                int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
                var fromDate = !string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var toDate = !string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
                var query = from a in _context.PartyAdmissionProfiles.Where(x => x.IsDeleted == false)
                            join b in _context.Users on a.CreatedBy equals b.UserName into b1
                            from b in b1.DefaultIfEmpty()
                            where (fromDate == null || (fromDate <= a.Birthday))
                                   && (toDate == null || (toDate >= a.Birthday))
                                   //&& (string.IsNullOrEmpty(jTablePara.Name) || a.CurrentName.ToLower().Contains(jTablePara.Name.ToLower()))
                                   //&& (string.IsNullOrEmpty(jTablePara.Nation) || a.Nation.ToLower().Contains(jTablePara.Nation.ToLower()))
                                   //&& (string.IsNullOrEmpty(jTablePara.Religion) || a.Religion.ToLower().Contains(jTablePara.Religion.ToLower()))
                                   //&& (string.IsNullOrEmpty(jTablePara.JobEducation) || a.JobEducation.ToLower().Contains(jTablePara.JobEducation.ToLower()))
                                   //&& (string.IsNullOrEmpty(jTablePara.Degree) || a.JobEducation.ToLower().Contains(jTablePara.Degree.ToLower()))
                            select new
                            {
                                a.Id,
                                a.CurrentName,
                                a.UserCode,
                                a.Status,
                                a.Username,
                                CreatedBy= b!=null ? b.GivenName: "",
                                a.ProfileLink,
                                resumeNumber=a.ResumeNumber
                            };

                //int total = _context.PartyAdmissionProfiles.Count();
                var query_row_number = query.AsEnumerable().Select((x, index) => new
                {
                    stt = index + 1,
                    x.Id,
                    x.CurrentName,
                    x.UserCode,
                    x.Status,
                    x.Username,
                    x.CreatedBy,
                    x.ProfileLink,
                    x.resumeNumber
                }).ToList();
                int count = query_row_number.Count();
                var data = query_row_number.AsQueryable().OrderBy(x => x.stt).Skip(intBegin).Take(jTablePara.Length);

                var jdata = JTableHelper.JObjectTable(Enumerable.ToList(data), jTablePara.Draw, count, "stt", "Id", "CurrentName", "UserCode", "Status", "Username", "CreatedBy", "ProfileLink", "resumeNumber");
                return Json(jdata);
            }
            catch (Exception err)
            {
                var jdata = JTableHelper.JObjectTable(null, jTablePara.Draw, 0, "stt", "Id", "CurrentName", "UserCode", "Status", "Username", "CreatedBy", "ProfileLink", "resumeNumber");
                return Json(jdata);
            }
        }
       

    }
}
