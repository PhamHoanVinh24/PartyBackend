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
using DocumentFormat.OpenXml.VariantTypes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class UserJoinPartyController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<SharedResources> _sharedResources;


        public UserJoinPartyController(EIMDBContext context, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _sharedResources = sharedResources;
        }

        [Breadcrumb("ViewData.UserJoinParty", AreaName = "Admin", FromAction = "Index", FromController = typeof(SaleWareHouseHomeController))]
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
            public string Name { get; set; }
            public string Username { get; set; }
            public string Status { get; set; }
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
                                   && (string.IsNullOrEmpty(jTablePara.Name) || a.CurrentName.ToLower().Contains(jTablePara.Name.ToLower()))
                                   && (string.IsNullOrEmpty(jTablePara.Status) || a.Status==jTablePara.Status)
                                   && (string.IsNullOrEmpty(jTablePara.Username) || a.Username.ToLower().Contains(jTablePara.Username.ToLower()) || a.ResumeNumber.ToLower().Contains(jTablePara.Username.ToLower()))
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

        [HttpPost]
        [AllowAnonymous]
        public object InsertPersonalHistory([FromBody] PersonalHistory model)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                if (!string.IsNullOrEmpty(model.Content) || model.Begin != null || model.End != null)
                {
                    var data = _context.PartyAdmissionProfiles.FirstOrDefault(a => a.ResumeNumber == model.ProfileCode);
                    if (data == null)
                    {
                        msg.Error = true;
                        msg.Title = "Mã hồ sơ không tồn tại";
                        return msg;
                    }
                    var obj = new PersonalHistory();
                    obj.Begin = model.Begin;
                    obj.End = model.End;
                    obj.Content = model.Content;
                    obj.ProfileCode = model.ProfileCode;
                    _context.PersonalHistories.Add(obj);
                    _context.SaveChanges();
                    msg.Title = "Thêm mới Lịch sử bản thân thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Lịch sử bản thân chưa hợp lệ";
                }

            }
            catch (Exception err)
            {
                msg.Error = true;
                msg.Title = "Thêm Lịch sử bản thân thất bại";
            }
            return msg;
        }
        [HttpPost]
        [AllowAnonymous]
        public object UpdatePersonalHistory([FromBody] PersonalHistory model)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                if (!string.IsNullOrEmpty(model.Content) || model.Begin != null || model.End != null)
                {

                    var data = _context.PartyAdmissionProfiles.FirstOrDefault(x => x.ResumeNumber == model.ProfileCode);
                    if (data == null)
                    {
                        msg.Error = true;
                        msg.Title = "Mã hồ sơ không tồn tại";
                        return msg;
                    }
                    var a = _context.PersonalHistories.Find(model.Id);
                    if (a != null)
                    {
                        a.Begin = model.Begin;
                        a.End = model.End;
                        a.Content = model.Content;
                        a.IsDeleted = false;
                        _context.PersonalHistories.Update(a);
                        _context.SaveChanges();
                        msg.Title = "Thêm mới Lịch sử bản thân thành công";
                    }
                    else
                    {
                        msg.Error = true;
                        msg.Title = "Lịch sử bản thân chưa hợp lệ";
                        return msg;
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Lịch sử bản thân chưa hợp lệ";
                }

            }
            catch (Exception err)
            {
                msg.Error = true;
                msg.Title = "Thêm Lịch sử bản thân thất bại";
            }
            return msg;
        }

        [HttpPost]
        public object InsertAwardOnly([FromBody] Award x)
        {
            var msg = new JMessage() { Error = false };

            try
            {
                var check = _context.PartyAdmissionProfiles.FirstOrDefault(y => y.ResumeNumber == x.ProfileCode && y.IsDeleted == false);
                if(check != null || x.ProfileCode==null)
                {
                    msg.Error = true;
                    msg.Title = "Mã hồ sơ không tồn tại";
                    return msg;
                }

                if (!string.IsNullOrEmpty(x.MonthYear) || x.Reason != null || x.GrantOfDecision != null)
                {
                    if (x.Id == 0)
                    {
                        _context.Awards.Add(x);
                    }
                    else
                    {
                        var a = _context.Awards.Find(x.Id);
                        if (a != null)
                        {
                            a.MonthYear = x.MonthYear;
                            a.Reason = x.Reason;
                            a.GrantOfDecision = x.GrantOfDecision;
                            a.IsDeleted = false;
                            _context.Awards.Update(a);
                        }
                        else
                        {
                            msg.Error = true;
                            msg.Title = "Khen thưởng chưa hợp lệ";
                            return msg;
                        }
                    }


                }
                _context.SaveChanges();
                msg.Title = "Thêm mới Khen thưởng thành công";

            }
            catch (Exception err)
            {
                msg.Error = true;
                msg.Title = "Thêm mới Khen thưởng thất bại";
            }
            return msg;
        }
    }
}
