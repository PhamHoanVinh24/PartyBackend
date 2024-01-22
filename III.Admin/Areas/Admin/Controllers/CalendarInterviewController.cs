using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class CalendarInterviewController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        public CalendarInterviewController(EIMDBContext context, IUploadService upload)
        {
            _context = context;
            _upload = upload;
        }
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult GetInterviewDate([FromBody]JtableModelInterview searchData)
        {
            var fromDate = string.IsNullOrEmpty(searchData.FromDate) ? (DateTime?)null : DateTime.ParseExact(searchData.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var toDate = string.IsNullOrEmpty(searchData.ToDate) ? (DateTime?)null : DateTime.ParseExact(searchData.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            try
            {
                var data = from a in _context.CandidateInterviews
                           join b in _context.CandiateBasic
                           on a.CandidateCode equals b.CandidateCode
                           where (string.IsNullOrEmpty(searchData.CandidateCode) || searchData.CandidateCode.Equals(a.CandidateCode))
                           && (fromDate == null || (a.InterviewDate.Date >= fromDate.Value.Date))
                           && (toDate == null || (a.InterviewDate.Date <= toDate.Value.Date))
                           && ((fromDate != null && toDate != null) || (a.InterviewDate.Date >= DateTime.Today))
                           select new
                           {
                               a.Id,
                               a.InterviewDate,
                               InterviewDateCompare = a.InterviewDate.ToString("dd/MM/yyyy hh:mm:ss"),
                               a.CandidateCode,
                               b.Fullname
                           };

                return Json(data);
            }
            catch (Exception ex)
            {
                return Json(ex);
            }
        }

        [HttpGet]
        public JsonResult GetCandidateInterviewDate(string dateSearch)
        {
            var date = string.IsNullOrEmpty(dateSearch) ? (DateTime?)null : DateTime.ParseExact(dateSearch, "dd/MM/yyyy", CultureInfo.InvariantCulture);
            var data = from a in _context.CandidateInterviews
                       join b in _context.CandiateBasic
                       on a.CandidateCode equals b.CandidateCode
                       where a.InterviewDate.Date == date.Value.Date
                       select new
                       {
                           a.Id,
                           a.InterviewDate,
                           InterviewDateCompare = a.InterviewDate.ToString("dd/MM/yyyy HH:mm:ss"),
                           b.Fullname
                       };

            return Json(data);
        }
        [HttpPost]
        public JsonResult SetInterviewDate([FromBody]Interview data)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                if (data == null)
                {
                    msg.Title = String.Format(CommonUtil.ResourceValue("CL_MSG_CHOSE_DATE_INTERVIEW"));
                    return Json(msg);
                }

                if (string.IsNullOrEmpty(data.CandidateCode))
                {
                    msg.Title = String.Format(CommonUtil.ResourceValue("CL_MSG_CHOSE_CODE_CANDIDATE"));
                    return Json(msg);
                }


                var query = _context.CandidateInterviews.Where(x => x.CandidateCode.Equals(data.CandidateCode));
                if (query.Count() > 0)
                {
                    var a = _context.CandidateInterviews.FirstOrDefault(x => x.CandidateCode.Equals(data.CandidateCode));
                    a.InterviewDate = data.InterviewDate;
                    _context.CandidateInterviews.Update(a);
                    _context.SaveChanges();

                    msg.Error = false;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_SUCCESS"));

                    return Json(msg);
                }

                CandidateInterview obj = new CandidateInterview()
                {
                    CandidateCode = data.CandidateCode,
                    //InterviewDate = DateTime.ParseExact(data.InterviewDate.Replace(' ', 'T'), "dd/MM/yyyy", CultureInfo.InvariantCulture)
                    InterviewDate = data.InterviewDate
                };

                _context.CandidateInterviews.Add(obj);
                _context.SaveChanges();

                msg.Error = false;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_SUCCESS"));
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_SUCCESS"));
                return Json(msg);
                throw;
            }
        }

        [HttpPost]
        public object GetUserCandidate()
        {
            var data = _context.CandiateBasic.Where(x => x.Fullname != null).OrderByDescending(x => x.Id).Select(x => new
            {
                Code = x.CandidateCode,
                Name = x.Fullname,
                IsNew = x.CreatedTime.Date == DateTime.Today ? true : false
            });
            return data;
        }

        [HttpGet]
        public JsonResult GetItemCandidate(string candidateCode)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var data = _context.CandiateBasic.FirstOrDefault(x => x.CandidateCode == candidateCode);
                if (data != null)
                {
                    msg.Object = data;
                }
                else
                {
                    //msg.Title = "Ứng viên không tồn tại!";
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("CI_LIST_COL_INTERVIEW"));
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                //msg.Title = "Ứng viên không tồn tại!";
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_NOT_EXITS"), CommonUtil.ResourceValue("CI_LIST_COL_INTERVIEW"));
            }
            return Json(msg);
        }
        [HttpGet]
        public object GetItemLanguage(string langCode)
        {
            var list = _context.CommonSettings.FirstOrDefault(x => x.IsDeleted == false && x.CodeSet == langCode).ValueSet;
            return list;
        }

    }
    public class Interview
    {
        public string CandidateCode { get; set; }
        public DateTime InterviewDate { get; set; }
    }
    public class JtableModelInterview : JTableModel
    {
        public string CandidateCode { get; set; }
        public string FromDate { get; set; }
        public string ToDate { get; set; }
    }
}