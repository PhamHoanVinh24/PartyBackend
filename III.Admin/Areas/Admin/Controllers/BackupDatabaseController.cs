using ESEIM;
using ESEIM.Models;
using ESEIM.Utils;
using III.Admin.Utils;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;
using Microsoft.SqlServer.Management.Common;
using Microsoft.SqlServer.Management.Sdk.Sfc;
using Microsoft.SqlServer.Management.Smo;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SmartBreadcrumbs.Attributes;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class BackupDatabaseController : BaseController
    {
        private readonly EIMDBContext _context;
        private readonly IUploadService _upload;
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly IStringLocalizer<JcObjectTypeController> _stringLocalizer;
        private readonly IStringLocalizer<SharedResources> _sharedResources;
        private readonly IRepositoryService _repositoryService;
        private readonly ConnectionStrings _connSetting;
        private readonly AppSettings _appSettings;

        public BackupDatabaseController(EIMDBContext context,
                                        IUploadService upload,
                                        IHostingEnvironment hostingEnvironment,
                                        IStringLocalizer<JcObjectTypeController> stringLocalizer,
                                        IStringLocalizer<SharedResources> sharedResources,
                                        IRepositoryService repositoryService,IOptions<AppSettings> appSettings,
                                        IOptions<ConnectionStrings> connSettings)
        {
            _context = context;
            _upload = upload;
            _hostingEnvironment = hostingEnvironment;
            _stringLocalizer = stringLocalizer;
            _sharedResources = sharedResources;
            _repositoryService = repositoryService;
            _connSetting = connSettings.Value;
            _appSettings = appSettings.Value;
        }

        [Breadcrumb("ViewData.Title", AreaName = "Admin", FromAction = "Index", FromController = typeof(SysTemSettingHomeController))]
        [AdminAuthorize]
        public IActionResult Index()
        {
            ViewData["CrumbDashBoard"] = _sharedResources["COM_CRUMB_DASH_BOARD"];
            ViewData["CrumbMenuSystemSett"] = _sharedResources["COM_CRUMB_SYSTEM"];
            ViewData["CrumbSystemSettHome"] = _sharedResources["COM_CRUMB_SYSTEM_SETTING"];
            ViewData["Title"] = _sharedResources["Sao lưu dữ liệu"];
            return View();
        }

        #region Function
        [HttpGet]
        public JsonResult GetListTable()
        {
            var msg = new JMessage { Error = false, Title = "" };
            try
            {
                msg.Object = _context.VTableNames;
            }
            catch (Exception ex)
            {
                throw ex;
            }

            return Json(msg);
        }

        public void ClearFileTemp()
        {
            var folderTemp = _hostingEnvironment.WebRootPath + "\\uploads\\tempFile";
            System.IO.DirectoryInfo di = new DirectoryInfo(folderTemp);

            foreach (FileInfo file in di.GetFiles())
            {
                file.Delete();
            }
        }

        [HttpPost]
        public JsonResult Save([FromBody] BackupModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };

            try
            {
                switch (obj.Type)
                {
                    case "BAK":
                        msg = SaveBAK(obj);
                        break;

                    case "SQL":
                        msg = SaveSQL(obj);
                        break;

                    default:
                        msg = SaveSQL(obj);
                        break;
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Backup thất bại";
            }

            return Json(msg);
        }

        [NonAction]
        public JMessage SaveBAK([FromBody] BackupModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };

            try
            {
                var filePath = string.Format("E:\\{0}_{1}.bak", "Swork_Vatco_Backup", DateTime.Now.ToString("ddMMyyyy_hhmmss"));

                string[] param = new string[] { "@filePath" };
                object[] val = new object[] { filePath };

                DataTable rs = _repositoryService.GetDataTableProcedureSql("Db_BackupDatabase_V01", param, val);
                var query = CommonUtil.ConvertDataTable<ResultBackup>(rs);
                if (query.Any())
                {
                    switch (query.FirstOrDefault().Result)
                    {
                        //Backup dữ liệu thất bại
                        case 0:
                            msg.Error = true;
                            msg.Title = "Backup dữ liệu thất bại";
                            break;
                        //Backup dữ liệu thành công
                        case 1:
                            msg.Title = "Backup dữ liệu thành công";
                            break;
                    }
                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Backup thất bại";
            }

            return msg;
        }

        [NonAction]
        public JMessage SaveSQL([FromBody] BackupModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };

            try
            {
                ServerConnection serverConn = new ServerConnection("192.168.1.68,1437", "user_swork_vatco", "Vietnam@3i2020");
                var srv = new Server(serverConn);
                string dbName = _appSettings.DbName;

                Database db = new Database();
                db = srv.Databases[dbName];

                StringBuilder sb = new StringBuilder();

                var scripter = new Scripter(srv);
                scripter.Options.IncludeIfNotExists = true;
                scripter.Options.ScriptSchema = true;
                scripter.Options.ScriptData = true;

                foreach (Table tbl in db.Tables)
                {
                    if (obj.ListTable.Any(p => p.IsCheck && p.TableName.Equals(tbl.Name)))
                    {
                        foreach (string str in scripter.EnumScript(new Urn[] { tbl.Urn }))
                        {
                            sb.Append(str);
                            sb.Append(Environment.NewLine);
                        }
                    }
                }

                var path = string.Format("E:\\{0}_{1}.sql", "Backup", DateTime.Now.ToString("ddMMyyyy_hhmmss"));

                var result = sb.ToString();
                // Create a new file     
                using (FileStream fs = new FileStream(path, FileMode.Create, FileAccess.ReadWrite))
                {
                    // Add some text to file    
                    byte[] text = new UTF8Encoding(true).GetBytes(result);
                    fs.Write(text, 0, text.Length);
                }

                msg.Title = "Backup thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Backup thất bại";
            }

            return msg;
        }

        [HttpPost]
        public JsonResult Restore(IFormFile fileUpload, string databaseName)
        {
            var msg = new JMessage { Error = false, Title = "" };

            try
            {
                msg = ExcuteSQL(fileUpload, databaseName);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Restore thất bại";
            }

            return Json(msg);
        }


        [HttpGet]
        public JMessage ExcuteSQL(IFormFile fileUpload, string databaseName)
        {
            var msg = new JMessage { Error = false, Title = "" };

            try
            {
                var result = new StringBuilder();
                using (var reader = new StreamReader(fileUpload.OpenReadStream()))
                {
                    while (reader.Peek() >= 0)
                        result.AppendLine(reader.ReadLine());
                }

                var script = result.ToString();

                ServerConnection serverConn = new ServerConnection("192.168.1.68,1437", "user_swork_vatco", "Vietnam@3i2020");
                var srv = new Server(serverConn);

                if (string.IsNullOrEmpty(databaseName))
                {
                    srv.ConnectionContext.DatabaseName = _appSettings.DbName;
                }
                else
                {
                    srv.ConnectionContext.DatabaseName = databaseName;
                }

                srv.ConnectionContext.ExecuteNonQuery(script);

                msg.Title = "Restore thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Restore thất bại";
            }

            return msg;
        }

        [NonAction]
        public async Task<JMessage> RefreshIIS()
        {
            var msg = new JMessage { Error = false, Title = "" };

            try
            {
                msg = await API.Refresh();
                if (!msg.Error)
                    msg.Title = "Refresh thành công";
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Refresh thất bại";
            }

            return msg;
        }

        [HttpGet]
        public JMessage GetConnSetting()
        {
            var msg = new JMessage { Error = false, Title = "" };

            try
            {
                var connSetting = EncodeConnectString.DecryptString(_connSetting.EIMConnection);
                msg.Object = connSetting;
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Refresh thất bại";
            }

            return msg;
        }

        [HttpPost]
        public async Task<JMessage> ChangeAppSetting([FromBody] AppSettingModel obj)
        {
            var msg = new JMessage { Error = false, Title = "" };

            try
            {
                var connString = EncodeConnectString.EncryptString(obj.ConnectString, "14/11/2020");

                AddOrUpdateAppSetting("ConnectionStrings:EIMConnection", connString);

                msg = await RefreshIIS();
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = "Refresh thất bại";
            }

            return msg;
        }

        public void AddOrUpdateAppSetting<T>(string key, T value)
        {
            try
            {
                var filePath = Path.Combine(_hostingEnvironment.ContentRootPath, "appSettings.json");
                string json = System.IO.File.ReadAllText(filePath);
                dynamic jsonObj = Newtonsoft.Json.JsonConvert.DeserializeObject(json);

                var sectionPath = key.Split(":")[0];
                if (!string.IsNullOrEmpty(sectionPath))
                {
                    var keyPath = key.Split(":")[1];
                    jsonObj[sectionPath][keyPath] = value;
                }
                else
                {
                    jsonObj[sectionPath] = value; // if no sectionpath just set the value
                }
                string output = Newtonsoft.Json.JsonConvert.SerializeObject(jsonObj, Newtonsoft.Json.Formatting.Indented);
                System.IO.File.WriteAllText(filePath, output);
            }
            catch (ConfigurationErrorsException)
            {
                Console.WriteLine("Error writing app settings");
            }
        }

        #endregion

        #region Model
        public class BackupModel
        {
            public BackupModel()
            {
                ListTable = new List<VTableName>();
            }
            public List<VTableName> ListTable { get; set; }
            public string FromDate { get; set; }
            public string ToDate { get; set; }
            public string Type { get; set; }
        }

        public class AppSettingModel
        {
            public string ConnectString { get; set; }
        }
        #endregion

        #region Language
        [HttpGet]
        public IActionResult Translation(string lang)
        {
            var resourceObject = new Newtonsoft.Json.Linq.JObject();
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