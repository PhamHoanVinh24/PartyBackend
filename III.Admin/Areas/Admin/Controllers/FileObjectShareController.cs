using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.Extensions.Options;
using III.Admin.Controllers;
using III.Domain.Enums;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using ESEIM;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class FileObjectShareController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly IStringLocalizer<FileObjectShareController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;

        public IActionResult Index()
        {
            return View();
        }
        public FileObjectShareController(EIMDBContext context, IUploadService upload, IOptions<AppSettings> appSettings, 
            IStringLocalizer<FileObjectShareController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _appSettings = appSettings.Value;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }

        [HttpGet]
        public object GetListFileWithObject(string objectCode, string objectType)
        {
            try
            {
                var query = (from a in _context.EDMSRepoCatFiles.Where(x => x.ObjectCode == objectCode && x.ObjectType == objectType)
                             join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                             select new
                             {
                                 Id = b.FileID,
                                 b.FileName,
                                 b.FileCode,
                             }).AsNoTracking();
                return Json(query);
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet]
        public object GetListObjectTypeShare()
        {
            var list = new List<Properties>();
            var project = new Properties
            {
                Code = EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project),
                Name = ProjectEnum.Project.DescriptionAttr()
            };
            list.Add(project);

            var contract = new Properties
            {
                Code = EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract),
                Name = ContractEnum.Contract.DescriptionAttr()
            };
            list.Add(contract);

            var Customer = new Properties
            {
                Code = EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer),
                Name = CustomerEnum.Customer.DescriptionAttr()
            };
            list.Add(Customer);

            var Supplier = new Properties
            {
                Code = EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier),
                Name = SupplierEnum.Supplier.DescriptionAttr()
            };
            list.Add(Supplier);
            return Json(list);
        }

        [HttpGet]
        public object GetListObjectCode(string objectCode, string objectType)
        {
            try
            {
                IQueryable listFileCode = null;
                if (objectType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project))
                {
                    listFileCode = GetListProject(objectCode);
                    return Json(listFileCode);
                }
                else if (objectType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract))
                {
                    listFileCode = GetListContract(objectCode);
                    return Json(listFileCode);
                }
                else if (objectType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer))
                {
                    listFileCode = GetListCustommer(objectCode);
                    return Json(listFileCode);
                }
                else if (objectType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier))
                {
                    listFileCode = GetListSupplier(objectCode);
                    return Json(listFileCode);
                }
                else
                {
                    return Json("");
                }
            }
            catch (Exception ex)
            {

                throw ex;
            }
        }

        [HttpGet]
        public object GetListObjectShare(string objectCodeShared, string objectTypeShared, string objectCode, string objectType, string fileCode)
        {
            var query = (from a in _context.EDMSObjectShareFiles
                         join b in _context.EDMSFiles on a.FileCode equals b.FileCode
                         where a.ObjectCodeShared == objectCodeShared && a.ObjectTypeShared == objectTypeShared
                         && (string.IsNullOrEmpty(objectCode) || a.ObjectCode == objectCode)
                         && (string.IsNullOrEmpty(objectType) || a.ObjectType == objectType)
                         && (string.IsNullOrEmpty(fileCode) || a.FileCode == fileCode)
                         select new JtableModelShareFile
                         {
                             Id = a.Id,
                             FileName = b.FileName,
                             ObjectCode = a.ObjectCode,
                             ObjectType = a.ObjectType,
                         }).AsNoTracking().ToList();
            foreach (var item in query)
            {
                var obj = GetObjectName(item.ObjectCode, item.ObjectType);
                item.ObjectTypeName = obj.objectTypeName;
                item.ObjectName = obj.objectName;
            }
            return query;
        }

        [HttpPost]
        public JsonResult InsertFileShare([FromBody]EDMSObjectShareFile obj)
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                var fileShare = _context.EDMSObjectShareFiles.FirstOrDefault(x => x.ObjectCode.Equals(obj.ObjectCode) && x.ObjectCodeShared.Equals(obj.ObjectCodeShared) && x.FileCode == obj.FileCode);
                if (fileShare == null)
                {
                    obj.CreatedBy = ESEIM.AppContext.UserName;
                    obj.CreatedTime = DateTime.Now;
                    _context.EDMSObjectShareFiles.Add(obj);
                    _context.SaveChanges();
                    msg.Title = CommonUtil.ResourceValue("Chia sẻ tệp thành công !");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = CommonUtil.ResourceValue("Đối tượng đã được chia sẻ !");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex.Message;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [HttpGet]
        public JsonResult DeleteObjectShare(int id)
        {
            var msg = new JMessage();
            try
            {
                var fileShare = _context.EDMSObjectShareFiles.FirstOrDefault(x => x.Id.Equals(id));
                if (fileShare != null)
                {
                    _context.EDMSObjectShareFiles.Remove(fileShare);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = CommonUtil.ResourceValue("Đã tắt chia sẻ tệp thành công !");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = CommonUtil.ResourceValue("Không tìm thấy tệp !");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [NonAction]
        public IQueryable<FileShareObj> GetListContract(string objectCode)
        {
            try
            {
                var query = from a in _context.PoSaleHeaders
                            where !a.IsDeleted && a.ContractCode != objectCode
                            orderby a.ContractHeaderID descending
                            select new FileShareObj
                            {
                                ObjCode = a.ContractCode,
                                ObjName = a.Title
                            };
                return query;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [NonAction]
        public IQueryable<FileShareObj> GetListProject(string objectCode)
        {
            try
            {
                var query = from a in _context.Projects
                            where !a.FlagDeleted && a.ProjectCode != objectCode
                            orderby a.Id descending
                            select new FileShareObj
                            {
                                ObjCode = a.ProjectCode,
                                ObjName = a.ProjectTitle
                            };
                return query;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [NonAction]
        public IQueryable<FileShareObj> GetListSupplier(string objectCode)
        {
            try
            {
                var query = from a in _context.Suppliers
                            where !a.IsDeleted && a.SupCode != objectCode
                            orderby a.SupID descending
                            select new FileShareObj
                            {
                                ObjCode = a.SupCode,
                                ObjName = a.SupName
                            };
                return query;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [NonAction]
        public IQueryable<FileShareObj> GetListCustommer(string objectCode)
        {
            try
            {
                var query = from a in _context.Customerss
                            where !a.IsDeleted && a.CusCode != objectCode
                            orderby a.CusID descending
                            select new FileShareObj
                            {
                                ObjCode = a.CusCode,
                                ObjName = a.CusName
                            };
                return query;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [NonAction]
        public (string objectName, string objectTypeName) GetObjectName(string objCode, string objType)
        {
            var objectName = "";
            var objectTypeName = "";
            if (objType == EnumHelper<ProjectEnum>.GetDisplayValue(ProjectEnum.Project))
            {
                objectName = _context.Projects.FirstOrDefault(x => x.ProjectCode == objCode)?.ProjectTitle;
                objectTypeName = ProjectEnum.Project.DescriptionAttr();
            }
            else if (objType == EnumHelper<ContractEnum>.GetDisplayValue(ContractEnum.Contract))
            {
                objectName = _context.PoSaleHeaders.FirstOrDefault(x => x.ContractCode == objCode)?.Title;
                objectTypeName = ContractEnum.Contract.DescriptionAttr();
            }
            else if (objType == EnumHelper<CustomerEnum>.GetDisplayValue(CustomerEnum.Customer))
            {
                objectName = _context.Customerss.FirstOrDefault(x => x.CusCode == objCode)?.CusName;
                objectTypeName = CustomerEnum.Customer.DescriptionAttr();
            }
            else if (objType == EnumHelper<SupplierEnum>.GetDisplayValue(SupplierEnum.Supplier))
            {
                objectName = _context.Suppliers.FirstOrDefault(x => x.SupCode == objCode)?.SupName;
                objectTypeName = SupplierEnum.Supplier.DescriptionAttr();
            }
            return (objectName, objectTypeName);
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
        public class FileShareObj
        {
            public string ObjCode { get; set; }
            public string ObjName { get; set; }
        }
        public class JtableModelShareFile
        {
            public int Id { get; set; }
            public string FileName { get; set; }
            public string ObjectType { get; set; }
            public string ObjectTypeName { get; set; }
            public string ObjectCode { get; set; }
            public string ObjectName { get; set; }
        }
    }
}