using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using System.Data;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using III.Domain.Enums;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EduExamController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<EduExamController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public EduExamController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<EduExamController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        [Breadcrumb("ViewData.CrumbCmsItem", AreaName = "Admin", FromAction = "Index", FromController = typeof(ContentManageHomeController))]

        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbContentManage"] = _sharedResources["COM_CRUMB_CONTENT_MANAGE_HOME"];
            ViewData["CrumbCmsItem"] = _sharedResources["Bài thi"];
            return View();
        }

        #region JTable
        [HttpPost]
        public object JTable([FromBody]ExamJTableModel jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.CreFromDate) ? DateTime.ParseExact(jTablePara.CreFromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.CreToDate) ? DateTime.ParseExact(jTablePara.CreToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.EduExaminations.Where(x => !x.IsDeleted)
                        join b in _context.EduExaminations.Where(x => !x.IsDeleted) on a.ExamInheritance equals b.Code into b1
                        from b in b1.DefaultIfEmpty()
                        where (fromDate == null || (fromDate <= a.CreatedTime))
                        && (toDate == null || (toDate >= a.CreatedTime))
                        && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.Contains(jTablePara.Title))
                        select new
                        {
                            a.Id,
                            a.Code,
                            a.Title,
                            a.Duration,
                            a.ExamInheritance,
                            ExamInheritanceName = b.Title,
                            a.CreatedBy,
                            a.CreatedTime,
                            a.Note
                        };

            var count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();

            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "Code", "Title", "Duration", "ExamInheritance", "ExamInheritanceName", "CreatedBy", "CreatedTime", "Note");
            return Json(jdata);
        }

        [HttpPost]
        public object GetListDetail(string practiceTestCode)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = from a in _context.EduExaminationDetails.Where(x => !x.IsDeleted && x.PracticeTestCode.Equals(practiceTestCode))
                          join b in _context.QuizPools.Where(x => !x.IsDeleted) on a.QuestionCode equals b.Code
                          select new
                          {
                              a.Id,
                              b.Title,
                              b.Content
                          };

                msg.Object = obj;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy câu hỏi";
            }

            return msg;
        }

        #endregion

        #region Function
        [HttpPost]
        public object Insert([FromBody]EduExamination data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.EduExaminations.FirstOrDefault(x => x.Code.Equals(data.Code));
                if (model == null)
                {
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    _context.EduExaminations.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm mới thành công";
                    msg.ID = data.Id;
                }
                else
                {
                    msg.Title = "Bài thi đã tồn tại";
                    msg.Error = true;
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return msg;
            }
        }
        [HttpPost]
        public object Update([FromBody]EduExamination data)
        {

            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.EduExaminations.FirstOrDefault(x => x.Code.Equals(data.Code));
                if (model != null)
                {
                    model.Title = data.Title;
                    model.Duration = data.Duration;
                    model.Note = data.Note;
                    model.ExamInheritance = data.ExamInheritance;
                    model.UpdatedBy = User.Identity.Name;
                    model.UpdatedTime = DateTime.Now;
                    _context.EduExaminations.Update(model);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                    //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Bài thi không tồn tại";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];

                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi cập nhật";
                msg.Title = _sharedResources["COM_UPDATE_FAIL"];
                return msg;
            }
        }

        [HttpPost]
        public object GetItem([FromBody] int id)
        {
            var msg = new JMessage() { Error = false, Title = "" };
            try
            {
                var obj = _context.EduExaminations.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(id));

                msg.Object = obj;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy bài thi";
            }

            return msg;
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EduExaminations.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = "Bài thi không tồn tại";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    data.DeletedTime = DateTime.Now;
                    _context.EduExaminations.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi xóa";
                msg.Title = _sharedResources["COM_ERR_DELETE"];
                return msg;
            }
        }
        #endregion

        #region Detail
        [HttpPost]
        public object InsertQuestion([FromBody]EduExaminationDetail data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.EduExaminationDetails.FirstOrDefault(x => !x.IsDeleted && x.PracticeTestCode.Equals(data.PracticeTestCode) && x.QuestionCode.Equals(data.QuestionCode));
                if (model == null)
                {
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    _context.EduExaminationDetails.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm mới thành công";
                    msg.ID = data.Id;
                }
                else
                {
                    msg.Title = "Câu hỏi đã tồn tại";
                    msg.Error = true;
                }
                return msg;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi xảy ra khi thêm";
                msg.Title = _sharedResources["COM_ERR_ADD"];
                return msg;
            }
        }

        [HttpPost]
        public object DeleteQuestion(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.EduExaminationDetails.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    msg.Title = "Câu hỏi không tồn tại";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    data.DeletedTime = DateTime.Now;
                    _context.EduExaminationDetails.Update(data);
                    _context.SaveChanges();
                    msg.Title = "Xóa thành công";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
                }
                return msg;

            }
            catch (Exception ex)
            {
                msg.Error = true;
                //msg.Title = "Có lỗi khi xóa";
                msg.Title = _sharedResources["COM_ERR_DELETE"];
                return msg;
            }
        }

        #endregion

        #region Combobox
        [HttpPost]
        public object GetListQuestion()
        {
            var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Name = x.Title }).ToList();
            return data;
        }

        [HttpPost]
        public object GetListExamInheritance(string code)
        {
            var data = _context.EduExaminations.Where(x => !x.IsDeleted && !x.Code.Equals(code)).Select(x => new { Code = x.Code, Name = x.Title }).ToList();
            return data;
        }
        #endregion

        #region Model
        public class ExamJTableModel : JTableModel
        {
            public string Title { get; set; }
            public string PostFromDate { get; set; }
            public string PostToDate { get; set; }
            public string CreFromDate { get; set; }
            public string CreToDate { get; set; }
            public int? Category { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new JObject();
            var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value }).Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }));
            foreach (var item in query)
            {
                resourceObject.Add(item.Name, item.Value);
            }
            return Ok(resourceObject);
        }
        #endregion
    }
}