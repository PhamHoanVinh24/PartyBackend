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
using Newtonsoft.Json;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class EduQuizController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<EduQuizController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public EduQuizController(EIMDBContext context, IUploadService upload, IHostingEnvironment hostingEnvironment, IStringLocalizer<EduQuizController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
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
            ViewData["CrumbCmsItem"] = _sharedResources["Câu hỏi"];
            return View();
        }

        #region JTable
        [HttpPost]
        public object JTable([FromBody]QuizJTableModel jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.CreFromDate) ? DateTime.ParseExact(jTablePara.CreFromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.CreToDate) ? DateTime.ParseExact(jTablePara.CreToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture) : (DateTime?)null;

            int intBegin = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.QuizPools.Where(x => !x.IsDeleted)
                        join b in _context.EduCategorys.Where(x => x.Published == true) on a.Category equals b.Id into b1
                        from b in b1.DefaultIfEmpty()
                        where (fromDate == null || (fromDate.Value.Date <= a.CreatedTime.Value.Date))
                        && (toDate == null || (toDate.Value.Date >= a.CreatedTime.Value.Date))
                        && (jTablePara.Category == null || (jTablePara.Category != null && a.Category.Equals(jTablePara.Category)))
                        && (string.IsNullOrEmpty(jTablePara.Title) || a.Title.Contains(jTablePara.Title))
                        select new
                        {
                            a.Id,
                            a.Code,
                            a.Title,
                            a.JsonData,
                            a.Category,
                            CategoryName = b != null ? b.Name : "",
                            LectureRelative = a.LectureRelative,
                            a.Content,
                            a.CreatedBy,
                            a.CreatedTime
                        };

            var count = query.Count();
            var data = query.AsQueryable().OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBegin).Take(jTablePara.Length).ToList();

            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "ID", "Code", "Title", "JsonData", "Category", "CategoryName", "LectureRelative", "Content", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }
        #endregion

        #region Function
        [HttpPost]
        public object Insert([FromBody]QuizPool data)
        {
            var msg = new JMessage() { Error = false, ID = 0 };
            try
            {
                var model = _context.QuizPools.FirstOrDefault(x => x.Code.Equals(data.Code));
                if (model == null)
                {
                    data.Category = data.Section;
                    data.CreatedBy = User.Identity.Name;
                    data.CreatedTime = DateTime.Now;
                    _context.QuizPools.Add(data);
                    _context.SaveChanges();
                    msg.Title = "Thêm mới thành công";
                    //msg.Title = _stringLocalizer["CMS_ITEM_MSG_ADD_SUCCESS"];
                    msg.ID = data.Id;
                }
                else
                {
                    //msg.Title = "Bài viết đã tồn tại";
                    msg.Title = _stringLocalizer["CMS_ITEM_MSG_EXITS"];
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
        public object Update([FromBody]QuizPool data)
        {

            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.QuizPools.FirstOrDefault(x => x.Code.Equals(data.Code));
                if (model != null)
                {
                    model.Title = data.Title;
                    model.Category = data.Section;
                    model.Content = data.Content;
                    model.JsonData = data.JsonData;
                    model.UpdatedBy = User.Identity.Name;
                    model.UpdatedTime = DateTime.Now;
                    _context.QuizPools.Update(model);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                    //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];

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
        public object UpdateAnswer([FromBody]QuizPool data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.QuizPools.FirstOrDefault(x => x.Code.Equals(data.QuestionCode));
                if (model != null)
                {
                    model.JsonData = data.JsonData;
                    model.UpdatedBy = User.Identity.Name;
                    model.UpdatedTime = DateTime.Now;
                    _context.QuizPools.Update(model);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                    //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];

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
        public object UpdateLecture([FromBody]QuizPool data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var model = _context.QuizPools.FirstOrDefault(x => x.Id.Equals(data.Id));
                if (model != null)
                {
                    model.LectureRelative = data.LectureRelative;
                    model.UpdatedBy = User.Identity.Name;
                    model.UpdatedTime = DateTime.Now;
                    _context.QuizPools.Update(model);
                    _context.SaveChanges();
                    msg.Title = "Cập nhật thành công";
                    //msg.Title = _stringLocalizer["CMS_ITEM_UPDATE_SUCCESS"];
                }
                else
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
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
                var obj = _context.QuizPools.FirstOrDefault(x => !x.IsDeleted && x.Id.Equals(id));
                if (obj != null)
                {
                    obj.Section = obj.Category;

                    if (_context.EduCategorys.Any(x => x.Id.Equals(obj.Section)))
                        obj.Subject = _context.EduCategorys.FirstOrDefault(x => x.Id.Equals(obj.Section))?.Parent;

                    if (_context.EduCategorys.Any(x => x.Id.Equals(obj.Subject)))
                        obj.Course = _context.EduCategorys.FirstOrDefault(x => x.Id.Equals(obj.Subject))?.Parent;
                }

                msg.Object = obj;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Không tìm thấy câu hỏi";
            }

            return msg;
        }
        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = _context.QuizPools.FirstOrDefault(x => x.Id.Equals(id));
                if (data == null)
                {
                    msg.Error = true;
                    //msg.Title = "Bài viết không tồn tại";
                    msg.Title = _stringLocalizer["CMS_ITEM_MSG_ARC_NOT_EXITS"];
                }
                else
                {
                    data.IsDeleted = true;
                    data.DeletedBy = User.Identity.Name;
                    data.DeletedTime = DateTime.Now;
                    _context.QuizPools.Update(data);
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
        public object GetListCourse()
        {
            var data = _context.EduCategorys.Where(x => x.Published == true && x.ExtraFieldsGroup.Equals(1)).Select(x => new EduCategory { Id = x.Id, Name = x.Name }).ToList();
            return data;
        }
        [HttpPost]
        public object GetListLecture()
        {
            var data = _context.EduLectures.Where(x => x.published == true).Select(x => new EduCategory { Id = x.id, Name = x.title }).ToList();
            return data;
        }
        [HttpPost]
        public object GetLectureDetail(int id)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                msg.Object = _context.EduLectures.Where(x => x.published == true && x.id.Equals(id)).FirstOrDefault();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Lấy thông tin bài giảng thất bại";
            }

            return msg;
        }
        [HttpPost]
        public object GetListCategoryByParent(int parentCode)
        {
            var data = _context.EduCategorys.Where(x => x.Published == true && x.Parent.Equals(parentCode)).ToList();
            return data;
        }

        [HttpPost]
        public object GetListLectureByCategory(int categoryCode)
        {
            var data = _context.EduLectures.Where(x => x.published == true && x.cat_id.Equals(categoryCode)).Select(x => new EduCategory { Id = x.id, Name = x.title }).ToList();
            return data;
        }

        [HttpPost]
        public object GetListQuestionByLecture(int lectureCode)
        {
            var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Name = x.Title, x.JsonData }).ToList();
            return data;
        }

        [HttpPost]
        public object GetListQuestion()
        {
            var data = _context.QuizPools.Where(x => !x.IsDeleted).Select(x => new { Code = x.Code, Name = x.Title, x.JsonData }).ToList();
            return data;
        }

        #endregion

        #region Model
        public class QuizJTableModel : JTableModel
        {
            public string Title { get; set; }
            public string PostFromDate { get; set; }
            public string PostToDate { get; set; }
            public string CreFromDate { get; set; }
            public string CreToDate { get; set; }
            public int? Category { get; set; }
        }

        public class LectureRelativeModel
        {
            public string Code { get; set; }
            public string Name { get; set; }
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