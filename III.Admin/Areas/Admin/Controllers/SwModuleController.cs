using ESEIM.Models;
using ESEIM.Utils;
using III.Admin.Controllers;
using III.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System;
using Syncfusion.EJ2.DocumentEditor;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace III.Admin.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class SwModuleController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IStringLocalizer<CMSDocumentController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public SwModuleController(EIMDBContext context, IStringLocalizer<CMSDocumentController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        public IActionResult Index()
        {
            return View();
        }

        #region action
        // lấy cây cha con theo bảng đầu mục dự án
        [HttpPost]
        [AllowAnonymous]
        public object GetTreeDataParent(string projectCode)
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.SwModuleResources.Where(x => x.ModuleCode == projectCode)
                    .OrderBy(x => x.Id);
                var dataOrder = GetSubTreeCategoryData(data.ToList(), null, new List<TreeViewResource>(), 0, 1);
                //return dataOrder;
                //var data = _context.ProjectItemPlans.GroupBy(x => x.Name).Select(x => x.First()).Where(d => d.ParentID == null);
                //var dataa = data.Distinct();
                msg.Object = dataOrder;

                msg.Error = false;
            }
            catch (Exception ex)
            {
                //msg.Title = "Get Parent Group fail ";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }
        // lấy cây từ node parentid
        [HttpPost]
        [AllowAnonymous]
        public object GetTreeInNode(string parentId)
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.SwModuleResources.OrderByDescending(x => x.Id).AsNoTracking();
                var dataOrder = GetSubTreeCategoryData(data.ToList(), parentId, new List<TreeViewResource>(), 0, 2);
                //return dataOrder;
                //var data = _context.ProjectItemPlans.GroupBy(x => x.Name).Select(x => x.First()).Where(d => d.ParentID == null);
                //var dataa = data.Distinct();
                msg.Object = dataOrder;

                msg.Error = false;
            }
            catch (Exception ex)
            {
                //msg.Title = "Get Parent Group fail ";
                msg.Title = _sharedResources["COM_MSG_ERR"];
            }

            return Json(msg);
        }
        // hàm đệ quy lấy cây, thay ProjectItemPlan = model tương ứng
        [NonAction]
        private List<TreeViewResource> GetSubTreeCategoryData(List<SwModuleResource> data, string parentId, List<TreeViewResource> lstCategories, int tab, int typeOrder)
        {
            //tab += "- ";
            var contents = string.IsNullOrEmpty(parentId)
                ? (typeOrder == 1 ? data.Where(x => x.ParentModule == null || x.ParentModule == "")
                .OrderBy(x => x.Id).AsParallel() : data.Where(x => x.ParentModule == null || x.ParentModule == "")
                .OrderByDescending(x => x.Id).AsParallel())
                : data.Where(x => x.ParentModule == parentId).OrderByDescending(x => x.Id).AsParallel();
            foreach (var item in contents)
            {
                var category = new TreeViewResource
                {
                    Id = item.Id,
                    Code = item.ModuleCode,
                    Title = item.ModuleTitle,
                    Level = tab,
                    HasChild = data.Any(x => x.ParentModule == item.ModuleCode),
                    ParentCode = string.IsNullOrEmpty(item.ParentModule) ? null : item.ParentModule,
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeCategoryData(data, item.ModuleCode, lstCategories, tab + 1, 1);
            }
            return lstCategories;
        }
        [HttpPost]
        [AllowAnonymous]
        public object GetListModule(string moduleCode)
        {
            var msg = new JMessage() { Error = false };
            var item = _context.SwModuleResources.Where(x => string.IsNullOrEmpty(moduleCode) || x.ParentModule != moduleCode).Select(x => new
            {
                Code = x.ModuleCode,
                Name = x.ModuleTitle
            }).ToList();

            if (item != null)
            {
                msg.Object = item;
            }
            else
            {
                msg.Title = "Không tìm thấy";
                msg.Error = true;
            }
            //var data = _context.cms_items.FirstOrDefault(x => x.id == id);
            return msg;
        }

        [HttpPost]
        [AllowAnonymous]
        public object GetItem(int id)
        {
            var msg = new JMessage() { Error = false };
            var item = _context.SwModuleResources.FirstOrDefault(x => x.Id == id);

            if (item != null)
            {
                var obj = new ModuleResourceModelView();
                obj.Description = item.Description;
                obj.ModuleTitle = item.ModuleTitle;
                obj.ModuleCode = item.ModuleCode;
                obj.Level = item.Level;
                obj.ParentModule = item.ParentModule;
                msg.Object = obj;
            }
            else
            {
                msg.Title = "Không tìm thấy";
                msg.Error = true;
            }
            //var data = _context.cms_items.FirstOrDefault(x => x.id == id);
            return msg;
        }

        [HttpPost]
        [AllowAnonymous]
        public object Insert([FromBody] ModuleResourceModelView data)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data2 = _context.SwModuleResources.FirstOrDefault(x => x.ModuleCode == data.ModuleCode);
                if (data2 != null)
                {
                    msg.Error = true;
                    msg.Title = "Module đã tồn tại";
                    return msg;
                }

                var obj = new SwModuleResource()
                {
                    CreatedBy = ESEIM.AppContext.UserName,
                    CreatedTime = DateTime.Now
                };

                obj.ModuleCode = data.ModuleCode;
                obj.ParentModule = data.ParentModule == "" ? null : data.ParentModule;
                obj.Level = data.Level;
                obj.ModuleTitle = data.ModuleTitle;
                obj.Description = data.Description;

                _context.SwModuleResources.Add(obj);
                _context.SaveChanges();
                msg.Title = msg.Title = "Thêm thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Title = "Thêm thất bại";
            }
            return msg;
        }

        [HttpPost]
        [AllowAnonymous]
        public object Update([FromBody] ModuleResourceModelView data)
        {
            var msg = new JMessage() { Error = false };
            {
                try
                {
                    var obj = _context.SwModuleResources.FirstOrDefault(x => x.ModuleCode == data.ModuleCode);
                    if (obj == null)
                    {
                        msg.Error = true;
                        msg.Title = "COM_MSG_NOT_EXITS"; //danh mục không tồn tại trong hệ thống
                    }
                    else
                    {
                        obj.ModuleCode = data.ModuleCode;
                        obj.ParentModule = data.ParentModule == "" ? null : data.ParentModule;
                        obj.Level = data.Level;
                        obj.ModuleTitle = data.ModuleTitle;
                        obj.Description = data.Description;
                        obj.UpdatedBy = ESEIM.AppContext.UserName;
                        obj.UpdatedTime = DateTime.Now;

                        _context.SwModuleResources.Update(obj);
                        _context.SaveChanges();
                        // msg.Title = String.Format(CommonUtil.ResourceValue("Cập nhật danh mục thành công")); //Cập nhật thành công
                        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["CMS_CAT_LBL_CATEGORY"]);
                    }
                    return Json(msg);

                }
                catch (Exception ex)
                {
                    msg.Error = true;
                    msg.Title = _sharedResources["COM_MSG_ERR"];
                    return Json(msg);
                }

            }

        }


        [HttpPost]
        public object Delete(int id)
        {
            //var a = _context.cms_items.Where(x => x.id.ToString().Equals(id)).FirstOrDefault();
            //var a = _context.cms_items.Where(x => x.id == id).FirstOrDefault();
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.SwModuleResources.FirstOrDefault(x => x.Id == id);
                //data.trash = true;
                //_context.cms_items.Update(data);
                _context.SwModuleResources.Remove(data);
                _context.SaveChanges();
                msg.Error = false;
                //msg.Title = String.Format(CommonUtil.ResourceValue("FCC_MSG_DELETE_DONE"));//"Xóa thành công";
                msg.Title = msg.Title = "Xóa văn bản thành công";
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = msg.Title = "Xóa văn bản thất bại";
                return Json(msg);
            }
        }

        #endregion
        public string Import(IFormCollection data)
        {
            if (data.Files.Count == 0)
                return null;
            Stream stream = new MemoryStream();
            IFormFile file = data.Files[0];
            int index = file.FileName.LastIndexOf('.');
            string type = index > -1 && index < file.FileName.Length - 1 ?
                file.FileName.Substring(index) : ".docx";
            file.CopyTo(stream);
            stream.Position = 0;

            WordDocument document = WordDocument.Load(stream, GetFormatType(type.ToLower()));
            //document.Save(streamSave);

            string sfdt = JsonConvert.SerializeObject(document);

            var outputStream = WordDocument.Save(sfdt, FormatType.Html);
            outputStream.Position = 0;
            StreamReader reader = new StreamReader(outputStream);
            string value = reader.ReadToEnd().ToString();
            return value;
        }

        internal static FormatType GetFormatType(string format)
        {
            if (string.IsNullOrEmpty(format))
                throw new System.NotSupportedException("EJ2 DocumentEditor does not support this file format.");
            switch (format.ToLower())
            {
                case ".dotx":
                case ".docx":
                case ".docm":
                case ".dotm":
                    return FormatType.Docx;
                case ".dot":
                case ".doc":
                    return FormatType.Doc;
                case ".rtf":
                    return FormatType.Rtf;
                case ".txt":
                    return FormatType.Txt;
                case ".xml":
                    return FormatType.WordML;
                default:
                    throw new System.NotSupportedException("EJ2 DocumentEditor does not support this file format.");
            }
        }
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
    public class ModuleResourceModelView
    {

        [StringLength(50)]
        public string ModuleCode { get; set; }

        [StringLength(50)]
        public string ModuleTitle { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public int Level { get; set; }

        [StringLength(255)]
        public string ParentModule { get; set; }

    }
}
