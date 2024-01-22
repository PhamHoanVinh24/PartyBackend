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
using System.IO;
using III.Admin.Controllers;

namespace ESEIM.Controllers
{
    //public class JTableModelAccessLog : JTableModel
    //{
    //    public string StartDate { set; get; }
    //    public string EndDate { set; get; }
    //    public string UserId { set; get; }
    //    public string ApplicationId { set; get; }
    //    public string Action { set; get; }
    //}
    [Area("Admin")]
    public class EDMSFileController : BaseController
    {
		private readonly EIMDBContext _context;


		public EDMSFileController(EIMDBContext context)
		{
			_context = context;
		}
		public IActionResult Index()
		{
			return View();
		}
		[HttpPost]
		public object JTable([FromBody]JTableModel jTablePara)
		{
			int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
			var query = from a in _context.EDMSFiles
						select new
						{
							a.FileID,
							a.FileName,
							a.FileTypePhysic,
							a.CreatedBy,
							a.CreatedTime,
							a.Tags
						};
			var data = query.Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
			var count = query.Count();
			var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "FileID", "FileName", "FileTypePhysic", "CreatedBy", "CreatedTime", "Tags");
			return Json(jdata);
		}

	}
}