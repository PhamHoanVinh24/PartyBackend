using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Syncfusion.EJ2.Linq;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace III.Admin.Controllers
{
    public class MobileWfActivityController : Controller
    {
        private readonly EIMDBContext _context;
        public MobileWfActivityController(EIMDBContext context)
        {
            _context = context;
        }

        [HttpPost]
        public JsonResult GetAllWfInstance(int pageCurent = 1, int pageLength = 25, string content = "")
        {
            int intBegin = (pageCurent - 1) * pageLength;
            var data = (from a in _context.WorkflowInstances.Where(x => !x.IsDeleted.Value)
                            //join b in _context.WorkFlows.Where(x => !x.IsDeleted.Value) on a.WorkflowCode equals b.WfCode
                        orderby a.Id descending
                        where string.IsNullOrEmpty(content)
                        || (!string.IsNullOrEmpty(a.WfInstCode) && a.WfInstCode.Contains(content))
                        || (!string.IsNullOrEmpty(a.WfInstName) && a.WfInstName.Contains(content))
                        select new
                        {
                            Code = a.WfInstCode,
                            Name = /*b.WfName*/a.WfInstName
                        }
                ).DistinctBy(x => x.Code).Skip(intBegin).Take(pageLength).ToList();
            return Json(data);
        }
    }
}
