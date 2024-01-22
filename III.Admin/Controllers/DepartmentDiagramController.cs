using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace III.Admin.Controllers
{
    public class DepartmentDiagramController : Controller
    {
        private readonly EIMDBContext _context;
        private readonly IHostingEnvironment _hostingEnvironment;
        public DepartmentDiagramController(IHostingEnvironment hostingEnvironment, EIMDBContext context)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
        }

        public IActionResult Index()
        {
            return View();
        }
        private readonly List<string> _listColor = new List<string> { "#71AF17", "#1859B7", "#2E95D8" };

        public class DepartmentCard
        {
            public int DepartmentId { get; set; }
            public string DepartmentCode { get; set; }
            public string Title { get; set; }
            public string ParentCode { get; set; }
            public string CardCode { get; set; }
            public string Status { get; set; }
            public DateTime? Deadline { get; set; }
            public string DepartmentHead { get; set; }
        }

        public class DepartmentCardCount
        {
            public int DepartmentId { get; set; }
            public string DepartmentCode { get; set; }
            public string Title { get; set; }
            public string ParentCode { get; set; }
            public int CardSumCount { get; set; }
            public int CardPendingCount { get; set; }
            public int CardSuccessCount { get; set; }
            public int CardCancelCount { get; set; }
            public int CardExpireCount { get; set; }
            public string DepartmentHead { get; set; }
        }

        public class TreeViewDepartmentCard : TreeView
        {
            public int CardSumCount { get; set; }
            public int CardPendingCount { get; set; }
            public int CardSuccessCount { get; set; }
            public int CardCancelCount { get; set; }
            public int CardExpireCount { get; set; }
            public string DepartmentHead { get; set; }
        }

        public object GetListDepartment()
        {
            var departmentCards = (from a in _context.AdDepartments.Where(x => !x.IsDeleted)
                join b in _context.WORKOSBoards.Where(x => !x.IsDeleted) on a.DepartmentCode equals b.Department into b1
                from b in b1.DefaultIfEmpty()
                join c in _context.WORKOSLists.Where(x => !x.IsDeleted) on b.BoardCode equals c.BoardCode into c1
                from c in c1.DefaultIfEmpty()
                join d in _context.WORKOSCards.Where(x => !x.IsDeleted) on c.ListCode equals d.ListCode into d1
                from d in d1.DefaultIfEmpty()
                select new DepartmentCard
                {
                    DepartmentId = a.DepartmentId,
                    DepartmentCode = a.DepartmentCode,
                    Title = a.Title,
                    ParentCode = a.ParentCode,
                    CardCode = d != null ? d.CardCode : null,
                    Status = d != null ? d.Status : null,
                    Deadline = d != null ? d.Deadline : (DateTime?) null,
                    //DepartmentHead = e != null ? e.GivenName : null,
                }).ToList();
            var listDepartments = departmentCards.GroupBy(x => x.DepartmentCode)
                .Select(g => new DepartmentCardCount
                {
                    DepartmentId = g.FirstOrDefault().DepartmentId,
                    DepartmentCode = g.Key,
                    Title = g.FirstOrDefault().Title,
                    ParentCode = g.FirstOrDefault().ParentCode,
                    DepartmentHead = (
                        from a in _context.Users
                    join b in _context.UserRoles on a.Id equals b.UserId into b1
                    from b in b1.DefaultIfEmpty()
                    join c in _context.Roles on b.RoleId equals c.Id into c1
                    from c in c1.DefaultIfEmpty()
                    where c.Code == "TRUONGPHONG" && a.DepartmentId == g.Key select a.GivenName).FirstOrDefault(),
                    CardSumCount = g.Count(x => x.CardCode != null),
                    CardPendingCount = g.Count(x => x.Status == "START"),
                    CardSuccessCount = g.Count(x => x.Status == "DONE"),
                    CardCancelCount = g.Count(x => x.Status == "CANCLED"),
                    CardExpireCount = g.Count(x => x.Deadline < DateTime.Now),
                }).ToList();

            var listTreeView = GetSubTreeData(listDepartments, null, new List<TreeViewDepartmentCard>(), 0);
            return listTreeView.Select(x => new
            {
                Id = x.Id,
                Code = x.Code,
                Title = x.Title,
                Parent = x.ParentCode,
                Color = _listColor.Count > x.Level ? _listColor[x.Level] : "#2E95D8",
                CardSumCount = x.CardSumCount,
                CardPendingCount = x.CardPendingCount,
                CardSuccessCount = x.CardSuccessCount,
                CardCancelCount = x.CardCancelCount,
                CardExpireCount = x.CardExpireCount,
                DepartmentHead = x.DepartmentHead,
            });
        }

        private List<TreeViewDepartmentCard> GetSubTreeData(List<DepartmentCardCount> data, string parentCode, List<TreeViewDepartmentCard> lstCategories, int tab)
        {
            //tab += "- ";
            var contents = parentCode == null
                ? data.Where(x => x.ParentCode == null).OrderBy(x => x.Title).ToList()
                : data.Where(x => x.ParentCode == parentCode).OrderBy(x => x.Title).ToList();
            foreach (var item in contents)
            {
                var category = new TreeViewDepartmentCard
                {
                    Id = item.DepartmentId,
                    Code = item.DepartmentCode,
                    Title = item.Title,
                    Level = tab,
                    ParentCode = item.ParentCode,
                    CardSumCount = item.CardSumCount,
                    CardPendingCount = item.CardPendingCount,
                    CardSuccessCount = item.CardSuccessCount,
                    CardCancelCount = item.CardCancelCount,
                    CardExpireCount = item.CardExpireCount,
                    DepartmentHead = item.DepartmentHead,
                    HasChild = data.Any(x => x.ParentCode == item.DepartmentCode)
                };
                lstCategories.Add(category);
                if (category.HasChild) GetSubTreeData(data, item.DepartmentCode, lstCategories, tab + 1);
            }
            return lstCategories;
        }
        
        [HttpPost]
        public JsonResult UploadFileDiagram(IFormFile file)
        {

            var msg = new JMessage();
            try
            {
                if (file != null)
                {
                    if (file != null && file.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files\\diagram");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = "Biểu đồ công ty.json";
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                        var url = "/uploads/files/diagram/" + fileName;
                        /*msg.Object = url;*/
                    }
                    msg.Error = false;
                    msg.Title = "Tải file thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "File không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi tải file";
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult UploadFileDiagramRadial(IFormFile file)
        {

            var msg = new JMessage();
            try
            {
                if (file != null)
                {
                    if (file != null && file.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files\\diagram");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = "Biểu đồ công ty Vũ trụ.json";
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                        var url = "/uploads/files/diagram/" + fileName;
                        /*msg.Object = url;*/
                    }
                    msg.Error = false;
                    msg.Title = "Tải file thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "File không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi tải file";
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult UploadFileDiagramMobile(IFormFile file)
        {

            var msg = new JMessage();
            try
            {
                if (file != null)
                {
                    if (file != null && file.Length > 0)
                    {
                        var pathUpload = Path.Combine(_hostingEnvironment.WebRootPath, "uploads\\files\\diagram");
                        if (!Directory.Exists(pathUpload)) Directory.CreateDirectory(pathUpload);
                        var fileName = "Biểu đồ công ty Mobile.json";
                        var filePath = Path.Combine(pathUpload, fileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                        var url = "/uploads/files/diagram/" + fileName;
                        /*msg.Object = url;*/
                    }
                    msg.Error = false;
                    msg.Title = "Tải file thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "File không tồn tại";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Có lỗi khi tải file";
            }
            return Json(msg);
        }

        public string GetFileDiagram(string url)
        {
            try
            {
                //var url = "/uploads/files/diagram/Biểu đồ công ty.json";
                return (new WebClient()).DownloadString(url);
            }
            catch (Exception)
            {
                return "";
            }
        }
    }
}
