using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using ESEIM.Models;
using ESEIM.Utils;
using Microsoft.EntityFrameworkCore;
using FTU.Utils.HelperNet;
using Microsoft.Extensions.Logging;
using System.Globalization;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;
using ESEIM;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMGisTableManagerController : BaseController
    {
        private readonly UserManager<AspNetUser> _userManager;
        private readonly RoleManager<AspNetRole> _roleManager;
        private readonly EIMDBContext _context;
        private readonly AppSettings _appSettings;
        private readonly ILogger _logger;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly UploadService _uploadService;
        //private readonly EIMDBContext _context;
        //private readonly ILogger _logger;
        public RMGisTableManagerController(IOptions<AppSettings> appSettings, EIMDBContext context, UserManager<AspNetUser> userManager,
            RoleManager<AspNetRole> roleManager, IHostingEnvironment hostingEnvironment
            //, UploadService uploadService
            )
        {
            _userManager = userManager;
            _context = context;
            _roleManager = roleManager;
            _appSettings = appSettings.Value;
            _hostingEnvironment = hostingEnvironment;
            _uploadService = new UploadService(_hostingEnvironment, _context);
        }

        public IActionResult Index()
        {
            ViewData["Message"] = "ĐỐI TƯỢNG BẢN ĐỒ";
            return View("Index");
        }
        string[] formats = { "dd/MM/yyyy", "d/MM/yyyy", "dd/M/yyyy", "dd/MM/yy", "d/MM/yy", "dd/M/yy" };

        [HttpPost]
        public object JTable([FromBody]GisTableSearch jTablePara)
        {
            var fromDate = !string.IsNullOrEmpty(jTablePara.CreateDate) ? DateTime.ParseExact(jTablePara.CreateDate, formats, new CultureInfo("vi-VN"), DateTimeStyles.None) : (DateTime?)null;
            var toDate = !string.IsNullOrEmpty(jTablePara.Ngay_gio_den) ? DateTime.ParseExact(jTablePara.Ngay_gio_den, formats, new CultureInfo("vi-VN"), DateTimeStyles.None) : (DateTime?)null;

            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.RmGisTables
                        where (string.IsNullOrEmpty(jTablePara.CreateDate) || a.CreatedTime.Date >= fromDate.Value.Date) && (string.IsNullOrEmpty(jTablePara.Ngay_gio_den) || a.CreatedTime.Date <= toDate.Value.Date)
                        select new
                        {
                            a.Id,
                            a.Code,
                            a.Name,
                            a.Parent,
                            a.Type,
                            a.NodeGis,
                            a.CreatedBy,
                            CreatedTime = a.CreatedTime.ToString("dd/MM/yyyy"),
                        };
            var count = query.Count();
            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "Id", "Code", "Name", "Parent", "Type", "NodeGis", "CreatedBy", "CreatedTime");
            return Json(jdata);
        }
        [HttpPost]
        public object GetMyGis(MyGisSearch obj)
        {
            JMessage msg = new JMessage();
            try
            {
                var query = from a in _context.RmGisTables
                            where a.CreatedBy == obj.UserName
                            select new
                            {
                                a.Id,
                                a.Code,
                                a.Name,
                                a.Parent,
                                a.Type,
                                a.NodeGis,
                                a.CreatedTime

                            };
                if (obj.Length == 0)
                {
                    var list = query.OrderByDescending(x => x.Id).ToList();
                    msg.Object = list;
                }
                else
                {
                    var list = query.OrderByDescending(x => x.Id).Skip(obj.Length * obj.Page).Take(obj.Length).ToList();
                    msg.Object = list;
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xảy ra lỗi khi lấy dữ liệu";
            }
            var json = Json(msg);
            return Json(msg);
        }

        //API Remooc
        [HttpPost]
        public JsonResult Insert1(GisModel obj)
        {
            JMessage msg = new JMessage();
            msg.Object = obj;
            try
            {
                RmGisTable RmGisTable = new RmGisTable();
                RmGisTable.Code = Guid.NewGuid().ToString();
                RmGisTable.Name = obj.Name;
                RmGisTable.Parent = obj.Parent;
                RmGisTable.CreatedBy = obj.CreatedBy;
                RmGisTable.CreatedTime = DateTime.Now;



                _context.RmGisTables.Add(RmGisTable);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Thêm thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Insert(GisModel obj)
        {
            JMessage msg = new JMessage();
            msg.Object = obj;
            try
            {
                RmGisTable RmGisTable = new RmGisTable();
                RmGisTable.Code = obj.Code;
                RmGisTable.Name = obj.Name;
                RmGisTable.Parent = obj.Parent;
                RmGisTable.Type = obj.Type;
                RmGisTable.CreatedBy = obj.CreatedBy;
                RmGisTable.CreatedTime = DateTime.Now;

                var mList = JsonConvert.DeserializeObject<List<NodeGis>>(obj.List1);

                GisObject gisObject = new GisObject();
                foreach (var item in mList)
                {
                    List<double> m = new List<double>();
                    m.Add(item.Lng * 20037508.34 / 180);
                    m.Add((Math.Log(Math.Tan((90 + item.Lat) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180);
                    gisObject.geometry.coordinates[0].Add(m);
                }
                RmGisTable.NodeGis = JsonConvert.SerializeObject(gisObject);
                _context.RmGisTables.Add(RmGisTable);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = "Thêm thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Update(GisModel obj)
        {
            JMessage msg = new JMessage();
            msg.Object = obj;
            try
            {
                //RmGisTable RmGisTable = new RmGisTable();
                //RmGisTable.Code = Guid.NewGuid().ToString();
                //RmGisTable.Name = obj.Name;
                //RmGisTable.Parent = obj.Parent;
                //RmGisTable.Created_By = obj.CreatedBy;
                //RmGisTable.Created_Time = DateTime.Now;
                var data = _context.RmGisTables.FirstOrDefault(x=>x.Code==obj.Code);
                if(data!=null)
                {
                    var mList = JsonConvert.DeserializeObject<List<NodeGis>>(obj.List1);
                    data.Parent = obj.Parent;
                    data.Type = obj.Type;
                    GisObject gisObject = new GisObject();
                    foreach (var item in mList)
                    {
                        List<double> m = new List<double>();
                        m.Add(item.Lng * 20037508.34 / 180);
                        m.Add((Math.Log(Math.Tan((90 + item.Lat) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180);
                        gisObject.geometry.coordinates[0].Add(m);
                    }
                    data.NodeGis = JsonConvert.SerializeObject(gisObject);
                    _context.RmGisTables.Update(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Cập nhật thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy dữ liệu";
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = ex.Message;
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult DeleteItem(string gisCode)
        {
            JMessage msg = new JMessage();
            try
            {
                var data = _context.RmGisTables.FirstOrDefault(x => x.Code == gisCode);
                if (data != null)
                {
                    _context.RmGisTables.Remove(data);
                    _context.SaveChanges();
                    msg.Error = false;
                    msg.Title = "Xóa thành công";
                }
                else
                {
                    msg.Error = true;
                    msg.Title = "Không tìm thấy bản ghi này";
                }

            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Xảy ra lỗi khi lấy dữ liệu";
            }
            return Json(msg);
        }
        [HttpPost]
        public double[] ConvertCoordinate(double lat, double lng)
        {
            double x = lng * 20037508.34 / 180;
            double y = Math.Log(Math.Tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
            //y = y * 20037508.34 / 180;
            return new double[] { x, y };
        }
        [HttpPost]
        public double[] ConvertCoordinateToGps(double a, double b)
        {
            var x = 20;
            var tanX = Math.Tan(x);
            var xx = 1/Math.Atan(tanX);
            
            var logX = Math.Log(x);
            var logX_1 = Math.Pow(logX,10);
            double lat = (double)360 * (Math.Tanh(Math.Log10((180 * b) / 20037508.34))) - 90;
            double lng = (double)180*a / 20037508.34;
            return new double[] { lat, lng };
        }
        [HttpPost]
        public JsonResult GetNextCode(string userName)
        {
            var msg = new JMessage() { Error = false, ID = 1 };
            var date = DateTime.Now;
            var count = _context.RmGisTables.Where(x => x.CreatedBy.ToLower() == userName.ToLower()).Count();
            var sosCode = "GIS_" + userName + "_" + date.ToString("dd-MM-yyyy") + "_" + (count + 1);
            msg.Object = sosCode;
            return Json(msg);
        }
        public class GisModel
        {
            public GisModel()
            {
                //List = new List<NodeGis>();
            }
            public string Code { get; set; }
            public string Name { get; set; }
            public string Parent { get; set; }
            public string Type { get; set; }
            public string CreatedBy { get; set; }
            public string List1 { get; set; }
            public List<NodeGis> List { get; set; }
        }
        public class NodeGis
        {
            public float Lat { get; set; }
            public float Lng { get; set; }
        }
        public class GisObject
        {
            public GisObject()
            {
                type = "";
                properties = new GisPropertise();
                geometry = new Geometry();
            }
            public string type { get; set; }
            public GisPropertise properties { get; set; }
            public Geometry geometry { get; set; }

        }
        public class GisPropertise
        {

            public int ID_0 { get; set; }
            public string ISO { get; set; }
            public string NAME_0 { get; set; }
            public int ID_1 { get; set; }
            public string NAME_1 { get; set; }
            public int ID_2 { get; set; }
            public string NAME_2 { get; set; }
            public string HASC_2 { get; set; }
            public int CCN_2 { get; set; }
            public string TYPE_2 { get; set; }
            public string ENGTYPE_2 { get; set; }
            public string VARNAME_2 { get; set; }
        }
        public class Geometry
        {
            public Geometry()
            {
                type = "";
                coordinates = new List<List<List<double>>>();
                coordinates.Add(new List<List<double>>());
            }
            public string type { get; set; }
            public List<List<List<double>>> coordinates { get; set; }
        }
    }
    public class GisTableSearch : JTableModel
    {
        public string CreateDate { get; set; }
        public string Ngay_gio_den { get; set; }
    }

    public class MyGisSearch
    {
        public string UserName { get; set; }
        public int Page { get; set; }
        public int Length { get; set; }
    }
}