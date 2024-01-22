using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using FTU.Utils.HelperNet;
using System.Data;
using System.Globalization;
using System.Collections.Generic;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class LmsExamController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IRepositoryService _repositoryService;
        private readonly IStringLocalizer<EduExamController> _stringLocalizer;
        private readonly IStringLocalizer<LmsDashBoardController> _stringLocalizerLms;
        private readonly IStringLocalizer<LmsExamController> _stringLocalizerLmsExam;
        private readonly IStringLocalizer<StaffLateController> _stringLocalizerStaffLate;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public LmsExamController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IRepositoryService repositoryService,
            IStringLocalizer<LmsDashBoardController> stringLocalizerLms,
            IStringLocalizer<LmsExamController> stringLocalizerLmsExam, IStringLocalizer<StaffLateController> stringLocalizerStaffLate,
            IStringLocalizer<EduExamController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _repositoryService = repositoryService;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _stringLocalizerLmsExam = stringLocalizerLmsExam;
            _stringLocalizerLms = stringLocalizerLms;
            _stringLocalizerStaffLate = stringLocalizerStaffLate;
        }
        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(LmsDashBoardController))]
        // ViewData.Title // typeof(LmsDashBoardController)
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuCenter"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbLMSDashBoard"] = _sharedResources["COM_CRUMB_LMS_DASH_BOARD"];
            ViewData["CrumbLMSExam"] = _sharedResources["COM_CRUMB_LMS_EXAM"];
            return View();
        }

        //#region JTable
        //[HttpPost]
        //public object JTable([FromBody]JtableModelLmsExam jTablePara)
        //{
        //    var fromDate = !string.IsNullOrEmpty(jTablePara.CreFromDate) ? DateTime.ParseExact(jTablePara.CreFromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
        //    var toDate = !string.IsNullOrEmpty(jTablePara.CreToDate) ? DateTime.ParseExact(jTablePara.CreToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

        //    int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
        //    var query = from a in _context.ExamHeaders.Where(x => !x.IsDeleted)
        //                join b in _context.LmsSubjectManagements on a.SubjectCode equals b.SubjectCode into b1
        //                from b in b1.DefaultIfEmpty()
        //                //join b in _context.EduExaminations.Where(x => !x.IsDeleted) on a.ExamInheritance equals b.Code into b1
        //                //from b in b1.DefaultIfEmpty()
        //                where (fromDate == null || (fromDate <= a.CreatedTime))
        //                && (toDate == null || (toDate >= a.CreatedTime))
        //                && (string.IsNullOrEmpty(jTablePara.Title) || a.ExamTitle.Contains(jTablePara.Title))
        //                && (string.IsNullOrEmpty(jTablePara.Subject) || b.SubjectCode.Equals(jTablePara.Subject))
        //                select new
        //                {
        //                    a.Id,
        //                    a.ExamCode,
        //                    a.ExamTitle,
        //                    a.Duration,
        //                    a.Unit,
        //                    //a.ExamInheritance,
        //                    ExamSubject = b != null ? b.SubjectName : "",
        //                    a.CreatedBy,
        //                    a.CreatedTime,
        //                    a.Description
        //                };

        //    var count = query.Count();
        //    var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();

        //    var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "ExamCode", "ExamTitle", "Duration", "Unit", "ExamSubject", "CreatedBy", "CreatedTime", "Description");
        //    return Json(jdata);
        //}

        //[HttpPost]
        //public object GetListDetail(string examCode)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        var obj = from a in _context.ExamDetails.Where(x => !x.IsDeleted && x.ExamCode.Equals(examCode))
        //                  join b in _context.QuizPools.Where(x => !x.IsDeleted) on a.QuestCode equals b.Code
        //                  orderby a.Order
        //                  select new
        //                  {
        //                      a.Id,
        //                      a.Order,
        //                      b.Content,
        //                      a.Duration,
        //                      a.Unit,
        //                      a.Mark
        //                  };

        //        msg.Object = obj;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = _sharedResources["LMS_EXAM_MSG_NOT_FOUND_QT"];// "Không tìm thấy câu hỏi";
        //    }

        //    return msg;
        //}

        //[HttpPost]
        //public object GetListDetailQuiz(string examCode, string sessionCode)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        var data = from a in _context.ExamDetails.Where(x => !x.IsDeleted && x.ExamCode.Equals(examCode))
        //                  join b in _context.QuizPools.Where(x => !x.IsDeleted) on a.QuestCode equals b.Code
        //                  join c in _context.UserDoExerciseResults.Where(x => x.TypeTraining == "DO_TEST" && x.ObjectCode == examCode && x.SessionCode == sessionCode)
        //                  on a.QuestCode equals c.QuizCode into c1
        //                  from c in c1.DefaultIfEmpty()
        //                  orderby a.Order
        //                  select new
        //                  {
        //                      a.Id,
        //                      a.Order,
        //                      a.Duration,
        //                      a.Unit,
        //                      a.Mark,
        //                      b.Content,
        //                      b.Code,
        //                      b.Type,
        //                      b.JsonData,
        //                      IdQuiz = b.Id,
        //                      UserChoose = c != null ? c.UserChoose : null,
        //                  };
        //        var obj = new
        //        {
        //            isAlreadyDone = _context.UserDoExerciseResults.Any(x => x.TypeTraining == "DO_TEST" && x.ObjectCode == examCode && x.SessionCode == sessionCode),
        //            details = data,
        //        };
        //        msg.Object = obj;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = _sharedResources["LMS_EXAM_MSG_NOT_FOUND_QT"];// "Không tìm thấy câu hỏi";
        //    }

        //    return msg;
        //}

        //#endregion

        //#region Function
        //[HttpPost]
        //public object Insert([FromBody]ExamHeader data)
        //{
        //    var msg = new JMessage() { Error = false, ID = 0 };
        //    try
        //    {
        //        var model = _context.ExamHeaders.FirstOrDefault(x => x.ExamCode.Equals(data.ExamCode));
        //        if (model == null)
        //        {
        //            data.CreatedBy = User.Identity.Name;
        //            data.CreatedTime = DateTime.Now;
        //            _context.ExamHeaders.Add(data);
        //            _context.SaveChanges();
        //            msg.Title = _sharedResources["LMS_EXAM_MSG_ADD_SUCCESS"];// "Thêm mới thành công";
        //            msg.ID = data.Id;
        //        }
        //        else
        //        {
        //            msg.Title = _sharedResources["LMS_EXAM_MSG_ERR_EXIST"];// "Bài thi đã tồn tại";
        //            msg.Error = true;
        //        }
        //        return msg;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        //msg.Title = "Có lỗi xảy ra khi thêm";
        //        msg.Title = _sharedResources["COM_ERR_ADD"];
        //        return msg;
        //    }
        //}
        //[HttpPost]
        //public object Update([FromBody] ExamHeader data)
        //{

        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var model = _context.ExamHeaders.FirstOrDefault(x => x.Id == data.Id);
        //        if (model != null)
        //        {
        //            model.ExamCode = data.ExamCode;
        //            model.ExamTitle = data.ExamTitle;
        //            model.Duration = data.Duration;
        //            model.Unit = data.Unit;
        //            model.Level = data.Level;
        //            model.MarkPass = data.MarkPass;
        //            model.ViewResult = data.ViewResult;
        //            model.Rework = data.Rework;
        //            model.WorkSequence = data.WorkSequence;
        //            model.IsPublished = data.IsPublished;
        //            model.SubjectCode = data.SubjectCode;
        //            model.Description = data.Description;
        //            //model.Note = data.Note;
        //            //model.ExamInheritance = data.ExamInheritance;
        //            model.UpdatedBy = User.Identity.Name;
        //            model.UpdatedTime = DateTime.Now;
        //            _context.ExamHeaders.Update(model);
        //            _context.SaveChanges();
        //            msg.Title = _sharedResources["LMS_EXAM_MSG_UPDATE_SUCCESS"];// "Cập nhật thành công";
        //            //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = _sharedResources["LMS_EXAM_MSG_NOT_EXITS"];// "Bài thi không tồn tại";
        //            //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];

        //        }
        //        return msg;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        //msg.Title = "Có lỗi khi cập nhật";
        //        msg.Title = _sharedResources["COM_UPDATE_FAIL"];
        //        return msg;
        //    }
        //}

        //[HttpPost]
        //public object GetItem([FromBody] int id)
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        var obj = _context.ExamHeaders.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(id));

        //        msg.Object = obj;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = _sharedResources["LMS_EXAM_MSG_NOT_FOUND"];// "Không tìm thấy bài thi";
        //    }

        //    return msg;
        //}
        //[HttpPost]
        //public object Delete(int id)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var data = _context.ExamHeaders.FirstOrDefault(x => x.Id.Equals(id));
        //        if (data == null)
        //        {
        //            msg.Error = true;
        //            msg.Title = _sharedResources["LMS_EXAM_MSG_NOT_EXITS"];// "Bài thi không tồn tại";
        //            //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
        //        }
        //        else
        //        {
        //            data.IsDeleted = true;
        //            data.DeletedBy = User.Identity.Name;
        //            data.DeletedTime = DateTime.Now;
        //            _context.ExamHeaders.Update(data);
        //            _context.SaveChanges();
        //            msg.Title = _sharedResources["LMS_EXAM_DELETE_SUCCESS"];// "Xóa thành công";
        //            //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
        //        }
        //        return msg;

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        //msg.Title = "Có lỗi khi xóa";
        //        msg.Title = _sharedResources["COM_ERR_DELETE"];
        //        return msg;
        //    }
        //}
        //#endregion

        //#region Detail
        //[HttpPost]
        //public object InsertQuestion([FromBody]ExamDetail data)
        //{
        //    var msg = new JMessage() { Error = false, ID = 0 };
        //    try
        //    {
        //        var model = _context.ExamDetails.FirstOrDefault(x => !x.IsDeleted && x.ExamCode.Equals(data.ExamCode) && x.QuestCode.Equals(data.QuestCode));
        //        if (model == null)
        //        {
        //            data.CreatedBy = User.Identity.Name;
        //            data.CreatedTime = DateTime.Now;
        //            _context.ExamDetails.Add(data);
        //            _context.SaveChanges();
        //            msg.Title = _sharedResources["LMS_EXAM_MSG_ADD_SUCCESS"];// "Thêm mới thành công";
        //            msg.ID = data.Id;
        //        }
        //        else
        //        {
        //            msg.Title = _sharedResources["LMS_EXAM_MSG_QUESTION_EXIST"];// "Câu hỏi đã tồn tại";
        //            msg.Error = true;
        //        }
        //        return msg;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        //msg.Title = "Có lỗi xảy ra khi thêm";
        //        msg.Title = _sharedResources["COM_ERR_ADD"];
        //        return msg;
        //    }
        //}

        //[HttpPost]
        //public object DeleteQuestion(int id)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        var data = _context.ExamDetails.FirstOrDefault(x => x.Id.Equals(id));
        //        if (data == null)
        //        {
        //            msg.Error = true;
        //            msg.Title = _sharedResources["LMS_EXAM_MSG_QUESTION_NOT_EXIST"];// "Câu hỏi không tồn tại";
        //            //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
        //        }
        //        else
        //        {
        //            data.IsDeleted = true;
        //            data.DeletedBy = User.Identity.Name;
        //            data.DeletedTime = DateTime.Now;
        //            _context.ExamDetails.Update(data);
        //            _context.SaveChanges();
        //            msg.Title = _sharedResources["LMS_EXAM_DELETE_SUCCESS"];// "Xóa thành công";
        //            //msg.Title = _stringLocalizer["CMS_ITEM_MSG_DELETE_ARC_SUCCESS"];
        //        }
        //        return msg;

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        //msg.Title = "Có lỗi khi xóa";
        //        msg.Title = _sharedResources["COM_ERR_DELETE"];
        //        return msg;
        //    }
        //}

        //#endregion

        //[HttpPost]
        //public object LogSession([FromBody]UserDoExerciseResultModel obj)
        //{
        //    var msg = new JMessage() { Error = false, ID = 0 };
        //    try
        //    {
        //        var model = _context.UserDoExerciseResults.FirstOrDefault(x => x.SessionCode == obj.SessionCode && x.CreatedBy == User.Identity.Name && x.QuizCode == obj.QuizCode);
        //        if (model == null)
        //        {
        //            var data = new UserDoExerciseResult()
        //            {
        //                QuizCode = obj.QuizCode,
        //                UserChoose = obj.UserChoose,
        //                Result = obj.Result,
        //                TypeTraining = obj.TypeTraining,
        //                ObjectCode = obj.ObjectCode,
        //                SessionCode = obj.SessionCode
        //            };
        //            data.CreatedBy = User.Identity.Name;
        //            data.CreatedTime = DateTime.Now;
        //            _context.UserDoExerciseResults.Add(data);
        //            _context.SaveChanges();
        //            msg.Title = _sharedResources["LMS_EXAM_MSG_SAVE_SUCCESS"];// "Log thành công"; 
        //        }
        //        else
        //        {
        //            model.UserChoose = obj.UserChoose;
        //            model.Result = obj.Result;
        //            model.TypeTraining = obj.TypeTraining;
        //            model.ObjectCode = obj.ObjectCode;
        //            model.UpdatedBy = User.Identity.Name;
        //            model.UpdatedTime = DateTime.Now;
        //            _context.UserDoExerciseResults.Update(model);
        //            _context.SaveChanges();
        //            msg.Title = _sharedResources["LMS_EXAM_MSG_HW_SUCCESS"];// "Đã làm bài tập";
        //        }
        //        return msg;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        //msg.Title = "Có lỗi xảy ra khi thêm";
        //        msg.Title = _sharedResources["COM_ERR_ADD"];
        //        return msg;
        //    }
        //}


        //#region Combobox
        //[HttpPost]
        //public object GetListQuestion(int pageNo = 1, int pageSize = 10, string content="")
        //{
        //    //var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
        //    var search = !String.IsNullOrEmpty(content) ? content : "";
        //    string[] param = new string[] { "@pageNo", "@pageSize", "@content" };
        //    object[] val = new object[] { pageNo, pageSize, search };
        //    DataTable rs = _repositoryService.GetDataTableProcedureSql("P_GET_LIST_QUIZ_LMS", param, val);
        //    var data = CommonUtil.ConvertDataTable<QuizPool>(rs).Select(x => new { Code = x.Code, Content = x.Content }).ToList();
        //    //return query;
        //    return data;
        //}
        //[HttpPost]
        //public object GetListSubject()
        //{
        //    var msg = new JMessage() { Error = false, Title = "" };
        //    try
        //    {
        //        var obj = from a in _context.LmsSubjectManagements.Where(x => x.Status == "AVAILABLE")
        //                  select new
        //                  {
        //                      Code = a.SubjectCode,
        //                      Name = a.SubjectName
        //                  };

        //        msg.Object = obj;
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = _sharedResources["LMS_EXAM_MSG_ERR_LOAD_COMBO"];// "Lỗi khi load combobox";
        //    }

        //    return msg;
        //}

        //[HttpPost]
        //public object UpdateDoingExamProgress([FromBody] LmsTaskUserItemProgress obj)
        //{
        //    var msg = new JMessage { Error = false, Title = "" };
        //    try
        //    {
        //        var sessionInfo = HttpContext.GetSessionUser();
        //        var data = _context.LmsTaskUserItemProgresses.Where(x => x.User.Equals(sessionInfo.UserId) && x.ProgressAuto != 100
        //        && x.TrainingType.Equals("DO_EXAM") && !x.IsDeleted && x.ItemCode.Equals(obj.ItemCode));
        //        if (data != null)
        //        {
        //            foreach (var item in data)
        //            {
        //                item.ProgressAuto = 100;
        //                _context.LmsTaskUserItemProgresses.Update(item);
        //            }

        //            _context.SaveChanges();
        //            msg.Title = _sharedResources["COM_UPDATE_SUCCESS"];
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = _stringLocalizer["COM_UPDATE_FAIL"];
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = _sharedResources["COM_MSG_ERR"];
        //    }
        //    return Json(msg);
        //}
        //#endregion

        //#region Model
        //public class JtableModelLmsExam : JTableModel
        //{
        //    public string Title { get; set; }
        //    public string PostFromDate { get; set; }
        //    public string PostToDate { get; set; }
        //    public string CreFromDate { get; set; }
        //    public string CreToDate { get; set; }
        //    public int? Category { get; set; }
        //    public string Subject { get; set; }
        //}
        //public class UserDoExerciseResultModel
        //{
        //    public string QuizCode { get; set; }
        //    public string UserChoose { get; set; }
        //    public bool? Result { get; set; }
        //    public string SessionCode { get; set; }
        //    public string TypeTraining { get; set; }
        //    public string ObjectCode { get; set; }
        //}
        //#endregion

        //#region Language
        //[HttpGet]
        //public IActionResult Translation(string lang)
        //{
        //    var resourceObject = new JObject();
        //    var query = _stringLocalizer.GetAllStrings().Select(x => new { x.Name, x.Value })
        //        .Union(_stringLocalizerLms.GetAllStrings().Select(x => new { x.Name, x.Value }))
        //        .Union(_stringLocalizerLmsExam.GetAllStrings().Select(x => new { x.Name, x.Value }))
        //        .Union(_stringLocalizerStaffLate.GetAllStrings().Select(x => new { x.Name, x.Value }))
        //        .Union(_sharedResources.GetAllStrings().Select(x => new { x.Name, x.Value }))
        //        .DistinctBy(x => x.Name);
        //    foreach (var item in query)
        //    {
        //        resourceObject.Add(item.Name, item.Value);
        //    }
        //    return Ok(resourceObject);
        //}
        //#endregion
    }
}