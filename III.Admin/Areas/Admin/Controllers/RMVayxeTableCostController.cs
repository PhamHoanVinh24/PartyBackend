using ESEIM.Models;
using ESEIM.Utils;

using FTU.Utils.HelperNet;
using III.Admin.Controllers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace III.Admin.Controllers
{
    [Area("Admin")]
    public class RMVayxeTableCostController : BaseController
    {
        private readonly IHostingEnvironment _hostingEnvironment;
        private readonly EIMDBContext _context;
        private readonly IActionLogService _actionLog;

        public RMVayxeTableCostController(EIMDBContext context, IHostingEnvironment hostingEnvironment, IActionLogService actionLog)
        {
            _context = context;
            _hostingEnvironment = hostingEnvironment;
            _actionLog = actionLog;
        }
        public class JTableModelCustom : JTableModel
        {
            public string Key { get; set; }
            public string Key1 { get; set; }
            public string service_name { get; set; }
        }
        public class VayxeTableCost
        {
            public int id { get; set; }
            public string service_code { get; set; }
            public int status { get; set; }

        }
        public IActionResult Index()
        {
            ViewData["Message"] = String.Format(CommonUtil.ResourceValue("RMVTC_TITLE_PRICE_SERVICE"));
            return View("Index");
        }
        [HttpPost]
        public object JTable([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.RmVayxeTableCostHeaders
                        where a.Flag == 1 && (string.IsNullOrEmpty(jTablePara.Key) || a.TableCode.ToLower().Contains(jTablePara.Key.ToLower()) || a.TableName.ToLower().Contains(jTablePara.Key.ToLower()))
                        select new
                        {
                            id = a.Id,
                            table_code = a.TableCode,
                            table_name = a.TableName,
                            status = a.Status,
                            begin_time_apply = a.BeginTimeApply,
                            end_time_apply = a.EndTimeApply,
                            appover_id = a.AppoverId
                        };

            var count = query.Count();
            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "table_code", "table_name", "status", "begin_time_apply", "end_time_apply", "appover_id");
            return Json(jdata);
        }


        [HttpPost]
        public object JTable_details([FromBody]JTableModelCustom jTablePara)
        {
            int intBeginFor = (jTablePara.CurrentPage - 1) * jTablePara.Length;
            var query = from a in _context.RmVayxeTableCostDetailss
                        join b in _context.RmVayxeCatSevicess on a.ServiceCode equals b.ServiceCode
                        where a.Flag == 1 && a.TableId.ToString() == jTablePara.Key && (jTablePara.service_name == null || a.ServiceCode.ToLower().Contains(jTablePara.service_name.ToLower()))
                        select new
                        {
                            id = a.Id,
                            service_code = a.ServiceCode,
                            service_name = b.ServiceName,
                            status = a.Status
                        };
            var count = query.Count();
            var data = query
                .OrderUsingSortExpression(jTablePara.QueryOrderBy).Skip(intBeginFor).Take(jTablePara.Length).AsNoTracking().ToList();
            var jdata = JTableHelper.JObjectTable(data, jTablePara.Draw, count, "id", "service_code", "service_name", "status");
            return Json(jdata);
        }

        [HttpPost]
        public async Task<JsonResult> Insert([FromBody] RmVayxeTableCostHeader obj)
        {
            var msg = new JMessage()
            {
                Error = true
            };
            try
            {
                if (_context.RmVayxeTableCostHeaders.FirstOrDefault(x => x.TableCode == obj.TableCode) != null)
                {
                    msg.Error = true;
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_MSG_EXITS"), CommonUtil.ResourceValue("COM_TITLE_CODE"));
                    return Json(msg);
                }
                obj.Flag = 1;
                obj.CreatedTime = DateTime.Now;
                _context.RmVayxeTableCostHeaders.Add(obj);
                await _context.SaveChangesAsync();
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ADD_SUCCESS"));
                msg.Object = obj;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.ID = 0;
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [HttpPost]
        public JsonResult Insert_Details1([FromBody]VayxeTableCost obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                var data = new RmVayxeTableCostDetails();

                data.TableId = obj.id;
                data.ServiceCode = obj.service_code;
                data.Status = obj.status;
                data.CreatedTime = DateTime.Now;
                data.Flag = 1;
                _context.RmVayxeTableCostDetailss.Add(data);
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ADD_SUCCESS"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }
        [HttpPost]
        public JsonResult Insert_Details([FromBody]VayxeTableCost obj)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                RmVayxeTableCostDetails data = new RmVayxeTableCostDetails();

                data.TableId = obj.id;
                data.ServiceCode = obj.service_code;
                data.Status = obj.status;

                data.CreatedTime = DateTime.Now;
                data.Flag = 1;
                _context.RmVayxeTableCostDetailss.Add(data);
                _context.SaveChanges();
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ADD_SUCCESS"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));
            }
            return Json(msg);
        }

        [HttpPost]
        public async Task<JsonResult> Update([FromBody]RmVayxeTableCostHeader obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var data = _context.RmVayxeTableCostHeaders.FirstOrDefault(x => x.Id == obj.Id);
                if (data != null)
                {
                    if (_context.RmVayxeTableCostHeaders.FirstOrDefault(x => x.TableCode == obj.TableCode && x.Id != data.Id) != null)
                    {

                        msg.Title = String.Format(CommonUtil.ResourceValue("RMVTC_MSG_EXITS_TABLE_PRICE"));
                        msg.Error = true;
                        return Json(msg);

                    }
                    data.TableName = obj.TableName;
                    data.EndTimeApply = obj.EndTimeApply;
                    data.BeginTimeApply = obj.BeginTimeApply;
                    data.Note = obj.Note;
                    data.Status = obj.Status;
                    data.AppoverId = obj.AppoverId;
                    data.UpdatedTime = DateTime.Now;
                    _context.RmVayxeTableCostHeaders.Update(data);

                    await _context.SaveChangesAsync();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_ADD_SUCCESS"));
                    msg.Error = false;

                }
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_ADD"));

            }
            return Json(msg);
        }
        [HttpGet]
        public object getItemDetails(int id)
        {
            try
            {
                var CostDetails = _context.RmVayxeTableCostDetailss.SingleOrDefault(x => x.Id == id);
                var query = from a in _context.RmVayxeTableCostDetailss
                                //where DateTime.Parse("2017-09-24 14:34:50.0000000" + "").ToString("dd-MM-yyyy") == DateTime.Now.ToString("dd-MM-yyyy")
                            select new
                            {
                                id = a.Id,
                                service_code = a.ServiceCode,

                                status = a.Status
                            };
                var data = query.Where(x => x.id == id);

                return Json(data);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
            }
        }
        [HttpPost]
        public JsonResult updateDetails([FromBody]RmVayxeTableCostDetails obj)
        {
            var msg = new JMessage() { Error = true };
            try
            {
                var rs = _context.RmVayxeTableCostDetailss.SingleOrDefault(x => x.Id == obj.Id);

                if (rs != null)
                {
                    rs.ServiceCode = obj.ServiceCode;
                    rs.Status = obj.Status;
                    rs.UpdatedTime = DateTime.Now;
                    _context.RmVayxeTableCostDetailss.Update(rs);

                    _context.SaveChanges();
                    msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_SUCCESS")); 
                    msg.Error = false;

                }
            }
            catch (Exception ex)
            {
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_UPDATE_FAIL"));

            }
            return Json(msg);
        }



        [HttpGet]
        public object getItem(int id)
        {
            try
            {
                var booking = _context.RmVayxeTableCostHeaders.SingleOrDefault(x => x.Id == id);
                var query = from a in _context.RmVayxeTableCostHeaders
                                //where DateTime.Parse("2017-09-24 14:34:50.0000000" + "").ToString("dd-MM-yyyy") == DateTime.Now.ToString("dd-MM-yyyy")
                            select new
                            {
                                id = a.Id,
                                table_code = a.TableCode,
                                table_name = a.TableName,
                                note = a.Note,
                                created_by = a.CreatedBy,
                                status = a.Status,
                                appover_id = a.AppoverId,
                                begin_time_apply = a.BeginTimeApply,
                                end_time_apply = a.EndTimeApply
                            };
                var data = query.Where(x => x.id == id);

                return Json(data);
            }
            catch (Exception ex)
            {
                return Json(new JMessage() { Error = true, Title = String.Format(CommonUtil.ResourceValue("MSG_LOAD_FAIL"), CommonUtil.ResourceValue("USER_USERNAME").ToLower()), Object = ex });
            }
        }

        [HttpPost]
        public object gettreedata()
        {
            var msg = new JMessage { Error = true };

            try
            {
                var data = _context.RmVayxeCatSevicess.OrderBy(x => x.ServiceCode);
                msg.Object = data;
                msg.Error = false;
            }
            catch (Exception ex)
            {
                msg.Title = "Get Parent Group fail ";
            }

            return Json(msg);
        }

        [HttpPost]
        public object Delete(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.RmVayxeTableCostHeaders.FirstOrDefault(x => x.Id == id);
                data.Flag = 0;
                _context.RmVayxeTableCostHeaders.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_DELETE_SUCCESS"));
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
                return Json(msg);
            }
        }
        [HttpPost]
        public object DeleteItems([FromBody]List<int> listIdI)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdI)
                {
                    var obj = _context.RmVayxeTableCostHeaders.FirstOrDefault(x => x.Id == id);
                    if (obj != null)
                    {
                        obj.Flag = 0;
                        _context.RmVayxeTableCostHeaders.Update(obj);
                        _context.SaveChanges();
                    }
                }
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_DELETE_SUCCESS"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
                //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource fail");
                //_actionLog.InsertActionLogDeleteItem("AdResource", "An error occurred while Delete list Resource", null, null, "Error");

            }
            return Json(msg);
        }

        [HttpPost]
        public object deleteService([FromBody]List<int> listIdService)
        {
            var msg = new JMessage() { Error = false };
            try
            {
                foreach (var id in listIdService)
                {
                    var data = _context.RmVayxeTableCostDetailss.FirstOrDefault(x => x.Id == id);
                    if (data != null)
                    {
                        data.Flag = 0;
                        _context.RmVayxeTableCostDetailss.Update(data);
                        _context.SaveChanges();
                    }
                }
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_DELETE_SUCCESS"));
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Object = ex;
                msg.Title = String.Format(CommonUtil.ResourceValue("MSG_DELETE_LIST_FAIL"), CommonUtil.ResourceValue("RESOURCE"));
                //_logger.LogError(LoggingEvents.LogDb, "Delete list Resource fail");
                //_actionLog.InsertActionLogDeleteItem("AdResource", "An error occurred while Delete list Resource", null, null, "Error");

            }
            return Json(msg);
        }


        [HttpPost]
        public object DeleteDetails(int id)
        {
            var msg = new JMessage { Error = true };
            try
            {
                var data = _context.RmVayxeTableCostDetailss.FirstOrDefault(x => x.Id == id);
                data.Flag = 0;
                _context.RmVayxeTableCostDetailss.Update(data);
                _context.SaveChanges();
                msg.Error = false;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_DELETE_SUCCESS"));
                return Json(msg);
            }
            catch (Exception ex)
            {
                msg.Error = true;
                msg.Title = String.Format(CommonUtil.ResourceValue("COM_ERR_DELETE"));
                return Json(msg);
            }
        }



    }
}