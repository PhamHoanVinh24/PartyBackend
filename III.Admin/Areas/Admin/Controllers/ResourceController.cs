using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using System.Globalization;
using Microsoft.Extensions.Localization;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using Microsoft.AspNetCore.Authorization;

namespace III.Admin.Controllers
{
    public class ResourceModel
    {
        public int Id { set; get; }
        public string Title { set; get; }
        public string Code { set; get; }
        public string ParentId { set; get; }
        public int? Ord { set; get; }
        public string Description { set; get; }
        //public int? GroupResourceId { get; set; }
        //public string GroupResourceTitle { get; set; }
        public string Path { get; set; }
        public string Api { get; set; }
        public string Function { get; set; }
        public bool Status { get; set; }
        public string Style { get; set; }
        public bool Scope { get; set; }
        public DateTime? CreateDate { get; set; }
        //public int TotalRow { set; get; }
    }
    public class JTableModelResourceCustom : JTableModel
    {
        public string Name { set; get; }
        public string Code { set; get; }
        public string Api { set; get; }
        public string Function { set; get; }
        public string Description { set; get; }
        public string FromDate { set; get; }
        public string ToDate { set; get; }

        public int? Id { set; get; }
    }
    [Area("Admin")]
    public class ResourceController : BaseController
    {
        private readonly EIMDBContext _context;

        private readonly ILogger _logger;
        private readonly IActionLogService _actionLog;
        private readonly IStringLocalizer<ResourceController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        public ResourceController(EIMDBContext context, IStringLocalizer<ResourceController> stringLocalizer, IStringLocalizer<SharedResources> sharedResources)
        {
            _context = context;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
        }
        //{
        //    _context = context;
        //    _logger = logger;
        //    _actionLog = actionLog;
        //}
        [Breadcrumb("ViewData.CrumbResource", AreaName = "Admin", FromAction = "Index", FromController = typeof(UserManageHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbUserManageHome"] = _sharedResources["COM_CRUMB_USER_MANAGE"];
            ViewData["CrumbResource"] = _sharedResources["COM_CRUMB_RESOURCE_WEB"];
            return View();
        }

        //[HttpPost]
        //public object GetAll([FromBody]AdGroupResource obj)
        //{
        //	//_logger.LogInformation(LoggingEvents.LogDb, "Get list resource");
        //	if (obj.Id <= 0)
        //	{
        //		//var rs = _context.AdResources.OrderBy(x => x.Ord).Select(x => new { x.Id, x.Title, x.Code, x.ParentId, x.GroupResourceId, x.Ord, x.Description, x.Path, API = "/function/demo-api", Function = "Chức năng thanh toán, chức năng bảo hiểm" }).AsNoTracking().ToList();
        //		var query = from x in _context.AdResources

        //					let func = (from a in _context.AdFunctions
        //								join b in _context.AdPrivileges on a.Id equals b.FunctionId
        //								where b.ResourceId == x.Id
        //								select new
        //								{
        //									a.Title
        //								})
        //					where x.Status
        //					select new
        //					{
        //						x.Id,
        //						x.Title,
        //						x.Code,
        //						x.ParentId,
        //						//x.GroupResourceId,
        //						x.Ord,
        //						x.Description,
        //						x.Path,
        //						x.Status,
        //						API = x.Api,
        //						Function = setString(String.Join("", func.AsNoTracking().ToList()))
        //					};
        //		var rs = query.OrderBy(x => x.Ord).AsNoTracking().ToList();
        //		return Json(rs);
        //	}
        //	else
        //	{
        //		//var rs = _context.AdResources.OrderBy(x => x.Ord).Select(x => new { x.Id, x.Title, x.Code, x.ParentId, x.GroupResourceId, x.Ord, x.Description, x.Path, API = "/function/demo-api", Function = "Chức năng thanh toán, chức năng bảo hiểm" }).Where(x => x.GroupResourceId == obj.Id).AsNoTracking().ToList();

        //		var query = from x in _context.AdResources

        //					let func = (from a in _context.AdFunctions
        //								join b in _context.AdPrivileges on a.Id equals b.FunctionId
        //								where b.ResourceId == x.Id
        //								select new
        //								{
        //									a.Title
        //								})
        //					where /*x.GroupResourceId == obj.Id && */x.Status
        //					select new
        //					{
        //						x.Id,
        //						x.Title,
        //						x.Code,
        //						x.ParentId,
        //						//x.GroupResourceId,
        //						x.Ord,
        //						x.Description,
        //						x.Path,
        //						x.Status,
        //						API = x.Api,
        //						Function = setString(String.Join("", func.AsNoTracking().ToList()))
        //					};
        //		var rs = query.OrderBy(x => x.Ord).AsNoTracking().ToList();
        //		return Json(rs);
        //	}
        //}

        //[HttpGet]
        //public object GetByNameAddParent(string name)
        //{
        //	//_logger.LogInformation(LoggingEvents.LogDb, "Get list resource");
        //	try
        //	{
        //		//List<ResourceModelCustom> listFullResource = new List<ResourceModelCustom>();
        //		//var listFull = new List<new { int Id, string Title, string Code, int ? ParentId, int GroupResourceId, int ? Ord, string Description, string Path, string API, string Function }
        //		//> ();
        //		//var listFullResource = new List<Object>();
        //		if (string.IsNullOrEmpty(name))
        //		{
        //			var query = from x in _context.AdResources

        //						let func = (from a in _context.AdFunctions
        //									join b in _context.AdPrivileges on a.Id equals b.FunctionId
        //									where b.ResourceId == x.Id
        //									select new
        //									{
        //										a.Title
        //									})
        //						where x.Status
        //						select new
        //						{
        //							x.Id,
        //							x.Title,
        //							x.Code,
        //							x.ParentId,
        //							//x.GroupResourceId,
        //							x.Ord,
        //							x.Description,
        //							x.Path,
        //							API = x.Api,
        //							x.Status,
        //							Function = setString(String.Join("", func.AsNoTracking().ToList()))
        //						};
        //			var rs = query.OrderBy(x => x.Ord).AsNoTracking().ToList();
        //			//foreach (var resource in rs)
        //			//{
        //			//    listFullResource.Add(new { Id = resource.Id, Title = resource.Title, Code = resource.Code, ParentId = resource.ParentId, GroupResourceId = resource.GroupResourceId, Ord = resource.Ord, Description = resource.Description, Path = resource.Path, API = resource.API, Function = resource.Function });
        //			//}
        //			return Json(rs);
        //		}
        //		else
        //		{
        //			var query = from x in _context.AdResources

        //						let func = (from a in _context.AdFunctions
        //									join b in _context.AdPrivileges on a.Id equals b.FunctionId
        //									where b.ResourceId == x.Id
        //									select new
        //									{
        //										a.Title
        //									})
        //						where x.Title.ToLower().Contains(name.ToLower()) && x.Status
        //						select new
        //						{
        //							x.Id,
        //							x.Title,
        //							x.Code,
        //							x.ParentId,
        //							//x.GroupResourceId,
        //							x.Ord,
        //							x.Description,
        //							x.Path,
        //							API = x.Api,
        //							x.Status,
        //							Function = setString(String.Join("", func.AsNoTracking().ToList()))
        //						};
        //			var rs = query.OrderBy(x => x.Ord).AsNoTracking().ToList();
        //			var listResourceAdd = new List<Object>();
        //			List<int> listParentTreeId = new List<int>();
        //			foreach (var item in rs)
        //			{
        //				GetParentTreeId(item.Id, listParentTreeId);
        //			}
        //			List<int> listTreeId = GetlistTreeId(listParentTreeId);
        //			foreach (var id in listTreeId)
        //			{
        //				var query1 = from x in _context.AdResources

        //							 let func = (from a in _context.AdFunctions
        //										 join b in _context.AdPrivileges on a.Id equals b.FunctionId
        //										 where b.ResourceId == x.Id
        //										 select new
        //										 {
        //											 a.Title
        //										 })
        //							 where x.Id == id && x.Status
        //							 select new
        //							 {
        //								 x.Id,
        //								 x.Title,
        //								 x.Code,
        //								 x.ParentId,
        //								 //x.GroupResourceId,
        //								 x.Ord,
        //								 x.Description,
        //								 x.Path,
        //								 API = x.Api,
        //								 x.Status,
        //								 Function = setString(String.Join("", func.AsNoTracking().ToList()))
        //							 };
        //				var resource = query1.AsNoTracking().SingleOrDefault();
        //				listResourceAdd.Add(new { Id = resource.Id, Title = resource.Title, Code = resource.Code, ParentId = resource.ParentId, /*GroupResourceId = resource.GroupResourceId, */Ord = resource.Ord, Description = resource.Description, Path = resource.Path, API = resource.API, Status = resource.Status, Function = resource.Function });
        //			}
        //			return Json(listResourceAdd);
        //		}
        //	}
        //	catch (Exception ex)
        //	{
        //		var msg = new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_LOAD_FAIL"), _stringLocalizer["DATA").ToLower()), Object = ex };
        //		//_logger.LogInformation(LoggingEvents.LogDb, "Get list function fail");
        //		return Json(msg);
        //	}
        //}

        //private List<int> GetParentTreeId(int? id, List<int> listParentTreeId)
        //{
        //	if (id != null)
        //	{
        //		var resource = _context.AdResources.Where(x => x.Status).SingleOrDefault(x => x.Id == id);
        //		if (resource != null)
        //		{
        //			listParentTreeId.Add((int)id);
        //			GetParentTreeId(resource.ParentId, listParentTreeId);
        //		}
        //	}
        //	return listParentTreeId;
        //}

        //Delete Duplicate Id in list
        //private List<int> GetlistTreeId(List<int> listTreeId)
        //{
        //	List<int> noDupes = listTreeId.Distinct().ToList();
        //	return noDupes;
        //}
        //[HttpGet]
        //public object GetGroupResource()
        //{
        //    var rs = _context.AdGroupResources.OrderBy(x => x.Id).AsNoTracking().ToList();
        //    return Json(rs);
        //}

        [HttpPost]
        public object JTable([FromBody]JTableModelResourceCustom jTablePara)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Get list Resource");
            ////_actionLog.InsertActionLog("AdResource", "Get list Resource", null, null, "JTable");

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            // Hiển thị treeView khi không có search
            if (jTablePara.QueryOrderBy == "Title " && string.IsNullOrEmpty(jTablePara.Name) && string.IsNullOrEmpty(jTablePara.Code) && string.IsNullOrEmpty(jTablePara.Api) && string.IsNullOrEmpty(jTablePara.Function) && string.IsNullOrEmpty(jTablePara.Description) && string.IsNullOrEmpty(jTablePara.FromDate) && string.IsNullOrEmpty(jTablePara.ToDate))
            {
                var query = from x in _context.AdResources
                                //join g in _context.AdGroupResources on x.GroupResourceId equals g.Id
                            let func = (from a in _context.AdFunctions
                                        join b in _context.AdPrivileges on a.FunctionCode equals b.FunctionCode
                                        where b.ResourceCode == x.ResourceCode
                                        select new
                                        {
                                            a.Title
                                        })
                            select new ResourceModel
                            {
                                Id = x.ResourceId,
                                Title = x.Title,
                                Code = x.ResourceCode,
                                ParentId = x.ParentCode,
                                Ord = x.Ord,
                                Description = x.Description,
                                //GroupResourceId = x.GroupResourceId,
                                //GroupResourceTitle = g.Title,
                                Path = x.Path,
                                Api = x.Api,
                                Status = x.Status,
                                Style = x.Style,
                                Scope = x.Scope,
                                CreateDate = x.CreatedDate,
                                Function = setString(String.Join("", func.AsNoTracking().ToList()))
                            };
                var data = query.OrderBy(x => x.Title).AsNoTracking();
                var sortData = data.OrderUsingSortExpression(jTablePara.QueryOrderBy).ToList();
                var listResource = sortData as IList<ResourceModel> ?? sortData.ToList();

                var result = new List<ResourceModel>();
                foreach (var resour in listResource.Where(x => x.ParentId == null))
                {
                    var resource = new ResourceModel();
                    resource.Id = resour.Id;
                    resource.Title = resour.Title;
                    resource.Code = resour.Code;
                    resource.ParentId = resour.ParentId;
                    resource.Ord = resour.Ord;
                    resource.Description = resour.Description;
                    //resource.GroupResourceId = resour.GroupResourceId;
                    //resource.GroupResourceTitle = resour.GroupResourceTitle;
                    resource.Path = resour.Path;
                    resource.Api = resour.Api;
                    resource.Style = resour.Style;
                    resource.Scope = resour.Scope;
                    resource.Status = resour.Status;
                    resource.CreateDate = resour.CreateDate;
                    resource.Function = resour.Function;
                    result.Add(resource);
                    result = result.Concat(GetResourceChild(listResource, resour.Code, ". . . ")).ToList();
                }
                var count = result.Count();
                var res = result.Skip(intBeginFor).Take(jTablePara.Length).ToList();
                var jdata = JTableHelper.JObjectTable(res, jTablePara.Draw, count, "Id", "Title", "Code", "ParentId", "CreateDate", "Ord", "Description", "Path", "Api", "Status", "Function", "Style", "Scope");
                return Json(jdata);
            }
            // Hiển thị bảng khi có search
            else
            {
                DateTime fromDate = string.IsNullOrEmpty(jTablePara.FromDate) ? DateTime.ParseExact("01/01/1900", "dd/MM/yyyy", CultureInfo.InvariantCulture) : DateTime.ParseExact(jTablePara.FromDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                DateTime toDate = string.IsNullOrEmpty(jTablePara.ToDate) ? DateTime.Now : DateTime.ParseExact(jTablePara.ToDate, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                var query = from x in _context.AdResources
                                //join g in _context.AdGroupResources on x.GroupResourceId equals g.Id
                            let func = (from a in _context.AdFunctions
                                        join b in _context.AdPrivileges on a.FunctionCode equals b.FunctionCode
                                        where b.ResourceCode == x.ResourceCode
                                        //&& (string.IsNullOrEmpty(jTablePara.Function) || a.Title.ToLower().Contains(jTablePara.Function.ToLower()))
                                        select new { a.Title })
                            where (string.IsNullOrEmpty(jTablePara.Name) || x.Title.ToLower().Contains(jTablePara.Name.ToLower()))
                                    && (string.IsNullOrEmpty(jTablePara.Code) || x.ResourceCode.ToLower().Contains(jTablePara.Code.ToLower()))
                                    && (string.IsNullOrEmpty(jTablePara.Api) || x.Api.ToLower().Contains(jTablePara.Api.ToLower()))
                                    && (string.IsNullOrEmpty(jTablePara.Description) || x.Description.ToLower().Contains(jTablePara.Description.ToLower()))
                                    && ((jTablePara.FromDate == null && jTablePara.ToDate == null) || (x.CreatedDate >= fromDate && x.CreatedDate <= toDate))
                                    //&& (string.IsNullOrEmpty(jTablePara.Function) || x.Privileges.Any(y => y.Function.Title.ToLower().Contains(jTablePara.Function.ToLower())))
                                    && (string.IsNullOrEmpty(jTablePara.Function) || func.Any(y => y.Title.ToLower().Contains(jTablePara.Function.ToLower())))
                            select new ResourceModel
                            {
                                Id = x.ResourceId,
                                Title = x.Title,
                                Code = x.ResourceCode,
                                ParentId = x.ParentCode,
                                Ord = x.Ord,
                                Description = x.Description,
                                //GroupResourceId = x.GroupResourceId,
                                //GroupResourceTitle = g.Title,
                                Path = x.Path,
                                Api = x.Api,
                                Status = x.Status,
                                Style = x.Style,
                                Scope = x.Scope,
                                CreateDate = x.CreatedDate,
                                //Function = setString(String.Join("", x.Privileges.Select(y => y.Function.Title).ToList()))
                                Function = setString(String.Join("", func.AsNoTracking().ToList()))
                            };
                //var sql = query.ToSql();
                //var data = query.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking();
                var count = query.Count();
                var res = query.Skip(intBeginFor).Take(jTablePara.Length).OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking().ToList();
                var jdata = JTableHelper.JObjectTable(res, jTablePara.Draw, count, "Id", "Title", "Code", "ParentId", "CreateDate", "Ord", "Description", "Path", "Api", "Status", "Function", "Style", "Scope");
                return Json(jdata);
            }
        }

        private String setString(String value)
        {
            char[] delimiters = new char[] { '{', '}', '=' };
            String rs = "";
            rs = String.Join("", value.Split(delimiters, StringSplitOptions.RemoveEmptyEntries));
            String[] delimitersString = { "Title" };
            List<String> a = rs.Split(delimitersString, StringSplitOptions.RemoveEmptyEntries).ToList();
            a.RemoveAll(item => item == " ");
            rs = String.Join(", ", a);
            return rs;
        }

        private static List<ResourceModel> GetResourceChild(IList<ResourceModel> listResource, string parentId, string level)
        {
            var result = new List<ResourceModel>();
            var query = from resour in listResource
                        where resour.ParentId == parentId
                        orderby resour.Title
                        select new ResourceModel
                        {
                            Id = resour.Id,
                            Title = level + resour.Title,
                            Code = resour.Code,
                            ParentId = resour.ParentId,
                            Ord = resour.Ord,
                            Description = resour.Description,
                            //GroupResourceId = resour.GroupResourceId,
                            //GroupResourceTitle = resour.GroupResourceTitle,
                            Path = resour.Path,
                            Api = resour.Api,
                            Style = resour.Style,
                            Scope = resour.Scope,
                            Status = resour.Status,
                            Function = resour.Function
                        };

            var listResour = query as IList<ResourceModel> ?? query.ToList();
            foreach (var rs in listResour)
            {
                result.Add(rs);
                var destination = GetResourceChild(listResource, rs.Code, level + ". . . ");
                result = result.Concat(destination).ToList();
            }
            return result;
        }

        [HttpPost]
        public object JTableFunctionByResourceId([FromBody]JTableModelResourceCustom jTablePara)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Get list function of Resource");
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from x in _context.AdFunctions
                        join app in _context.AdPrivileges on x.FunctionCode equals app.FunctionCode
                        where app.ResourceCode == jTablePara.Code
                        select new AdFunction
                        {
                            FunctionId = x.FunctionId,
                            Title = x.Title,
                            FunctionCode = x.FunctionCode,
                            ParentCode = x.ParentCode,
                            Ord = x.Ord,
                            Description = x.Description
                        };
            var data = query.AsNoTracking();//.OrderUsingSortExpression(jTablePara.QueryOrderBy).AsNoTracking();
            var count = data.Count();
            var res = jTablePara.Length > 0 ? data.Skip(intBeginFor).Take(jTablePara.Length).ToList() : data.ToList();
            var jdata = JTableHelper.JObjectTable(res, jTablePara.Draw, count, "FunctionId", "Title", "FunctionCode", "ParentCode", "Ord", "Description");
            return Json(jdata);
        }


        //// Get table when using tree View
        //[HttpPost]
        //public object JTableFunctionByResourceId([FromBody]JTableModelResourceCustom jTablePara)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Get list function of Resource");
        //    int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
        //    var query = from x in _context.AdFunctions
        //                join app in _context.AdPrivileges on x.Id equals app.FunctionId
        //                where app.ResourceId == jTablePara.Id
        //                select new FunctionModel
        //                {
        //                    Id = x.Id,
        //                    Title = x.Title,
        //                    Code = x.Code,
        //                    ParentId = x.ParentId,
        //                    Ord = x.Ord,
        //                    Description = x.Description
        //                };
        //    var data = query.OrderBy(x => x.Title).AsNoTracking();
        //    var listFunction = data as IList<FunctionModel> ?? data.ToList();

        //    var result = new List<FunctionModel>();
        //    foreach (var func in listFunction.Where(x => x.ParentId == null).OrderBy(x => x.Title))
        //    {
        //        var function = new FunctionModel();
        //        function.Id = func.Id;
        //        function.Title = func.Title;
        //        function.Code = func.Code;
        //        function.ParentId = func.ParentId;
        //        function.Ord = func.Ord;
        //        function.Description = func.Description;
        //        result.Add(function);
        //        result = result.Concat(GetFunctionChild(listFunction, func.Id, ". . . ")).ToList();
        //    }
        //    var count = result.Count();
        //    var res = result.Skip(intBeginFor).Take(jTablePara.Length).ToList();
        //    var jdata = JTableHelper.JObjectTable(res, jTablePara.Draw, count, "Id", "Title", "Code", "ParentId", "Ord", "Description");
        //    return Json(jdata);
        //}

        //private static List<FunctionModel> GetFunctionChild(IList<FunctionModel> listFunction, int parentId, string level)
        //{
        //    var result = new List<FunctionModel>();
        //    var query = from func in listFunction
        //                where func.ParentId == parentId
        //                orderby func.Title
        //                select new FunctionModel
        //                {
        //                    Id = func.Id,
        //                    Title = level + func.Title,
        //                    Code = func.Code,
        //                    ParentId = func.ParentId,
        //                    Ord = func.Ord,
        //                    Description = func.Description,
        //                };

        //    var listFunc = query as IList<FunctionModel> ?? query.ToList();
        //    foreach (var func in listFunc)
        //    {
        //        result.Add(func);
        //        var destination = GetFunctionChild(listFunction, func.Id, level + ". . . ");
        //        result = result.Concat(destination).ToList();
        //    }
        //    return result;
        //}


        [HttpPost]
        public object DeletePrivilege([FromBody]AdPrivilege obj)
        {
            try
            {
                //_logger.LogInformation(LoggingEvents.LogDb, "Delete Function of Resource");
                ////_actionLog.InsertActionLog("AdPrivilege", "Delete Function of Resource", null, null, "JTable");

                //var dataFunction = _context.AdFunctions.Where(p => p.ParentCode == obj.FunctionCode).AsNoTracking().ToList();
                //if (dataFunction.Count > 0)
                //{
                //    foreach (var items in dataFunction)
                //    {
                //        var privilege = _context.AdPrivileges
                //            .Where(p => p.FunctionCode == items.FunctionCode && p.ResourceCode == obj.ResourceCode)
                //            .AsNoTracking().SingleOrDefault();
                //        if (privilege != null)
                //        {
                //            //_logger.LogError(LoggingEvents.LogDb, "Delete function fail");
                //            //_actionLog.InsertActionLog("AdPrivilege", "Delete function fail", null, null, "Error");

                //            return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_CHILD"), _stringLocalizer["FUNCTION")) });
                //        }
                //    }
                //}

                //_logger.LogInformation(LoggingEvents.LogDb, "Delete Function of Resource");

                var privilegeDel = _context.AdPrivileges.FirstOrDefault(p => p.ResourceCode == obj.ResourceCode && p.FunctionCode == obj.FunctionCode);
                if (privilegeDel != null)
                {
                    _context.Remove(privilegeDel);
                    _context.SaveChanges();

                    //_actionLog.InsertActionLog("AdPrivilege", "Delete function successfully", obj, null, "Error");
                }
                //_logger.LogInformation(LoggingEvents.LogDb, "Delete function successfully");

                return Json(new JMessage() { Error = false, Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["FUNCTION"]) });
            }
            catch (Exception ex)
            {
                //_logger.LogError(LoggingEvents.LogDb, "Delete function fail");
                //_actionLog.InsertActionLog("AdPrivilege", "Delete function fail", null, null, "Error");

                return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"], _stringLocalizer["FUNCTION"]) });
            }
        }

        //// Require Delete child first.
        //[HttpPost]
        //public object DeletePrivilege([FromBody]AdPrivilege obj)
        //{
        //    try
        //    {
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Delete Function of Resource");
        //        var dataFunction = _context.AdFunctions
        //            .Where(p => p.ParentId == obj.FunctionId).AsNoTracking().ToList();
        //        if (dataFunction.Count > 0)
        //        {
        //            foreach (var items in dataFunction)
        //            {
        //                var privilege = _context.AdPrivileges
        //                    .Where(p => p.FunctionId == items.Id && p.ResourceId == obj.ResourceId)
        //                    .AsNoTracking().SingleOrDefault();
        //                if (privilege != null)
        //                {
        //                    //_logger.LogError(LoggingEvents.LogDb, "Delete function fail");
        //                    return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_CHILD"), _stringLocalizer["FUNCTION")) });
        //                }
        //            }
        //        }

        //        var privilegeDel = _context.AdPrivileges
        //            .Where(p => p.ResourceId == obj.ResourceId && p.FunctionId == obj.FunctionId)
        //            .AsNoTracking().SingleOrDefault();
        //        _context.AdPrivileges.Attach(privilegeDel);
        //        _context.AdPrivileges.Remove(privilegeDel);

        //        _context.SaveChanges();
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Delete function successfully");
        //        return Json(new JMessage() { Error = false, Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"), _stringLocalizer["FUNCTION")) });
        //    }
        //    catch (Exception ex)
        //    {
        //        //_logger.LogError(LoggingEvents.LogDb, "Delete function fail");
        //        return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"), _stringLocalizer["FUNCTION")) });
        //    }
        //}


        [HttpPost]
        public JsonResult Insert([FromBody]AdResource obj)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Add resource");
            var msg = new JMessage() { Error = false };
            if (checkExistAPI(0, obj.Api))
            {
                msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"], _stringLocalizer["API"]);
                msg.Error = true;
                //_logger.LogError(LoggingEvents.LogDb, "Add resource fail");
                ////_actionLog.InsertActionLog("AdResource", "Add resource fail", null, null, "Error");

                return Json(msg);
            }
            try
            {
                //            _context.AdResources.Add(obj);
                //            var a = _context.SaveChanges();
                //            msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"), _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"));
                //            //_logger.LogInformation(LoggingEvents.LogDb, "Add resource successfully");
                ////_actionLog.InsertActionLog("AdResource", "Add resource successfully", null, obj, "Insert");


                var resource = _context.AdResources.FirstOrDefault(x => x.ResourceCode == obj.ResourceCode);
                if (resource == null)
                {
                    obj.CreatedDate = DateTime.Now;
                    _context.AdResources.Add(obj);
                    var b = _context.SaveChanges();
                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]);
                    //_actionLog.InsertActionLog("AdResource", "Add resource successfully", null, obj, "Insert");
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"], _stringLocalizer["ADM_RESOURCE_CURD_LBL_RESOURCE_CODE"]);
                    //_actionLog.InsertActionLog("AdResource", "Add resource fail", null, null, "Error");
                    return Json(msg);
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                try
                {
                    if (ex.InnerException.Data["HelpLink.EvtID"].ToString() == "2627")
                    {
                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAIL"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]);
                        //_logger.LogError(LoggingEvents.LogDb, "Add resource fail");
                        //_actionLog.InsertActionLog("AdResource", "An error occurred while Add resource", null, null, "Error");

                        return Json(msg);
                    }
                }
                catch (Exception e)
                {

                }
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update([FromBody]AdResource obj)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Update resource");
            var msg = new JMessage() { Error = false };
            if (checkExistAPI(obj.ResourceId, obj.Api))
            {
                msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"], _stringLocalizer["API"]);
                msg.Error = true;
                //_logger.LogError(LoggingEvents.LogDb, "Update resource fail");
                //_actionLog.InsertActionLog("AdResource", "Update resource fail", null, null, "Error");

                return Json(msg);
            }
            try
            {
                var objUpdate = _context.AdResources.SingleOrDefault(x => x.ResourceCode == obj.ResourceCode);
                var objOld = CommonUtil.Clone(objUpdate);
                if (objUpdate.ResourceCode != obj.ResourceCode)
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_ERR_CODE_CHANGE"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]);
                    //_logger.LogError(LoggingEvents.LogDb, "Update resource fail");
                    //_actionLog.InsertActionLog("AdResource", "Update resource fail", null, null, "Error");

                }
                else
                {
                    if (obj.Status == true)
                    {
                        var parentResource = _context.AdResources.FirstOrDefault(x => x.ResourceCode == obj.ParentCode && x.Status == false);
                        if (parentResource != null)
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_sharedResources["COM_MSG_ACTIVE_PARENT"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]);
                            //_logger.LogError(LoggingEvents.LogDb, "Update resource fail");
                            //_actionLog.InsertActionLog("AdResource", "Update resource fail", null, null, "Error");

                        }
                        else
                        {
                            objUpdate.Title = obj.Title;
                            objUpdate.ParentCode = obj.ParentCode;
                            objUpdate.Ord = obj.Ord;
                            objUpdate.Path = obj.Path;
                            objUpdate.Api = obj.Api;
                            objUpdate.Description = obj.Description;
                            objUpdate.Style = obj.Style;
                            objUpdate.Scope = obj.Scope;
                            objUpdate.Status = obj.Status;
                            objUpdate.UpdatedDate = DateTime.Now;
                            var a = _context.SaveChanges();
                            msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]);
                            //_logger.LogInformation(LoggingEvents.LogDb, "Update resource successfully");
                            //_actionLog.InsertActionLog("AdResource", "Update resource successfully", objOld, obj, "Update");

                        }
                    }
                    else
                    {
                        var childResource = _context.AdResources.Where(x => x.ParentCode == obj.ResourceCode && x.Status == true).AsNoTracking().ToList();
                        if (childResource.Count > 0)
                        {
                            msg.Error = true;
                            msg.Title = String.Format(_sharedResources["COM_MSG_DEACTIVE_CHILD"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]);
                            //_logger.LogError(LoggingEvents.LogDb, "Update resource fail");
                            //_actionLog.InsertActionLog("AdResource", "Update resource fail", null, null, "Error");

                        }
                        else
                        {
                            objUpdate.Title = obj.Title;
                            objUpdate.ParentCode = obj.ParentCode;
                            objUpdate.Ord = obj.Ord;
                            objUpdate.Path = obj.Path;
                            objUpdate.Api = obj.Api;
                            objUpdate.Description = obj.Description;
                            objUpdate.Style = obj.Style;
                            objUpdate.Scope = obj.Scope;
                            objUpdate.Status = obj.Status;
                            objUpdate.UpdatedDate = DateTime.Now;
                            var a = _context.SaveChanges();
                            msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]);
                            //_logger.LogInformation(LoggingEvents.LogDb, "Update resource successfully");
                            //_actionLog.InsertActionLog("AdResource", "Update resource successfully", objOld, obj, "Update");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                try
                {
                    if (ex.InnerException.Data["HelpLink.EvtID"].ToString() == "2627")
                    {
                        msg.Title = msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"], _stringLocalizer["CODE"]);//"Mã đã tồn tại trong hệ thống";
                                                                                                                           //_logger.LogError(LoggingEvents.LogDb, "Update resource fail");
                                                                                                                           //_actionLog.InsertActionLog("AdResource", "Update resource fail", null, null, "Error");

                        return Json(msg);
                    }
                }
                catch (Exception)
                {
                }

                msg.Error = true;
                //_logger.LogError(LoggingEvents.LogDb, "Update resource fail");
                //_actionLog.InsertActionLog("AdResource", "An error occurred while Update resource", null, null, "Error");

                msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]); //"Có lỗi khi sửa khoản mục";
            }
            return Json(msg);
        }
        [HttpPost]
        public object Delete([FromBody]int id)
        {
            //_logger.LogInformation(LoggingEvents.LogDb, "Delete resource");
            try
            {
                AdResource obj = _context.AdResources.FirstOrDefault(x => x.ResourceId == id);
                if (obj != null)
                {
                    var priv = _context.AdPrivileges.FirstOrDefault(x => x.ResourceCode == obj.ResourceCode);
                    var pms = _context.AdPermissions.FirstOrDefault(x => x.ResourceCode == obj.ResourceCode);
                    if (priv != null || pms != null)
                    {
                        //_actionLog.InsertActionLog("AdResource", "Delete resource fail", null, null, "Error");
                        return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_ERR_OBJ_REF"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]) });
                    }
                    else
                    {
                        _context.Remove(obj);
                        _context.SaveChanges();

                        //_logger.LogInformation(LoggingEvents.LogDb, "Delete resource successfully");
                        //_actionLog.InsertActionLog("AdResource", "Delete resource successfully", obj, null, "Delete");
                    }
                }

                return Json(new JMessage() { Error = false, Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"])/*; "Xóa khoản mục thành công."*/ });
            }
            catch (Exception ex)
            {
                //_logger.LogError(LoggingEvents.LogDb, "Delete resource fail");
                //_actionLog.InsertActionLog("AdResource", "Delete resource fail", null, null, "Error");

                return Json(new JMessage() { Error = true, Title = String.Format(_stringLocalizer["	COM_MSG_DELETE_FAIL"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"])/*"Có lỗi khi xóa khoản mục."*/, Object = ex.Message });
            }
        }

        [HttpPost]
        public object DeleteItems([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                //_logger.LogInformation(LoggingEvents.LogDb, "Delete list Resource");
                List<int> listId = new List<int>();
                List<int> listRef = new List<int>();
                List<int> listDel = new List<int>();
                List<int> listDelFinal = new List<int>();
                List<AdResource> listResource = new List<AdResource>();
                foreach (var id in listIdI)
                {
                    AdResource obj = _context.AdResources.FirstOrDefault(x => x.ResourceId == id);
                    if (obj != null)
                    {
                        var priv = _context.AdPrivileges.FirstOrDefault(x => x.ResourceCode == obj.ResourceCode);
                        var pms = _context.AdPermissions.FirstOrDefault(x => x.ResourceCode == obj.ResourceCode);
                        if (priv == null && pms == null)
                        {
                            listId.Add(id);
                        }
                    }
                }
                if (listId.Any())
                {
                    // Find list Id haven't child , this list can delete (list A)
                    foreach (var id in listId)
                    {
                        AdResource obj = _context.AdResources.FirstOrDefault(x => x.ResourceId == id);
                        if (obj != null)
                        {
                            var idRef = _context.AdResources.FirstOrDefault(x => x.ParentCode == obj.ResourceCode);
                            if (idRef == null)
                            {
                                listDel.Add(id);
                            }
                        }
                    }
                    if (listDel.Count == 0)
                    {
                        msg.Error = true;
                        msg.Title = String.Format(_sharedResources["COM_ERR_LIST_OBJ_HAS_CHILD"],
                            _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]);
                        //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource fail");
                        //_actionLog.InsertActionLog("AdResource", "Delete list Resource fail", null, null, "Error");

                    }
                    else
                    {
                        // Find final list Id (parent, grandparent,...) begin from (list A), this list can delete.
                        listDelFinal = listDelFinal.Concat(listDel).ToList();
                        foreach (var id in listDel)
                        {
                            var listAdd = FindParentInList(listId, id, new List<int>());
                            listDelFinal = listDelFinal.Concat(listAdd).ToList();
                        }
                        // Find list Id in selected list can't delete.
                        foreach (var id in listId)
                        {
                            if (!listDelFinal.Contains(id))
                            {
                                listRef.Add(id);
                            }
                        }
                        // case exist list can't delete.
                        if (listRef.Count > 0)
                        {
                            foreach (var idDel in listDelFinal)
                            {
                                AdResource objDel = _context.AdResources.FirstOrDefault(x => x.ResourceId == idDel);
                                if (objDel != null)
                                {
                                    listResource.Add(objDel);

                                    _context.Remove(objDel);
                                }
                            }
                            _context.SaveChanges();
                            msg.Error = true;
                            msg.Title = String.Format(_sharedResources["COM_DEL_SUCCESS_LIST_ITEM_BUT_HAS_CHILD"],
                                _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]);
                            //_logger.LogError(LoggingEvents.LogDb, "Delete part of the Resource list successfully");
                            _actionLog.InsertActionLogDeleteItem("AdResource", "Delete part of the Resource list successfully", listResource.ToArray(), null, "Delete");

                        }
                        // case full list parameter can delete.
                        else
                        {
                            foreach (var idDel in listDelFinal)
                            {
                                AdResource objDel = _context.AdResources.FirstOrDefault(x => x.ResourceId == idDel);
                                if (objDel != null)
                                {
                                    listResource.Add(objDel);

                                    _context.Remove(objDel);
                                }
                            }
                            _context.SaveChanges();
                            msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_LIST_SUCCESS"],
                                _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]);
                            //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource successfully");
                            _actionLog.InsertActionLogDeleteItem("AdResource", "Delete list Resource successfully", listResource.ToArray(), null, "Delete");

                        }
                    }
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_sharedResources["COM_ERR_LIST_OBJ_REF"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]);
                    //_logger.LogError(LoggingEvents.LogDb, "Delete list Function fail");
                    _actionLog.InsertActionLogDeleteItem("AdResource", "Delete list Resource fail", null, null, "Error");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(_sharedResources["COM_MSG_DELETE_LIST_FAIL"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]);
                //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource fail");
                _actionLog.InsertActionLogDeleteItem("AdResource", "An error occurred while Delete list Resource", null, null, "Error");

            }
            return Json(msg);
        }
        private List<int> FindParentInList(List<int> listId, int id, List<int> listParentId)
        {
            AdResource obj = _context.AdResources.FirstOrDefault(x => x.ResourceId == id);
            if (obj != null)
            {
                var parentObj = _context.AdResources.FirstOrDefault(x => x.ResourceCode == obj.ParentCode);
                if (parentObj != null && listId.Contains(parentObj.ResourceId))
                {
                    listParentId.Add(parentObj.ResourceId);
                    FindParentInList(listId, parentObj.ResourceId, listParentId);
                }
            }
            return listParentId;
        }

        [HttpPost]
        public JsonResult GetItem([FromBody]int id)
        {
            if (id <= 0)
            {
                return Json("");
            }
            var a = _context.AdResources.AsNoTracking().First(m => m.ResourceId == id);
            return Json(a);
        }

        #region Resource Attribute
        //[HttpPost]
        //public JsonResult UpdateResAttribute([FromBody]List<ESResAttribute> model)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Update resource atribute");
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        foreach (var item in model)
        //        {
        //            _context.ESResAttributes.Update(item);
        //            _context.Entry(item).State = EntityState.Modified;
        //            var a = _context.SaveChanges();
        //        }
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Update resource atribute successfully");
        //        //_actionLog.InsertActionLog("ESResAttribute", "Update resource atribute successfully", model, null, "Update");

        //        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_SUCCESS"), _stringLocalizer["ATTRIBUTE"));// "Sửa khoản mục thành công";
        //    }
        //    catch (Exception)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(_sharedResources["COM_MSG_UPDATE_FAILED"), _stringLocalizer["ATTRIBUTE")); //"Có lỗi khi sửa khoản mục";
        //                                                                                                                       //_logger.LogError(LoggingEvents.LogDb, "Update resource atribute fail");
        //        //_actionLog.InsertActionLog("ESResAttribute", "Update resource atribute fail", null, null, "Error");

        //    }
        //    return Json(msg);
        //}
        //[HttpPost]
        //public object DeleteResAtribute([FromBody]List<ESResAttribute> obj)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Delete resource atribute");

        //    try
        //    {
        //        foreach (var item in obj)
        //        {
        //            ESResAttribute objDel = new ESResAttribute();
        //            objDel.Id = item.Id;
        //            _context.ESResAttributes.Attach(objDel);
        //            _context.ESResAttributes.Remove(objDel);
        //            _context.SaveChanges();
        //        }
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Delete resource atribute successfully");
        //        _actionLog.InsertActionLogDeleteItem("ESResAttribute", "Delete resource atribute successfully", obj.ToArray(), null, "Delete");

        //        return Json(new JMessage() { Error = false, Title = String.Format(_sharedResources["COM_MSG_DELETE_SUCCESS"), _stringLocalizer["ATTRIBUTE"))/*"Xóa khoản mục thành công."*/ });
        //    }
        //    catch (Exception ex)
        //    {
        //        //_logger.LogError(LoggingEvents.LogDb, "Delete resource atribute fail");
        //        _actionLog.InsertActionLogDeleteItem("ESResAttribute", "An error occurred while Delete resource atribute", null, null, "Error");

        //        return Json(new JMessage() { Error = true, Title = String.Format(_sharedResources["COM_MSG_DELETE_FAIL"), _stringLocalizer["ATTRIBUTE"))/*"Có lỗi khi xóa khoản mục."*/, Object = ex.Message });
        //    }
        //}
        //[HttpPost]
        //public JsonResult GetResAttribute([FromBody]int? id)
        //{
        //    if (id == null || id < 0)
        //    {
        //        return Json("");
        //    }
        //    var a = _context.ESResAttributes.Where(m => m.ResourceId == id).ToList();
        //    return Json(a);
        //}
        //[HttpPost]
        //public object InsertResAttribute([FromBody]List<ESResAttribute> model)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Insert resource atribute");
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        foreach (var item in model)
        //        {
        //            _context.ESResAttributes.Add(item);
        //            var a = _context.SaveChanges();
        //        }
        //        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"), _stringLocalizer["ATTRIBUTE"));// "Áp dụng thành công.";
        //                                                                                                                      //_logger.LogInformation(LoggingEvents.LogDb, "Insert resource atribute successfully");
        //        //_actionLog.InsertActionLog("ESResAttribute", "Insert resource atribute successfully", null, model, "Insert");

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex;
        //        msg.Error = true;
        //        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAIL"), _stringLocalizer["ATTRIBUTE")); //"Có lỗi khi Áp dụng khoản mục";
        //                                                                                                                    //_logger.LogError(LoggingEvents.LogDb, "Insert resource atribute fail");
        //        //_actionLog.InsertActionLog("ESResAttribute", "Insert resource atribute fail", null, null, "Error");

        //    }
        //    return Json(msg);
        //} 
        #endregion

        [HttpPost]
        public object Resort([FromBody]List<AdResource> model)
        {

            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var item in model)
                {
                    _context.AdResources.Attach(item);
                    _context.Entry(item).Property(x => x.Ord).IsModified = true;
                    _context.SaveChanges();
                }
                msg.Title = String.Format(_sharedResources["COM_MSG_SORT_SUCCESS"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]); // "Sắp xếp các khoản mục thành công.";
            }
            catch (Exception)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_SORT_FAIL"], _stringLocalizer["ADM_RESOURCE_LBL_RESOURCE"]); //"Có lỗi khi sắp xếp khoản mục";
            }
            return Json(msg);
        }

        [HttpPost]
        public List<TreeView> GetTreeData([FromBody]TempSub obj)
        {
            if (obj.IdI == null && obj.IdS == null)
            {
                return null;
            }
            if (obj.IdI == null)
            {
                var data = _context.AdResources.OrderBy(x => x.Title).Where(x => x.Status).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeView>(), "");
                return dataOrder;
            }
            else
            {
                var data = _context.AdResources.OrderBy(x => x.Title).Where(x => (x.ResourceCode != obj.IdS[0] && x.ParentCode != obj.IdS[0]) && x.Status).AsNoTracking();
                var dataOrder = GetSubTreeData(data.ToList(), null, new List<TreeView>(), "");
                return dataOrder;
            }
        }

        private List<TreeView> GetSubTreeData(List<AdResource> data, string parentid, List<TreeView> lstCategories, string tab)
        {
            //tab += "- ";
            var contents = parentid == null
                ? data.Where(x => x.ParentCode == null).ToList()
                : data.Where(x => x.ParentCode == parentid).ToList();
            foreach (var item in contents)
            {
                var category = new TreeView
                {
                    Id = item.ResourceId,
                    Code = item.ResourceCode,
                    Title = tab + item.Title,
                    HasChild = data.Any(x => x.ParentCode == item.ResourceCode)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.ResourceCode, lstCategories, tab + "- ");
            }
            return lstCategories;
        }
        [HttpPost]
        public object GetByParent([FromBody]TempSub obj)
        {
            if (obj.IdS[0] == null || obj.IdS[0] == "")
            {
                var temp = Convert.ToInt32(obj.IdI[0]);
                return Json(_context.AdResources.Where(x => ((x.ParentCode == obj.IdS[0]) || (temp == 0 && x.ParentCode == null)) && x.Status).OrderBy(x => x.Title).AsNoTracking().ToList());
            }
            else
            {
                var temp = Convert.ToInt32(obj.IdI[0]);
                return Json(_context.AdResources.Where(x => ((x.ParentCode == obj.IdS[0]) || (temp == 0 && x.ParentCode == null)) && /*x.GroupResourceId.ToString() == obj.IdS[0] && */x.Status).OrderBy(x => x.Title).AsNoTracking().ToList());
            }
        }
        //[HttpPost]
        //public object GetTreeFunction([FromBody]int? id)
        //{
        //	if (id == null || id < 0)
        //	{
        //		return Json("");
        //	}
        //	var query = from a in _context.AdFunctions
        //				join b in _context.AdPrivileges on a.Id equals b.FunctionId
        //				where b.ResourceId == id
        //				select new
        //				{
        //					a.Id,
        //					a.Title,
        //					a.Code,
        //					a.ParentId,
        //					a.Ord,
        //					a.Description
        //				};
        //	var rs = query.AsNoTracking().ToList();
        //	return Json(rs);
        //}
        [HttpPost]
        public object GetTreeFunctionData()
        {
            var query = from x in _context.AdFunctions
                            //where x.Title.ToLower().Contains(name.ToLower())
                        select new FunctionModel
                        {
                            Id = x.FunctionId,
                            TitleJoin = x.Title,
                            Title = x.Title,
                            Code = x.FunctionCode,
                            ParentCode = x.ParentCode,
                            Ord = x.Ord,
                            Description = x.Description
                        };
            var data = query.OrderBy(x => x.Title).AsNoTracking();
            var listFunction = data as IList<FunctionModel> ?? data.ToList();

            var result = new List<FunctionModel>();
            foreach (var func in listFunction.Where(x => string.IsNullOrEmpty(x.ParentCode)))
            {
                var function = new FunctionModel();
                function.Id = func.Id;
                function.Title = func.Title;
                function.TitleJoin = func.TitleJoin;
                function.Code = func.Code;
                function.ParentCode = func.ParentCode;
                function.Ord = func.Ord;
                function.Description = func.Description;
                function.Level = 0;
                var child = GetTreeFunctionChild(listFunction, func.Code, 1);
                if (child.Count() > 0)
                {
                    function.HasChild = true;
                }
                else
                {
                    function.HasChild = false;
                }
                result.Add(function);
                result = result.Concat(child).ToList();
            }
            var res = result.ToList();
            return Json(res);
        }
        private static List<FunctionModel> GetTreeFunctionChild(IList<FunctionModel> listFunction, string parentId, int tab)
        {
            var result = new List<FunctionModel>();
            var query = from func in listFunction
                        where func.ParentCode == parentId
                        orderby func.Title
                        select new FunctionModel
                        {
                            Id = func.Id,
                            TitleJoin = func.Title,
                            Title = func.Title,
                            Code = func.Code,
                            ParentCode = func.ParentCode,
                            Ord = func.Ord,
                            Level = tab,
                            Description = func.Description,
                        };

            var listFunc = query as IList<FunctionModel> ?? query.ToList();
            foreach (var func in listFunc)
            {
                result.Add(func);
                var destination = GetTreeFunctionChild(listFunction, func.Code, tab + 1);
                result = result.Concat(destination).ToList();
            }
            return result;
        }
        //[HttpPost]
        //public List<TreeView> GetTreeFunctionData([FromBody]int? id)
        //{
        //    var data = _context.AdFunctions.OrderBy(x => x.Ord).AsNoTracking();
        //    var dataOrder = GetSubTreeData(data.ToList(), 0, new List<TreeView>(), "");
        //    //if (id == null || id < 0)
        //    //{
        //    //    return null;
        //    //}
        //    //var query = from a in _context.AdFunctions
        //    //            where !_context.AdPrivileges.Any(es => (es.ResourceId == a.Id ))
        //    //            select a;
        //    //List<AdFunction> rs = query.ToList<AdFunction>();
        //    //var dataOrder = GetSubTreeData(rs, 0, new List<TreeView>(), "");
        //    return dataOrder;
        //}
        //private List<TreeView> GetSubTreeData(List<AdFunction> data, int parentid, List<TreeView> lstCategories, string tab)
        //{
        //    tab += "- ";
        //    var contents = parentid == 0
        //        ? data.Where(x => x.ParentId == null).ToList()
        //        : data.Where(x => x.ParentId == parentid).ToList();
        //    foreach (var item in contents)
        //    {
        //        var category = new TreeView
        //        {
        //            Id = item.Id,
        //            Title = tab + item.Title,
        //            HasChild = data.Any(x => x.ParentId == item.Id)
        //        };
        //        lstCategories.Add(category);
        //        if (category.HasChild) GetSubTreeData(data, item.Id, lstCategories, tab);
        //    }
        //    return lstCategories;
        //}



        ////Insert parentFunction first
        //[HttpPost]
        //public JsonResult AddPrivilege([FromBody]AdPrivilege obj)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Insert Function of Resource");
        //        var res = _context.AdResources.Where(p => p.Id == obj.ResourceId).AsNoTracking().SingleOrDefault();
        //        var func = _context.AdFunctions.Where(p => p.Id == obj.FunctionId).AsNoTracking().SingleOrDefault();
        //        if (res != null && func != null)
        //        {
        //            var pri = _context.AdPrivileges
        //                .Where(p => p.ResourceId == obj.ResourceId && p.FunctionId == obj.FunctionId)
        //                .AsNoTracking().SingleOrDefault();
        //            if (pri != null)
        //            {
        //                msg.Error = true;
        //                msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"),
        //                    _stringLocalizer["FUNCTION")); // "Chức năng đã có vui lòng chọn chức năng khác";
        //                //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
        //            }
        //            else
        //            {
        //                if (func.ParentId == null)
        //                {
        //                    var objAdd = new AdPrivilege();
        //                    objAdd.ResourceId = obj.ResourceId;
        //                    objAdd.FunctionId = obj.FunctionId;

        //                    _context.AdPrivileges.Add(objAdd);
        //                    _context.SaveChanges();
        //                    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"),
        //                        _stringLocalizer["FUNCTION")); //"Thêm chức năng thành công";
        //                    //_logger.LogInformation(LoggingEvents.LogDb, "Insert function successfully");
        //                }
        //                else
        //                {
        //                    var priParent = _context.AdPrivileges
        //                        .Where(p => p.ResourceId == obj.ResourceId && p.FunctionId == func.ParentId)
        //                        .AsNoTracking().SingleOrDefault();
        //                    if (priParent == null)
        //                    {
        //                        msg.Error = true;
        //                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_PARENT_FIRST"),
        //                            _stringLocalizer["FUNCTION")); // "Bạn phải add chức năng cha trước";
        //                        //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
        //                    }
        //                    else
        //                    {
        //                        AdPrivilege objAdd1 = new AdPrivilege();
        //                        objAdd1.ResourceId = obj.ResourceId;
        //                        objAdd1.FunctionId = obj.FunctionId;
        //                        _context.AdPrivileges.Add(objAdd1);
        //                        _context.SaveChanges();
        //                        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"),
        //                            _stringLocalizer["FUNCTION")); //"Thêm chức năng thành công";
        //                        //_logger.LogInformation(LoggingEvents.LogDb, "Insert function successfully");
        //                    }
        //                }
        //            }
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = String.Format(_sharedResources["COM_ERR_NOT_CHECKED"),
        //                _stringLocalizer["FUNCTION"));
        //            //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAIL"), _stringLocalizer["FUNCTION")); //"Có lỗi khi thêm chức năng";
        //        //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
        //    }
        //    return Json(msg);
        //}


        //Insert parentFunction first
        [HttpPost]
        public async Task<JsonResult> AddPrivilege([FromBody]ResFuncModel obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var res = _context.AdResources.Where(p => p.ResourceCode == obj.ResourceCode).AsNoTracking().SingleOrDefault();
                if (res != null)
                {
                    // Add function
                    if (obj.FunctionAdd != null && obj.FunctionAdd.Count > 0)
                    {
                        foreach (var funcCode in obj.FunctionAdd)
                        {
                            var function = await _context.AdFunctions.FirstOrDefaultAsync(x => x.FunctionCode == funcCode);
                            if (function != null)
                            {
                                var resFunc = await _context.AdPrivileges.FirstOrDefaultAsync(x => x.ResourceCode == res.ResourceCode && x.FunctionCode == funcCode);
                                if (resFunc == null)
                                {
                                    resFunc = new AdPrivilege();
                                    resFunc.ResourceCode = res.ResourceCode;
                                    resFunc.FunctionCode = function.FunctionCode;
                                    _context.Add(resFunc);
                                }
                            }
                        }
                    }
                    // Remove function
                    if (obj.FunctionDel != null && obj.FunctionDel.Count > 0)
                    {
                        foreach (var funcCode in obj.FunctionDel)
                        {
                            var function = await _context.AdFunctions.FirstOrDefaultAsync(x => x.FunctionCode == funcCode);
                            if (function != null)
                            {
                                var resFunc = await _context.AdPrivileges.FirstOrDefaultAsync(x => x.ResourceCode == res.ResourceCode && x.FunctionCode == funcCode);
                                if (resFunc != null)
                                {
                                    _context.Remove(resFunc);
                                }
                            }
                        }
                    }
                    await _context.SaveChangesAsync();
                    msg.Title = String.Format(_stringLocalizer["ADM_RESOURCE_MSG_RESOUCE_UPDATE_SUCCSSESS"]);
                }
                else
                {
                    msg.Error = true;
                    msg.Title = String.Format(_stringLocalizer["ADM_RESOURCE_MSG_RESOUCE_ALREADY_EXISTS"]);
                    //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAIL"], _stringLocalizer["FUNCTION"]); //"Có lỗi khi thêm chức năng";
                //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
            }
            return Json(msg);
        }

        //[HttpPost]
        //public JsonResult AddPrivilege([FromBody]AdPrivilege obj)
        //{
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        //_logger.LogInformation(LoggingEvents.LogDb, "Insert Function of Resource");
        //        var res = _context.AdResources.Where(p => p.ResourceCode == obj.ResourceCode).AsNoTracking().SingleOrDefault();
        //        var func = _context.AdFunctions.Where(p => p.FunctionCode == obj.FunctionCode).AsNoTracking().SingleOrDefault();
        //        if (res != null && func != null)
        //        {
        //            var pri = _context.AdPrivileges
        //                .Where(p => p.ResourceCode == obj.ResourceCode && p.FunctionCode == obj.FunctionCode)
        //                .AsNoTracking().SingleOrDefault();
        //            if (pri != null)
        //            {
        //                msg.Error = true;
        //                msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"), _stringLocalizer["FUNCTION")); // "Chức năng đã có vui lòng chọn chức năng khác";
        //                                                                                                                        //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
        //                //_actionLog.InsertActionLog("AdPrivilege", "Insert function fail", null, null, "Error");
        //            }
        //            else
        //            {
        //                var objAdd = new AdPrivilege();
        //                objAdd.ResourceCode = obj.ResourceCode;
        //                objAdd.FunctionCode = obj.FunctionCode;
        //                _context.AdPrivileges.Add(objAdd);
        //                _context.SaveChanges();
        //                msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"), _stringLocalizer["FUNCTION")); //"Thêm chức năng thành công";
        //                                                                                                                              //_logger.LogInformation(LoggingEvents.LogDb, "Insert function successfully");
        //                //_actionLog.InsertActionLog("AdPrivilege", "Insert function successfully", null, obj, "Insert");

        //                //var priParent = _context.AdPrivileges
        //                //    .Where(p => p.ResourceCode == obj.ResourceCode && p.FunctionCode == func.ParentCode)
        //                //    .AsNoTracking().SingleOrDefault();
        //                //if (priParent == null)
        //                //{
        //                //    msg.Error = true;
        //                //    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_PARENT_FIRST"),
        //                //        _stringLocalizer["FUNCTION")); // "Bạn phải add chức năng cha trước";
        //                //                                               //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
        //                //    //_actionLog.InsertActionLog("AdPrivilege", "Insert function fail", null, null, "Error");

        //                //}
        //                //else
        //                //{
        //                //    AdPrivilege objAdd1 = new AdPrivilege();
        //                //    objAdd1.ResourceCode = obj.ResourceCode;
        //                //    objAdd1.FunctionCode = obj.FunctionCode;
        //                //    _context.AdPrivileges.Add(objAdd1);
        //                //    _context.SaveChanges();
        //                //    msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"),
        //                //        _stringLocalizer["FUNCTION")); //"Thêm chức năng thành công";
        //                //                                               //_logger.LogInformation(LoggingEvents.LogDb, "Insert function successfully");
        //                //    //_actionLog.InsertActionLog("AdPrivilege", "Insert function successfully", null, obj, "Insert");

        //                //}
        //            }
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = String.Format(_sharedResources["COM_ERR_NOT_CHECKED"), _stringLocalizer["FUNCTION"));
        //            //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Error = true;
        //        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAIL"), _stringLocalizer["FUNCTION")); //"Có lỗi khi thêm chức năng";
        //                                                                                                                   //_logger.LogError(LoggingEvents.LogDb, "Insert function fail");
        //        //_actionLog.InsertActionLog("AdPrivilege", "An error occurred while Insert function", null, null, "Error");
        //    }
        //    return Json(msg);
        //}

        //[HttpPost]
        //public JsonResult AddPrivilege([FromBody]AdPrivilege obj)
        //{
        //    //_logger.LogInformation(LoggingEvents.LogDb, "Add function");
        //    var msg = new JMessage() { Error = false };
        //    try
        //    {
        //        if (!checkExistPrivileges(obj.FunctionId, obj.ResourceId))
        //        {
        //            var dataFunction = _context.AdFunctions.Where(p => p.Id == obj.FunctionId).AsNoTracking().Single();
        //            if (dataFunction.ParentId != null && !checkExistPrivileges((int)dataFunction.ParentId, obj.ResourceId))
        //            {
        //                AdPrivilege AdPrivilege = new AdPrivilege();
        //                AdPrivilege.FunctionId = (int)dataFunction.ParentId;
        //                AdPrivilege.ResourceId = obj.ResourceId;
        //                _context.AdPrivileges.Add(AdPrivilege);
        //            }
        //            _context.AdPrivileges.Add(obj);
        //            var a = _context.SaveChanges();
        //            msg.Title = msg.Title = String.Format(_sharedResources["COM_MSG_ADD_SUCCESS"), _stringLocalizer["FUNCTION")); //"Thêm chức năng thành công";
        //            //_logger.LogInformation(LoggingEvents.LogDb, "Add function successfully");
        //        }
        //        else
        //        {
        //            msg.Error = true;
        //            msg.Title = String.Format(_sharedResources["COM_ERR_EXIST"), _stringLocalizer["FUNCTION")); //"Chức năng đã tồn tại";
        //            //_logger.LogError(LoggingEvents.LogDb, "Add function fail");
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        msg.Object = ex;
        //        msg.Error = true;
        //        msg.Title = String.Format(_sharedResources["COM_MSG_ADD_FAIL"), _stringLocalizer["FUNCTION")); //"Chưa thêm được chức năng";
        //        //_logger.LogError(LoggingEvents.LogDb, "Add function fail");
        //    }
        //    return Json(msg);
        //}


        private bool checkExistPrivileges(string functionCode, string resourceCode)
        {
            var Privileges = _context.AdPrivileges.Where(p => p.FunctionCode == functionCode && p.ResourceCode == resourceCode).AsNoTracking().ToList();
            return Privileges == null || Privileges.Count == 0 ? false : true;
        }
        private bool checkExistAPI(int id, String api)
        {
            if (api == null || api.Trim().Equals(""))
                return false;
            if (id <= 0)
            {
                var res = _context.AdResources.Where(p => p.Api == api).AsNoTracking().ToList();
                if (res == null || res.Count == 0)
                    return false;
                else
                    return true;
            }
            else
            {
                var res = _context.AdResources.Where(p => p.ResourceId != id && p.Api == api).AsNoTracking().ToList();
                if (res == null || res.Count == 0)
                    return false;
                else
                    return true;
            }
        }

        public class ResFuncModel
        {
            public string ResourceCode { get; set; }
            public List<string> FunctionAdd { get; set; }
            public List<string> FunctionDel { get; set; }
        }

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